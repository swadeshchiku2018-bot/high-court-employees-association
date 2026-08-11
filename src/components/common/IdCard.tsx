import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Member, AssociationSettings } from '../../types';
import { Scale, MapPin, Phone, Globe, Printer, RotateCw } from 'lucide-react';

interface IdCardProps {
  member: Member;
  settings?: AssociationSettings | null;
}

export const IdCard: React.FC<IdCardProps> = ({ member, settings }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const printRef = useRef<HTMLDivElement>(null);

  const verificationUrl = `${window.location.origin}/verify/member/${member.membershipId}`;

  useEffect(() => {
    // Generate QR with no margin and high contrast
    QRCode.toDataURL(verificationUrl, { margin: 1, width: 140, color: { dark: '#003366', light: '#ffffff' } })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error(err));
  }, [verificationUrl]);

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date();
  const validUpto = `31.12.${currentDate.getFullYear()}`;
  const issueDate = `01.01.${currentDate.getFullYear()}`;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-id-card, .printable-id-card * {
            visibility: visible;
          }
          .printable-id-card {
            position: absolute;
            left: 50%;
            top: 40px;
            transform: translateX(-50%) scale(0.95) !important;
            width: 600px !important;
            transform-origin: top center;
          }
          .id-card-wrapper {
            transform: none !important;
          }
          .id-card-front, .id-card-back {
            position: relative !important;
            transform: none !important;
            backface-visibility: visible !important;
            page-break-inside: avoid;
            margin-bottom: 40px;
            box-shadow: none !important;
          }
        }
      `}</style>
      {/* Action Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3 w-full print:hidden">
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-all cursor-pointer"
        >
          <RotateCw className="w-4 h-4 text-[#003366]" />
          Flip to {isFlipped ? "Back" : "Front"}
        </button>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#003366] rounded-lg shadow-sm hover:bg-blue-900 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Print Card
        </button>
      </div>

      {/* Scaling Wrapper for Mobile Responsiveness (Prevents Clipping) */}
      <div className="flex justify-center w-full overflow-hidden sm:overflow-visible min-h-[400px] printable-id-card">
        
        {/* Fixed Size ID Card Container */}
        <div 
          className="w-[600px] h-[378px] shrink-0 [perspective:1000px] group font-sans origin-top transition-transform"
          style={{ transform: 'scale(min(1, calc((100vw - 32px) / 600)))' }}
        >
          <div
            ref={printRef}
            className={`relative w-full h-full duration-700 [transform-style:preserve-3d] transition-transform id-card-wrapper ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
          >
            {/* ================= FRONT OF ID CARD ================= */}
            <div className="absolute inset-0 w-full h-full rounded-2xl bg-white shadow-xl overflow-hidden [backface-visibility:hidden] flex flex-col border border-slate-300 id-card-front">
              {/* Top Navy Border */}
              <div className="h-6 bg-[#002855] w-full shrink-0" />

              <div className="flex-1 flex px-5 pt-4 pb-2 relative">
                {/* Background Watermark (Center) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.06] pointer-events-none">
                  <img src="/logo.png" alt="" className="w-56 h-56 grayscale" />
                </div>

                {/* Left Column (Logo & Photo) */}
                <div className="w-[110px] flex flex-col items-center shrink-0">
                  {/* Logo Area */}
                  <div className="w-[85px] h-[85px] mb-3 shrink-0">
                    <img src="/logo.png" alt="Association Logo" className="w-full h-full object-contain" />
                  </div>

                  {/* Photo */}
                  <div className="w-[90px] h-[110px] border-[1.5px] border-[#002855] p-0.5 bg-white shrink-0">
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* President Signature Area */}
                  <div className="text-center mt-auto mb-2 w-full">
                    <div className="h-8 flex items-end justify-center border-b border-black/20 mx-1 relative">
                      {/* Signature */}
                      <img 
                        src="/president_sign.png" 
                        onError={(e) => { e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/f/fb/John_Hancock_Signature.svg" }}
                        className="absolute bottom-1 w-[90%] h-6 object-contain opacity-80" 
                        alt="President Signature" 
                      />
                    </div>
                    <div className="text-[11px] font-bold text-[#002855] mt-1">PRESIDENT</div>
                  </div>
                </div>

                {/* Center & Right Column */}
                <div className="flex-1 flex flex-col ml-5 relative">
                  {/* Header Text */}
                  <div className="text-center w-full mb-1">
                    <h2 className="text-[22px] font-serif font-bold text-[#002855] leading-[1.1] tracking-wide">
                      HIGH COURT EMPLOYEES'
                      <br />
                      ASSOCIATION
                    </h2>
                    <p className="text-[13px] font-bold text-[#002855] mt-1 tracking-wider">CUTTACK</p>
                    <div className="flex items-center justify-center my-2">
                      <div className="h-[1.5px] bg-slate-400 w-full max-w-[280px] relative">
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#002855] rotate-45"></div>
                      </div>
                    </div>
                    <h3 className="text-[16px] font-bold text-[#002855] tracking-wide">MEMBERSHIP ID CARD</h3>
                  </div>

                  {/* Member Details */}
                  <div className="flex-1 flex relative">
                    <div className="w-full max-w-[310px] text-[12px] space-y-[3px] mt-1 z-10 text-slate-900 leading-[1.2]">
                      <div className="grid grid-cols-[125px_1fr]">
                        <span className="font-medium">Name</span>
                        <span className="font-extrabold break-words pr-2">: {member.name.toUpperCase()}</span>
                      </div>
                      <div className="grid grid-cols-[125px_1fr]">
                        <span className="font-medium">Designation</span>
                        <span className="font-medium break-words pr-2">: {member.designation.toUpperCase()}</span>
                      </div>
                      <div className="grid grid-cols-[125px_1fr]">
                        <span className="font-medium">Department/Section</span>
                        <span className="font-medium break-words pr-2">: {member.department.toUpperCase()}</span>
                      </div>
                      <div className="grid grid-cols-[125px_1fr] mt-1">
                        <span className="font-medium">Membership No.</span>
                        <span className="font-extrabold text-[#002855] break-words pr-2">: {member.membershipId}</span>
                      </div>
                      <div className="grid grid-cols-[125px_1fr]">
                        <span className="font-medium">Date of Issue</span>
                        <span className="font-medium">: {issueDate}</span>
                      </div>
                      <div className="grid grid-cols-[125px_1fr]">
                        <span className="font-medium">Valid Upto</span>
                        <span className="font-medium">: {validUpto}</span>
                      </div>
                    </div>

                    {/* QR Code and Secretary Signature */}
                    <div className="absolute right-0 bottom-4 flex flex-col items-center w-[90px]">
                      <div className="border border-slate-500 p-1 bg-white mb-2">
                        {qrDataUrl ? (
                          <img src={qrDataUrl} alt="QR Code" className="w-[70px] h-[70px]" />
                        ) : (
                          <div className="w-[70px] h-[70px] bg-slate-100"></div>
                        )}
                      </div>
                      <div className="text-center w-full mt-2">
                        <div className="h-8 flex items-end justify-center border-b border-black/20 relative">
                          {/* Signature */}
                          <img 
                            src="/secretary_sign.png" 
                            onError={(e) => { e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/f/fb/John_Hancock_Signature.svg" }}
                            className="absolute bottom-1 w-[90%] h-6 object-contain opacity-80" 
                            alt="Secretary Signature" 
                          />
                        </div>
                        <div className="text-[11px] font-bold text-[#002855] mt-1">SECRETARY</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Role Pill (Centered to Card) */}
              <div className="absolute bottom-[22px] left-1/2 -translate-x-1/2 z-30">
                <div className="bg-[#002855] text-white text-[13px] font-bold px-12 py-1.5 rounded-t-xl rounded-b-none uppercase tracking-wide whitespace-nowrap">
                  REGULAR MEMBER
                </div>
              </div>

              {/* Bottom Navy Border */}
              <div className="h-[22px] bg-[#002855] w-full shrink-0 relative z-20" />
            </div>

            {/* ================= BACK OF ID CARD ================= */}
            <div className="absolute inset-0 w-full h-full rounded-2xl bg-white shadow-xl overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col border border-slate-300 id-card-back">
              {/* Top Navy Header */}
              <div className="h-10 bg-[#002855] w-full shrink-0 flex items-center justify-center px-6">
                <div className="h-px bg-white/40 flex-1"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-white mx-3 shadow-[0_0_5px_white]"></div>
                <span className="text-white text-[15px] font-bold tracking-widest uppercase">HIGH COURT EMPLOYEES' ASSOCIATION</span>
                <div className="w-1.5 h-1.5 rounded-full bg-white mx-3 shadow-[0_0_5px_white]"></div>
                <div className="h-px bg-white/40 flex-1"></div>
              </div>

              <div className="flex-1 flex flex-col px-6 pt-5 pb-3 relative justify-between">
                {/* Center Watermark */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.06] pointer-events-none">
                  <img src="/logo.png" alt="" className="w-72 h-72 grayscale" />
                </div>

                <div className="flex w-full z-10 gap-8 h-full">
                  {/* Left Side: Instructions */}
                  <div className="flex-[1.5]">
                    <div className="bg-[#002855] text-white text-[11px] font-bold px-4 py-1.5 rounded w-fit mb-4 tracking-wide shadow-sm">
                      INSTRUCTIONS
                    </div>
                    <ul className="text-[13px] text-slate-800 space-y-3.5 font-medium leading-[1.35] pl-2">
                      <li className="flex items-start">
                        <span className="mr-2 text-[#002855] text-[20px] leading-[15px]">•</span>
                        <span>This card is the property of<br />High Court Employees' Association.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-[#002855] text-[20px] leading-[15px]">•</span>
                        <span>This card is non-transferable.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-[#002855] text-[20px] leading-[15px]">•</span>
                        <span>Lost card must be reported<br />to the Association immediately.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-[#002855] text-[20px] leading-[15px]">•</span>
                        <span>This card is valid only for the<br />period mentioned on the front.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Right Side: QR & Mem No */}
                  <div className="flex-1 flex flex-col items-center">
                    <div className="bg-[#002855] text-white text-[11px] font-bold px-4 py-1.5 rounded mb-2 shadow-sm w-full text-center tracking-wide">
                      MEMBERSHIP NO.
                    </div>
                    <div className="text-[26px] font-extrabold text-[#002855] tracking-tight mb-3">
                      {member.membershipId}
                    </div>

                    <div className="flex flex-col items-center relative">
                      <div className="w-2.5 h-2.5 bg-[#002855] rounded-full absolute -top-2 shadow-[0_0_0_2px_white] z-10"></div>
                      <div className="w-[1.5px] h-4 bg-[#002855] mb-1"></div>
                      {qrDataUrl ? (
                        <img src={qrDataUrl} alt="QR Code" className="w-[100px] h-[100px] border-[1.5px] border-slate-400 p-1 mb-2 bg-white" />
                      ) : (
                        <div className="w-[100px] h-[100px] bg-slate-100 border-[1.5px] border-slate-400 mb-2"></div>
                      )}
                      <div className="bg-[#002855] text-white text-[10px] font-bold px-5 py-1.5 rounded shadow-sm tracking-wide">
                        SCAN TO VERIFY
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Footer Details */}
                <div className="w-full mt-5 pt-3 relative z-10">
                  <div className="absolute top-0 left-0 w-full flex items-center justify-center">
                    <div className="w-full h-px bg-slate-400"></div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-800 font-medium mt-3">
                    {/* Location */}
                    <div className="flex items-center gap-2 flex-[1.2] border-r border-slate-300 pr-2">
                      <div className="bg-[#002855] p-1.5 rounded-full shrink-0 shadow-sm">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <div className="leading-tight">
                        High Court Employees' Association<br />
                        High Court of Orissa, Cuttack - 753002<br />
                        Odisha, India
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="flex items-center gap-2 flex-1 px-4 border-r border-slate-300">
                      <div className="bg-[#002855] p-1.5 rounded-full shrink-0 shadow-sm">
                        <Phone className="w-4 h-4 text-white" />
                      </div>
                      <div className="leading-tight">
                        {settings?.phone || "0671-0000000"}<br />
                        {settings?.email || "hcea.cuttack@gmail.com"}
                      </div>
                    </div>

                    {/* Web */}
                    <div className="flex items-center gap-2 flex-1 pl-4">
                      <div className="bg-[#002855] p-1.5 rounded-full shrink-0 shadow-sm">
                        <Globe className="w-4 h-4 text-white" />
                      </div>
                      <div className="leading-tight">
                        www.hcea-cuttack.org
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
