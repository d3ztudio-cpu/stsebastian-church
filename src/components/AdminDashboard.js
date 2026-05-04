import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, setDoc, writeBatch } from 'firebase/firestore';
import * as XLSX from 'xlsx';

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
  }, [isAdmin, isOwner]);

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
    <section id="admin" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-sapphire">Admin Dashboard</h2>

        {/* Live Stream */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Live Stream Management</h3>
          <input
            type="text"
            value={liveUrl}
            onChange={handleLiveUrlChange}
            placeholder="YouTube Live URL"
            className="w-full p-2 border rounded mb-4"
          />
          {previewUrl && previewUrl.includes('youtube') && (
            <iframe
              width="560"
              height="315"
              src={`https://www.youtube.com/embed/${previewUrl.split('v=')[1]}`}
              title="Preview"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="mb-4"
            ></iframe>
          )}
          <button onClick={saveLiveUrl} className="bg-sapphire text-white px-4 py-2 rounded" disabled={savingLive}>
            {savingLive ? 'Publishing...' : 'Save & Publish Live URL'}
          </button>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Social Media Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              value={socialLinks.facebook}
              onChange={(e) => handleSocialChange('facebook', e.target.value)}
              placeholder="Facebook URL"
              className="p-2 border rounded"
            />
            <input
              type="text"
              value={socialLinks.instagram}
              onChange={(e) => handleSocialChange('instagram', e.target.value)}
              placeholder="Instagram URL"
              className="p-2 border rounded"
            />
            <input
              type="text"
              value={socialLinks.youtube}
              onChange={(e) => handleSocialChange('youtube', e.target.value)}
              placeholder="YouTube URL"
              className="p-2 border rounded"
            />
            <input
              type="text"
              value={socialLinks.whatsapp}
              onChange={(e) => handleSocialChange('whatsapp', e.target.value)}
              placeholder="WhatsApp Link"
              className="p-2 border rounded"
            />
            <input
              type="text"
              value={socialLinks.telegram}
              onChange={(e) => handleSocialChange('telegram', e.target.value)}
              placeholder="Telegram Channel URL"
              className="p-2 border rounded"
            />
          </div>
          <button
            onClick={saveSocialLinks}
            className="bg-sapphire text-white px-4 py-2 rounded"
            disabled={savingSocial}
          >
            {savingSocial ? 'Saving social settings...' : 'Save Social Media Links'}
          </button>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">About Section</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <textarea
              value={aboutContent.aboutText}
              onChange={(e) => setAboutContent((prev) => ({ ...prev, aboutText: e.target.value }))}
              placeholder="About St. Sebastian Church"
              className="p-2 border rounded md:col-span-2"
              rows="4"
            />
            <input
              type="text"
              value={aboutContent.vicarName}
              onChange={(e) => setAboutContent((prev) => ({ ...prev, vicarName: e.target.value }))}
              placeholder="Vicar Name"
              className="p-2 border rounded"
            />
            <input
              type="text"
              value={aboutContent.vicarImageUrl}
              onChange={(e) => setAboutContent((prev) => ({ ...prev, vicarImageUrl: e.target.value }))}
              placeholder="Vicar Image URL (optional)"
              className="p-2 border rounded"
            />
            <input
              type="text"
              value={aboutContent.assistantVicarName}
              onChange={(e) => setAboutContent((prev) => ({ ...prev, assistantVicarName: e.target.value }))}
              placeholder="Assistant Vicar Name"
              className="p-2 border rounded"
            />
            <input
              type="text"
              value={aboutContent.assistantVicarImageUrl}
              onChange={(e) => setAboutContent((prev) => ({ ...prev, assistantVicarImageUrl: e.target.value }))}
              placeholder="Assistant Vicar Image URL (optional)"
              className="p-2 border rounded"
            />
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <button onClick={saveAbout} className="bg-sapphire text-white px-4 py-2 rounded" disabled={savingAbout}>
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
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Admin Management</h3>
            <div className="flex mb-4">
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="Admin Email"
                className="flex-1 p-2 border rounded mr-2"
              />
              <button onClick={addAdmin} className="bg-sapphire text-white px-4 py-2 rounded">Add Admin</button>
            </div>
            <ul>
              {admins.map(admin => (
                <li key={admin.id} className="flex justify-between items-center p-2 border-b">
                  {admin.email}
                  <button onClick={() => removeAdmin(admin.id)} className="text-red-500">Remove</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Event Management */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Event Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Image URL"
              value={newEvent.imageUrl}
              onChange={(e) => setNewEvent({ ...newEvent, imageUrl: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Video URL (optional)"
              value={newEvent.videoUrl}
              onChange={(e) => setNewEvent({ ...newEvent, videoUrl: e.target.value })}
              className="p-2 border rounded"
            />
          </div>
          <textarea
            placeholder="Description"
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            className="w-full p-2 border rounded mb-4"
            rows="4"
          ></textarea>
          <button onClick={addEvent} className="bg-sapphire text-white px-4 py-2 rounded" disabled={addingEvent}>
            {addingEvent ? 'Publishing...' : 'Add & Publish Event'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;
