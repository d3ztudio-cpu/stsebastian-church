import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { AuthProvider, useAuth } from './AuthContext';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import MassTimings from './components/MassTimings';
import EventTimeline from './components/EventTimeline';
import ParishBulletins from './components/ParishBulletins';
import ParishUnits from './components/ParishUnits';
import EnquirySection from './components/EnquirySection';
import AdminDashboard from './components/AdminDashboard';
import NoticePopup from './components/NoticePopup';
import Footer from './components/Footer';
import './App.css';

function AppContent() {
  const { isAdmin } = useAuth();
  const siteUrl = 'https://stsebastian-church.web.app/';
  const [hash, setHash] = useState(() => window.location.hash || '');
  const [siteSections, setSiteSections] = useState(null);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || '');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const isAdminPage = hash === '#admin' || hash === '#admin-page';

  useEffect(() => {
    if (isAdminPage) return;
    const q = query(collection(db, 'site_sections'), orderBy('order', 'asc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setSiteSections(rows);
      },
      () => setSiteSections([]),
    );
    return () => unsub();
  }, [isAdminPage]);

  const sectionRegistry = useMemo(
    () => ({
      hero: <Hero />,
      about: <About />,
      mass_timings: <MassTimings />,
      events: <EventTimeline />,
      bulletins: <ParishBulletins />,
      parish_units: <ParishUnits />,
      enquiry: <EnquirySection />,
    }),
    [],
  );

  const defaultSectionOrder = useMemo(
    () => [
      { id: 'hero', enabled: true, order: 1 },
      { id: 'about', enabled: true, order: 2 },
      { id: 'mass_timings', enabled: true, order: 3 },
      { id: 'events', enabled: true, order: 4 },
      { id: 'bulletins', enabled: true, order: 5 },
      { id: 'parish_units', enabled: true, order: 6 },
      { id: 'enquiry', enabled: true, order: 7 },
    ],
    [],
  );

  const resolvedSections = useMemo(() => {
    const incoming = Array.isArray(siteSections) ? siteSections : null;
    if (!incoming || incoming.length === 0) return defaultSectionOrder;

    const normalized = incoming
      .map((row) => ({
        id: row.id,
        enabled: row.enabled !== false,
        order: Number(row.order) || 0,
      }))
      .filter((row) => Boolean(sectionRegistry[row.id]));

    const configuredIds = new Set(normalized.map((r) => r.id));
    const missingDefaults = defaultSectionOrder.filter((d) => !configuredIds.has(d.id));
    return [...normalized, ...missingDefaults].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [siteSections, defaultSectionOrder, sectionRegistry]);

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
      <NoticePopup />
      <Navbar />
      {isAdminPage ? (
        isAdmin ? (
          <div className="min-h-screen bg-gray-50 pt-24">
            <AdminDashboard />
          </div>
        ) : (
          <div className="min-h-screen bg-gray-50 pt-24">
            <div className="container mx-auto px-4">
              <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-sapphire">Admin</h2>
                <p className="mt-2 text-gray-600">You don&apos;t have permission to view this page.</p>
              </div>
            </div>
          </div>
        )
      ) : (
        <>
          {resolvedSections
            .filter((s) => s.enabled)
            .map((s) => (
              <React.Fragment key={s.id}>{sectionRegistry[s.id]}</React.Fragment>
            ))}
          {isAdmin && <AdminDashboard />}
        </>
      )}
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
