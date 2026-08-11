import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Building, Clock } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10 text-slate-800">
      <div className="text-center space-y-2">
        <span className="text-xs font-extrabold tracking-widest text-blue-900 uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          SECRETARIAT CONTACT & HELP
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Get in Touch with Association Office
        </h1>
        <p className="text-xs text-slate-600 max-w-xl mx-auto">
          Reach out to executive committee members or visit the High Court Association Secretariat room.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Contact Info */}
        <div className="md:col-span-5 bg-slate-900 text-white p-8 rounded-2xl shadow-xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-amber-300">High Court Secretariat</h2>
            <p className="text-xs text-slate-400">High Court Employees' Association, Cuttack</p>
          </div>

          <div className="space-y-4 text-xs text-slate-300">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Office Location:</p>
                <p className="leading-relaxed">
                  Association Room No. 12, Ground Floor,<br />
                  New High Court Building Complex,<br />
                  Cuttack, Odisha - 753002
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Phone Helpline:</p>
                <p>+91 (0671) 2508822 / 2508823</p>
                <p className="text-[11px] text-amber-300 font-mono">Mobile / WhatsApp: +91 94370 12345</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Official Email:</p>
                <p className="font-mono text-blue-300">secretary@hcea.gov.in</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Office Working Hours:</p>
                <p>Monday – Saturday: 10:00 AM – 05:30 PM</p>
                <p className="text-[10px] text-slate-400">(Closed on High Court Holidays & Second Saturdays)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200 p-8 shadow-md">
          {submitted ? (
            <div className="p-8 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900">Message Delivered Successfully!</h3>
              <p className="text-xs text-slate-600">
                Thank you for contacting the High Court Association office. The General Secretary's desk will review your inquiry shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2 bg-blue-900 text-white font-bold rounded-xl text-xs"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">
                Send Direct Grievance / Inquiry
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 94370 00000"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="name@hcea.gov.in"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject / Department</label>
                <select
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Membership Verification">Membership Verification</option>
                  <option value="Welfare Grant Request">Welfare Grant Request</option>
                  <option value="Subscription Ledger Issue">Subscription Ledger Issue</option>
                  <option value="ID Card Replacement">Digital ID Card Replacement</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Message Detail *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your query or suggestion..."
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer text-sm flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 text-amber-400" />
                Submit Inquiry to Secretariat
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
