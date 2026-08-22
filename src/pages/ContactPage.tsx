import React, { useState } from "react";
import { Mail, Send, CheckCircle2, AlertCircle, MessageSquare, Phone, Globe } from "lucide-react";
import { SiteSettings } from "../types";
import { api } from "../api";

interface ContactPageProps {
  settings?: SiteSettings;
}

export const ContactPage: React.FC<ContactPageProps> = ({ settings }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMsg("කරුණාකර සියලු තොරතුරු සම්පූර්ණ කරන්න.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.sendContactMessage(formData);
      setSuccessMsg(res.message || "ඔබගේ පණිවිඩය සාර්ථකව ලැබිණි. අප ඉක්මනින් සම්බන්ධ වන්නෙමු.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      setErrorMsg(err.message || "පණිවිඩය යැවීමේදී දෝෂයක් ඇතිවිය.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-amber-400 text-xs font-bold">
          <Mail className="w-3.5 h-3.5" />
          <span>CONTACT SUPPORT</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          අප අමතන්න (Contact Us)
        </h1>
        <p className="text-sm text-neutral-400">
          චිත්‍රපට, ටීවී සීරීස් හෝ සිංහල උපසිරැසි පිළිබඳ ඕනෑම ගැටලුවක්, ඉල්ලීමක් හෝ අදහසක් අප වෙත පහතින් යොමු කරන්න.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left: Contact Info Cards */}
        <div className="md:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              <span>සම්බන්ධතා විස්තර</span>
            </h3>

            <div className="space-y-3 text-xs sm:text-sm text-neutral-300">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-neutral-500 block text-[11px]">විද්‍යුත් තැපෑල (Email):</span>
                  <span className="font-semibold text-white">{settings?.contactEmail || "info@serieshub.lk"}</span>
                </div>
              </div>

              {settings?.telegramUrl && (
                <div className="flex items-start gap-3">
                  <Send className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-neutral-500 block text-[11px]">Telegram Community:</span>
                    <a
                      href={settings.telegramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-400 hover:underline font-semibold"
                    >
                      @SeriesHubLk_Official
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Globe className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-neutral-500 block text-[11px]">වෙබ් අඩවිය (Website):</span>
                  <span className="text-neutral-200">https://serieshub.lk</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-950/20 to-neutral-900 border border-amber-500/20 space-y-2">
            <h4 className="text-sm font-bold text-amber-400">උපසිරැසි නිර්මාණකරුවන්ට ආරාධනා</h4>
            <p className="text-xs text-neutral-300 leading-relaxed">
              ඔබ සිංහල උපසිරැසි නිර්මාණය කරන්නෙක් නම්, ඔබගේ උපසිරැසි SeriesHubLk හරහා ලක්ෂ සංඛ්‍යාත ප්‍රේක්ෂකයින් වෙත බෙදාහැරීමට අප හා එක්වන්න!
            </p>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="md:col-span-7 bg-neutral-900/90 rounded-2xl border border-neutral-800 p-6 sm:p-8 shadow-2xl space-y-5">
          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs sm:text-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-950/80 border border-red-500 text-red-300 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-300">
                නම (Your Name) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ඔබගේ සම්පූර්ණ නම ඇතුළත් කරන්න"
                className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500/60 transition-colors"
              />
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-300">
                විද්‍යුත් තැපෑල (Email Address) <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@gmail.com"
                className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500/60 transition-colors"
              />
            </div>

            {/* Subject Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-300">
                මාතෘකාව (Subject)
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="උදා: නව චිත්‍රපට ඉල්ලීමක් / උපසිරැසි ගැටලුවක්"
                className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500/60 transition-colors"
              />
            </div>

            {/* Message Textarea */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-300">
                පණිවිඩය (Message) <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="ඔබගේ පණිවිඩය මෙහි සටහන් කරන්න..."
                className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500/60 transition-colors resize-none"
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm tracking-wide shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? "යොමු වෙමින් පවතී..." : "යොමු කරන්න (Send Message)"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
