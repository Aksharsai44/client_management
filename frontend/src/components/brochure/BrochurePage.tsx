import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Layers,
  ArrowRight,
  CheckCircle2,
  Video,
  MessageSquare,
  Users,
  CalendarCheck,
  Cpu,
  ShieldCheck,
  Send,
  Building,
  UserCheck,
  Briefcase,
  Star,
  Check,
  Sparkles,
  Zap,
} from 'lucide-react';

export const BrochurePage: React.FC = () => {
  const { pricingPlans, submitDemoRequest, setCurrentView, quickSwitchRole } = useApp();

  const [isYearly, setIsYearly] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    teamSize: '10-25 members',
    requirements: '',
  });
  const [whatsappSuccess, setWhatsappSuccess] = useState<string | null>(null);

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill in your name, email, and contact phone number.');
      return;
    }

    const { whatsappUrl } = submitDemoRequest(
      {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        companyName: formData.companyName || 'Corporate Client',
        teamSize: formData.teamSize,
        requirements: formData.requirements,
      },
      '15550192831' // Target WhatsApp demo number
    );

    setWhatsappSuccess(whatsappUrl);
    // Open WhatsApp in new window/tab
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">Client Management</span>
              <span className="text-[10px] font-bold tracking-widest text-blue-600 block uppercase -mt-1">
                Workspace
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">
              Features
            </a>
            <a href="#roles" className="hover:text-blue-600 transition-colors">
              User Roles
            </a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">
              Pricing & Plans
            </a>
            <a href="#demo" className="hover:text-blue-600 transition-colors">
              Request Demo
            </a>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentView('login')}
              className="px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
            >
              Sign In to Portal
            </button>
            <a
              href="#demo"
              className="hidden sm:inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              <span>Book Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Complete 4-Role Unified Enterprise SaaS Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight max-w-4xl mx-auto leading-tight">
            Seamless Client Collaboration, AI Meeting Transcripts & Attendance Tracking
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            One platform connecting Product Super Admins, Company Leaders, Enterprise Clients, and
            Work Users with real-time WhatsApp-style chat, AI transcripts, and verified attendance audits.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#demo"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-md flex items-center justify-center space-x-2 transition-all hover:scale-102"
            >
              <span>Schedule WhatsApp Demo</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={() => setCurrentView('login')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold text-sm hover:bg-slate-50 shadow-xs transition-colors"
            >
              Access Demo Persona Dashboards
            </button>
          </div>

          {/* Quick Persona Launch Buttons */}
          <div className="mt-12 pt-8 border-t border-slate-200 max-w-3xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              1-Click Live Interactive Exploration:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => quickSwitchRole('product_super_admin')}
                className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Product Admin</span>
              </button>
              <button
                onClick={() => quickSwitchRole('company_admin')}
                className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Building className="w-3.5 h-3.5" />
                <span>Company Admin</span>
              </button>
              <button
                onClick={() => quickSwitchRole('client')}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Client Portal</span>
              </button>
              <button
                onClick={() => quickSwitchRole('work_user')}
                className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Work User (Employee)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Core Capabilities
            </h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Built for High-Growth Companies & Discerning Enterprise Clients
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Daily, Weekly & Custom Call Scheduling
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Launch Google Meet and Zoom calls directly from the portal. One-click entry for all
                stakeholders with automated historical duration logging.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                AI Call Summaries & Interactive Q&A
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Turn lengthy client meetings into crisp AI bullet points, speaker transcripts, and
                ask questions directly against the call transcript with Gemini intelligence.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Attendance Audits & Printable Reports
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Visual Present vs Absent calendar indicators with user attendance percentages and
                standardized PDF attendance performance reports.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mb-5">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                WhatsApp-Style Chat & Direct Messaging
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Familiar chatting experience right inside the dashboard. Connect with clients and team
                members individually or across batch groups with toggle controls.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-5">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Threaded Community Discussion Forum
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Batch-specific announcement boards with nested multi-level threaded replies,
                edit and delete controls, and real-time interaction.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-5">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Resource Vault with 5-Star Reviews
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Upload reports, roadmaps, and documents. Clients submit ratings and detailed feedback
                to ensure quality assurance across deliverables.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Segregation Architecture */}
      <section id="roles" className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Multi-Role Access Control
            </h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Precision Scopes for Every Organization Stakeholder
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-base mb-1">Product Admin</h4>
                <p className="text-xs text-slate-500 mb-4">
                  Platform owner & tenant manager
                </p>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Demo requests & dummy credentials</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Company admin client/user count</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Brochure pricing plan customizer</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Gemini API keys & toggles</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => quickSwitchRole('product_super_admin')}
                className="mt-6 w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs rounded-lg transition-colors"
              >
                Launch Admin &rarr;
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                  <Building className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-base mb-1">Company Admin</h4>
                <p className="text-xs text-slate-500 mb-4">
                  Team lead & batch orchestrator
                </p>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Batch switching & filtering</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Add clients, users & CSV upload</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Call scheduling & transcripts</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Attendance audit & printable PDF</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => quickSwitchRole('company_admin')}
                className="mt-6 w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-lg transition-colors"
              >
                Launch Company &rarr;
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-base mb-1">Client Dashboard</h4>
                <p className="text-xs text-slate-500 mb-4">
                  Customer & sponsor stakeholder
                </p>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Dedicated client batch view</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>1-click meeting join & history</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Interactive AI transcript Q&A</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Submit 5-star reviews on reports</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => quickSwitchRole('client')}
                className="mt-6 w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-lg transition-colors"
              >
                Launch Client &rarr;
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-base mb-1">Work User (Worker)</h4>
                <p className="text-xs text-slate-500 mb-4">
                  Engineer, manager & consultant
                </p>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Active tasks & assigned groups</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Threaded team community posting</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>WhatsApp-style batch chat</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Upload deliverable documents</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => quickSwitchRole('work_user')}
                className="mt-6 w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-xs rounded-lg transition-colors"
              >
                Launch Worker &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Transparent Pricing
            </h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Plans That Scale with Your Client Batches
            </p>
            <p className="mt-3 text-sm text-slate-500">
              Real-time pricing synced directly from the Product Admin control panel.
            </p>

            {/* Toggle Monthly/Yearly */}
            <div className="mt-6 inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  !isYearly ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center space-x-1 ${
                  isYearly ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Annual Billing</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded font-black">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {pricingPlans.map((plan) => {
              const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-7 flex flex-col justify-between transition-all ${
                    plan.popular
                      ? 'border-2 border-blue-600 shadow-xl bg-white relative'
                      : 'border border-slate-200 bg-white shadow-2xs hover:shadow-md'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm flex items-center space-x-1">
                      <Zap className="w-3 h-3 fill-current" />
                      <span>Most Popular Enterprise Plan</span>
                    </div>
                  )}

                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.tagline}</p>

                    <div className="mt-6 flex items-baseline">
                      <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        ${price}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 ml-1.5">
                        /{isYearly ? 'year' : 'month'}
                      </span>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Included Features:
                      </p>
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start space-x-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <a
                      href="#demo"
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                        plan.popular
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                          : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                      }`}
                    >
                      <span>Choose {plan.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Demo Request & WhatsApp Section */}
      <section id="demo" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl">
            <div className="text-center max-w-xl mx-auto mb-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
                <Send className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Request an Instant WhatsApp Demo
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Submit your team information below. We will immediately route your request to our
                WhatsApp business channel and generate temporary test credentials in the Product Admin!
              </p>
            </div>

            {whatsappSuccess ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-emerald-900 text-lg">
                  Demo Request Dispatched to WhatsApp!
                </h4>
                <p className="text-xs text-emerald-700 max-w-md mx-auto">
                  Your details have been logged in the platform registry. Our enterprise product team
                  has received your WhatsApp lead and a temporary credential is ready for review in
                  Product Admin.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <a
                    href={whatsappSuccess}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center space-x-1.5"
                  >
                    <span>Reopen WhatsApp Chat</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => quickSwitchRole('product_super_admin')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold inline-flex items-center space-x-1.5"
                  >
                    <span>Inspect in Product Admin</span>
                  </button>
                  <button
                    onClick={() => {
                      setWhatsappSuccess(null);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        companyName: '',
                        teamSize: '10-25 members',
                        requirements: '',
                      });
                    }}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-bold"
                  >
                    Submit Another
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@enterprise.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="Acme Global Inc"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Expected Team & Client Size
                  </label>
                  <select
                    value={formData.teamSize}
                    onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="1-10 members">1-10 members</option>
                    <option value="10-25 members">10-25 members</option>
                    <option value="25-100 members">25-100 members</option>
                    <option value="100+ Enterprise">100+ Enterprise members</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Specific Feature Requirements
                  </label>
                  <textarea
                    rows={3}
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="Tell us what you need (e.g., client attendance tracking, AI transcripts, WhatsApp alerts, CSV uploads...)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition-all hover:scale-101"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit & Send Directly to WhatsApp</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-900">Client Management</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center space-x-6 text-slate-600 font-medium">
            <button onClick={() => setCurrentView('login')} className="hover:text-blue-600">
              Sign In
            </button>
            <a href="#features" className="hover:text-blue-600">
              Features
            </a>
            <a href="#pricing" className="hover:text-blue-600">
              Pricing
            </a>
            <a href="#demo" className="hover:text-blue-600">
              WhatsApp Demo
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
