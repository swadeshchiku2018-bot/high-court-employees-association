import React, { useState } from 'react';
import { Contribution } from '../../types';
import { X, ShieldCheck, CreditCard, Landmark, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface PaymentModalProps {
  memberId: string;
  memberName: string;
  membershipNumber: string;
  onSuccess: (contribution: Contribution) => void;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  memberId,
  memberName,
  membershipNumber,
  onSuccess,
  onClose
}) => {
  const [amount, setAmount] = useState<number>(500);
  const [purpose, setPurpose] = useState<Contribution['purpose']>('MONTHLY');
  const [paymentMode, setPaymentMode] = useState<Contribution['paymentMode']>('ONLINE');
  const [remarks, setRemarks] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError("Amount must be greater than ₹0");
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const res = await fetch('/api/contributions/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          amount,
          purpose,
          paymentMode,
          remarks
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Payment verification failed");
      }

      const newContrib = await res.json();
      setIsProcessing(false);
      onSuccess(newContrib);
    } catch (err: any) {
      setIsProcessing(false);
      setError(err.message || "Payment process failed.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white px-6 py-5 flex items-center justify-between border-b border-amber-400/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base text-amber-300">HCEA Online Portal Gateway</h3>
              <p className="text-xs text-slate-300">Secure Association Fund Contribution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member Banner */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center text-xs">
          <div>
            <span className="text-slate-500 font-medium">Contributor: </span>
            <span className="font-bold text-slate-800">{memberName}</span>
          </div>
          <div className="font-mono font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            {membershipNumber}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-slate-800">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Contribution Purpose */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Select Purpose
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value as any)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
            >
              <option value="MONTHLY">Monthly Subscription (₹500 Default)</option>
              <option value="WELFARE">Welfare Corpus Fund</option>
              <option value="GENERAL">General Association Fund</option>
              <option value="DONATION">Voluntary Special Relief Donation</option>
              <option value="SPECIAL">Special Event Contribution</option>
            </select>
          </div>

          {/* Amount presets */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Contribution Amount (₹)
            </label>
            <div className="flex gap-2 mb-2">
              {[500, 1000, 2500, 5000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    amount === preset
                      ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ₹{preset}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="100"
              step="100"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none font-bold text-slate-900"
            />
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                  paymentMode === 'ONLINE'
                    ? 'border-blue-900 bg-blue-50/60 ring-1 ring-blue-900'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMode"
                  checked={paymentMode === 'ONLINE'}
                  onChange={() => setPaymentMode('ONLINE')}
                  className="text-blue-900 focus:ring-blue-900"
                />
                <CreditCard className="w-4 h-4 text-blue-900" />
                <span className="text-xs font-bold text-slate-800">UPI / Cards / Netbanking</span>
              </label>

              <label
                className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                  paymentMode === 'BANK_TRANSFER'
                    ? 'border-blue-900 bg-blue-50/60 ring-1 ring-blue-900'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMode"
                  checked={paymentMode === 'BANK_TRANSFER'}
                  onChange={() => setPaymentMode('BANK_TRANSFER')}
                  className="text-blue-900 focus:ring-blue-900"
                />
                <Landmark className="w-4 h-4 text-blue-900" />
                <span className="text-xs font-bold text-slate-800">Direct Bank Transfer</span>
              </label>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Remarks / Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Monthly contribution for August 2026"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Instant PDF official receipt will be generated and logged to your account upon payment completion.</span>
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying Server Gateway...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  Pay ₹{amount.toLocaleString('en-IN')} Now
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
