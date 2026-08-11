import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/public/LandingPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { LoginPage } from './pages/public/LoginPage';
import { VerifyPage } from './pages/public/VerifyPage';
import { AboutPage } from './pages/public/AboutPage';
import { OfficeBearersPage } from './pages/public/OfficeBearersPage';
import { WelfarePublicPage } from './pages/public/WelfarePublicPage';
import { NoticesPublicPage } from './pages/public/NoticesPublicPage';
import { EventsPublicPage } from './pages/public/EventsPublicPage';
import { GalleryPublicPage } from './pages/public/GalleryPublicPage';
import { ContactPage } from './pages/public/ContactPage';
import { MemberDashboard } from './pages/member/MemberDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { PaymentModal } from './components/common/PaymentModal';
import { ReceiptModal } from './components/common/ReceiptModal';
import { Contribution } from './types';

const MainApp: React.FC = () => {
  // Start on / page on fresh load or reload
  const [currentRoute, setCurrentRoute] = useState<string>('/');
  const [verifyIdParam, setVerifyIdParam] = useState<string>('');
  const { currentUser, refreshUserData } = useAuth();

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
    if (route.startsWith('/verify/')) {
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
      <Navbar currentRoute={currentRoute} onNavigate={navigate} />

      <main className="flex-1">
        {currentRoute === '/' && <LandingPage onNavigate={navigate} />}
        {currentRoute === '/about' && <AboutPage />}
        {currentRoute === '/office-bearers' && <OfficeBearersPage />}
        {currentRoute === '/activities' && <EventsPublicPage onNavigate={navigate} />}
        {currentRoute === '/welfare' && <WelfarePublicPage onNavigate={navigate} />}
        {currentRoute === '/notices' && <NoticesPublicPage />}
        {currentRoute === '/events' && <EventsPublicPage onNavigate={navigate} />}
        {currentRoute === '/gallery' && <GalleryPublicPage />}
        {currentRoute === '/contact' && <ContactPage />}
        {currentRoute === '/register' && <RegisterPage onNavigate={navigate} />}
        {currentRoute === '/login' && <LoginPage onNavigate={navigate} />}
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
        {(currentRoute === '/admin/dashboard' || currentRoute.startsWith('/admin')) && (
          currentUser && (
            currentUser.role === 'SUPER_ADMIN' ||
            currentUser.role === 'PRESIDENT' ||
            currentUser.role === 'SECRETARY' ||
            currentUser.role === 'TREASURER'
          ) ? (
            <AdminDashboard />
          ) : (
            <LoginPage onNavigate={navigate} />
          )
        )}
      </main>

      <Footer onNavigate={navigate} />

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
