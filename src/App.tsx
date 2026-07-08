import React from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Home } from './components/Home.tsx';
import { Auth } from './components/Auth.tsx';
import { ApplicantDashboard } from './components/ApplicantDashboard.tsx';
import { OfficerDashboard } from './components/OfficerDashboard.tsx';
import { DeptHeadDashboard } from './components/DeptHeadDashboard.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { Landmark, AlertCircle, CheckCircle2, X } from 'lucide-react';

const RouteDispatcher: React.FC = () => {
  const { currentRoute, user, toasts, removeToast } = useApp();

  const renderActiveRoute = () => {
    switch (currentRoute) {
      case 'home':
        return <Home />;
      case 'login':
        return <Auth type="login" />;
      case 'register':
        return <Auth type="register" />;
      case 'dashboard':
        if (!user) {
          return <Auth type="login" />;
        }
        // Redirect to appropriate role-specific dashboard panel
        switch (user.role) {
          case 'applicant':
            return <ApplicantDashboard />;
          case 'officer':
            return <OfficerDashboard />;
          case 'dept_head':
            return <DeptHeadDashboard />;
          case 'admin':
            return <AdminDashboard />;
          default:
            return <Home />;
        }
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-academic-ivory flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="animate-fadeIn">
          {renderActiveRoute()}
        </main>
      </div>

      {/* Global Academic Footer */}
      <footer className="bg-academic-charcoal text-gray-400 py-10 border-t-4 border-academic-gold mt-auto text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex items-center space-x-3 justify-center md:justify-start">
            <div className="bg-white/10 p-2 rounded text-academic-gold border border-white/10">
              <Landmark className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-white font-display block">UNIVERSITY ADMISSIONS PORTAL</span>
              <span className="text-[10px] tracking-wider block uppercase mt-0.5">Automated Online Admissions & Enrollment • Autumn 2026</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-gray-500">Built securely using MongoDB, Express.js, React.js, Node.js, and Cloudinary API.</p>
            <p className="text-gray-600 text-[10px] uppercase tracking-widest font-semibold">Strict meritocracy • Automated aggregate compilation</p>
          </div>
        </div>
      </footer>

      {/* Premium Toast Popup Stack */}
      <div className="fixed bottom-5 right-5 z-50 space-y-3.5 max-w-sm w-full px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-lg shadow-xl border flex items-start justify-between space-x-3 bg-white transform translate-y-0 transition-all duration-300 animate-slideUp ${
              toast.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-950' :
              toast.type === 'error' ? 'border-red-200 bg-red-50 text-red-950' :
              'border-gray-200 bg-gray-50 text-gray-950'
            }`}
          >
            <div className="flex items-start space-x-2.5">
              {toast.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <span className="text-xs font-semibold leading-relaxed">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <RouteDispatcher />
    </AppProvider>
  );
}
