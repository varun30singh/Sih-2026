'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { GlassCard } from '@/components/common/GlassCard';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { MOCK_FARMERS } from '@/lib/mock-data/farmers';
import { FarmerProfile } from '@/types';
import { 
  Building2, 
  Search, 
  UserCheck, 
  CalendarPlus, 
  QrCode, 
  Printer, 
  CheckCircle2, 
  Phone, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UserPlus
} from 'lucide-react';

export default function AssistedBookingPage() {
  const [searchQuery, setSearchQuery] = useState('9876543210');
  const [farmer, setFarmer] = useState<FarmerProfile | null>(MOCK_FARMERS[0]);
  const [bookedSuccess, setBookedSuccess] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [quantity, setQuantity] = useState('25');
  const [selectedCentre, setSelectedCentre] = useState('Centre #12 — Modinagar Agri Hub (Fastest)');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.replace(/\D/g, '');
    const found = MOCK_FARMERS.find(
      (f) => f.mobile.replace(/\D/g, '').includes(query) || f.farmerIdNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFarmer(found || null);
    setBookedSuccess(false);
  };

  const handleQuickBook = () => {
    setBookedSuccess(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        {/* Desk Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  CSC / Gram Panchayat Farmer Assistance Desk
                </h1>
                <Badge variant="info" size="sm">
                  VLE Operator Mode
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                Operator: Bhatiyana Gram Seva Kendra • CSC VLE #UP-VLE-8849
              </p>
            </div>
          </div>

          <Link href="/farmer/register">
            <Button size="sm" variant="outline" leftIcon={<UserPlus className="w-4 h-4 text-emerald-600" />}>
              + Register New Farmer
            </Button>
          </Link>
        </div>

        {/* Step 1: Simple Farmer Search */}
        <GlassCard className="p-6 bg-white dark:bg-slate-900">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
            Step 1: Look Up Farmer by Mobile or Farmer ID
          </h2>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter 10-digit mobile number (e.g. 9876543210) or Farmer ID"
                className="w-full pl-9 pr-3 py-3 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
            <Button type="submit" size="lg" variant="secondary" leftIcon={<Search className="w-4 h-4" />}>
              Search Farmer
            </Button>
          </form>
        </GlassCard>

        {/* Step 2: Farmer Record Found & Quick Booking */}
        {farmer ? (
          <div className="space-y-6 animate-in fade-in">
            {/* Farmer Profile Card */}
            <GlassCard className="p-6 bg-white dark:bg-slate-900 border-l-4 border-l-emerald-500">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-base">
                    {farmer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {farmer.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Father: {farmer.fatherName} • Mobile: <strong>{farmer.mobile}</strong>
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Farmer ID: {farmer.farmerIdNumber} | Village: {farmer.village}, {farmer.district}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <Badge variant="success" size="sm">
                    PM-Kisan Registry Verified ✓
                  </Badge>
                  <p className="text-xs text-slate-500 mt-1">Land: {farmer.totalLandAcres} Acres</p>
                </div>
              </div>

              {/* Booking Options */}
              {!bookedSuccess ? (
                <div className="mt-6 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Step 2: Generate Token & Book Slot
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Select Crop
                      </label>
                      <select
                        value={selectedCrop}
                        onChange={(e) => setSelectedCrop(e.target.value)}
                        className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                      >
                        <option value="Wheat">Wheat (MSP: ₹2,275/Qtl)</option>
                        <option value="Mustard">Mustard (MSP: ₹5,650/Qtl)</option>
                        <option value="Chana">Chana (MSP: ₹5,440/Qtl)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Quantity to Sell (Quintals)
                      </label>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Recommended Mandi Centre
                      </label>
                      <select
                        value={selectedCentre}
                        onChange={(e) => setSelectedCentre(e.target.value)}
                        className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-emerald-700 font-bold"
                      >
                        <option value="Centre #12 — Modinagar Agri Hub (Fastest)">
                          Centre #12 — Modinagar (Fastest • 55m wait)
                        </option>
                        <option value="Centre #14 — Hapur Central Mandi">
                          Centre #14 — Hapur Central (Congested • 2h wait)
                        </option>
                        <option value="Centre #21 — Pilkhuwa Sub-Yard">
                          Centre #21 — Pilkhuwa (8.5 km • 1h wait)
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      size="lg"
                      variant="primary"
                      onClick={handleQuickBook}
                      leftIcon={<QrCode className="w-4 h-4" />}
                    >
                      Generate Digital Token & Print Slip
                    </Button>
                  </div>
                </div>
              ) : (
                /* Generated Token Pass for Printing */
                <div className="mt-6 p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                      <div>
                        <h4 className="text-base font-bold text-emerald-900 dark:text-emerald-100">
                          Token Generated Successfully!
                        </h4>
                        <p className="text-xs text-emerald-800 dark:text-emerald-300">
                          Automated SMS and Voice Call dispatched to <strong>{farmer.mobile}</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="text-center sm:text-right p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 shadow-sm">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Assisted Token</span>
                      <span className="text-3xl font-black font-mono text-emerald-600">M-142</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs flex flex-wrap justify-between gap-2">
                    <span>Mandi: <strong>{selectedCentre.split('(')[0]}</strong></span>
                    <span>Slot: <strong>Today, 10:00 AM – 11:30 AM</strong></span>
                    <span>Crop: <strong>{selectedCrop} ({quantity} Quintals)</strong></span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.print()}
                      leftIcon={<Printer className="w-4 h-4" />}
                    >
                      Print Physical Receipt for Farmer
                    </Button>

                    <Link href="/farmer/queue">
                      <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                        Track Live Queue
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        ) : (
          <GlassCard className="p-8 text-center text-slate-500">
            <p>No farmer found matching &quot;{searchQuery}&quot;. Please verify the phone number or register as a new farmer.</p>
          </GlassCard>
        )}
      </main>

      <Footer />
    </div>
  );
}
