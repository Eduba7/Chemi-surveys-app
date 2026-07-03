import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { trpc } from '../utils/trpc';
import { useAuth } from '../hooks/useAuth';
import csmcLogo from '../assets/csmc-logo.png';

export const MainLayout: React.FC = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const { data: staffDirectory } = trpc.auth.staffDirectory.useQuery();

  // Close the mobile sidebar automatically whenever the route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Navigation Setup — "Home" added per brief, "Reports" added for PDF exports
  const mainNav = [
    { name: 'Home', path: '/home', icon: 'fa-home' },
    { name: 'Dashboard', path: '/dashboard', icon: 'fa-th-large' },
    { name: 'Calendar', path: '/calendar', icon: 'fa-calendar' },
    { name: 'Consultations', path: '/consultations', icon: 'fa-comments' },
    { name: 'Clients', path: '/clients', icon: 'fa-users' },
    { name: 'Services', path: '/services', icon: 'fa-cogs' },
    { name: 'My Projects', path: '/projects', icon: 'fa-map' },
    { name: 'Reports', path: '/reports', icon: 'fa-file-pdf-o' },
  ];

  const personalNav = [
    { name: 'About Us', path: '/about', icon: 'fa-info-circle' },
    { name: 'Contact Us', path: '/contact', icon: 'fa-envelope' },
  ];

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'JG';

  function handleSignOut() {
    logout();
    setIsProfileOpen(false);
    navigate('/login');
  }

  function NavLinks({ items, onNavigate }: { items: typeof mainNav; onNavigate?: () => void }) {
    return (
      <nav className="space-y-1">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onNavigate}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-[#1034A6] text-white font-semibold border-l-4 border-[#39FF14]'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <i className={`fa ${item.icon} text-base transition-colors w-5 text-center ${isActive ? 'text-[#39FF14]' : 'text-slate-400 group-hover:text-white'}`}></i>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  const sidebarInner = (onNavigate?: () => void) => (
    <>
      <div className="p-4 space-y-6 overflow-y-auto flex-1">
        <div>
          <p className="px-3 text-2xs font-bold tracking-widest text-slate-500 uppercase mb-2">Main</p>
          <NavLinks items={mainNav} onNavigate={onNavigate} />
        </div>
        <div>
          <p className="px-3 text-2xs font-bold tracking-widest text-slate-500 uppercase mb-2">Personal Information</p>
          <NavLinks items={personalNav} onNavigate={onNavigate} />
        </div>
      </div>
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-center text-xs text-slate-500 flex-shrink-0">
        <p className="font-semibold text-slate-400">Chemi Consultants v2.0</p>
        <p className="text-2xs">Precision Mapping Services</p>
      </div>
    </>
  );

  // Determine global background based on route sections
  const path = location.pathname;
  // Pages that should use yellow header-area background: header container change request
  const headerYellowPages = ['/', '/home', '/dashboard', '/calendar', '/consultations', '/clients', '/services', '/projects', '/reports'];
  // Pages that should use neon gradient body backgrounds for specific sections
  const gradientPages = ['/dashboard', '/calendar', '/consultations', '/clients', '/services', '/projects'];

  const mainStyle: React.CSSProperties = {};
  if (gradientPages.includes(path)) {
    mainStyle.background = 'linear-gradient(135deg,#39FF14 50%,#ffffff 100%)';
  } else if (headerYellowPages.includes(path)) {
    mainStyle.backgroundColor = '#FFFF00';
  }

  return (
    <div style={mainStyle} className="min-h-screen flex flex-col text-gray-800">

      {/* --- TOP HEADER NAVIGATION --- */}
      <header className="h-16 sm:h-20 bg-[#1034A6] text-white flex items-center justify-between px-3 sm:px-6 shadow-md fixed w-full z-50">

        {/* Mobile hamburger — opens slide-in sidebar on phones/tablets */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden p-2 -ml-1 text-white"
          aria-label="Open navigation menu"
        >
          <i className="fa fa-bars text-xl"></i>
        </button>

        {/* Brand Identity — larger logo, scales down on small screens */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <div className="w-11 h-11 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0">
            <img
              src={csmcLogo}
              alt="Chemi Surveys & Mapping Consultants logo"
              className="w-9 h-9 sm:w-14 sm:h-14 object-contain"
            />
          </div>
          <span className="font-black text-[10px] sm:text-base md:text-lg tracking-wider bg-gradient-to-r from-[#DFFF00] to-[#39FF14] bg-clip-text text-transparent truncate max-w-[120px] sm:max-w-none">
            CHEMI SURVEYS &amp; MAPPING CONSULTANTS
          </span>
        </div>

        {/* Global Search Bar — hidden below lg to save space on tablets/phones */}
        <div className="flex-1 max-w-md mx-8 hidden lg:block">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <i className="fa fa-search text-gray-400"></i>
            </span>
            <input
              type="text"
              placeholder="Search clients, tasks, or metrics..."
              className="w-full bg-blue-950 text-white placeholder-gray-400 pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#39FF14]"
            />
          </div>
        </div>

        {/* Utilities & Profile Actions */}
        <div className="flex items-center space-x-2 sm:space-x-6 relative">
          <button className="relative p-2 text-gray-300 hover:text-[#39FF14] transition-colors" aria-label="Notifications">
            <i className="fa fa-bell-o text-lg sm:text-xl"></i>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 p-1.5 sm:p-2 hover:bg-blue-900 rounded-lg transition-colors focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-[#39FF14] text-slate-900 font-bold flex items-center justify-center shadow-inner text-xs sm:text-sm">
                {initials}
              </div>
              <span className="text-sm font-semibold hidden sm:inline">My Account</span>
              <i className={`fa fa-chevron-down text-xs transition-transform hidden sm:inline ${isProfileOpen ? 'rotate-180' : ''}`}></i>
            </button>

            {isProfileOpen && (
              <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-16 sm:top-auto mt-0 sm:mt-2 sm:w-80 bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-100 py-4 max-h-[80vh] overflow-y-auto transition-all z-50">

                <div className="px-4 pb-3 border-b border-gray-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">My Profile</p>
                  <p className="font-bold text-gray-900 text-base">
                    {user?.fullName || 'John Muiruri Gachemi'}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    {user?.email || 'johnmuiruri68@gmail.com'}
                  </p>
                  <p className="text-xs text-gray-500">Contact: {user?.phone || '0703676856'}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-2xs font-bold uppercase">
                    {user?.jobTitle || 'Land Surveyor'}
                  </span>
                </div>

                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Firm Personnel</p>
                  <div className="space-y-2">
                    {(staffDirectory || []).map((s) => (
                      <div key={s.id}>
                        <p className="text-xs font-semibold text-gray-800">{s.fullName}</p>
                        <p className="text-2xs text-gray-500">
                          {s.phone} {s.jobTitle ? `• ${s.jobTitle}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-4 py-3 border-b border-gray-100 text-xs">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">HQ Location</p>
                  <p className="font-semibold text-gray-700">Thika, Kenya</p>
                  <p className="text-gray-500">KIGIO PLAZA, 4th Floor</p>
                  <p className="text-gray-500 font-mono">Room No: K482</p>
                </div>

                <div className="px-2 pt-2">
                  <button className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2">
                    <i className="fa fa-sliders text-gray-400"></i>
                    <span>System Settings</span>
                  </button>
                  {isAuthenticated ? (
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-2 mt-1"
                    >
                      <i className="fa fa-sign-out text-red-500"></i>
                      <span>Sign Out</span>
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setIsProfileOpen(false)}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center space-x-2 mt-1"
                    >
                      <i className="fa fa-sign-in text-blue-600"></i>
                      <span>Staff Sign In</span>
                    </Link>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>
      </header>

      {/* --- SPLIT VIEW (SIDEBAR + DISPLAY SCREEN) --- */}
      <div className="flex flex-1 pt-16 sm:pt-20">

        {/* Desktop / tablet-landscape fixed sidebar */}
        <aside className="w-64 bg-slate-900 text-slate-300 flex-col justify-between border-r border-slate-800 fixed h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)] z-40 hidden md:flex">
          {sidebarInner()}
        </aside>

        {/* Mobile / tablet-portrait slide-in sidebar + backdrop */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsSidebarOpen(false)}
              aria-hidden="true"
            />
            <aside className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-slate-900 text-slate-300 flex flex-col shadow-2xl">
              <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <img src={csmcLogo} alt="CSMC logo" className="w-8 h-8 object-contain bg-white rounded-full p-0.5" />
                  <span className="text-xs font-bold text-slate-200">CSMC Menu</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 p-2" aria-label="Close menu">
                  <i className="fa fa-times text-lg"></i>
                </button>
              </div>
              {sidebarInner(() => setIsSidebarOpen(false))}
            </aside>
          </div>
        )}

        <main className="flex-1 md:pl-64 flex flex-col min-h-[calc(100vh-64px)] sm:min-h-[calc(100vh-80px)] w-full overflow-x-hidden">
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>

          <footer className="bg-white border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-1 px-4 sm:px-6 py-2.5 text-[11px] sm:text-xs text-gray-500 font-medium text-center sm:text-left">
            <div>
              <span>System Status: </span>
              <span className="text-emerald-600 font-bold">● Operational</span>
            </div>
            <div>
              &copy; 2026 Surveyor John Muiruri Gachemi. All Rights Reserved.
            </div>
          </footer>
        </main>

      </div>
    </div>
  );
};
