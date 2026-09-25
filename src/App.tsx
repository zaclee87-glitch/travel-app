/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TripProvider, useTrip } from './context/TripContext';
import { TopBar } from './components/TopBar';
import { Tab1Discovery } from './components/tabs/Tab1Discovery';
import { Tab2FlightConfirm } from './components/tabs/Tab2FlightConfirm';
import { Tab3ItineraryBuilder } from './components/tabs/Tab3ItineraryBuilder';
import { Tab4Bookings } from './components/tabs/Tab4Bookings';
import { Tab5SummaryShare } from './components/tabs/Tab5SummaryShare';
import { AIChatModal } from './components/AIChatModal';

const TabRouter: React.FC = () => {
  const { activeTab } = useTrip();

  return (
    <main className="flex-1 min-h-0 overflow-hidden relative">
      {activeTab === 1 && <Tab1Discovery />}
      {activeTab === 2 && <Tab2FlightConfirm />}
      {activeTab === 3 && <Tab3ItineraryBuilder />}
      {activeTab === 4 && <Tab4Bookings />}
      {activeTab === 5 && <Tab5SummaryShare />}
    </main>
  );
};

export default function App() {
  return (
    <TripProvider>
      <div className="h-screen max-h-screen overflow-hidden flex flex-col bg-slate-950 text-slate-100 font-sans antialiased selection:bg-sky-500/30 selection:text-sky-200">
        <TopBar />
        <TabRouter />
        <AIChatModal />
      </div>
    </TripProvider>
  );
}
