import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, User, LogOut, Bell, LayoutDashboard, IdCard as IdCardIcon, ChevronDown, Menu, X, Check, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab?: string;
  onNavigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab = 'home', onNavigate }) => {
  const { currentUser, logout, settings, notifications, switchUserRole } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const navLinks = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'about', label: 'About Us', path: '/about' },
    { id: 'office-bearers', label: 'Office Bearers', path: '/office-bearers' },
    { id: 'contributions', label: 'Monthly Contribution', path: '/contributions' },
    { id: 'welfare', label: 'Welfare Fund', path: '/welfare' },
    { id: 'notices', label: 'Notices', path: '/notices' },
    { id: 'events', label: 'Events', path: '/events' },
    { id: 'gallery', label: 'Gallery', path: '/gallery' },
    { id: 'contact', label: 'Contact', path: '/contact' }
  ];

  const demoPersonas = [
    { label: "President (Sri R. K. Sharma)", email: "president@hcea.gov.in", role: "PRESIDENT" },
    { label: "General Secretary (Sri M. Patnaik)", email: "secretary@hcea.gov.in", role: "SECRETARY" },
    { label: "Treasurer (Sri A. Swain)", email: "treasurer@hcea.gov.in", role: "TREASURER" },
    { label: "Active Member (Sanjib Rout)", email: "member@hcea.gov.in", role: "MEMBER" },
    { label: "Pending Application", email: "pending1@hcea.gov.in", role: "PENDING" }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm font-sans flex flex-col">
      {/* Government Top Accessibility Bar */}
      <div className="bg-[#f5f5f5] border-b border-slate-300 py-1.5 px-4 text-xs text-slate-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 font-bold text-[#003366]">
            <span>Government of Odisha</span>
            <span className="hidden md:inline text-slate-400 font-normal">|</span>
            <span className="hidden md:inline font-normal">High Court Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="hidden sm:block hover:underline cursor-pointer">Skip to Main Content</button>
            <div className="flex items-center gap-1">
              <button className="w-6 h-6 bg-white border border-slate-300 flex items-center justify-center hover:bg-slate-100 cursor-pointer text-[10px]">A-</button>
              <button className="w-6 h-6 bg-white border border-slate-300 flex items-center justify-center hover:bg-slate-100 cursor-pointer text-xs">A</button>
              <button className="w-6 h-6 bg-white border border-slate-300 flex items-center justify-center hover:bg-slate-100 cursor-pointer text-sm">A+</button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Logo Area */}
      <div className="max-w-7xl mx-auto w-full px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div
          onClick={() => onNavigate('/')}
          className="flex items-center gap-4 cursor-pointer"
        >
          {/* Association Logo */}
          <div className="w-16 h-16 bg-transparent flex flex-col items-center justify-center shrink-0">
             <img src="/logo.png" alt="Association Logo" className="w-full h-full object-contain" />
          </div>
          <div className="border-l-[2.5px] border-amber-500 pl-4 py-1.5">
            <h1 className="font-bold text-[22px] md:text-2xl text-[#002855] leading-tight uppercase font-serif tracking-wide">
              High Court Employees' Association
            </h1>
            <p className="text-[11px] text-[#002855] font-extrabold tracking-widest uppercase mt-0.5">
              Cuttack, Odisha
            </p>
          </div>
        </div>
        
        {/* Helpdesk */}
        <div className="hidden lg:flex items-center gap-3 text-sm font-bold text-slate-700">
          <span className="text-[#003366]">Helpdesk:</span> +91 (0671) 230-4821
        </div>
      </div>

      {/* Navy Blue Navigation Bar */}
      <div className="bg-[#003366] text-white border-b-4 border-amber-500 relative z-50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center justify-between">
          {/* Mobile Menu Toggle */}
          <div className="w-full lg:hidden flex justify-end py-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white hover:bg-blue-800 rounded cursor-pointer flex items-center gap-2 font-bold"
            >
              <Menu className="w-5 h-5" />
              MENU
            </button>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex flex-wrap items-center">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.path)}
                className={`px-4 py-3 text-xs font-bold uppercase transition-all cursor-pointer border-r border-blue-800 ${activeTab === link.id
                    ? 'bg-amber-500 text-[#003366]'
                    : 'text-white hover:bg-[#002244]'
                  }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right User Actions */}
          <div className="hidden lg:flex items-center py-1">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#002244] hover:bg-blue-900 transition-all cursor-pointer border-l border-blue-800"
                >
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded border border-amber-400"
                  />
                  <div className="text-left">
                    <p className="text-xs font-bold text-white leading-none truncate max-w-[120px]">
                      {currentUser.name}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-white" />
                </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 py-2 text-xs">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="font-bold text-white">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{currentUser.membershipId}</p>
                  </div>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onNavigate(currentUser.role !== 'MEMBER' ? '/admin/dashboard' : '/member/dashboard');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-800 flex items-center gap-2 text-slate-200 cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4 text-amber-400" />
                    <span>{currentUser.role !== 'MEMBER' ? 'Admin Dashboard' : 'Member Dashboard'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onNavigate('/member/id-card');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-800 flex items-center gap-2 text-slate-200 cursor-pointer"
                  >
                    <IdCardIcon className="w-4 h-4 text-blue-400" />
                    <span>Digital ID Card</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onNavigate('/member/notifications');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-800 flex items-center justify-between text-slate-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-400" />
                      <span>Notifications</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold text-[10px]">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <div className="border-t border-slate-800 my-1" />

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                      onNavigate('/login');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-rose-900/30 text-rose-300 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center">
              <button
                onClick={() => onNavigate('/login')}
                className="px-4 py-3 text-xs font-bold text-white hover:bg-[#002244] transition-all cursor-pointer flex items-center gap-2 uppercase border-l border-blue-800"
              >
                <User className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
              <button
                onClick={() => onNavigate('/register')}
                className="px-4 py-3 text-xs font-bold text-[#003366] bg-amber-500 hover:bg-amber-400 transition-all cursor-pointer uppercase"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-t border-slate-800 px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigate(link.path);
              }}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${activeTab === link.id ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-200'
                }`}
            >
              {link.label}
            </button>
          ))}

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {currentUser ? (
              <>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigate(currentUser.role !== 'MEMBER' ? '/admin/dashboard' : '/member/dashboard');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-900 text-white font-bold text-xs text-center"
                >
                  Go to {currentUser.role !== 'MEMBER' ? 'Admin Dashboard' : 'Member Portal'}
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full py-2 text-rose-400 text-xs text-center font-semibold"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigate('/register');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-xs text-center"
                >
                  Become a Member
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigate('/login');
                  }}
                  className="w-full py-2 text-white text-xs text-center font-bold"
                >
                  Member Login
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
