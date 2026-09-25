import React, { useEffect, useState } from 'react';
import { Notice } from '../../types';
import {
  Printer, ArrowLeft, Download, Share2, Check, ShieldCheck,
  FileText, Calendar, Building, Sparkles, CheckCircle2, ExternalLink
} from 'lucide-react';

interface NoticePdfPageProps {
  noticeId: string;
  onNavigate: (route: string) => void;
}

export const NoticePdfPage: React.FC<NoticePdfPageProps> = ({ noticeId, onNavigate }) => {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<'UPLOADED_PDF' | 'LETTERHEAD'>('LETTERHEAD');

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch(`/api/notices/${noticeId}`)
      .then(async (res) => {
        if (!res.ok) {
          // If not found by ID, try finding in all notices
          const allRes = await fetch('/api/notices');
          if (allRes.ok) {
            const list: Notice[] = await allRes.json();
            const found = list.find(n => n.id === noticeId);
            if (found) return found;
          }
          throw new Error("Notice document not found");
        }
        return res.json();
      })
      .then((data: Notice) => {
        setNotice(data);
        if (data.attachmentUrl && (data.attachmentUrl.startsWith('data:application/pdf') || data.attachmentUrl.includes('.pdf') || data.attachmentUrl.startsWith('http') || data.attachmentUrl.startsWith('/'))) {
          setActiveView('UPLOADED_PDF');
        } else {
          setActiveView('LETTERHEAD');
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error loading notice:", err);
        setError("Official notice document could not be retrieved.");
        setIsLoading(false);
      });
  }, [noticeId]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadUploadedPdf = () => {
    if (!notice?.attachmentUrl) return;
    const link = document.createElement('a');
    link.href = notice.attachmentUrl;
    link.download = `${notice.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-blue-900 border-t-amber-400 rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-700">Loading Official High Court Notice Document...</p>
        <p className="text-xs text-slate-500 mt-1">Generating official document viewer & verified seal</p>
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-300 shadow-lg text-center max-w-md space-y-4">
          <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Notice Document Unavailable</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {error || "The requested notice circular ID was not found in the official registry."}
          </p>
          <button
            onClick={() => onNavigate('/notices')}
            className="px-5 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl text-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to All Notices
          </button>
        </div>
      </div>
    );
  }

  // Generate official dispatch reference number
  const refNo = `OHCEA/${notice.category.toUpperCase()}/2026/${notice.id.replace('not-', 'CIR-00')}`;
  
  // Format date in formal Indian legal gazette format
  const formattedDate = new Date(notice.date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const hasUploadedPdf = Boolean(notice.attachmentUrl && (notice.attachmentUrl.startsWith('data:application/pdf') || notice.attachmentUrl.includes('.pdf') || notice.attachmentUrl.startsWith('http') || notice.attachmentUrl.startsWith('/')));

  return (
    <div className="min-h-screen bg-slate-200/80 py-8 px-2 sm:px-4">
      {/* Top Floating Action Bar (Hidden on Print) */}
      <div className="no-print max-w-5xl mx-auto mb-6 bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/notices')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Notices
          </button>
          <div className="hidden sm:block border-l border-slate-700 pl-3">
            <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block">
              OFFICIAL NOTICE VIEWER
            </span>
            <span className="text-xs font-semibold text-slate-300">
              Ref: {refNo}
            </span>
          </div>
        </div>

        {/* View Switcher if Uploaded PDF exists */}
        {hasUploadedPdf && (
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setActiveView('UPLOADED_PDF')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'UPLOADED_PDF'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Uploaded PDF</span>
            </button>
            <button
              onClick={() => setActiveView('LETTERHEAD')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'LETTERHEAD'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Gazette Letterhead</span>
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {hasUploadedPdf && (
            <button
              onClick={handleDownloadUploadedPdf}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
              title="Download original uploaded PDF document"
            >
              <Download className="w-3.5 h-3.5 text-slate-950" />
              <span>Download PDF</span>
            </button>
          )}

          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-slate-700"
            title="Copy document URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 border border-slate-700"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: UPLOADED PDF VIEWER */}
      {hasUploadedPdf && activeView === 'UPLOADED_PDF' && (
        <div className="max-w-5xl mx-auto space-y-4 my-4">
          <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-900 text-amber-300 rounded-xl font-bold shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 uppercase">
                  {notice.category}
                </span>
                <h1 className="font-extrabold text-base sm:text-lg text-slate-900 mt-0.5">{notice.title}</h1>
                <p className="text-xs text-slate-500">
                  Official notification document uploaded by {notice.publishedBy} • {formattedDate}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadUploadedPdf}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Save PDF File</span>
              </button>
              <a
                href={`/api/notices/${notice.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all border border-slate-300 cursor-pointer"
                title="Open raw PDF document in full browser tab"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-900" />
                <span>Open Raw PDF in Tab</span>
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden">
            <iframe
              src={`/api/notices/${notice.id}/pdf`}
              title={notice.title}
              className="w-full h-[85vh] border-0 bg-slate-50"
            />
          </div>
        </div>
      )}

      {/* VIEW 2: OFFICIAL HIGH COURT LETTERHEAD GAZETTE */}
      {(!hasUploadedPdf || activeView === 'LETTERHEAD') && (
        <div className="pdf-page-container max-w-4xl mx-auto bg-white rounded-xl shadow-2xl border border-slate-300 overflow-hidden my-4">
        {/* Printable Letterhead Document */}
        <div className="p-8 sm:p-14 text-slate-900 font-serif leading-relaxed text-sm space-y-6">
          
          {/* Official Letterhead Header */}
          <div className="border-b-2 border-double border-slate-900 pb-5 text-center space-y-2">
            <div className="flex justify-between items-center mb-3">
              {/* Left Emblem */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
                <img
                  src="/emblem-india.svg"
                  alt="State Emblem of India"
                  className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                />
              </div>

              {/* Center Letterhead Text */}
              <div className="space-y-1">
                <h2 className="text-xs sm:text-sm font-sans font-bold tracking-widest text-slate-700 uppercase">
                  OFFICE OF THE SECRETARIAT
                </h2>
                <h1 className="text-lg sm:text-2xl font-serif font-extrabold text-[#002b66] tracking-tight uppercase">
                  HIGH COURT OF ORISSA EMPLOYEES' ASSOCIATION
                </h1>
                <p className="text-[11px] font-sans text-slate-600 font-medium">
                  (Registered under the Societies Registration Act XXI of 1860 • Regd. No. 1948/OHCEA)
                </p>
                <p className="text-[11px] font-sans text-slate-600 font-semibold tracking-wide">
                  HIGH COURT OF ORISSA, CHANDNI CHOWK, CUTTACK – 753002, ODISHA
                </p>
                <p className="text-[10px] font-mono text-slate-500">
                  Tel: +91 671 2508821 | Email: secretariat@OHCEA.odisha.gov.in | Portal: OHCEA.odisha.gov.in
                </p>
              </div>

              {/* Right Seal Emblem */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-blue-900 flex flex-col items-center justify-center bg-blue-50/50 p-1 text-center shadow-xs">
                  <ShieldCheck className="w-6 h-6 text-blue-900" />
                  <span className="text-[7px] font-sans font-extrabold text-blue-950 uppercase leading-tight mt-0.5">
                    OHCEA CUTTACK
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reference Number & Date Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs font-sans font-bold border-b border-slate-200 pb-3 gap-2">
            <div>
              <span className="text-slate-500">Letter Ref No.: </span>
              <span className="font-mono text-blue-950 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                {refNo}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Dated at Cuttack, the: </span>
              <span className="font-mono text-slate-900">{formattedDate}</span>
            </div>
          </div>

          {/* Official Subject Banner */}
          <div className="text-center my-6 space-y-2">
            <span className="inline-block px-3 py-1 text-[11px] font-sans font-extrabold uppercase tracking-widest bg-blue-900 text-white rounded">
              OFFICIAL {notice.category} NOTIFICATION
            </span>
            <h2 className="text-base sm:text-xl font-serif font-extrabold text-slate-950 underline decoration-slate-400 underline-offset-4 uppercase max-w-2xl mx-auto leading-snug">
              {notice.title}
            </h2>
          </div>

          {/* Notice Formal Body */}
          <div className="space-y-4 text-justify font-serif text-slate-900 leading-relaxed text-[13px] sm:text-[14px]">
            {notice.description && (
              <div className="p-4 bg-slate-50 border-l-4 border-blue-900 text-slate-800 font-sans text-xs sm:text-sm italic rounded-r-lg">
                <strong>Executive Summary:</strong> {notice.description}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <p className="font-sans font-bold text-xs uppercase text-slate-600">
                To: All Hon'ble Members, Officers, and Cadres of the High Court of Orissa.
              </p>
              
              <div className="whitespace-pre-line leading-relaxed text-slate-900 font-serif">
                {notice.content}
              </div>

              {notice.isImportant && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-950 font-sans text-xs font-semibold flex items-start gap-2">
                  <span className="font-bold uppercase text-[10px] bg-amber-400 px-1.5 py-0.5 rounded text-slate-950 shrink-0">
                    IMPORTANT
                  </span>
                  <span>
                    Compliance with the contents of this circular is earnestly requested from all section officers, department heads, and general members.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Official Signatures & Seal Section */}
          <div className="pt-10 border-t border-slate-300 mt-8">
            <div className="grid grid-cols-2 gap-8 items-end">
              {/* Left Rubber Stamp Seal */}
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full border-4 border-dashed border-blue-900/60 flex flex-col items-center justify-center p-2 text-center text-[#002b66] rotate-[-6deg]">
                  <div className="text-[7px] font-sans font-extrabold uppercase tracking-tighter">
                    ORISSA HIGH COURT
                  </div>
                  <ShieldCheck className="w-7 h-7 text-[#002b66] my-0.5" />
                  <div className="text-[6.5px] font-sans font-extrabold uppercase">
                    EMPLOYEES' ASSN.
                  </div>
                  <div className="text-[6px] font-mono text-slate-600">
                    ESTD 1948 • SEAL
                  </div>
                </div>
                <div className="text-[10px] font-sans text-slate-500">
                  <p className="font-bold text-slate-700">Official Association Seal</p>
                  <p>Digitally Authenticated</p>
                </div>
              </div>

              {/* Right: Signature Blocks */}
              <div className="text-right space-y-6">
                <div>
                  <div className="font-serif italic text-blue-900 font-bold text-sm tracking-wide mb-1">
                    [Sri Manoranjan Patnaik]
                  </div>
                  <p className="font-sans font-bold text-xs text-slate-900 uppercase">General Secretary</p>
                  <p className="text-[10px] font-sans text-slate-600">High Court Employees' Association</p>
                </div>
                <div>
                  <div className="font-serif italic text-blue-900 font-bold text-sm tracking-wide mb-1">
                    [Sri Debabrata Lenka]
                  </div>
                  <p className="font-sans font-bold text-xs text-slate-900 uppercase">President</p>
                  <p className="text-[10px] font-sans text-slate-600">High Court Employees' Association</p>
                </div>
              </div>
            </div>
          </div>

          {/* Official Distribution (Memo) */}
          <div className="pt-6 border-t border-slate-200 text-[11px] font-sans text-slate-600 space-y-1">
            <p className="font-bold text-slate-800 uppercase tracking-wide">
              Memo No.: {refNo}-A // Dated: {formattedDate}
            </p>
            <p className="font-semibold text-slate-700">Copy forwarded for kind information and necessary action to:</p>
            <ol className="list-decimal list-inside space-y-0.5 pl-2 text-slate-600">
              <li>The Principal Private Secretary to the Hon'ble The Chief Justice, High Court of Orissa.</li>
              <li>The Registrar General / Registrar (Judicial / Administration), High Court of Orissa.</li>
              <li>Notice Board of High Court Main Building, Annex Building, and Staff Quarters.</li>
              <li>Notice Board of the High Court Employees' Association Club House, Cuttack.</li>
              <li>Office Guard File & Official Digital Web Archives.</li>
            </ol>
          </div>

          {/* Footer Legal Verification Stamp */}
          <div className="border-t-2 border-slate-900 pt-3 flex flex-col sm:flex-row justify-between items-center text-[10px] font-sans text-slate-500 gap-1">
            <span>
              Published by: <strong>{notice.publishedBy}</strong> | High Court Employees' Association Secretariat
            </span>
            <span className="font-mono text-slate-400">
              Document Authenticity Verification: OHCEA.odisha.gov.in/verify/notice/{notice.id}
            </span>
          </div>

        </div>
      </div>
      )}
    </div>
  );
};
