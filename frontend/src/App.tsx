import { useState, useEffect } from 'react';
import { User } from './types/index.js';
import { api } from './services/api.js';
import { LandingPage } from './pages/LandingPage.js';
import { LoginPage } from './features/auth/LoginPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { RefreshCw } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const res = await api.auth.getMe();
      setUser(res.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await api.auth.logout();
      setUser(null);
      setShowAuth(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center text-[#78716c] font-sans">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 mb-4 text-white font-bold text-base animate-pulse">
          <span>RI</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#78716c]">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-600" />
          <span>Connecting to ReachInbox Queue Engine...</span>
        </div>
      </div>
    );
  }

  // If user is authenticated, direct them straight to the Dashboard
  if (user) {
    return <DashboardPage user={user} onLogout={handleLogout} />;
  }

  // If unauthenticated: user can either view the Landing Page or the Login / Signup form
  if (showAuth) {
    return (
      <LoginPage
        onLoginSuccess={checkAuth}
        onBackToLanding={() => setShowAuth(false)}
      />
    );
  }

  return (
    <LandingPage
      onGetStarted={() => setShowAuth(true)}
      onSignIn={() => setShowAuth(true)}
    />
  );
}
