import React, { useState, useEffect } from 'react';
import { useTrip } from '../../context/TripContext';
import { CURRENCY_SYMBOLS, fetchHotels } from '../../services/mcpClient';
import { BookingItem } from '../../types/travel';
import {
  Hotel,
  Train,
  Ticket,
  Star,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Building,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';

export const Tab4Bookings: React.FC = () => {
  const {
    selectedDestination,
    bookings,
    addBooking,
    confirmBooking,
    preferences,
    setActiveTab,
  } = useTrip();

  const [activeCategory, setActiveCategory] = useState<'all' | 'hotel' | 'transit' | 'attraction'>('all');
  const [recommendations, setRecommendations] = useState<BookingItem[]>([]);
  const [selectedItemForModal, setSelectedItemForModal] = useState<BookingItem | null>(null);
  const [travelerName, setTravelerName] = useState('Alex Taylor');
  const [travelerEmail, setTravelerEmail] = useState('alex.taylor@example.com');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedSuccessRef, setConfirmedSuccessRef] = useState<string | null>(null);

  const currencySymbol = CURRENCY_SYMBOLS[preferences.currency] || '$';

  // Load curated recommendations for current destination
  useEffect(() => {
    let isCurrent = true;
    fetchHotels(selectedDestination.city, 4, preferences.currency).then((hotels) => {
      if (!isCurrent) return;

      const transitItems: BookingItem[] = [
        {
          id: `tr-${selectedDestination.code}-01`,
          type: 'transit',
          title: `${selectedDestination.city} Regional All-Access Unlimited Transit Pass`,
          subtitle: 'Valid across subways, metropolitan lines, and airport trains',
          provider: 'Regional Transport Authority',
          rating: 4.9,
          reviewCount: 5120,
          price: 28,
          priceUnit: '/ person',
          status: 'recommended',
          details: ['Unlimited subway rides', 'Direct airport express transfer', 'Digital Apple Wallet / Google Pay tap'],
          badge: 'Most Popular',
          mcpSource: 'exasearch/exa-mcp',
        },
        {
          id: `tr-${selectedDestination.code}-02`,
          type: 'transit',
          title: 'High-Speed Intercity Express Shinkansen / Bullet Link',
          subtitle: 'Reserved seat pass for scenic day excursions',
          provider: 'High-Speed Rail MCP',
          rating: 4.8,
          reviewCount: 3400,
          price: 95,
          priceUnit: '/ person',
          status: 'recommended',
          details: ['Guaranteed window seat', 'Luggage compartment space', 'Flexible departure timing'],
          badge: 'High Speed',
          mcpSource: 'exasearch/exa-mcp',
        },
      ];

      const attractionItems: BookingItem[] = [
        {
          id: `att-${selectedDestination.code}-01`,
          type: 'attraction',
          title: `${selectedDestination.city} City Landmark & Museum Priority Pass`,
          subtitle: 'Skip-the-line access to top 15 national museums & palaces',
          provider: 'City Tourism Bureau via MCP',
          rating: 4.8,
          reviewCount: 2980,
          price: 55,
          priceUnit: '/ person',
          status: 'recommended',
          details: ['Skip-the-line priority queues', 'Audio guide app access', 'Valid for entire 4-day window'],
          badge: 'Fast Track',
          mcpSource: 'exasearch/exa-mcp',
        },
        {
          id: `att-${selectedDestination.code}-02`,
          type: 'attraction',
          title: 'Private Culinary Sommelier & Foodie Tasting Walk',
          subtitle: 'Small group 3-hour guided gastro-crawl through local alleys',
          provider: 'Exa Local Foodie Guide',
          rating: 4.9,
          reviewCount: 1670,
          price: 75,
          priceUnit: '/ person',
          status: 'recommended',
          details: ['6 signature local dish tastings', 'Curated wine or sake pairings', 'Local certified culinary guide'],
          badge: 'Top Rated',
          mcpSource: 'exasearch/exa-mcp',
        },
      ];

      setRecommendations([...hotels, ...transitItems, ...attractionItems]);
    });

    return () => {
      isCurrent = false;
    };
  }, [selectedDestination.city, selectedDestination.code, preferences.currency]);

  // Filter items by category
  const filteredItems = recommendations.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.type === activeCategory;
  });

  const handleOpenBookingModal = (item: BookingItem) => {
    setSelectedItemForModal(item);
    setConfirmedSuccessRef(null);
  };

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForModal) return;

    setIsProcessing(true);
    setTimeout(() => {
      const generatedRef = `${selectedItemForModal.type.toUpperCase().slice(0, 2)}-${Math.floor(100000 + Math.random() * 900000)}`;
      addBooking(selectedItemForModal);
      confirmBooking(selectedItemForModal.id, generatedRef);
      setIsProcessing(false);
      setConfirmedSuccessRef(generatedRef);
    }, 700);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Category Filter Controls & Header (Anti-pill segmented control) */}
      <div className="px-5 py-3 border-b border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            Curated Bookings & Logistics Portfolio
          </h2>
          <p className="text-xs text-slate-400">
            Live inventories validated via <span className="font-mono text-sky-300">google/hotels</span> and <span className="font-mono text-sky-300">exasearch/exa-mcp</span>
          </p>
        </div>

        {/* Functional Segmented Controls */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          {[
            { id: 'all', label: 'All Logistics', icon: Building },
            { id: 'hotel', label: 'Hotels & Stays', icon: Hotel },
            { id: 'transit', label: 'Transit & Passes', icon: Train },
            { id: 'attraction', label: 'Attractions & Tours', icon: Ticket },
          ].map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-sky-400 shadow-sm border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Localized vertical scroll */}
      <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-w-7xl mx-auto">
          {filteredItems.map((item) => {
            const isConfirmed = bookings.some(
              (b) => b.id === item.id && b.status === 'confirmed',
            );
            const confirmedItem = bookings.find((b) => b.id === item.id);

            return (
              <div
                key={item.id}
                className={`rounded-xl border p-4 bg-slate-900/60 flex flex-col justify-between transition-all ${
                  isConfirmed
                    ? 'border-emerald-500/50 bg-emerald-950/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="capitalize font-mono text-sky-300">{item.type}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-amber-400 font-mono tabular-nums">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{item.rating}</span>
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          ({item.reviewCount.toLocaleString()})
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white tracking-tight mt-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{item.subtitle}</p>
                    </div>

                    {item.badge && (
                      <span className="text-[11px] text-sky-300 font-mono bg-sky-950/60 border border-sky-800/40 px-2 py-0.5 rounded whitespace-nowrap">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* Highlights list */}
                  <div className="space-y-1 pt-1">
                    {item.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                        <span className="w-1 h-1 rounded-full bg-sky-400 shrink-0" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-base font-bold text-emerald-400 font-mono tabular-nums">
                      {currencySymbol}
                      {item.price.toLocaleString()}{' '}
                      <span className="text-xs text-slate-400 font-normal">{item.priceUnit}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Source: {item.mcpSource}
                    </div>
                  </div>

                  {isConfirmed ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-medium bg-emerald-950/40 px-3 py-1.5 rounded-md border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{confirmedItem?.confirmationRef || 'Confirmed'}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenBookingModal(item)}
                      className="px-4 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-md transition-colors cursor-pointer shadow-sm shadow-sky-950/50"
                    >
                      Book & Reserve
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Navigation */}
        <div className="pt-6 flex justify-between max-w-7xl mx-auto border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab(3)}
            className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            ← Back to Itinerary Builder
          </button>

          <button
            onClick={() => setActiveTab(5)}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors cursor-pointer shadow-md shadow-sky-950/60"
          >
            Generate Trip Summary & Master Share →
          </button>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {selectedItemForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-semibold text-white">
                  Confirm Reservation & Voucher
                </h3>
              </div>
              <button
                onClick={() => setSelectedItemForModal(null)}
                className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {confirmedSuccessRef ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Booking Confirmed!</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Your reservation has been locked in with provider <span className="text-slate-200">{selectedItemForModal.provider}</span>.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg inline-block text-left text-xs font-mono space-y-1">
                  <div className="text-slate-500">Booking Reference:</div>
                  <div className="text-base text-sky-400 font-bold tracking-wider">
                    {confirmedSuccessRef}
                  </div>
                </div>

                <div className="pt-2 flex justify-center">
                  <button
                    onClick={() => setSelectedItemForModal(null)}
                    className="px-5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmReservation} className="p-5 space-y-4">
                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2">
                  <div className="text-xs text-slate-400 font-mono capitalize">
                    {selectedItemForModal.type} Reservation
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    {selectedItemForModal.title}
                  </h4>
                  <div className="flex items-center justify-between text-xs text-slate-300 pt-1 border-t border-slate-800 font-mono">
                    <span>Total Amount</span>
                    <span className="text-emerald-400 font-bold tabular-nums">
                      {currencySymbol}
                      {selectedItemForModal.type === 'hotel'
                        ? (selectedItemForModal.price * 4).toLocaleString()
                        : (selectedItemForModal.price * preferences.partySize).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium">Primary Traveler Name</label>
                    <input
                      type="text"
                      required
                      value={travelerName}
                      onChange={(e) => setTravelerName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium">Confirmation Email</label>
                    <input
                      type="email"
                      required
                      value={travelerEmail}
                      onChange={(e) => setTravelerEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 bg-sky-950/20 border border-sky-900/30 rounded-lg text-xs text-sky-300 space-y-1">
                  <span className="font-semibold">Instant E-Ticket & Pass Issue:</span>
                  <p className="text-[11px] text-slate-400">
                    Vouchers sync directly with WanderPulse Master Summary with live QR access and automatic budget reconciliation.
                  </p>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedItemForModal(null)}
                    className="px-4 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-50 rounded-md transition-colors cursor-pointer"
                  >
                    {isProcessing ? 'Verifying with MCP...' : 'Confirm & Generate Pass'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
