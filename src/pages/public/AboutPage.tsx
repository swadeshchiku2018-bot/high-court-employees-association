import React, { useEffect, useState } from 'react';
import { AssociationSettings } from '../../types';
import { Shield, Target, Eye, Award, Users, BookOpen, HeartHandshake } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const [settings, setSettings] = useState<AssociationSettings | null>(null);

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(setSettings).catch(console.error);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12 text-slate-800">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-extrabold tracking-widest text-blue-900 uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          ABOUT THE ASSOCIATION
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          High Court Employees' Association
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto">
          Established in 1978 to foster unity, service dignity, staff welfare, and judicial administrative excellence.
        </p>
      </div>

      {/* Main About Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-md space-y-6">
        <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-3">
          Our Organizational Profile
        </h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          {settings?.aboutText || "The High Court Employees' Association represents judicial administrative cadres, section officers, court masters, translators, assistants, and technical personnel. We work closely with the High Court Registry and Honorable Chief Justice to ensure cadre advancement, welfare, and digital court workflows."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="p-5 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-base">
              <Target className="w-5 h-5 text-amber-600" />
              <h3>Our Mission</h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {settings?.mission || "To safeguard employee service rights, promote professional skill development, provide rapid emergency medical & educational relief, and maintain high standards of court service."}
            </p>
          </div>

          <div className="p-5 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
              <Eye className="w-5 h-5 text-amber-600" />
              <h3>Our Vision</h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {settings?.vision || "An empowered, techno-savvy, and harmonious judicial administrative workforce operating with exemplary speed, integrity, and fraternity."}
            </p>
          </div>
        </div>
      </div>

      {/* Core Objectives */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 text-center">Core Pillars of Association Service</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: HeartHandshake, title: "Emergency Medical Relief", desc: "Instant grants up to ₹1,00,000 for critical surgeries and specialized hospital care." },
            { icon: BookOpen, title: "Merit Education Awards", desc: "Scholarships and annual financial assistance for higher education of employee children." },
            { icon: Users, title: "Cadre Progression", desc: "Negotiating service pay matrix anomalies and promotion avenues before court committees." },
            { icon: Award, title: "Digital ID & Amenities", desc: "Smart digital ID cards, subsidies at court canteen, and access to club facilities." },
            { icon: Shield, title: "Grievance Redressal", desc: "Formal employee grievance cell handling section transfer and workplace equity issues." },
            { icon: Target, title: "Sports & Cultural Meets", desc: "Annual inter-departmental badminton, chess, and cultural competitions for staff." }
          ].map((col, i) => (
            <div key={i} className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
              <col.icon className="w-6 h-6 text-blue-900" />
              <h3 className="font-bold text-slate-900 text-sm">{col.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{col.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
