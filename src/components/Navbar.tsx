import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Landmark, LogOut, User, Menu, X, ShieldAlert } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, currentRoute, setRoute, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleNav = (route: string) => {
    setRoute(route);
    setMobileMenuOpen(false);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500/10 text-red-200 border-red-500/30';
      case 'dept_head': return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'officer': return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      default: return 'bg-slate-400/10 text-slate-300 border-slate-400/30';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'System Admin';
      case 'dept_head': return 'Dept Head';
      case 'officer': return 'Admissions Officer';
      default: return 'Applicant';
    }
  };

  return (
    <nav id="academic-navbar" className="bg-academic-crimson text-white border-b-4 border-academic-gold sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo & University Branding */}
          <div className="flex items-center cursor-pointer" onClick={() => handleNav('home')}>
            <div className="flex-shrink-0 bg-academic-gold p-2.5 rounded-lg text-academic-crimson shadow-md mr-3 border border-amber-600">
              <Landmark className="h-6 w-6 text-academic-crimson animate-pulse" />
            </div>
            <div>
              <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-white block leading-tight">
                UNIVERSITY PORTAL
              </span>
              <span className="text-[10px] sm:text-xs uppercase tracking-widest text-amber-300 block font-bold">
                Academic Admissions & Enrollment
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <button 
              id="nav-btn-home"
              onClick={() => handleNav('home')} 
              className={`px-3 py-2 text-xs uppercase font-bold tracking-wider transition-colors ${currentRoute === 'home' ? 'text-academic-gold border-b-2 border-academic-gold' : 'text-slate-300 hover:text-white'}`}
            >
              Academic Programs
            </button>
            
            {user ? (
              <>
                <button 
                  id="nav-btn-dashboard"
                  onClick={() => handleNav('dashboard')} 
                  className={`px-3 py-2 text-xs uppercase font-bold tracking-wider transition-colors ${currentRoute === 'dashboard' ? 'text-academic-gold border-b-2 border-academic-gold' : 'text-slate-300 hover:text-white'}`}
                >
                  My Dashboard
                </button>

                <div className="flex items-center space-x-3 pl-4 border-l border-slate-700">
                  <div className="text-right">
                    <span className="text-sm font-semibold block text-white">{user.name}</span>
                    <span className={`text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded border ${getRoleBadgeColor(user.role)}`}>
                      {getRoleDisplayName(user.role)}
                    </span>
                  </div>
                  
                  <button 
                    id="nav-btn-logout"
                    onClick={logout}
                    title="Logout Session"
                    className="p-2 rounded-full text-slate-300 hover:text-academic-gold hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <button 
                  id="nav-btn-login"
                  onClick={() => handleNav('login')} 
                  className="px-4 py-2 text-xs uppercase font-extrabold tracking-wider text-academic-gold hover:bg-slate-800 border border-academic-gold rounded transition-all cursor-pointer"
                >
                  Sign In
                </button>
                <button 
                  id="nav-btn-register"
                  onClick={() => handleNav('register')} 
                  className="px-4 py-2 text-xs uppercase font-extrabold tracking-wider text-academic-crimson bg-academic-gold hover:bg-amber-400 rounded shadow-sm border border-academic-gold transition-all cursor-pointer"
                >
                  Apply Online
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div id="mobile-navigation" className="md:hidden bg-slate-900 border-b border-slate-800 py-4 px-6 animate-fadeIn text-white">
          <div className="flex flex-col space-y-4">
            <button 
              onClick={() => handleNav('home')} 
              className={`text-left py-2 text-xs uppercase font-extrabold tracking-wider ${currentRoute === 'home' ? 'text-academic-gold border-l-4 border-academic-gold pl-2' : 'text-slate-300'}`}
            >
              Academic Programs
            </button>
            {user ? (
              <>
                <button 
                  onClick={() => handleNav('dashboard')} 
                  className={`text-left py-2 text-xs uppercase font-extrabold tracking-wider ${currentRoute === 'dashboard' ? 'text-academic-gold border-l-4 border-academic-gold pl-2' : 'text-slate-300'}`}
                >
                  My Dashboard
                </button>
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold block text-white">{user.name}</span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400">{getRoleDisplayName(user.role)}</span>
                  </div>
                  <button 
                    onClick={logout} 
                    className="flex items-center text-red-400 text-sm font-medium hover:underline"
                  >
                    <LogOut className="h-4 w-4 mr-1" /> Log Out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col space-y-3 pt-4 border-t border-slate-800">
                <button 
                  onClick={() => handleNav('login')} 
                  className="w-full text-center py-2 text-xs uppercase font-extrabold tracking-wider text-academic-gold border border-academic-gold rounded"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => handleNav('register')} 
                  className="w-full text-center py-2 text-xs uppercase font-extrabold tracking-wider text-academic-crimson bg-academic-gold rounded"
                >
                  Apply Online
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
