'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar, Footer, useLanguage } from '@/components/common';
import { Button, GlassCard, Badge } from '@/components/ui';
import { MOCK_ANALYTICS } from '@/lib/mock-data/analytics';
import { 
  Sprout, 
  Clock, 
  ShieldCheck, 
  MapPin, 
  QrCode, 
  Users, 
  Boxes, 
  AlertTriangle, 
  CheckCircle2, 
  PhoneCall, 
  Smartphone, 
  Building, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  Scale, 
  CreditCard, 
  Layers,
  FileCheck,
  ChevronRight,
  HelpCircle,
  Truck
} from 'lucide-react';

export default function LandingPage() {
  const { t } = useLanguage();

  const coreFeatures = [
    {
      id: 'no-wait',
      title: 'Smart No-Wait Arrival',
      tag: 'Core SIH Feature',
      desc: 'Farmers never wait physically in long tractor lines at the mandi. Real-time turn alerts notify you exactly when to depart from home or your field.',
      icon: Clock,
      route: '/farmer/queue',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'dynamic-slots',
      title: 'Dynamic Slot Adjustment',
      tag: 'Core SIH Feature',
      desc: 'When a mandi experiences unexpected delays (e.g. weighbridge calibration), the system dynamically recalibrates slots or reroutes farmers to nearby relief centres.',
      icon: AlertTriangle,
      route: '/admin/dynamic-slots',
      color: 'from-amber-500 to-orange-600',
    },
    {
      id: 'smart-matching',
      title: 'Intelligent Centre Matching',
      tag: 'Core SIH Feature',
      desc: 'Recommends the fastest mandi by evaluating distance, queue congestion, counter speeds, and truck capacity—not just geographical proximity.',
      icon: MapPin,
      route: '/farmer/smart-centres',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      id: 'digital-twin',
      title: 'Digital Twin of Mandis',
      tag: 'Core SIH Feature',
      desc: 'A live 3D-styled virtual floor plan monitors physical choke-points from Gate Entry to Electronic Weighbridges and Bagging Bays in real time.',
      icon: Boxes,
      route: '/admin/digital-twin',
      color: 'from-purple-500 to-fuchsia-600',
    },
    {
      id: 'fairness-engine',
      title: 'Queue Fairness & Delay Protection',
      tag: 'Core SIH Feature',
      desc: 'Algorithmic transparency ensures no arbitrary queue jumping. Farmers affected by mandi-caused slowdowns receive automated fairness shields.',
      icon: Scale,
      route: '/admin/fairness',
      color: 'from-teal-500 to-emerald-600',
    },
    {
      id: 'digital-token',
      title: 'Digital Token System (QR)',
      tag: 'Transparency',
      desc: 'Non-transferable digital passes with tamper-proof QR codes eliminate manual paper slips and touts.',
      icon: QrCode,
      route: '/farmer/token',
      color: 'from-slate-700 to-slate-900',
    },
    {
      id: 'multi-channel',
      title: 'IVR & Non-Smartphone Access',
      tag: 'Accessibility',
      desc: 'Full accessibility via Automated Voice Calls (IVR), SMS push notifications, CSC Kendra operators, and Gram Panchayat desks.',
      icon: PhoneCall,
      route: '/assisted-booking',
      color: 'from-rose-500 to-red-600',
    },
    {
      id: 'procurement-lifecycle',
      title: '8-Stage Procurement Tracking',
      tag: 'Traceability',
      desc: 'Track your crop grain through verification, automated moisture assay (<12% FAQ), electronic weighing, and bagging.',
      icon: Layers,
      route: '/farmer/procurement',
      color: 'from-emerald-600 to-green-700',
    },
    {
      id: 'dbt-payments',
      title: 'Direct Benefit Transfer (DBT)',
      tag: 'Finance',
      desc: 'Direct bank credit tracking integrated with PFMS and Aadhaar Payment Bridge for guaranteed 48-hour MSP disbursement.',
      icon: CreditCard,
      route: '/farmer/payment',
      color: 'from-cyan-600 to-blue-700',
    },
  ];

  const howItWorksSteps = [
    { num: '01', title: 'Register', desc: 'Verify your Aadhaar & land records once.' },
    { num: '02', title: 'Match Centre', desc: 'AI recommends the mandi with the lowest wait time.' },
    { num: '03', title: 'Book Slot', desc: 'Select convenient harvest delivery time.' },
    { num: '04', title: 'Get Token', desc: 'Receive Digital Pass M-142 with QR code.' },
    { num: '05', title: 'Track at Home', desc: 'Live alerts track when farmers ahead clear.' },
    { num: '06', title: 'Arrive Just-in-Time', desc: 'Enter directly to unloading without lines.' },
    { num: '07', title: 'Weigh & Direct Credit', desc: 'Instant weighment slip and DBT credit.' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-emerald-50/40 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-400/10 dark:bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Government / SIH Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-xs">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Smart India Hackathon 2026 • Agri-Tech Zero-Waiting Protocol</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Smart Procurement. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600">
                Zero Waiting.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Connect farmers with procurement centres, manage digital tokens, and reach the mandi at the exact right time — eliminating hours of exhausting tractor lines.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/farmer/register" className="w-full sm:w-auto">
                <Button size="xl" variant="primary" className="w-full" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Register as Farmer
                </Button>
              </Link>
              <Link href="/farmer/smart-centres" className="w-full sm:w-auto">
                <Button size="xl" variant="outline" className="w-full" leftIcon={<MapPin className="w-5 h-5 text-emerald-600" />}>
                  Find Best Procurement Centre
                </Button>
              </Link>
            </div>

            {/* Quick Demo Shortcuts */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-500">
              <span>Quick Demo:</span>
              <Link href="/farmer/dashboard" className="text-emerald-600 hover:underline">
                Farmer Dashboard (Token M-142) →
              </Link>
              <span className="text-slate-300">•</span>
              <Link href="/admin/digital-twin" className="text-emerald-600 hover:underline">
                Mandi Digital Twin →
              </Link>
              <span className="text-slate-300">•</span>
              <Link href="/admin/dynamic-slots" className="text-emerald-600 hover:underline">
                Dynamic Delay Alerts →
              </Link>
            </div>
          </div>

          {/* Interactive Hero Visual Showcase Card */}
          <div className="mt-12 sm:mt-16 max-w-4xl mx-auto">
            <GlassCard className="p-6 sm:p-8 border-2 border-emerald-500/30 shadow-2xl bg-white/90 dark:bg-slate-900/90 rounded-3xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-3 text-center md:text-left">
                  <Badge variant="protected" size="md">
                    Live Mandi Dispatch Simulation
                  </Badge>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    Just-In-Time Mandi Arrival Card
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md">
                    Farmers are notified to depart when exactly 8 farmers are ahead. Zero overnight tractor camping.
                  </p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-emerald-600 font-bold">
                      <CheckCircle2 className="w-4 h-4" /> 74% Wait Time Reduced
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Algorithmic Fairness
                    </span>
                  </div>
                </div>

                {/* Hero Token Preview */}
                <div className="p-5 rounded-2xl bg-slate-950 text-white border border-slate-800 shadow-xl w-full md:w-80 shrink-0 text-center">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-2">
                    <span>DIGITAL PASS</span>
                    <span className="text-emerald-400 font-bold">🟢 ON TRACK</span>
                  </div>
                  <span className="text-4xl font-black font-mono text-emerald-400 block tracking-tight">
                    M-142
                  </span>
                  <p className="text-xs text-slate-300 mt-1">Ramesh Singh • 25 Qtl Wheat</p>
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800 text-left text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Ahead in Line</span>
                      <span className="font-bold text-white text-sm">8 Farmers</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Recommended Arrival</span>
                      <span className="font-bold text-emerald-400 text-sm">10:45 AM</span>
                    </div>
                  </div>
                  <Link href="/farmer/queue" className="block mt-4">
                    <Button size="sm" variant="primary" className="w-full">
                      Track Live Turn
                    </Button>
                  </Link>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* 3. PROBLEM SECTION */}
      <section className="py-16 sm:py-24 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="danger" size="sm">
              The Existing Crisis
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-2">
              The Reality of Indian Procurement Mandis Today
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Millions of farmers face agonizing, unpredictable delays during wheat and paddy harvest seasons.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-2">
              <span className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 inline-block">
                <Clock className="w-5 h-5" />
              </span>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">12 to 36 Hour Waits</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Farmers forced to camp overnight in tractors with grain exposed to rain, pests, and rot.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-2">
              <span className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 inline-block">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Unpredictable Bottlenecks</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                A single weighbridge breakdown causes 4-mile highway traffic jams with zero warning.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-2">
              <span className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 inline-block">
                <FileCheck className="w-5 h-5" />
              </span>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Manual Paper Slips</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Vulnerable to arbitrary queue manipulation, lost receipts, and intermediary touts.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-2">
              <span className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 inline-block">
                <Users className="w-5 h-5" />
              </span>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Zero Real-time Info</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Farmers arrive blindly without knowing if their nearest mandi is operating or congested.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-2">
              <span className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 inline-block">
                <CreditCard className="w-5 h-5" />
              </span>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Payment Uncertainty</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Delayed weighment paper entry delays Direct Benefit Transfer (DBT) bank credit for weeks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SOLUTION SECTION */}
      <section className="py-16 sm:py-24 bg-emerald-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <Badge variant="protected" size="sm">
              The MandiSetu Paradigm
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Transforming Mandi Chaos into an Orchestrated Symphony
            </h2>
            <p className="text-sm sm:text-base text-emerald-200">
              By combining digital queuing algorithms with physical mandi telemetry, MandiSetu turns the procurement yard into a Just-In-Time logistics pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-emerald-500/30 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
                01
              </div>
              <h3 className="text-lg font-bold">Intelligent Load Balancing</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Rather than sending all farmers to the closest overcrowded mandi, our algorithm balances intake across regional centres based on processing speeds and capacity.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-emerald-500/30 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold">
                02
              </div>
              <h3 className="text-lg font-bold">Virtual Queue & No-Wait Arrival</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Farmers wait comfortably at home while automated SMS, App, and IVR voice calls track progress, alerting them to depart only when their turn is near.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-emerald-500/30 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-600 flex items-center justify-center text-white font-bold">
                03
              </div>
              <h3 className="text-lg font-bold">Guaranteed Operational Fairness</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                If the centre itself suffers a breakdown or equipment slowdown, farmers’ slots are automatically shielded from penalties through transparent audit rules.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CORE DIFFERENTIATING FEATURES */}
      <section id="features" className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="success" size="sm">
              SIH 2026 Core Capabilities
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-2">
              The 5 Core Differentiating Features
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Engineered specifically for government-scale procurement logistics and farmer trust.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <GlassCard
                  key={feat.id}
                  hoverEffect={true}
                  className="p-6 flex flex-col justify-between border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-2xl bg-gradient-to-br ${feat.color} text-white shadow-md`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge variant="neutral" size="sm">
                        {feat.tag}
                      </Badge>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <Link
                      href={feat.route}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                    >
                      Explore Interactive UI <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="neutral" size="sm">
              Step-by-Step Flow
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-2">
              How MandiSetu Works for Farmers
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              From registration to direct bank deposit in 7 seamless, transparent steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
            {howItWorksSteps.map((step) => (
              <div
                key={step.num}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between text-center relative group hover:border-emerald-500 transition-colors"
              >
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {step.num}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. ACCESSIBILITY / ASSISTED CHANNELS */}
      <section id="accessibility" className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto p-8 rounded-3xl bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 text-white shadow-2xl border border-emerald-500/30">
            <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
              <Badge variant="protected" size="md">
                Inclusion & Universal Access
              </Badge>
              <h3 className="text-2xl sm:text-3xl font-black">
                Works for Every Farmer — With or Without Smartphones
              </h3>
              <p className="text-xs sm:text-sm text-emerald-200">
                Digital exclusion is prevented through multiple assisted government infrastructure touchpoints.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
                <Smartphone className="w-6 h-6 mx-auto text-emerald-400 mb-2" />
                <h4 className="font-bold text-sm">Smartphone Web App</h4>
                <p className="text-xs text-slate-300 mt-1">
                  PWA with regional languages, live QR pass, and real-time timers.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
                <PhoneCall className="w-6 h-6 mx-auto text-amber-400 mb-2" />
                <h4 className="font-bold text-sm">Interactive Voice (IVR)</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Automated outbound voice calls in local dialect: “8 farmers ahead, depart now”.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
                <Building className="w-6 h-6 mx-auto text-blue-400 mb-2" />
                <h4 className="font-bold text-sm">CSC & Panchayat Desk</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Village Village Level Entrepreneurs (VLE) assist booking and print paper tokens.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
                <Users className="w-6 h-6 mx-auto text-teal-400 mb-2" />
                <h4 className="font-bold text-sm">Cooperative Societies</h4>
                <p className="text-xs text-slate-300 mt-1">
                  PACS societies bulk book slots for member marginal farmers.
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link href="/assisted-booking">
                <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Access CSC / Panchayat Operator Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. STATISTICS SECTION */}
      <section className="py-16 sm:py-24 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              National Impact Telemetry
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1">
              Engineered for Nationwide Government Scale
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <GlassCard className="text-center p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <p className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {MOCK_ANALYTICS.nationalStats.farmersRegistered}
              </p>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">
                Farmers Registered
              </h4>
              <p className="text-[11px] text-slate-500">Across 8 major agricultural states</p>
            </GlassCard>

            <GlassCard className="text-center p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <p className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400 font-mono">
                {MOCK_ANALYTICS.nationalStats.procurementCentres}
              </p>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">
                Procurement Centres
              </h4>
              <p className="text-[11px] text-slate-500">Integrated e-NAM & FCI mandis</p>
            </GlassCard>

            <GlassCard className="text-center p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <p className="text-3xl sm:text-4xl font-black text-purple-600 dark:text-purple-400 font-mono">
                {MOCK_ANALYTICS.nationalStats.tokensManaged}
              </p>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">
                Digital Tokens Managed
              </h4>
              <p className="text-[11px] text-slate-500">Zero duplicate paper slips</p>
            </GlassCard>

            <GlassCard className="text-center p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <p className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {MOCK_ANALYTICS.nationalStats.waitingTimeReducedPercent}
              </p>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">
                Waiting Time Reduced
              </h4>
              <p className="text-[11px] text-slate-500">Average wait down from 14 hrs to 42 min</p>
            </GlassCard>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
