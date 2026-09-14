import React from 'react';
import Link from 'next/link';
import { Sprout, Phone, Shield, ExternalLink, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Col 1 & 2: Project Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-white">
                  Mandi<span className="text-emerald-400">Setu</span>
                </span>
                <p className="text-xs text-slate-400">Smart Procurement. Zero Waiting.</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              An intelligent procurement-centre queue and farmer management platform built for 
              <strong> Smart India Hackathon 2026</strong>. Eliminating hours of physical mandi waiting 
              through digital tokens, JIT arrival schedules, and transparent algorithmic queue fairness.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-3 py-2 rounded-xl w-fit">
              <Phone className="w-4 h-4" />
              <span>National Kisan Toll-Free IVR: <strong>1800-180-1551</strong></span>
            </div>
          </div>

          {/* Col 3: Farmer Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Farmer Services
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/farmer/register" className="hover:text-emerald-400 transition-colors">
                  New Farmer Registration
                </Link>
              </li>
              <li>
                <Link href="/farmer/smart-centres" className="hover:text-emerald-400 transition-colors">
                  Smart Centre Recommender
                </Link>
              </li>
              <li>
                <Link href="/farmer/book-slot" className="hover:text-emerald-400 transition-colors">
                  Book Procurement Slot
                </Link>
              </li>
              <li>
                <Link href="/farmer/token" className="hover:text-emerald-400 transition-colors">
                  View Digital Pass / Token
                </Link>
              </li>
              <li>
                <Link href="/farmer/queue" className="hover:text-emerald-400 transition-colors">
                  Live Queue Tracker
                </Link>
              </li>
              <li>
                <Link href="/farmer/payment" className="hover:text-emerald-400 transition-colors">
                  DBT Payment Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Operations & Admin */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Mandi Operations
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/admin/dashboard" className="hover:text-emerald-400 transition-colors">
                  Centre Ops Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin/digital-twin" className="hover:text-emerald-400 transition-colors">
                  Mandi Digital Twin 3D View
                </Link>
              </li>
              <li>
                <Link href="/admin/dynamic-slots" className="hover:text-emerald-400 transition-colors">
                  Dynamic Slot Bottlenecks
                </Link>
              </li>
              <li>
                <Link href="/admin/fairness" className="hover:text-emerald-400 transition-colors">
                  Queue Fairness Rules
                </Link>
              </li>
              <li>
                <Link href="/admin/centres" className="hover:text-emerald-400 transition-colors">
                  Multi-Centre Monitor
                </Link>
              </li>
              <li>
                <Link href="/assisted-booking" className="hover:text-emerald-400 transition-colors">
                  CSC / Panchayat Counter
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Governance & Standards */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              National Architecture
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-1.5 text-slate-400">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>e-NAM Interoperable</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-400">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>PM-Kisan Registry Ready</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-400">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>PFMS DBT Direct Credit</span>
              </li>
              <li className="pt-2">
                <Link href="/login" className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline">
                  Official Portal Login <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 MandiSetu. Smart India Hackathon 2026 Project Prototype.</p>
          <div className="flex items-center gap-6">
            <span>Designed for Accessibility & Inclusion</span>
            <span>Zero-Wait Mandi Standard</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
