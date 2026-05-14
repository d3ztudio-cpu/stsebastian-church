import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { auth } from '../firebase';
import Login from './Login';
import NotificationsBell from './NotificationsBell';

const Navbar = () => {
  const { user, isAdmin } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-sapphire text-white z-50 shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/logo192.png" alt="St. Sebastian Church logo" className="h-10 w-10 rounded-md border border-white/20 object-cover" />
          <div>
            <h1 className="text-xl font-bold">St. Sebastian Church</h1>
            <p className="text-sm text-white/75">Puranattukara</p>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <a href="#home" className="hover:text-gold">Home</a>
          <a href="#about" className="hover:text-gold">About</a>
          <a href="#mass" className="hover:text-gold">Mass Timings</a>
          <a href="#events" className="hover:text-gold">Events</a>
          <a href="#bulletin" className="hover:text-gold">Bulletin</a>
          <a href="#parish-units" className="hover:text-gold">Parish Units</a>
          <a href="#enquiry" className="hover:text-gold">Enquiry</a>
          {isAdmin && <a href="#admin-page" className="hover:text-gold">Admin</a>}
          <NotificationsBell />
          {user ? (
            <button onClick={() => auth.signOut()} className="hover:text-gold">Logout</button>
          ) : (
            <button onClick={() => setShowLogin(true)} className="hover:text-gold">Login</button>
          )}
        </div>

        <div className="md:hidden flex items-center gap-3">
          <NotificationsBell />
          <button
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-md border border-white/20 transition hover:border-gold"
            aria-label="Toggle navigation menu"
            aria-expanded={showMobileMenu}
            onClick={() => setShowMobileMenu((prev) => !prev)}
          >
            <span className="sr-only">Toggle navigation</span>
            <div className="space-y-1.5">
              <span className="block h-0.5 w-6 bg-white"></span>
              <span className="block h-0.5 w-6 bg-white"></span>
              <span className="block h-0.5 w-6 bg-white"></span>
            </div>
          </button>
        </div>
      </div>

      <div className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${showMobileMenu ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <button
          type="button"
          className="absolute inset-0 bg-black/50"
          onClick={() => setShowMobileMenu(false)}
          aria-label="Close mobile menu"
        />
        <aside className={`absolute right-0 top-0 h-full w-72 bg-sapphire/95 backdrop-blur-xl border-l border-white/10 shadow-2xl transform transition-transform duration-300 ease-out ${showMobileMenu ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <img src="/logo192.png" alt="Logo" className="h-10 w-10 rounded-md border border-white/20 object-cover" />
              <div>
                <h2 className="text-lg font-bold">St. Sebastian</h2>
                <p className="text-sm text-white/70">Navigation</p>
              </div>
            </div>
            <button type="button" onClick={() => setShowMobileMenu(false)} className="text-white text-2xl leading-none" aria-label="Close menu">
              ×
            </button>
          </div>
          <nav className="px-4 py-6 space-y-3">
            <a href="#home" className="block rounded-xl px-4 py-3 text-white hover:bg-white/10 hover:text-gold">Home</a>
            <a href="#about" className="block rounded-xl px-4 py-3 text-white hover:bg-white/10 hover:text-gold">About</a>
            <a href="#mass" className="block rounded-xl px-4 py-3 text-white hover:bg-white/10 hover:text-gold">Mass Timings</a>
            <a href="#events" className="block rounded-xl px-4 py-3 text-white hover:bg-white/10 hover:text-gold">Events</a>
            <a href="#bulletin" className="block rounded-xl px-4 py-3 text-white hover:bg-white/10 hover:text-gold">Bulletin</a>
            <a href="#parish-units" className="block rounded-xl px-4 py-3 text-white hover:bg-white/10 hover:text-gold">Parish Units</a>
            <a href="#enquiry" className="block rounded-xl px-4 py-3 text-white hover:bg-white/10 hover:text-gold">Enquiry</a>
            {isAdmin && <a href="#admin-page" className="block rounded-xl px-4 py-3 text-white hover:bg-white/10 hover:text-gold">Admin</a>}
            {user ? (
              <button
                type="button"
                onClick={() => { auth.signOut(); setShowMobileMenu(false); }}
                className="w-full text-left rounded-xl px-4 py-3 text-white hover:bg-white/10 hover:text-gold"
              >
                Logout
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setShowLogin(true); setShowMobileMenu(false); }}
                className="w-full text-left rounded-xl px-4 py-3 text-white hover:bg-white/10 hover:text-gold"
              >
                Login
              </button>
            )}
          </nav>
        </aside>
      </div>

      {showLogin && <Login onClose={() => setShowLogin(false)} />}
    </nav>
  );
};

export default Navbar;
