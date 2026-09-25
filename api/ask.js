import { GoogleGenAI, mcpToTool } from "@google/genai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export default async function handler(req, res) {
  // 1) Verify GEMINI_API_KEY
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      error: "GEMINI_API_KEY is not set. Add it in Vercel and redeploy.",
    });
  }

  // 2) Validate question
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (_) {}
  }
  const question = body?.question;
  if (
    !question ||
    typeof question !== "string" ||
    question.trim().length === 0 ||
    question.length > 500
  ) {
    return res.status(400).json({
      error: "Question is required and must be at most 500 characters.",
    });
  }

  // 3) Parse MCP_SERVERS and connect
  const rawServers = process.env.MCP_SERVERS || "";
  const addresses = rawServers
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const connectedClients = [];
  const unavailable = [];

  for (const address of addresses) {
    let client = null;
    try {
      client = new Client({ name: "t5-agent", version: "1.0.0" });
      const requestHeaders =
        address.includes("smithery.ai") && process.env.SMITHERY_API_KEY
          ? { Authorization: `Bearer ${process.env.SMITHERY_API_KEY}` }
          : {};
      const transport = new StreamableHTTPClientTransport(new URL(address), {
        requestHeaders,
      });

      let timeoutHandle;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(new Error("Connection timed out after 8 seconds"));
        }, 8000);
      });

      await Promise.race([client.connect(transport), timeoutPromise]);
      clearTimeout(timeoutHandle);
      connectedClients.push(client);
    } catch (err) {
      const reason = err?.message
        ? err.message.split("\n")[0]
        : "Connection failed";
      unavailable.push({
        address,
        reason,
      });
      if (client) {
        try {
          await client.close();
        } catch (_) {}
      }
    }
  }

  // 4) Execute Gemini with tools
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const systemInstruction =
      "answer only from tool results; give the source and the fetched_at time for every figure; if a tool returns an error or nothing, say so in one sentence and do not guess; at most 120 words.";

    const config = {
      systemInstruction,
      automaticFunctionCalling: { maximumRemoteCalls: 6 },
    };

    if (connectedClients.length > 0) {
      config.tools = [mcpToTool(...connectedClients)];
    }

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: question,
        config,
      });
    } catch (geminiErr) {
      const status = geminiErr?.status || 500;
      let reason = "Gemini request failed";
      if (geminiErr?.message) {
        const msg = String(geminiErr.message);
        if (msg.includes('{')) {
          try {
            const jsonPart = msg.slice(msg.indexOf('{'));
            const parsed = JSON.parse(jsonPart);
            reason = parsed?.error?.message || parsed?.message || msg;
          } catch (_) {
            reason = msg;
          }
        } else {
          reason = msg;
        }
      }
      reason = String(reason).split("\n")[0];
      return res.status(502).json({
        status,
        reason,
        error: reason,
      });
    }

    // 5) Build tool_calls from automaticFunctionCallingHistory
    const tool_calls = [];
    const history = response?.automaticFunctionCallingHistory || [];

    for (let i = 0; i < history.length; i++) {
      const item = history[i];
      if (item && item.role === "model" && Array.isArray(item.parts)) {
        const nextItem = history[i + 1];
        const respParts =
          nextItem && Array.isArray(nextItem.parts) ? nextItem.parts : [];

        for (let pIdx = 0; pIdx < item.parts.length; pIdx++) {
          const part = item.parts[pIdx];
          if (part && part.functionCall) {
            const name = part.functionCall.name;
            const args = part.functionCall.args || {};

            const matchingRespPart =
              respParts.find(
                (rp) =>
                  rp?.functionResponse && rp.functionResponse.name === name
              ) || respParts[pIdx];

            let failed = false;
            if (matchingRespPart && matchingRespPart.functionResponse) {
              const resp = matchingRespPart.functionResponse.response;
              if (resp) {
                if (
                  resp.error != null ||
                  resp.isError === true ||
                  (resp.content &&
                    Array.isArray(resp.content) &&
                    resp.content.some((c) => c?.isError)) ||
                  (typeof resp === "string" &&
                    resp.toLowerCase().includes("error"))
                ) {
                  failed = true;
                }
              }
            }

            tool_calls.push({
              name,
              args,
              failed,
            });
          }
        }
      }
    }

    return res.status(200).json({
      answer: response?.text || "",
      tool_calls,
      unavailable,
      model: "gemini-3.8-flash",
      answered_at: new Date().toISOString(),
    });
  } finally {
    // 6) Always close every connected MCP client
    for (const client of connectedClients) {
      try {
        await client.close();
      } catch (_) {}
    }
  }
}
