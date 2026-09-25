import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { KeyInitiativesPage } from './pages/public/KeyInitiativesPage';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/public/LandingPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { LoginPage } from './pages/public/LoginPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { VerifyPage } from './pages/public/VerifyPage';
import { AboutPage } from './pages/public/AboutPage';
import { OfficeBearersPage } from './pages/public/OfficeBearersPage';
import { WelfarePublicPage } from './pages/public/WelfarePublicPage';
import { NoticesPublicPage } from './pages/public/NoticesPublicPage';
import { EventsPublicPage } from './pages/public/EventsPublicPage';
import { GalleryPublicPage } from './pages/public/GalleryPublicPage';
import { ContactPage } from './pages/public/ContactPage';
import { NoticePdfPage } from './pages/public/NoticePdfPage';
import { MemberDashboard } from './pages/member/MemberDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { PaymentModal } from './components/common/PaymentModal';
import { ReceiptModal } from './components/common/ReceiptModal';
import { Contribution } from './types';

const getInitialRouteState = () => {
  if (typeof window === 'undefined') return { route: '/', noticeId: 'not-1', verifyId: '' };
  const pathname = window.location.pathname;
  const hash = window.location.hash ? window.location.hash.replace('#', '') : '';
  const target = (pathname && pathname !== '/') ? pathname : hash;

  if (target.startsWith('/notice/')) {
    return { route: '/notice-viewer', noticeId: target.replace('/notice/', ''), verifyId: '' };
  }
  if (target.startsWith('/notices/')) {
    return { route: '/notice-viewer', noticeId: target.replace('/notices/', ''), verifyId: '' };
  }
  if (target.startsWith('/verify/')) {
    return { route: '/verify', noticeId: 'not-1', verifyId: target.replace('/verify/', '') };
  }
  if (target) {
    return { route: target, noticeId: 'not-1', verifyId: '' };
  }
  return { route: '/', noticeId: 'not-1', verifyId: '' };
};

const MainApp: React.FC = () => {
  const initial = getInitialRouteState();
  const [currentRoute, setCurrentRoute] = useState<string>(initial.route);
  const [verifyIdParam, setVerifyIdParam] = useState<string>(initial.verifyId);
  const [activeNoticeId, setActiveNoticeId] = useState<string>(initial.noticeId);
  const { currentUser, refreshUserData } = useAuth();

  // Listen for browser Back/Forward and URL changes
  useEffect(() => {
    const handleLocationChange = () => {
      const state = getInitialRouteState();
      setCurrentRoute(state.route);
      setActiveNoticeId(state.noticeId);
      setVerifyIdParam(state.verifyId);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Payment Modal State
  const [paymentModalData, setPaymentModalData] = useState<{
    isOpen: boolean;
    title: string;
    amount: number;
    type: 'SUBSCRIPTION' | 'WELFARE_DONATION';
    monthYear?: string;
  }>({
    isOpen: false,
    title: '',
    amount: 500,
    type: 'SUBSCRIPTION'
  });

  // Receipt Modal State
  const [activeReceipt, setActiveReceipt] = useState<Contribution | null>(null);

  // Parse path or simple hash routing
  const navigate = (route: string) => {
    try {
      window.history.pushState(null, '', route);
    } catch (e) {
      // ignore in environments without history api
    }
    if (route.startsWith('/notice/') || route.startsWith('/notices/')) {
      const id = route.replace('/notice/', '').replace('/notices/', '');
      setActiveNoticeId(id);
      setCurrentRoute('/notice-viewer');
    } else if (route.startsWith('/verify/')) {
      const id = route.replace('/verify/', '');
      setVerifyIdParam(id);
      setCurrentRoute('/verify');
    } else {
      setVerifyIdParam('');
      setCurrentRoute(route);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPayment = (data: { title: string; amount: number; type: 'SUBSCRIPTION' | 'WELFARE_DONATION'; monthYear?: string }) => {
    setPaymentModalData({
      isOpen: true,
      title: data.title,
      amount: data.amount,
      type: data.type,
      monthYear: data.monthYear
    });
  };

  const handlePaymentSuccess = async (contribution: Contribution) => {
    setPaymentModalData(prev => ({ ...prev, isOpen: false }));
    await refreshUserData();
    // Open the generated printable receipt immediately
    setActiveReceipt(contribution);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans text-slate-800 selection:bg-blue-900 selection:text-white">
      {currentRoute !== '/notice-viewer' && <Navbar currentRoute={currentRoute} onNavigate={navigate} />}

      <main className="flex-1">
        {currentRoute === '/' && <LandingPage onNavigate={navigate} />}
        {currentRoute === '/about' && <AboutPage />}
        {currentRoute === '/office-bearers' && <OfficeBearersPage />}
        {currentRoute === '/activities' && <EventsPublicPage onNavigate={navigate} />}
        {currentRoute === '/notices' && <NoticesPublicPage onNavigate={navigate} />}
        {currentRoute === '/key-initiatives' && <KeyInitiativesPage onNavigate={navigate} />}
        {currentRoute === '/notice-viewer' && <NoticePdfPage noticeId={activeNoticeId} onNavigate={navigate} />}
        {currentRoute === '/events' && <EventsPublicPage onNavigate={navigate} />}
        {currentRoute === '/gallery' && <GalleryPublicPage />}
        {currentRoute === '/contact' && <ContactPage />}
        {currentRoute === '/register' && <RegisterPage onNavigate={navigate} />}
        {currentRoute === '/login' && <LoginPage onNavigate={navigate} />}
        {currentRoute === '/admin' && <AdminLoginPage onNavigate={navigate} />}
        {currentRoute === '/verify' && <VerifyPage initialMemberId={verifyIdParam} />}

        {/* Member & Contribution Routes (Strictly Guarded) */}
        {(currentRoute === '/contributions' ||
          currentRoute === '/member/contributions' ||
          currentRoute === '/member/dashboard' ||
          currentRoute === '/member/id-card' ||
          currentRoute === '/member/notifications' ||
          currentRoute.startsWith('/member')) && (
          currentUser ? (
            <MemberDashboard
              initialTab={(currentRoute === '/contributions' || currentRoute === '/member/contributions') ? 'CONTRIBUTIONS' : 'ID_CARD'}
              onOpenPayment={handleOpenPayment}
              onOpenReceipt={(c) => setActiveReceipt(c)}
            />
          ) : (
            <LoginPage onNavigate={navigate} />
          )
        )}

        {/* Admin Portal (Strictly Guarded) */}
        {(currentRoute === '/admin/dashboard' || (currentRoute.startsWith('/admin') && currentRoute !== '/admin')) && (
          currentUser && (
            currentUser.role === 'SUPER_ADMIN' ||
            currentUser.role === 'PRESIDENT' ||
            currentUser.role === 'SECRETARY' ||
            currentUser.role === 'TREASURER'
          ) ? (
            <AdminDashboard />
          ) : (
            <AdminLoginPage onNavigate={navigate} />
          )
        )}
      </main>

      {currentRoute !== '/notice-viewer' && <Footer onNavigate={navigate} />}

      {/* Payment Gateway Dialog */}
      {paymentModalData.isOpen && currentUser && (
        <PaymentModal
          memberId={currentUser.id}
          memberName={currentUser.name}
          membershipNumber={currentUser.membershipId}
          onClose={() => setPaymentModalData(prev => ({ ...prev, isOpen: false }))}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Official Receipt Modal */}
      {activeReceipt && (
        <ReceiptModal
          contribution={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
