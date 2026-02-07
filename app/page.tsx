import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ScanFace,
  Boxes,
  IndianRupee,
  ArrowRight,
  CheckCircle,
  BarChart3,
  ShieldCheck,
  Globe,
  Zap,
  BarChart as ChartIcon
} from "lucide-react";

export default async function LandingPage() {
  const { userId, sessionClaims } = await auth();

  // If already logged in, redirect to dashboard
  if (userId) {
    const role = sessionClaims?.metadata?.role || "manager";
    redirect(role === 'supervisor' ? "/supervisor" : "/manager");
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">SiteManager<span className="text-indigo-600">.</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500 uppercase tracking-widest">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#solutions" className="hover:text-indigo-600 transition-colors">Solutions</a>
            <a href="#reporting" className="hover:text-indigo-600 transition-colors">Reporting</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="hidden xs:block text-sm font-black uppercase tracking-widest text-slate-900 hover:text-indigo-600 transition-colors px-2">
              Log In
            </Link>
            <Link href="/sign-up" className="bg-slate-900 text-white px-5 sm:px-6 py-3 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all hover:shadow-xl hover:shadow-slate-200 active:scale-95">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="pt-40 pb-20 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-black uppercase tracking-widest mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              The Next Gen Site Management
            </div>

            <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tight leading-[0.9] mb-8">
              Manage your sites<br />
              <span className="text-indigo-600">with precision.</span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 font-medium leading-relaxed mb-12">
              The all-in-one platform for site supervisors and managers. High-accuracy face recognition, real-time inventory tracking, and seamless financial management.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sign-up" className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest text-xl shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-32 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 group hover:bg-indigo-600 transition-all duration-500">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-8 group-hover:scale-110 transition-transform">
                  <ScanFace className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-white">AI Face Attendance</h3>
                <p className="text-slate-500 font-medium leading-relaxed group-hover:text-indigo-100">
                  Zero-fraud attendance using state-of-the-art face recognition. High accuracy matching ensures only authorized staff log in.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 group hover:bg-emerald-600 transition-all duration-500">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-8 group-hover:scale-110 transition-transform">
                  <Boxes className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-white">Inventory Control</h3>
                <p className="text-slate-500 font-medium leading-relaxed group-hover:text-emerald-50">
                  Track machinery and raw materials per site. Click photos to maintain visual records and prevent equipment loss.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 group hover:bg-orange-600 transition-all duration-500">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-8 group-hover:scale-110 transition-transform">
                  <IndianRupee className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-white">Cash Flow Tracker</h3>
                <p className="text-slate-500 font-medium leading-relaxed group-hover:text-orange-50">
                  Manage ingoing and outgoing finances for every site. Categorize expenses and view instant balance sheets.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="solutions" className="py-24 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-20 items-center">
              <div className="flex-1">
                <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-8">
                  Designed for the<br />modern workforce.
                </h2>
                <div className="space-y-6">
                  {[
                    "Role-based access for Supervisors & Managers",
                    "Real-time data isolation per site location",
                    "Instant reports and historical analytics",
                    "Offline-capable scanner interface"
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-slate-300">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div className="p-8 bg-slate-800 rounded-[2.5rem] border border-slate-700 text-center">
                  <div className="text-4xl font-black mb-2 text-indigo-400">99.8%</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Matching Accuracy</div>
                </div>
                <div className="p-8 bg-slate-800 rounded-[2.5rem] border border-slate-700 text-center">
                  <div className="text-4xl font-black mb-2 text-emerald-400">10x</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Efficiency Boost</div>
                </div>
                <div className="p-8 bg-slate-800 rounded-[2.5rem] border border-slate-700 text-center">
                  <div className="text-4xl font-black mb-2 text-orange-400">Zero</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Paper Records</div>
                </div>
                <div className="p-8 bg-slate-800 rounded-[2.5rem] border border-slate-700 text-center">
                  <div className="text-4xl font-black mb-2 text-indigo-400">24/7</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Remote Overlook</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="reporting" className="py-32 px-6">
          <div className="max-w-5xl mx-auto bg-indigo-600 rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 blur-[100px] rounded-full"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-8">
                Ready to digitize<br />your business?
              </h2>
              <p className="text-indigo-100 text-lg md:text-xl font-medium mb-12 max-w-xl mx-auto">
                Join hundreds of site managers who have already optimized their operations with SiteManager.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link href="/sign-up" className="bg-white text-indigo-600 px-10 py-5 rounded-3xl font-black uppercase tracking-widest text-lg hover:shadow-xl hover:shadow-indigo-800 transition-all active:scale-95">
                  Start Your Journey
                </Link>
                <div className="flex items-center gap-2 font-bold text-indigo-100">
                  <ShieldCheck className="w-5 h-5" />
                  No Credit Card Required
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2.5">
            <span className="text-lg font-black tracking-tighter text-slate-900 uppercase">SiteManager<span className="text-indigo-600">.</span></span>
          </div>
          <div className="text-slate-400 font-bold text-sm uppercase tracking-widest">
            © 2026 SITEMANAGER SOLUTIONS. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-6">
            <Globe className="w-5 h-5 text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors" />
            <ShieldCheck className="w-5 h-5 text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors" />
            <ChartIcon className="w-5 h-5 text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors" />
          </div>
        </div>
      </footer>
    </div>
  );
}
