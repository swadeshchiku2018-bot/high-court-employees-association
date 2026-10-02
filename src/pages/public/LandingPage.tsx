import React, { useEffect, useState } from 'react';
import { AssociationSettings, OfficeBearer, Notice, EventItem, GalleryItem } from '../../types';
import { Shield, Users, Award, HeartHandshake, Calendar, FileText, ArrowRight, CheckCircle2, ChevronRight, ChevronLeft, Download, Sparkles, MapPin, Phone, Mail, QrCode, ExternalLink, Megaphone, MessageSquare } from 'lucide-react';
import { GossipCard } from '../../components/common/GossipCard';

interface LandingPageProps {
  onNavigate: (route: string) => void;
  onOpenNoticeModal?: (notice: Notice) => void;
}

const Marquee = 'marquee' as any;

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenNoticeModal }) => {
  const [settings, setSettings] = useState<AssociationSettings | null>(null);
  const [officeBearers, setOfficeBearers] = useState<OfficeBearer[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [gossipPosts, setGossipPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const gossipScrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [res, gossipRes] = await Promise.all([
          fetch('/api/public/initial-data'),
          fetch('/api/gossip')
        ]);

        if (res.ok) {
          const data = await res.json();
          if (data.settings) setSettings(data.settings);
          if (data.officeBearers) setOfficeBearers(data.officeBearers);
          if (data.notices) setNotices(data.notices);
          if (data.events) setEvents(data.events);
          if (data.gallery) setGallery(data.gallery);
        }
        
        if (gossipRes.ok) {
          const gossipData = await gossipRes.json();
          setGossipPosts(gossipData);
        }
      } catch (e) {
        console.error("Landing data load error:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const carouselImages = [
    "/carousel/IMG-20260731-WA0391.jpg",
    "/carousel/IMG-20260731-WA0392.jpg",
    "/carousel/IMG-20260731-WA0393.jpg"
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-12 pb-12 bg-slate-50 text-slate-800">

      {/* TOP GROUP: Carousel, Announcements, Hero */}
      <div className="flex flex-col">
        {/* 0. PHOTO CAROUSEL */}
        <section className="w-full bg-slate-900 overflow-hidden relative mb-2" style={{ height: '350px' }}>
          {carouselImages.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`Carousel Slide ${idx + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none" />

          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
            {carouselImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`w-3 h-3 rounded-full border border-white transition-all cursor-pointer ${idx === currentImageIndex ? 'bg-amber-500 border-amber-500' : 'bg-white/30 hover:bg-white'
                  }`}
              />
            ))}
          </div>
        </section>

        {/* SCROLLING ANNOUNCEMENT BAR */}
        {notices.filter(n => n.isImportant).length > 0 && (
          <div className="bg-[#003366] text-white shadow-sm z-20 relative border-b border-slate-300">
            <div className="max-w-7xl mx-auto flex items-stretch h-full px-4">
              <div className="bg-amber-500 text-[#003366] px-5 py-2.5 font-extrabold uppercase text-xs flex items-center gap-2.5 shrink-0 z-10 relative shadow-[4px_0_10px_rgba(0,0,0,0.15)]">
                {/* Visual pulsing megaphone SVG */}
                <div className="relative flex items-center justify-center">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#003366] opacity-30 animate-ping"></span>
                  <Megaphone className="w-4 h-4 text-[#003366] relative z-10 fill-[#003366]/20" />
                </div>
                <span className="hidden sm:inline tracking-wider">Announcements</span>
                <span className="sm:hidden tracking-wider">Alert</span>
              </div>
              <div className="flex-1 overflow-hidden relative flex items-center px-2">
                <Marquee className="text-sm font-bold tracking-wide py-2.5 flex items-center" scrollamount="6">
                  {notices.filter(n => n.isImportant).map((n, i) => (
                    <span key={n.id} className="mx-8">
                      <span className="text-amber-400 mr-2">[{n.date}]</span>
                      <a
                        href={n.attachmentUrl ? `/api/notices/${n.id}/pdf` : `/notice/${n.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-amber-300 hover:underline cursor-pointer transition-colors"
                        title="Click to view notice details"
                      >
                        {n.title}
                      </a>
                      {i < notices.filter(x => x.isImportant).length - 1 && <span className="mx-8 text-white/30">•</span>}
                    </span>
                  ))}
                </Marquee>
              </div>
            </div>
          </div>
        )}

        {/* 1. HERO & NOTICES SECTION */}
        <section className="bg-white border-b border-slate-300">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">

            {/* Welcome Content */}
            <div className="lg:col-span-8 space-y-6 pt-4">
              <h1 className="text-3xl font-bold text-[#003366] uppercase">
                Welcome to the High Court Employees' Association
              </h1>

              <p className="text-base text-slate-700 leading-relaxed text-justify">
                {settings?.heroSubtitle || "The official democratic representative body advocating for the dignity, professional advancement, health security, and fraternity of High Court administrative & judicial cadre. We strive for excellence in service and unity among all cadres."}
              </p>

              <div className="flex flex-wrap items-center gap-4 border-t border-slate-200 pt-4">
                <button
                  onClick={() => onNavigate('/register')}
                  className="px-6 py-2.5 bg-[#003366] hover:bg-blue-800 text-white font-bold rounded shadow-sm transition-all flex items-center gap-2 cursor-pointer uppercase text-xs"
                >
                  <span>Register for Membership</span>
                </button>
                <button
                  onClick={() => onNavigate('/login')}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded shadow-sm transition-all flex items-center gap-2 cursor-pointer uppercase text-xs"
                >
                  <span>Member Login Portal</span>
                </button>
                <button
                  onClick={() => onNavigate('/verify')}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#003366] border border-slate-300 font-bold rounded transition-all flex items-center gap-2 cursor-pointer uppercase text-xs"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Verify ID Card</span>
                </button>
              </div>
            </div>

            {/* What's New Ticker */}
            <div className="lg:col-span-4 border border-amber-500 rounded bg-[#f5f5f5] overflow-hidden flex flex-col h-[300px]">
              <div className="bg-amber-500 text-[#003366] font-bold p-2 text-center text-sm uppercase flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                What's New
              </div>
              <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-white">
                {notices.map((notice) => (
                  <div key={notice.id} className="border-b border-slate-200 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0">
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="bg-[#003366] text-white px-1.5 py-0.5 font-bold uppercase">{notice.category}</span>
                      <span className="text-slate-500 font-bold">{notice.date}</span>
                    </div>
                    <a
                      href={notice.attachmentUrl ? `/api/notices/${notice.id}/pdf` : `/notice/${notice.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-blue-800 hover:underline text-left cursor-pointer inline leading-relaxed group/item"
                      title="Open PDF in a new tab"
                    >
                      <span>{notice.title}</span>
                      <img
                        src="/new-blinking.svg"
                        alt="NEW"
                        className="inline-block align-middle ml-1.5 h-3.5"
                      />
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover/item:text-blue-700 shrink-0 inline-block align-middle ml-1" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>
      </div> {/* END TOP GROUP */}

      {/* 2. DASHBOARD STATS */}
      <section className="bg-[#e9f2f9] border-b border-slate-300 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 border-l-4 border-[#003366] shadow-sm flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Total Registered Members</span>
              <span className="text-2xl font-bold text-[#003366]">{settings?.stats?.totalMembers?.toLocaleString('en-IN') || "1,248"}</span>
            </div>
            <div className="bg-white p-4 border-l-4 border-amber-500 shadow-sm flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Active Cadre Strength</span>
              <span className="text-2xl font-bold text-amber-600">{settings?.stats?.activeMembers?.toLocaleString('en-IN') || "1,180"}</span>
            </div>
            <div className="bg-white p-4 border-l-4 border-[#003366] shadow-sm flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Welfare Corpus Fund</span>
              <span className="text-2xl font-bold text-[#003366]">₹{((settings?.stats?.welfareFundBalance || 14850000) / 10000000).toFixed(2)} Cr</span>
            </div>
            <div className="bg-white p-4 border-l-4 border-amber-500 shadow-sm flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Members Assisted (YTD)</span>
              <span className="text-2xl font-bold text-amber-600">{settings?.stats?.membersSupported || 342}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT THE ASSOCIATION */}
      <section className="max-w-7xl mx-auto px-4 py-8 border-b border-slate-300">
        <div className="mb-6 border-b-2 border-[#003366] pb-2 inline-block">
          <h2 className="text-xl font-bold text-[#003366] uppercase">
            Aims & Objectives
          </h2>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed mb-6">
          {settings?.aboutText || "Representing section officers, court masters, translators, and administrative personnel across all judicial departments."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: HeartHandshake,
              title: "Staff Welfare Fund",
              desc: "Instant financial grants for medical emergencies, children higher education, and sudden family bereavement."
            },
            {
              icon: Users,
              title: "Representation",
              desc: "Safeguarding service pay matrix, timely promotional avenues, and cadre progression."
            },
            {
              icon: Award,
              title: "Digital Amenities",
              desc: "Smart digital identity card issuance, welfare store subsidies, and access to Club facilities."
            },
            {
              icon: FileText,
              title: "Governance",
              desc: "Audited ledger accounts, online contribution receipts, and democratic elections."
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-white border border-slate-300 shadow-sm hover:bg-[#f5f9ff] transition-colors flex items-start gap-4"
            >
              <div className="w-10 h-10 shrink-0 bg-[#003366] text-white flex items-center justify-center rounded">
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#003366] text-sm uppercase">{item.title}</h3>
                <p className="text-xs text-slate-600 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. OFFICE BEARERS SECTION */}
      <section className="bg-slate-100 py-8 px-4 border-b border-slate-300">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-300 pb-2">
            <div className="border-b-2 border-[#003366] pb-1 inline-block -mb-[3px]">
              <h2 className="text-xl font-bold text-[#003366] uppercase">
                Executive Body
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/office-bearers')}
              className="text-xs font-bold text-blue-800 hover:underline flex items-center gap-1 cursor-pointer uppercase"
            >
              <span>View Full List</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {officeBearers.slice(0, 6).map((ob) => (
              <div
                key={ob.id}
                className="bg-white border border-slate-300 shadow-sm flex flex-col justify-between"
              >
                <div className="p-4 flex items-start gap-4">
                  <img
                    src={ob.photo}
                    alt={ob.name}
                    className="w-16 h-20 object-cover border border-slate-300 shrink-0"
                  />
                  <div className="space-y-0.5">
                    <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold bg-amber-500 text-[#003366] uppercase">
                      {ob.designation}
                    </span>
                    <h3 className="font-bold text-[#003366] text-sm leading-snug uppercase">{ob.name}</h3>
                    <p className="text-xs font-semibold text-slate-600">{ob.courtRole}</p>
                    <p className="text-[10px] text-slate-500">Tenure: {ob.term}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. NOTICES, GOSSIP & EVENTS TRIPLE SECTION */}
      <section className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Notices */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-900" />
              Notices & Official Circulars
            </h2>
            <button
              onClick={() => onNavigate('/notices')}
              className="text-xs font-bold text-blue-900 hover:underline cursor-pointer"
            >
              All Notices
            </button>
          </div>

          <div className="space-y-3">
            {notices.length > 0 ? notices.slice(0, 4).map((notice) => (
              <a
                key={notice.id}
                href={notice.attachmentUrl ? `/api/notices/${notice.id}/pdf` : `/notice/${notice.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-800 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-2 group"
                title="Click to open official PDF in a new tab"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${notice.category === 'CIRCULAR' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                    }`}>
                    {notice.category}
                  </span>
                  <span className="text-slate-400 font-mono">{notice.date}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-blue-900 transition-colors flex items-center justify-between gap-2">
                  <span>{notice.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-800 shrink-0" />
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2">{notice.description}</p>
                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                  <span>By: <strong className="text-slate-700">{notice.publishedBy}</strong></span>
                  <span className="text-blue-900 font-bold group-hover:underline flex items-center gap-1">
                    <span>View PDF in New Tab</span>
                    <span>↗</span>
                  </span>
                </div>
              </a>
            )) : (
              <div className="w-full h-32 flex items-center justify-center text-sm text-slate-400 bg-white rounded-xl border border-slate-200">
                No recent notices or circulars.
              </div>
            )}
          </div>
        </div>

        {/* Middle: Gossip / ମୋ ମନ କଥା */}
        <div className="space-y-4 flex flex-col relative group">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              ମୋ ମନ କଥା 💭
            </h2>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1">
                <button 
                  onClick={() => {
                    if (gossipScrollRef.current) {
                      gossipScrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
                    }
                  }}
                  className="p-1 rounded-full bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700 transition-colors cursor-pointer"
                  title="Swipe Left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    if (gossipScrollRef.current) {
                      gossipScrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
                    }
                  }}
                  className="p-1 rounded-full bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700 transition-colors cursor-pointer"
                  title="Swipe Right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => {
                  const currentUserStr = localStorage.getItem('OHCEA_user');
                  if (!currentUserStr) {
                    alert("Register as Member to comment in this post");
                    onNavigate('/register');
                    return;
                  }
                  try {
                    const currentUser = JSON.parse(currentUserStr);
                    if (currentUser.role === 'MEMBER' && currentUser.status !== 'ACTIVE') {
                      alert("Your membership application is currently pending Secretariat approval. Only approved members can post to Mo Mana Katha.");
                      onNavigate('/member/dashboard');
                      return;
                    }
                  } catch (e) {}
                  onNavigate('/member/dashboard');
                }}
                className="text-xs font-bold text-purple-600 hover:underline cursor-pointer"
              >
                Post
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium italic">ମନରେ ଯାହା... କହିଦିଅ, ମନ ହାଲୁକା କର 😜</p>

          <div 
            ref={gossipScrollRef}
            className="flex-1 overflow-x-auto flex gap-4 snap-x snap-mandatory pb-4 custom-scrollbar scroll-smooth"
          >
            {gossipPosts.length > 0 ? gossipPosts.map((post) => (
              <div key={post.id} className="min-w-[85%] sm:min-w-[280px] snap-center">
                <GossipCard 
                  post={post}
                  onReact={async (postId, reaction) => {
                    const currentUserStr = localStorage.getItem('OHCEA_user');
                    if (!currentUserStr) {
                      alert("Register as Member to comment in this post");
                      return;
                    }
                    try {
                      const currentUser = JSON.parse(currentUserStr);
                      if (currentUser.role === 'MEMBER' && currentUser.status !== 'ACTIVE') {
                        alert("Register as Member to comment in this post");
                        return;
                      }
                    } catch (e) {}
                    await fetch(`/api/gossip/${postId}/react`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ reaction })
                    });
                    const res = await fetch('/api/gossip');
                    if (res.ok) setGossipPosts(await res.json());
                  }}
                  onComment={async (postId, content) => {
                    const currentUserStr = localStorage.getItem('OHCEA_user');
                    if (!currentUserStr) {
                      alert("Register as Member to comment in this post");
                      return;
                    }
                    try {
                      const currentUser = JSON.parse(currentUserStr);
                      if (currentUser.role === 'MEMBER' && currentUser.status !== 'ACTIVE') {
                        alert("Register as Member to comment in this post");
                        return;
                      }
                    } catch (e) {}
                    const currentUser = JSON.parse(currentUserStr);
                    const postRes = await fetch(`/api/gossip/${postId}/comment`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ authorId: currentUser.id, authorName: currentUser.name, content })
                    });
                    if (!postRes.ok) {
                      const data = await postRes.json();
                      alert(data.error || "Register as Member to comment in this post");
                      return;
                    }
                    const res = await fetch('/api/gossip');
                    if (res.ok) setGossipPosts(await res.json());
                  }}
                  onDelete={async (postId) => {
                    if (!confirm('Are you sure you want to delete this post?')) return;
                    await fetch(`/api/gossip/${postId}`, { method: 'DELETE' });
                    setGossipPosts(prev => prev.filter(p => p.id !== postId));
                  }}
                />
              </div>
            )) : (
              <div className="w-full h-32 flex items-center justify-center text-sm text-slate-400 bg-white rounded-xl border border-slate-200">
                No gossip yet! Be the first to post.
              </div>
            )}
          </div>
        </div>

        {/* Right: Upcoming Events */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-900" />
              Upcoming Activities & Events
            </h2>
            <button
              onClick={() => onNavigate('/events')}
              className="text-xs font-bold text-blue-900 hover:underline cursor-pointer"
            >
              All Events
            </button>
          </div>

          <div className="space-y-3">
            {events.length > 0 ? events.slice(0, 3).map((evt) => (
              <div
                key={evt.id}
                className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex items-center gap-4"
              >
                <img
                  src={evt.image}
                  alt={evt.title}
                  className="w-20 h-20 rounded-lg object-cover shrink-0"
                />
                <div className="space-y-1 flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">
                    {evt.category} • {evt.date}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm truncate">{evt.title}</h3>
                  <p className="text-xs text-slate-500 truncate">{evt.venue}</p>
                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="text-emerald-700 font-bold">{evt.totalRegistered} Registered</span>
                    <button
                      onClick={() => onNavigate('/events')}
                      className="text-xs font-bold text-blue-900 hover:underline cursor-pointer"
                    >
                      Register
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="w-full h-32 flex items-center justify-center text-sm text-slate-400 bg-white rounded-xl border border-slate-200">
                No upcoming events scheduled.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION BAR */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-[#003366] text-white p-6 shadow-sm border border-slate-300 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-xl font-bold uppercase text-white">
              Employee Portal Access
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Official registration is mandatory for accessing digital membership ID, medical grants, and online contribution receipts.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              onClick={() => onNavigate('/register')}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-[#003366] font-bold shadow-sm cursor-pointer text-xs uppercase"
            >
              Proceed to Register
            </button>
            <button
              onClick={() => onNavigate('/contact')}
              className="px-6 py-2.5 bg-white text-[#003366] border border-slate-300 font-bold hover:bg-slate-100 cursor-pointer text-xs uppercase"
            >
              Contact Office
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
