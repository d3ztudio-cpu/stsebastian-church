import React from 'react';
import { Helmet } from 'react-helmet';
import { AuthProvider, useAuth } from './AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MassTimings from './components/MassTimings';
import EventTimeline from './components/EventTimeline';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';
import './App.css';

function AppContent() {
  const { isAdmin } = useAuth();

  return (
    <div className="App">
      <Helmet>
        <title>St. Sebastian Church Puranattukara - Mass Timings</title>
        <meta
          name="description"
          content="Official website of St. Sebastian Church, Puranattukara. Find mass timings, events, and live streams."
        />
        <meta name="keywords" content="St. Sebastian Church, Puranattukara, mass timings, church events" />
      </Helmet>
      <Navbar />
      <Hero />
      <MassTimings />
      <EventTimeline />
      {isAdmin && <AdminDashboard />}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
