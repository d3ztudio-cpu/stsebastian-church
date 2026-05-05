import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc, Timestamp, updateDoc, writeBatch } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { toJsDate } from '../utils/time';

const AdminDashboard = () => {
  const { user, isAdmin, loading } = useAuth();
  const [liveUrl, setLiveUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [socialLinks, setSocialLinks] = useState({ facebook: '', instagram: '', youtube: '', whatsapp: '', telegram: '' });
  const [admins, setAdmins] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', imageUrl: '', videoUrl: '' });
  const [savingLive, setSavingLive] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);
  const [addingEvent, setAddingEvent] = useState(false);
  const [aboutContent, setAboutContent] = useState({
    aboutText: '',
    vicarName: '',
    vicarImageUrl: '',
    assistantVicarName: '',
    assistantVicarImageUrl: '',
  });
  const [savingAbout, setSavingAbout] = useState(false);
  const [importingPeople, setImportingPeople] = useState(false);
  const [peopleImportSummary, setPeopleImportSummary] = useState('');

  const [bulletinYear, setBulletinYear] = useState(() => new Date().getFullYear());
  const [bulletinMonth, setBulletinMonth] = useState(() => new Date().getMonth() + 1);
  const [bulletinUrl, setBulletinUrl] = useState('');
  const [savingBulletin, setSavingBulletin] = useState(false);
  const [selectedBulletinMeta, setSelectedBulletinMeta] = useState(null);

  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeLinkUrl, setNoticeLinkUrl] = useState('');
  const [noticeImageUrl, setNoticeImageUrl] = useState('');
  const [noticeEndAt, setNoticeEndAt] = useState('');
  const [savingNotice, setSavingNotice] = useState(false);
  const [currentNoticeMeta, setCurrentNoticeMeta] = useState(null);

  const trimmedUserEmail = useMemo(() => (user?.email || '').trim(), [user?.email]);
  const isOwner = useMemo(() => trimmedUserEmail.toLowerCase() === 'd3ztudio@gmail.com', [trimmedUserEmail]);

  useEffect(() => {
    if (!isAdmin) return;

    // Load live url
    getDoc(doc(db, 'global_settings', 'liveStream')).then(doc => {
      if (doc.exists()) setLiveUrl(doc.data().url || '');
    });

    // Load social links
    getDoc(doc(db, 'global_settings', 'socialLinks')).then(doc => {
      if (doc.exists()) {
        setSocialLinks({ facebook: '', instagram: '', youtube: '', whatsapp: '', telegram: '', ...doc.data() });
      }
    });

    // Load admins if owner
    if (isOwner) {
      getDocs(collection(db, 'site_admins')).then(snapshot => {
        setAdmins(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    }

    // Load about content
    getDoc(doc(db, 'global_settings', 'aboutContent')).then(docSnap => {
      if (docSnap.exists()) {
        setAboutContent((prev) => ({ ...prev, ...docSnap.data() }));
      }
    });

    // Load events
    getDocs(collection(db, 'church_events')).then(snapshot => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Load current notice popup settings
    getDoc(doc(db, 'global_settings', 'noticePopup')).then((docSnap) => {
      if (!docSnap.exists()) {
        setCurrentNoticeMeta(null);
        return;
      }
      const data = docSnap.data();
      setNoticeTitle(data.title || '');
      setNoticeLinkUrl(data.linkUrl || '');
      setNoticeImageUrl(data.imageUrl || '');
      const end = toJsDate(data.endAt);
      setNoticeEndAt(end ? new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '');
      setCurrentNoticeMeta({
        id: docSnap.id,
        createdAt: data.createdAt || null,
        updatedAt: data.updatedAt || null,
      });
    });
  }, [isAdmin, isOwner]);

  useEffect(() => {
    if (!isAdmin) return;
    const loadSelectedBulletin = async () => {
      const id = `${bulletinYear}-${String(bulletinMonth).padStart(2, '0')}`;
      try {
        const snap = await getDoc(doc(db, 'parish_bulletins', id));
        if (!snap.exists()) {
          setBulletinUrl('');
          setSelectedBulletinMeta(null);
          return;
        }
        const data = snap.data();
        setBulletinUrl(data.url || '');
        setSelectedBulletinMeta({
          id,
          createdAt: data.createdAt || null,
          updatedAt: data.updatedAt || null,
        });
      } catch (error) {
        console.error('Unable to load bulletin:', error);
      }
    };

    loadSelectedBulletin();
  }, [isAdmin, bulletinYear, bulletinMonth]);

  const handleLiveUrlChange = (e) => {
    setLiveUrl(e.target.value);
    setPreviewUrl(e.target.value);
  };

  const handleSocialChange = (key, value) => {
    setSocialLinks((prev) => ({ ...prev, [key]: value }));
  };

  const saveLiveUrl = async () => {
    setSavingLive(true);
    try {
      await setDoc(doc(db, 'global_settings', 'liveStream'), { url: liveUrl });
      alert('Live URL updated and published to website!');
    } catch (error) {
      alert('Failed to update: ' + error.message);
    }
    setSavingLive(false);
  };

  const saveSocialLinks = async () => {
    setSavingSocial(true);
    try {
      await setDoc(doc(db, 'global_settings', 'socialLinks'), socialLinks);
      alert('Social media links updated successfully!');
    } catch (error) {
      alert('Failed to save social links: ' + error.message);
    }
    setSavingSocial(false);
  };

  const addAdmin = async () => {
    const email = (newAdminEmail || '').trim();
    if (email) {
      await setDoc(doc(db, 'site_admins', email), { email });
      setAdmins([...admins, { id: email, email }]);
      setNewAdminEmail('');
    }
  };

  const removeAdmin = async (email) => {
    const trimmed = (email || '').trim();
    await deleteDoc(doc(db, 'site_admins', trimmed));
    setAdmins(admins.filter(admin => admin.id !== trimmed));
  };

  const saveAbout = async () => {
    setSavingAbout(true);
    try {
      await setDoc(doc(db, 'global_settings', 'aboutContent'), aboutContent);
      alert('About section updated successfully!');
    } catch (error) {
      alert('Failed to save about section: ' + error.message);
    }
    setSavingAbout(false);
  };

  const saveBulletin = async () => {
    const year = Number(bulletinYear);
    const month = Number(bulletinMonth);
    const url = (bulletinUrl || '').trim();
    if (!year || year < 2000) {
      alert('Please enter a valid year.');
      return;
    }
    if (!month || month < 1 || month > 12) {
      alert('Please select a valid month.');
      return;
    }
    if (!url) {
      alert('Please paste the Drive download link / bulletin URL.');
      return;
    }

    setSavingBulletin(true);
    const id = `${year}-${String(month).padStart(2, '0')}`;
    const ref = doc(db, 'parish_bulletins', id);
    try {
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await updateDoc(ref, { url, year, month, updatedAt: serverTimestamp() });
        alert('Bulletin updated.');
      } else {
        await setDoc(ref, { url, year, month, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        await addDoc(collection(db, 'site_notifications'), { type: 'bulletin', year, month, createdAt: serverTimestamp() });
        alert('Bulletin published and notification sent.');
      }

      const after = await getDoc(ref);
      if (after.exists()) {
        const data = after.data();
        setSelectedBulletinMeta({
          id,
          createdAt: data.createdAt || null,
          updatedAt: data.updatedAt || null,
        });
      }
    } catch (error) {
      alert('Failed to save bulletin: ' + error.message);
    }
    setSavingBulletin(false);
  };

  const saveNoticePopup = async () => {
    const title = (noticeTitle || '').trim();
    const linkUrl = (noticeLinkUrl || '').trim();
    const imageUrl = (noticeImageUrl || '').trim();

    const ref = doc(db, 'global_settings', 'noticePopup');
    const hasAnyLink = Boolean(linkUrl || imageUrl);

    if (!hasAnyLink) {
      setSavingNotice(true);
      try {
        await deleteDoc(ref);
        setCurrentNoticeMeta(null);
        alert('Notice popup cleared (no popup will be shown).');
      } catch (error) {
        alert('Failed to clear notice: ' + error.message);
      }
      setSavingNotice(false);
      return;
    }

    if (!noticeEndAt) {
      alert('Please set an expiry end date & time for the notice popup.');
      return;
    }

    const endDate = new Date(noticeEndAt);
    if (Number.isNaN(endDate.getTime())) {
      alert('Please provide a valid end date & time.');
      return;
    }

    setSavingNotice(true);
    try {
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await updateDoc(ref, {
          title,
          linkUrl,
          imageUrl,
          endAt: Timestamp.fromDate(endDate),
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(ref, {
          title,
          linkUrl,
          imageUrl,
          endAt: Timestamp.fromDate(endDate),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      const after = await getDoc(ref);
      if (after.exists()) {
        const data = after.data();
        setCurrentNoticeMeta({
          id: after.id,
          createdAt: data.createdAt || null,
          updatedAt: data.updatedAt || null,
        });
      }
      alert('Notice popup saved.');
    } catch (error) {
      alert('Failed to save notice popup: ' + error.message);
    }
    setSavingNotice(false);
  };

  const parsePeopleSheet = (rows) => {
    const normalized = rows
      .map((row) => {
        const category = (row.category || row.Category || row.CATOGORY || row.catogory || '').toString().trim();
        const name = (row.name || row.Name || '').toString().trim();
        const role = (row.role || row.Role || '').toString().trim();
        const phone = (row.phone || row.Phone || row.number || row.Number || row.contact || row.Contact || '').toString().trim();
        const imageUrl = (row.image || row.Image || row.imageUrl || row.ImageUrl || '').toString().trim();
        if (!category && !name && !role && !phone && !imageUrl) return null;
        return { category, name, role, phone, imageUrl };
      })
      .filter(Boolean);

    const valid = normalized.filter((r) => r.category && r.name);
    const invalid = normalized.length - valid.length;
    return { valid, invalid, total: normalized.length };
  };

  const importPeopleFromFile = async (file) => {
    setImportingPeople(true);
    setPeopleImportSummary('');
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames?.[0];
      if (!firstSheetName) throw new Error('No sheets found in the uploaded file.');
      const sheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      const { valid, invalid, total } = parsePeopleSheet(rows);

      if (!valid.length) {
        throw new Error('No valid rows found. Required columns: category + name (role/phone/image optional).');
      }

      const batch = writeBatch(db);
      valid.forEach((person) => {
        const idBase = `${person.category}_${person.name}_${person.phone}`.toLowerCase();
        const docId = idBase.replace(/[^a-z0-9_-]/g, '_').slice(0, 120);
        batch.set(doc(db, 'about_people', docId), {
          ...person,
          category: person.category.toString().trim(),
          name: person.name.toString().trim(),
          role: person.role.toString().trim(),
          phone: person.phone.toString().trim(),
          imageUrl: person.imageUrl.toString().trim(),
          updatedAt: new Date(),
        });
      });
      await batch.commit();
      setPeopleImportSummary(`Imported ${valid.length} rows (ignored ${invalid} invalid rows) from ${total} total.`);
      alert('Excel import completed!');
    } catch (error) {
      alert('Failed to import: ' + error.message);
    }
    setImportingPeople(false);
  };

  const addEvent = async () => {
    setAddingEvent(true);
    try {
      await addDoc(collection(db, 'church_events'), {
        ...newEvent,
        date: new Date(newEvent.date)
      });
      setNewEvent({ title: '', description: '', date: '', imageUrl: '', videoUrl: '' });
      alert('Event added and published to website!');
    } catch (error) {
      alert('Failed to add event: ' + error.message);
    }
    setAddingEvent(false);
  };

  if (loading) {
    return null;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <section id="admin" className="py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-sapphire">Admin Dashboard</h2>
            <p className="mt-1 text-sm text-gray-600">Manage live stream, bulletin publishing, notices, and site settings.</p>
          </div>
          <a
            href="#home"
            className="inline-flex items-center justify-center rounded-xl border border-sapphire/15 bg-white px-4 py-2 text-sm font-semibold text-sapphire shadow-sm transition hover:border-sapphire/25"
          >
            Back to website
          </a>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <div className="sticky top-28 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold tracking-wide text-gray-500">SETTINGS</p>
              <nav className="mt-3 space-y-1">
                <a href="#admin-live" className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Live stream</a>
                <a href="#admin-social" className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Social links</a>
                <a href="#admin-bulletin" className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Parish bulletin</a>
                <a href="#admin-notice" className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Notice popup</a>
                <a href="#admin-about" className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">About section</a>
                {isOwner && <a href="#admin-admins" className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Admins</a>}
                <a href="#admin-events" className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Events</a>
              </nav>
            </div>
          </aside>

          <div className="lg:col-span-9 space-y-6">
            {/* Live Stream */}
            <div id="admin-live" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Live Stream</h3>
                  <p className="mt-1 text-sm text-gray-600">Update the YouTube live URL shown on the website.</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4">
                <input
                  type="text"
                  value={liveUrl}
                  onChange={handleLiveUrlChange}
                  placeholder="YouTube Live URL"
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 shadow-sm focus:border-sapphire focus:outline-none"
                />
                {previewUrl && previewUrl.includes('youtube') && (
                  <div className="overflow-hidden rounded-2xl border border-gray-200">
                    <iframe
                      width="560"
                      height="315"
                      src={`https://www.youtube.com/embed/${previewUrl.split('v=')[1]}`}
                      title="Preview"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-[320px] w-full"
                    ></iframe>
                  </div>
                )}
                <div className="flex items-center justify-end">
                  <button
                    onClick={saveLiveUrl}
                    className="rounded-xl bg-sapphire px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sapphire/90 disabled:opacity-60"
                    disabled={savingLive}
                  >
                    {savingLive ? 'Publishing...' : 'Save & Publish'}
                  </button>
                </div>
              </div>
            </div>

            {/* Social */}
            <div id="admin-social" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Social Media</h3>
                <p className="mt-1 text-sm text-gray-600">These links appear in the footer and floating buttons.</p>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  type="text"
                  value={socialLinks.facebook}
                  onChange={(e) => handleSocialChange('facebook', e.target.value)}
                  placeholder="Facebook URL"
                  className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm focus:border-sapphire focus:outline-none"
                />
                <input
                  type="text"
                  value={socialLinks.instagram}
                  onChange={(e) => handleSocialChange('instagram', e.target.value)}
                  placeholder="Instagram URL"
                  className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm focus:border-sapphire focus:outline-none"
                />
                <input
                  type="text"
                  value={socialLinks.youtube}
                  onChange={(e) => handleSocialChange('youtube', e.target.value)}
                  placeholder="YouTube URL"
                  className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm focus:border-sapphire focus:outline-none"
                />
                <input
                  type="text"
                  value={socialLinks.whatsapp}
                  onChange={(e) => handleSocialChange('whatsapp', e.target.value)}
                  placeholder="WhatsApp Link"
                  className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm focus:border-sapphire focus:outline-none"
                />
                <input
                  type="text"
                  value={socialLinks.telegram}
                  onChange={(e) => handleSocialChange('telegram', e.target.value)}
                  placeholder="Telegram Channel URL"
                  className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm focus:border-sapphire focus:outline-none md:col-span-2"
                />
              </div>
              <div className="mt-5 flex items-center justify-end">
                <button
                  onClick={saveSocialLinks}
                  className="rounded-xl bg-sapphire px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sapphire/90 disabled:opacity-60"
                  disabled={savingSocial}
                >
                  {savingSocial ? 'Saving...' : 'Save Social Links'}
                </button>
              </div>
            </div>

            {/* Bulletin */}
            <div id="admin-bulletin" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Parish Bulletin (വിശ്വാസദീപ്തി)</h3>
                  <p className="mt-1 text-sm text-gray-600">Publish a monthly Drive link; viewers get a separate download button per month.</p>
                </div>
                <div className="text-xs text-gray-500">
                  {selectedBulletinMeta?.createdAt ? (
                    <>
                      <span className="font-semibold">Added:</span> {toJsDate(selectedBulletinMeta.createdAt)?.toLocaleString()}
                      {selectedBulletinMeta.updatedAt && (
                        <>
                          {' '}
                          • <span className="font-semibold">Updated:</span> {toJsDate(selectedBulletinMeta.updatedAt)?.toLocaleString()}
                        </>
                      )}
                    </>
                  ) : (
                    <span>No saved bulletin for selected month.</span>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600">Year</label>
                  <input
                    type="number"
                    value={bulletinYear}
                    onChange={(e) => setBulletinYear(e.target.value)}
                    placeholder="e.g., 2026"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white p-3 shadow-sm focus:border-sapphire focus:outline-none"
                    min="2000"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600">Month</label>
                  <select
                    value={bulletinMonth}
                    onChange={(e) => setBulletinMonth(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white p-3 shadow-sm focus:border-sapphire focus:outline-none"
                  >
                    <option value={1}>January</option>
                    <option value={2}>February</option>
                    <option value={3}>March</option>
                    <option value={4}>April</option>
                    <option value={5}>May</option>
                    <option value={6}>June</option>
                    <option value={7}>July</option>
                    <option value={8}>August</option>
                    <option value={9}>September</option>
                    <option value={10}>October</option>
                    <option value={11}>November</option>
                    <option value={12}>December</option>
                  </select>
                </div>
                <div className="md:col-span-6">
                  <label className="block text-xs font-semibold text-gray-600">Bulletin URL</label>
                  <input
                    type="text"
                    value={bulletinUrl}
                    onChange={(e) => setBulletinUrl(e.target.value)}
                    placeholder="Drive download link / bulletin URL"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white p-3 shadow-sm focus:border-sapphire focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end">
                <button
                  onClick={saveBulletin}
                  className="rounded-xl bg-sapphire px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sapphire/90 disabled:opacity-60"
                  disabled={savingBulletin}
                >
                  {savingBulletin ? 'Saving...' : 'Save & Publish Bulletin'}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">Publishing a new month sends a notification automatically.</p>
            </div>

            {/* Notice */}
            <div id="admin-notice" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Notice Popup</h3>
                  <p className="mt-1 text-sm text-gray-600">Shows on refresh for 10 seconds until expiry, only if a link or image is set.</p>
                </div>
                <div className="text-xs text-gray-500">
                  {currentNoticeMeta?.createdAt ? (
                    <>
                      <span className="font-semibold">Saved:</span> {toJsDate(currentNoticeMeta.createdAt)?.toLocaleString()}
                      {currentNoticeMeta.updatedAt && (
                        <>
                          {' '}
                          • <span className="font-semibold">Updated:</span> {toJsDate(currentNoticeMeta.updatedAt)?.toLocaleString()}
                        </>
                      )}
                    </>
                  ) : (
                    <span>No notice popup active.</span>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600">Title (optional)</label>
                  <input
                    type="text"
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    placeholder="Popup title"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white p-3 shadow-sm focus:border-sapphire focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600">Expiry (required if active)</label>
                  <input
                    type="datetime-local"
                    value={noticeEndAt}
                    onChange={(e) => setNoticeEndAt(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white p-3 shadow-sm focus:border-sapphire focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600">Notice Link (Drive URL)</label>
                  <input
                    type="text"
                    value={noticeLinkUrl}
                    onChange={(e) => setNoticeLinkUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white p-3 shadow-sm focus:border-sapphire focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600">Notice Image URL (optional)</label>
                  <input
                    type="text"
                    value={noticeImageUrl}
                    onChange={(e) => setNoticeImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white p-3 shadow-sm focus:border-sapphire focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end">
                <button
                  onClick={saveNoticePopup}
                  className="rounded-xl bg-sapphire px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sapphire/90 disabled:opacity-60"
                  disabled={savingNotice}
                >
                  {savingNotice ? 'Saving...' : 'Save Notice Popup'}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">Clear both link fields and save to disable the popup.</p>
            </div>

            {/* About */}
            <div id="admin-about" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">About Section</h3>
                <p className="mt-1 text-sm text-gray-600">Update the about text and vicar details shown on the website.</p>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <textarea
              value={aboutContent.aboutText}
              onChange={(e) => setAboutContent((prev) => ({ ...prev, aboutText: e.target.value }))}
              placeholder="About St. Sebastian Church"
              className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm focus:border-sapphire focus:outline-none md:col-span-2"
              rows="4"
            />
            <input
              type="text"
              value={aboutContent.vicarName}
              onChange={(e) => setAboutContent((prev) => ({ ...prev, vicarName: e.target.value }))}
              placeholder="Vicar Name"
              className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm focus:border-sapphire focus:outline-none"
            />
            <input
              type="text"
              value={aboutContent.vicarImageUrl}
              onChange={(e) => setAboutContent((prev) => ({ ...prev, vicarImageUrl: e.target.value }))}
              placeholder="Vicar Image URL (optional)"
              className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm focus:border-sapphire focus:outline-none"
            />
            <input
              type="text"
              value={aboutContent.assistantVicarName}
              onChange={(e) => setAboutContent((prev) => ({ ...prev, assistantVicarName: e.target.value }))}
              placeholder="Assistant Vicar Name"
              className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm focus:border-sapphire focus:outline-none"
            />
            <input
              type="text"
              value={aboutContent.assistantVicarImageUrl}
              onChange={(e) => setAboutContent((prev) => ({ ...prev, assistantVicarImageUrl: e.target.value }))}
              placeholder="Assistant Vicar Image URL (optional)"
              className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm focus:border-sapphire focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <button
              onClick={saveAbout}
              className="rounded-xl bg-sapphire px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sapphire/90 disabled:opacity-60"
              disabled={savingAbout}
            >
              {savingAbout ? 'Saving...' : 'Save About Section'}
            </button>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <label className="text-sm text-gray-700">Import People (Excel/CSV):</label>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) importPeopleFromFile(file);
                  e.target.value = '';
                }}
                disabled={importingPeople}
              />
              {peopleImportSummary && <span className="text-sm text-gray-600">{peopleImportSummary}</span>}
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Excel columns supported: <strong>category</strong>, <strong>name</strong>, role, phone/number/contact, image/imageUrl.
          </p>
            </div>

            {/* Admin Management - Only for Owner */}
            {isOwner && (
              <div id="admin-admins" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Admin Management</h3>
                  <p className="mt-1 text-sm text-gray-600">Owner-only: add or remove admin emails.</p>
                </div>
                <div className="mt-4 flex flex-col gap-3 md:flex-row">
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="Admin Email"
                    className="flex-1 rounded-xl border border-gray-200 bg-white p-3 shadow-sm focus:border-sapphire focus:outline-none"
                  />
                  <button
                    onClick={addAdmin}
                    className="rounded-xl bg-sapphire px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sapphire/90"
                  >
                    Add Admin
                  </button>
                </div>
                <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200">
                  <ul>
                    {admins.map(admin => (
                      <li key={admin.id} className="flex items-center justify-between gap-3 bg-white p-3 border-b last:border-b-0">
                        <span className="text-sm text-gray-800">{admin.email}</span>
                        <button onClick={() => removeAdmin(admin.id)} className="text-sm font-semibold text-red-600 hover:text-red-700">
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Event Management */}
            <div id="admin-events" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Event Management</h3>
                <p className="mt-1 text-sm text-gray-600">Publish events shown in the Events section.</p>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm focus:border-sapphire focus:outline-none"
            />
            <input
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm focus:border-sapphire focus:outline-none"
            />
            <input
              type="text"
              placeholder="Image URL"
              value={newEvent.imageUrl}
              onChange={(e) => setNewEvent({ ...newEvent, imageUrl: e.target.value })}
              className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm focus:border-sapphire focus:outline-none"
            />
            <input
              type="text"
              placeholder="Video URL (optional)"
              value={newEvent.videoUrl}
              onChange={(e) => setNewEvent({ ...newEvent, videoUrl: e.target.value })}
              className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm focus:border-sapphire focus:outline-none"
            />
          </div>
          <textarea
            placeholder="Description"
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            className="w-full rounded-xl border border-gray-200 bg-white p-3 shadow-sm focus:border-sapphire focus:outline-none mb-4"
            rows="4"
          ></textarea>
              <div className="flex items-center justify-end">
                <button
                  onClick={addEvent}
                  className="rounded-xl bg-sapphire px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sapphire/90 disabled:opacity-60"
                  disabled={addingEvent}
                >
                  {addingEvent ? 'Publishing...' : 'Add & Publish Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;
