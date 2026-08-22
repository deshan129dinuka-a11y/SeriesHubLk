import React, { useState } from "react";
import {
  Crown,
  Sparkles,
  Zap,
  CheckCircle2,
  Download,
  Tv,
  Film,
  ShieldCheck,
  Send,
  HelpCircle,
  Copy,
  Check,
  CreditCard,
  Building2,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Star,
  Users,
  Clock,
  ArrowRight,
} from "lucide-react";
import { SiteSettings } from "../types";
import { api } from "../api";

interface VIPMembershipPageProps {
  onNavigate: (tab: string, param?: string) => void;
  settings?: SiteSettings;
}

interface Plan {
  id: string;
  name: string;
  sinName: string;
  duration: string;
  priceLKR: number;
  periodLabel: string;
  popular?: boolean;
  savings?: string;
  features: string[];
}

export const VIPMembershipPage: React.FC<VIPMembershipPageProps> = ({
  onNavigate,
  settings,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>("gold");
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [paymentRef, setPaymentRef] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const plans: Plan[] = [
    {
      id: "silver",
      name: "Silver VIP Pass",
      sinName: "මාසික සාමාජිකත්වය",
      duration: "1 Month (දින 30)",
      priceLKR: 500,
      periodLabel: "/ 1 Month",
      features: [
        "1 Device / Telegram Access",
        "Direct Google Drive & Mega Fast Links",
        "1080p Full HD Sinhala Sub Releases",
        "100% Ad-Free Direct Downloads",
        "Standard Movie & Series Request Queue",
        "Daily Subtitle Updates",
      ],
    },
    {
      id: "gold",
      name: "Gold VIP Pro",
      sinName: "මාස 3ක සාමාජිකත්වය",
      duration: "3 Months (දින 90)",
      priceLKR: 1200,
      periodLabel: "/ 3 Months",
      popular: true,
      savings: "20% ඉතිරියක් (Save 20%)",
      features: [
        "2 Devices / Telegram Group & Bot Access",
        "Ultra High-Speed Google Drive & Direct CDN Links",
        "4K UHD & 1080p 10-Bit Sinhala Sub Releases",
        "100% Ad-Free Direct One-Click Downloads",
        "Priority Sinhala Subtitle Request Queue (24-48 hrs)",
        "VIP Telegram Discussion Lounge & Bot Access",
        "Early Access to trending TV Series",
      ],
    },
    {
      id: "platinum",
      name: "Platinum Ultimate VIP",
      sinName: "වාර්ෂික සාමාජිකත්වය",
      duration: "12 Months (දින 365)",
      priceLKR: 3500,
      periodLabel: "/ 1 Year",
      savings: "42% ඉතිරියක් (Save 42%)",
      features: [
        "4 Devices / Telegram Multi-Account Access",
        "Unlimited High-Speed Direct Cloud & Drive Links",
        "4K HDR / Remux & 1080p Sinhala Sub Releases",
        "Top Priority Custom Movie & Subtitle Requests",
        "VIP Member Badge in Telegram Community",
        "Direct 1-on-1 VIP Admin Telegram Support",
        "Lifetime Access to exclusive Archive collections",
      ],
    },
  ];

  const faqs = [
    {
      q: "VIP සාමාජිකත්වය සක්‍රිය (Activate) කරගන්නේ කෙසේද?",
      a: "ඔබට කැමති Plan එකක් තෝරා, අපගේ බැංකු ගිණුමකට හෝ eZ Cash/mCash මගින් ගෙවීම සිදුකර, ගෙවීම් රිසිට්පත (Receipt/Reference) ඉහත පෝරමය හරහා හෝ අපගේ නිල Telegram (@SeriesHubLk_Official) වෙත යොමු කරන්න. විනාඩි 15-30ක් ඇතුළත ඔබගේ VIP ගිණුම සක්‍රිය වේ.",
    },
    {
      q: "VIP සාමාජිකයින්ට ලැබෙන ප්‍රධාන වාසි මොනවාද?",
      a: "වෙළඳ දැන්වීම් හෝ Countdown ටයිමර් රහිත Direct High-Speed Google Drive / Mega Links, 4K UHD & 1080p ඉහළම ගුණාත්මක වීඩියෝ, නිකුත් වන දිනයේදීම ලැබෙන සිංහල උපසිරැසි සහ Private VIP Telegram Bot හරහා ක්ෂණිකව Download/Stream කිරීමේ පහසුකම හිමිවේ.",
    },
    {
      q: "මට අවශ්‍ය ඕනෑම චිත්‍රපටයක් හෝ ටීවී සීරීස් එකක් ඉල්ලීමට (Request) හැකිද?",
      a: "ඔව්! VIP සාමාජිකයින්ට අපගේ Telegram VIP Request Portal හරහා ඕනෑම චිත්‍රපටයක් හෝ සීරීස් එකක් ඉල්ලුම් කළ හැක. අපගේ උපසිරැසි පරිවර්තන කණ්ඩායම විසින් ප්‍රමුඛතාවය මත එය සකස් කර ලබාදෙයි.",
    },
    {
      q: "ගෙවීම් කළ හැකි ක්‍රම මොනවාද?",
      a: "Commercial Bank, Sampath Bank, Bank of Ceylon (BOC), HNB බැංකු තැන්පතු හෝ Online Banking හරහා, සහ eZ Cash, mCash, FriMi, Koko මගින් පහසුවෙන් ගෙවීම් කළ හැක.",
    },
  ];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(label);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      setSubmitError("කරුණාකර නම, විද්‍යුත් තැපෑල සහ දුරකථන අංකය ඇතුළත් කරන්න.");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const activePlan = plans.find((p) => p.id === selectedPlan) || plans[1];
      const messageBody = `
[VIP Membership Request]
Plan: ${activePlan.name} (${activePlan.duration} - LKR ${activePlan.priceLKR})
Name: ${name}
Email: ${email}
Phone / WhatsApp: ${phone}
Telegram: ${telegramUsername || "Not provided"}
Payment Method: ${paymentMethod}
Payment Reference / Slip: ${paymentRef || "Not attached / Will send via Telegram"}
Additional Notes: ${notes || "None"}
      `.trim();

      await api.sendContactMessage({
        name,
        email,
        subject: `👑 [VIP Registration] ${activePlan.name} - ${name}`,
        message: messageBody,
      });

      setSubmitSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message || "දෝෂයක් ඇතිවිය. කරුණාකර නැවත උත්සාහ කරන්න හෝ Telegram හරහා සම්බන්ධ වන්න.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentActivePlan = plans.find((p) => p.id === selectedPlan) || plans[1];

  return (
    <div className="min-h-screen bg-neutral-950 text-white animate-fadeIn pb-24">
      {/* Top Ambient Glow Banner */}
      <div className="relative overflow-hidden bg-gradient-to-b from-amber-950/40 via-neutral-950 to-neutral-950 border-b border-neutral-800/80 pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-sky-500/10 blur-3xl pointer-events-none -z-10"></div>

        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-black tracking-wider uppercase shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Crown className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>SERIESHUB VIP CLUB</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            අසීමිත වේගයකින්, දැන්වීම් රහිතව <br />
            <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
              VIP සාමාජිකත්වය (VIP Membership)
            </span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Direct High-Speed Google Drive බාගත කිරීම්, 4K UHD ගුණාත්මකභාවය,
            විශේෂිත VIP Telegram Channel සහ ප්‍රමුඛතා සිංහල උපසිරැසි ඉල්ලීම් සමඟින් ශ්‍රී ලාංකේය විශිෂ්ටතම සිනමා අත්දැකීම ලබාගන්න.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-neutral-300">
            <div className="flex items-center gap-2 bg-neutral-900/80 px-4 py-2 rounded-xl border border-neutral-800">
              <Users className="w-4 h-4 text-amber-400" />
              <span>
                <strong className="text-white">1,850+</strong> සක්‍රිය VIP සාමාජිකයින්
              </span>
            </div>
            <div className="flex items-center gap-2 bg-neutral-900/80 px-4 py-2 rounded-xl border border-neutral-800">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>
                <strong className="text-white">1 Gbps+</strong> Direct High-Speed CDN
              </span>
            </div>
            <div className="flex items-center gap-2 bg-neutral-900/80 px-4 py-2 rounded-xl border border-neutral-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                <strong className="text-white">100%</strong> තෘප්තිමත් සේවාව
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
        {/* Section 1: VIP Perks Grid */}
        <div className="space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              VIP සාමාජිකත්වයේ විශේෂ වරප්‍රසාද
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              සාමාන්‍ය පරිශීලකයින්ට නොලැබෙන සුවිශේෂී පහසුකම් රැසක් ඔබ වෙත
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-amber-500/40 transition-all space-y-3 group shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                Direct High-Speed Drive Links
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                කෙටි ලින්ක්ස් (Shortlinks), කරදරකාරී දැන්වීම් හෝ Countdown ටයිමර් කිසිවක් නොමැතිව Direct Google Drive, Mega සහ High-Speed සර්වර්ස් හරහා තත්පර ගණනකින් බාගත කරන්න.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-amber-500/40 transition-all space-y-3 group shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Film className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                4K UHD & 1080p 10-Bit Quality
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                ඉහළම ශ්‍රව්‍ය-දෘශ්‍ය ගුණාත්මකභාවයකින් (5.1 Dolby Audio, 10-Bit HEVC) යුතු 4K සහ Full HD පිටපත් සිංහල උපසිරැසි සමඟ ලබාගත හැකිය.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-amber-500/40 transition-all space-y-3 group shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                VIP Telegram Channel & Cloud Bot
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                අපගේ විශේෂිත Telegram Channel සහ automated bot මගින් ඔබගේ දුරකථනයට හෝ පරිගණකයට ඍජුවම Telegram හරහා Movies / TV Series Stream සහ Download කරන්න.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-amber-500/40 transition-all space-y-3 group shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                Priority Subtitle Requests
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                ඔබ කැමති ඕනෑම නවතම හෝ පැරණි චිත්‍රපටයකට හෝ සීරීස් එකකට සිංහල උපසිරැසි ඉල්ලීමක් සිදුකර පැය 24-48ක් ඇතුළත එය ප්‍රමුඛතාව මත සකසා ලබාගන්න.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-amber-500/40 transition-all space-y-3 group shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Tv className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                Multi-Device Compatibility
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Android TV, Smart TV Box, Windows PC, Mac, iPhone, iPad සහ Android ඕනෑම උපාංගයකින් පහසුවෙන් භාවිත කිරීමේ හැකියාව.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-amber-500/40 transition-all space-y-3 group shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                24/7 Dedicated VIP Support
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                ඕනෑම තාක්ෂණික ගැටලුවක්, download link අලුත් කිරීමක් හෝ උපදෙසක් සඳහා Telegram හරහා ඍජුවම admin සහය ලබාගැනීමේ හැකියාව.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Membership Plans */}
        <div id="pricing-plans" className="space-y-8 scroll-mt-24">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-amber-400 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>CHOOSE YOUR VIP PLAN</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              ඔබට ගැලපෙන VIP Plan එක තෝරාගන්න
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              පහසු ගෙවීම් ක්‍රම සහ ක්ෂණික සක්‍රිය කිරීම් සමඟ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  id={`plan-card-${plan.id}`}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                    plan.popular
                      ? "bg-gradient-to-b from-amber-950/40 via-neutral-900 to-neutral-900 border-2 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.25)] scale-102"
                      : "bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 shadow-xl"
                  } ${isSelected ? "ring-2 ring-amber-400" : ""}`}
                >
                  {/* Popular Ribbon */}
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-black tracking-wider uppercase shadow-md flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>MOST POPULAR</span>
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-white">{plan.name}</h3>
                        {plan.savings && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {plan.savings}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 mt-1">{plan.sinName}</p>
                    </div>

                    <div className="pt-2 border-t border-neutral-800">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs text-neutral-400 font-bold">LKR</span>
                        <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                          {plan.priceLKR.toLocaleString()}
                        </span>
                        <span className="text-xs text-neutral-400 font-semibold">{plan.periodLabel}</span>
                      </div>
                      <span className="text-[11px] text-amber-400 block mt-1 font-medium">
                        {plan.duration}
                      </span>
                    </div>

                    {/* Features List */}
                    <div className="space-y-3 pt-2">
                      <p className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                        ඇතුළත් පහසුකම්:
                      </p>
                      <ul className="space-y-2.5 text-xs text-neutral-300">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <span className="leading-snug">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-8 mt-6 border-t border-neutral-800">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlan(plan.id);
                        const el = document.getElementById("activation-form");
                        el?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={`w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                        plan.popular || isSelected
                          ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-amber-500/20"
                          : "bg-neutral-800 hover:bg-neutral-700 text-white"
                      }`}
                    >
                      <Crown className="w-4 h-4" />
                      <span>මෙම Plan එක තෝරන්න (Select)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Activation & Payment Details Form */}
        <div
          id="activation-form"
          className="scroll-mt-24 bg-neutral-900/90 rounded-3xl border border-neutral-800 p-6 sm:p-10 shadow-2xl space-y-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
            <div>
              <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Crown className="w-4 h-4" />
                <span>STEP-BY-STEP ACTIVATION</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                VIP සාමාජිකත්වය සක්‍රිය කරගැනීම (Activation)
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                තෝරාගත් Plan එක:{" "}
                <span className="text-amber-400 font-bold">
                  {currentActivePlan.name} (LKR {currentActivePlan.priceLKR} - {currentActivePlan.duration})
                </span>
              </p>
            </div>

            {/* Quick Telegram Activation Button */}
            {settings?.telegramUrl && (
              <a
                href={settings.telegramUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>Telegram හරහා ක්ෂණිකව සක්‍රිය කරන්න</span>
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Payment Accounts Details */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>ගෙවීම් කළ හැකි බැංකු ගිණුම් විස්තර</span>
              </h3>

              {/* Commercial Bank */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    <span className="font-bold text-xs sm:text-sm text-white">Commercial Bank</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard("8009124567", "combank")}
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    {copiedAccount === "combank" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAccount === "combank" ? "Copied!" : "Copy No"}</span>
                  </button>
                </div>
                <div className="text-xs text-neutral-300 space-y-1 bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-850">
                  <p><span className="text-neutral-500">Account No:</span> <strong className="text-white tracking-wider">8009124567</strong></p>
                  <p><span className="text-neutral-500">Account Name:</span> SeriesHubLk Media</p>
                  <p><span className="text-neutral-500">Branch:</span> Colombo Super Grade</p>
                </div>
              </div>

              {/* Sampath Bank */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-orange-400" />
                    <span className="font-bold text-xs sm:text-sm text-white">Sampath Bank</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard("1045236789", "sampath")}
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    {copiedAccount === "sampath" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAccount === "sampath" ? "Copied!" : "Copy No"}</span>
                  </button>
                </div>
                <div className="text-xs text-neutral-300 space-y-1 bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-850">
                  <p><span className="text-neutral-500">Account No:</span> <strong className="text-white tracking-wider">1045236789</strong></p>
                  <p><span className="text-neutral-500">Account Name:</span> SeriesHubLk</p>
                  <p><span className="text-neutral-500">Branch:</span> City Branch</p>
                </div>
              </div>

              {/* Mobile Wallets: eZ Cash & mCash */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-xs sm:text-sm text-white">eZ Cash / mCash / FriMi</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard("0771234567", "mobile")}
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    {copiedAccount === "mobile" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAccount === "mobile" ? "Copied!" : "Copy No"}</span>
                  </button>
                </div>
                <div className="text-xs text-neutral-300 space-y-1 bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-850">
                  <p><span className="text-neutral-500">Mobile Number:</span> <strong className="text-white tracking-wider">077 123 4567</strong></p>
                  <p><span className="text-neutral-500">Name:</span> SeriesHubLk Admin</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>සක්‍රිය වීමේ කාලය:</span>
                </p>
                <p className="text-neutral-300">
                  ගෙවීම් රිසිට්පත යොමු කර විනාඩි 15 - 30ක් ඇතුළත ඔබගේ VIP ගිණුම සක්‍රිය කර Telegram VIP Group එකට ඇතුළත් කෙරේ.
                </p>
              </div>
            </div>

            {/* Right: Submission Form */}
            <div className="lg:col-span-7 space-y-5">
              {submitSuccess ? (
                <div className="p-8 rounded-2xl bg-emerald-950/90 border-2 border-emerald-500 text-center space-y-4 shadow-2xl animate-fadeIn">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-white">
                    ඔබගේ VIP ඉල්ලීම සාර්ථකව ලැබිණි!
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
                    ස්තූතියි, <strong className="text-amber-400">{name}</strong>! අපගේ VIP කණ්ඩායම විසින් ඔබගේ තොරතුරු සහ ගෙවීම් පරීක්ෂා කර විනාඩි 15-30ක් ඇතුළත WhatsApp / Telegram ඔස්සේ ඔබව සම්බන්ධ කරගනු ඇත.
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    {settings?.telegramUrl && (
                      <a
                        href={settings.telegramUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>Telegram Admin වෙත Receipt එක එවන්න</span>
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setSubmitSuccess(false);
                        setName("");
                        setEmail("");
                        setPhone("");
                        setPaymentRef("");
                        setNotes("");
                      }}
                      className="px-6 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs sm:text-sm"
                    >
                      තවත් ඉල්ලීමක් කරන්න
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {submitError && (
                    <div className="p-4 rounded-xl bg-red-950/80 border border-red-500 text-red-300 text-xs sm:text-sm">
                      {submitError}
                    </div>
                  )}

                  {/* Plan Selector Radio */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-300">
                      තෝරාගත් VIP Plan එක:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {plans.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedPlan(p.id)}
                          className={`p-3 rounded-xl text-center border text-xs font-bold transition-all ${
                            selectedPlan === p.id
                              ? "bg-amber-500 text-black border-amber-400 shadow-md"
                              : "bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700"
                          }`}
                        >
                          <span className="block truncate">{p.name.split(" ")[0]} VIP</span>
                          <span className="block text-[11px] opacity-85">LKR {p.priceLKR}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-300">
                        ඔබගේ සම්පූර්ණ නම <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="උදා: කසුන් පෙරේරා"
                        className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-300">
                        WhatsApp / දුරකථන අංකය <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="077 123 4567"
                        className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Email & Telegram */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-300">
                        විද්‍යුත් තැපෑල (Email) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-300">
                        Telegram Username (විකල්ප)
                      </label>
                      <input
                        type="text"
                        value={telegramUsername}
                        onChange={(e) => setTelegramUsername(e.target.value)}
                        placeholder="@username"
                        className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Payment Method & Reference */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-300">
                        ගෙවූ ආකාරය (Payment Method)
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                      >
                        <option value="Commercial Bank">Commercial Bank Transfer</option>
                        <option value="Sampath Bank">Sampath Bank Transfer</option>
                        <option value="Bank of Ceylon">Bank of Ceylon (BOC)</option>
                        <option value="eZ Cash / mCash">eZ Cash / mCash</option>
                        <option value="FriMi / Koko">FriMi / Koko</option>
                        <option value="Direct Telegram Payment">Telegram හරහා කෙලින්ම ගෙවීම</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-300">
                        Bank Reference / Transaction No
                      </label>
                      <input
                        type="text"
                        value={paymentRef}
                        onChange={(e) => setPaymentRef(e.target.value)}
                        placeholder="උදා: Ref: 984521034"
                        className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-300">
                      අමතර සටහන් හෝ ඔබ කැමති උපසිරැසි ඉල්ලීමක් (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="ඔබට විශේෂයෙන් අවශ්‍ය Movies/Series හෝ වෙනත් විස්තර මෙහි සටහන් කරන්න..."
                      className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500 resize-none"
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-sm tracking-wide shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Crown className="w-4 h-4" />
                    <span>
                      {submitting
                        ? "ඉල්ලීම යොමු වෙමින් පවතී..."
                        : `LKR ${currentActivePlan.priceLKR} - VIP සක්‍රිය කිරීමට යොමු කරන්න`}
                    </span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: FAQ Section */}
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center justify-center gap-2">
              <HelpCircle className="w-6 h-6 text-amber-400" />
              <span>නිතර අසන ප්‍රශ්න (FAQ)</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              VIP සාමාජිකත්වය සම්බන්ධයෙන් ඔබේ ගැටලුවලට පිළිතුරු
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-neutral-900/90 border border-neutral-800 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-6 py-4.5 flex items-center justify-between text-left gap-4 hover:bg-neutral-850 transition-colors"
                  >
                    <span className="font-bold text-xs sm:text-sm text-white">{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4.5 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-neutral-800/60 pt-3 bg-neutral-950/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-amber-600/20 via-yellow-600/15 to-rose-600/20 border border-amber-500/30 p-8 sm:p-12 text-center space-y-5 shadow-2xl">
          <Crown className="w-10 h-10 text-amber-400 mx-auto animate-bounce" />
          <div className="space-y-2 max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              දැන්ම SeriesHubLk VIP සාමාජිකයෙකු වන්න
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300">
              ඔබේ ප්‍රියතම සිංහල උපසිරැසි සහිත චිත්‍රපට සහ ටීවී සීරීස් ලොව හොඳම ගුණාත්මකභාවයෙන් අත්විඳින්න.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => {
                const el = document.getElementById("pricing-plans");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>VIP Plans බලන්න</span>
            </button>
            <button
              onClick={() => onNavigate("contact")}
              className="px-6 py-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs sm:text-sm border border-neutral-700 transition-all cursor-pointer"
            >
              ප්‍රශ්නයක් තිබේද? අප අමතන්න
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
