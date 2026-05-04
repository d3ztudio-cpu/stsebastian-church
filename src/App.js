import React from 'react';
import { Helmet } from 'react-helmet';
import { AuthProvider, useAuth } from './AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import MassTimings from './components/MassTimings';
import EventTimeline from './components/EventTimeline';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';
import './App.css';

function AppContent() {
  const { isAdmin } = useAuth();
  const siteUrl = 'https://stsebastian-church.web.app/';

  return (
    <div className="App">
      <Helmet>
        <title>St. Sebastian Church Puranattukara - Mass Timings</title>
        <link rel="canonical" href={siteUrl} />
        <meta name="robots" content="index,follow" />
        <meta name="description" content="Official website of St. Sebastian Church, Puranattukara. Mass timings, events, and live stream updates." />
        <meta name="keywords" content="St. Sebastian Church, Puranattukara, mass timings, church events" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="St. Sebastian Church Puranattukara" />
        <meta property="og:description" content="Official website of St. Sebastian Church, Puranattukara. Mass timings, events, and live stream updates." />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:image" content={`${siteUrl}church-logo.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="St. Sebastian Church Puranattukara" />
        <meta name="twitter:description" content="Official website of St. Sebastian Church, Puranattukara. Mass timings, events, and live stream updates." />
        <meta name="twitter:image" content={`${siteUrl}church-logo.png`} />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Church',
            name: 'St. Sebastian Church Puranattukara',
            url: siteUrl,
            image: `${siteUrl}church-logo.png`,
          })}
        </script>
      </Helmet>
      <Navbar />
      <Hero />
      <About />
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
