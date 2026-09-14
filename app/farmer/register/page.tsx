'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/common/GlassCard';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { 
  User, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Wheat,
  FileCheck
} from 'lucide-react';

export default function FarmerRegistrationPage() {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    name: 'Ramesh Singh',
    mobile: '9876543210',
    dob: '1982-06-15',
    address: 'House #42, Main Chauraha, Bhatiyana, Hapur, UP',
    landAreaAcres: '6.5',
    village: 'Bhatiyana',
    district: 'Hapur',
    state: 'Uttar Pradesh',
    crop: 'Wheat (Kalyan Sona)',
    aadhaarNumber: '8921-4455-7788',
    farmerId: 'UP-FARM-2026-8921',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Badge variant="success" size="sm">
          National Kisan Registry
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Farmer One-Time Registration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Register to unlock zero-wait digital tokens, smart mandi routing, and direct MSP bank transfers.
        </p>
      </div>

      {/* 4-Step Progress Indicator */}
      <div className="flex items-center justify-between px-4 sm:px-8">
        {[
          { num: 1, label: 'Personal' },
          { num: 2, label: 'Farm Land' },
          { num: 3, label: 'Identity' },
          { num: 4, label: 'Confirm' },
        ].map((item, idx) => (
          <div key={item.num} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                step > item.num
                  ? 'bg-emerald-600 text-white'
                  : step === item.num
                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {step > item.num ? '✓' : item.num}
            </div>
            <span
              className={`hidden sm:inline text-xs font-semibold ${
                step >= item.num ? 'text-slate-900 dark:text-white' : 'text-slate-400'
              }`}
            >
              {item.label}
            </span>
            {idx < 3 && <div className="w-6 sm:w-12 h-0.5 bg-slate-200 dark:bg-slate-700 mx-1" />}
          </div>
        ))}
      </div>

      {/* Form Card */}
      <GlassCard className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl">
        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              Step 1: Personal Information
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name (as per Aadhaar / Land Deed)
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number (For Turn SMS & IVR Call)
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Farmer & Land Information */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Wheat className="w-5 h-5 text-emerald-600" />
              Step 2: Land Holding & Crop Information
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Total Cultivable Land Area (in Acres)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="landAreaAcres"
                    value={formData.landAreaAcres}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Harvest Crop
                  </label>
                  <select
                    name="crop"
                    value={formData.crop}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                  >
                    <option value="Wheat (Kalyan Sona)">Wheat (Kalyan Sona) — MSP ₹2,275/Qtl</option>
                    <option value="Mustard">Mustard — MSP ₹5,650/Qtl</option>
                    <option value="Chana (Gram)">Chana (Gram) — MSP ₹5,440/Qtl</option>
                    <option value="Paddy (Common)">Paddy (Common) — MSP ₹2,183/Qtl</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Village
                  </label>
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Identity & Aadhaar Mock Placeholder */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Step 3: Identity Verification (Mock Integration)
            </h3>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
              <strong>Hackathon Note:</strong> Real UIDAI Aadhaar verification & e-KYC will be integrated via NestJS backend in Phase 2. Using placeholder verification for prototype.
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Aadhaar Number (12 Digits)
                </label>
                <input
                  type="text"
                  name="aadhaarNumber"
                  value={formData.aadhaarNumber}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kisan Credit Card / Farmer Registry ID (Optional)
                </label>
                <input
                  type="text"
                  name="farmerId"
                  value={formData.farmerId}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation & Summary */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in text-center sm:text-left">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Confirm Registration Details
                </h3>
                <p className="text-xs text-slate-500">
                  Please review your information before final registration.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500">Farmer Name:</span>
                <span className="font-bold text-slate-900 dark:text-white">{formData.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500">Mobile Number:</span>
                <span className="font-bold text-slate-900 dark:text-white">+91 {formData.mobile}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500">Land & Village:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formData.landAreaAcres} Acres • {formData.village}, {formData.district}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500">Primary Crop:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{formData.crop}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Verified Farmer ID:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{formData.farmerId}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Registration completed! You can now book your slot and receive your digital pass.</span>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <Button size="md" variant="outline" onClick={prevStep} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <Button size="md" variant="primary" onClick={nextStep} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Continue to Step {step + 1}
            </Button>
          ) : (
            <Link href="/farmer/book-slot">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Proceed to Book Slot →
              </Button>
            </Link>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
