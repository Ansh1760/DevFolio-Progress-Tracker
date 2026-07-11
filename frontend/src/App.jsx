import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import Leaderboard from './pages/Leaderboard';
import DailyTracker from './pages/DailyTracker';
import Profile from './pages/Profile';
import SearchPage from './pages/SearchPage';
import PublicProfile from './pages/PublicProfile';
import Store from './pages/Store';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

// SSE Listener Component
const SSEListener = () => {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    
    if (!token) return;

    const eventSource = new EventSource(`${API_URL}/user/notifications/stream?token=${token}`);

    eventSource.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'connected') {
                console.log('SSE Connected:', data.message);
                return;
            }
            
            // Handle actual admin notifications
            if (data.title && data.message) {
                toast(
                    <div className="flex flex-col gap-1">
                        <span className="font-bold text-md">{data.title}</span>
                        <span className="text-sm opacity-90">{data.message}</span>
                    </div>,
                    {
                        duration: 6000,
                        position: 'top-right',
                        style: {
                            background: '#2B1D10',
                            color: '#fff',
                            border: '1px solid rgba(233, 226, 208, 0.2)'
                        },
                        icon: '🔔',
                    }
                );
            }
        } catch (error) {
            console.error('Error parsing SSE data', error);
        }
    };

    eventSource.onerror = (error) => {
        console.error('SSE connection error, closing...');
        eventSource.close();
    };

    return () => {
        eventSource.close();
    };
  }, [user]);

  return null;
};

// Show loading spinner while auth state initialises
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center text-white text-xl">
    Loading...
  </div>
);

// Redirect unauthenticated users to /login
// Redirect authenticated users who haven't finished onboarding to /onboarding
const ProtectedRoute = ({ children, requireOnboarding = true }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (requireOnboarding && !user.onboardingComplete) return <Navigate to="/onboarding" replace />;
  return children;
};

// Onboarding route: must be logged in but onboarding NOT yet complete
const OnboardingRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.onboardingComplete) return <Navigate to="/dashboard" replace />;
  return children;
};

// Redirect already-logged-in users away from login/signup
const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <LoadingScreen />;
  if (user) {
    return user.onboardingComplete
      ? <Navigate to="/dashboard" replace />
      : <Navigate to="/onboarding" replace />;
  }
  return children;
};

const RootRoute = () => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.onboardingComplete) return <Navigate to="/onboarding" replace />;
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <SSEListener />
        <Toaster
          position="top-right"
          containerStyle={{
            top: 72, // below the sticky topbar (64px mobile / 80px desktop)
            right: 16,
            left: 16,
            zIndex: 9999,
          }}
          toastOptions={{
            duration: 6000,
            style: {
              background: '#2B1D10',
              color: '#F8F5EF',
              border: '1px solid rgba(233, 226, 208, 0.15)',
              borderRadius: '14px',
              padding: '14px 16px',
              fontSize: '14px',
              lineHeight: '1.45',
              boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
              backdropFilter: 'blur(16px)',
              maxWidth: 'calc(100vw - 32px)',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#2B1D10' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#2B1D10' },
            },
          }}
        />
        <Routes>
          {/* Root: smart redirect based on auth state */}
          <Route path="/" element={<RootRoute />} />

          {/* Admin routes (Completely isolated auth) */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Public routes */}
          <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

          {/* Onboarding: logged in but onboarding incomplete */}
          <Route path="/onboarding" element={
            <OnboardingRoute><Onboarding /></OnboardingRoute>
          } />

          {/* Protected routes: logged in AND onboarding complete */}
          <Route path="/dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/wallet"     element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
          <Route path="/store"      element={<ProtectedRoute><Store /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/tracker"    element={<ProtectedRoute><DailyTracker /></ProtectedRoute>} />
          <Route path="/profile"    element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/search"     element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
