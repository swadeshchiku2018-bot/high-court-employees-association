import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Contribution, AssociationSettings } from '../../types';
import { X, Printer, Shield, CheckCircle2 } from 'lucide-react';

interface ReceiptModalProps {
  contribution: Contribution | null;
  settings?: AssociationSettings | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ contribution, settings, onClose }) => {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    if (contribution) {
      const verifyText = `HCEA RECEIPT NO: ${contribution.receiptNo} | MEMBER: ${contribution.memberName} (${contribution.membershipNumber}) | AMOUNT: ₹${contribution.amount} | DATE: ${contribution.date}`;
      QRCode.toDataURL(verifyText, { width: 100, margin: 1 })
        .then(url => setQrUrl(url))
        .catch(console.error);
    }
  }, [contribution]);

  if (!contribution) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Top Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-amber-300 uppercase tracking-wide">
              Official Payment Receipt
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-amber-400 rounded-lg hover:bg-amber-300 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div id="printable-receipt" className="p-8 space-y-6 text-slate-800 bg-white">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-900 p-2 flex items-center justify-center shrink-0 border-2 border-amber-400 shadow-md">
                <Shield className="w-8 h-8 text-amber-300" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-blue-950 uppercase tracking-tight">
                  HIGH COURT EMPLOYEES' ASSOCIATION
                </h2>
                <p className="text-xs font-semibold text-slate-600">HIGH COURT CAMPUS, CUTTACK - 753002</p>
                <p className="text-[11px] text-slate-500">Reg No: 1978/HC/042 | Welfare Corpus Fund</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                PAID & VERIFIED
              </span>
              <p className="text-xs text-slate-500 mt-2 font-mono">
                DATE: <span className="font-bold text-slate-800">{contribution.date}</span>
              </p>
              <p className="text-xs text-slate-500 font-mono">
                RECEIPT NO: <span className="font-bold text-blue-900">{contribution.receiptNo}</span>
              </p>
            </div>
          </div>

          {/* Member Info Grid */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Received From (Member)</p>
              <p className="font-bold text-slate-900 text-base">{contribution.memberName}</p>
              <p className="text-xs text-slate-600 font-mono">Membership ID: {contribution.membershipNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase text-slate-500">Payment Purpose</p>
              <p className="font-bold text-blue-900 text-base">{contribution.purpose.replace('_', ' ')} CONTRIBUTION</p>
              <p className="text-xs text-slate-600">Financial Year: {contribution.financialYear}</p>
            </div>
          </div>

          {/* Payment Details Table */}
          <table className="w-full text-left border-collapse border border-slate-200 rounded-lg overflow-hidden text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-xs">
                <th className="p-3 border-b border-slate-200">Description</th>
                <th className="p-3 border-b border-slate-200">Mode / Txn Ref</th>
                <th className="p-3 border-b border-slate-200 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 border-b border-slate-200">
                  <p className="font-semibold text-slate-900">{contribution.purpose.replace('_', ' ')} SUBSCRIPTION</p>
                  <p className="text-xs text-slate-500">{contribution.remarks || "Regular monthly contribution towards High Court staff welfare corpus fund."}</p>
                </td>
                <td className="p-3 border-b border-slate-200 font-mono text-xs">
                  <p className="font-semibold">{contribution.paymentMode}</p>
                  <p className="text-slate-500">{contribution.transactionId}</p>
                </td>
                <td className="p-3 border-b border-slate-200 text-right font-bold text-slate-900 text-base">
                  ₹{contribution.amount.toLocaleString('en-IN')}
                </td>
              </tr>
              <tr className="bg-slate-50 font-bold">
                <td colSpan={2} className="p-3 text-right uppercase text-xs text-slate-600">
                  Total Amount Received:
                </td>
                <td className="p-3 text-right text-blue-900 text-lg">
                  ₹{contribution.amount.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Amount In Words */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs font-semibold text-blue-950 flex items-center justify-between">
            <span>STATUS: SUCCESSFUL (VERIFIED BY TREASURY)</span>
            <span className="flex items-center gap-1 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" /> System Generated Valid Receipt
            </span>
          </div>

          {/* Footer Signatures & QR */}
          <div className="flex items-end justify-between pt-6 border-t border-slate-200">
            <div className="flex items-center gap-3">
              {qrUrl && <img src={qrUrl} alt="QR Code" className="w-20 h-20 border p-1 rounded bg-white shadow-xs" />}
              <div className="text-[11px] text-slate-500">
                <p className="font-semibold text-slate-700">Digital Receipt Verification</p>
                <p>Scan to verify authenticity on HCEA portal.</p>
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="h-10 flex items-end justify-end">
                <span className="font-serif italic text-lg font-bold text-blue-900">Sri Ashutosh Swain</span>
              </div>
              <p className="text-xs font-bold text-slate-900">TREASURER / AUTHORIZED SIGNATORY</p>
              <p className="text-[10px] text-slate-500">High Court Employees' Association</p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
