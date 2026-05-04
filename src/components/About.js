import React, { useEffect, useMemo, useState } from 'react';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const CATEGORY_LABELS = [
  { key: 'parish trustee', label: 'Parish Trustee' },
  { key: 'parish trustees', label: 'Parish Trustee' },
  { key: 'trustee', label: 'Parish Trustee' },
  { key: 'parish units', label: 'Parish Units' },
  { key: 'unit', label: 'Parish Units' },
  { key: 'media team', label: 'Media Team' },
  { key: 'media', label: 'Media Team' },
  { key: 'clc', label: 'CLC' },
  { key: 'kcym', label: 'KCYM' },
];

const normalizeCategory = (value) => (value || '').toString().trim().toLowerCase();

const personCard = (person, idx) => {
  const hasImage = Boolean(person?.imageUrl);
  return (
    <div
      key={person?.id || `${person?.name || 'person'}_${idx}`}
      className="rounded-2xl border border-sapphire/10 bg-white p-4 shadow-sm"
    >
      <div className="mx-auto h-24 w-24 overflow-hidden rounded-2xl border border-sapphire/10 bg-gray-50">
        {hasImage ? (
          <img src={person.imageUrl} alt={person.name || 'Person'} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">Image</div>
        )}
      </div>
      <div className="mt-3 text-center">
        <p className="font-semibold text-sapphire">{person?.name || 'Name'}</p>
        {person?.role ? <p className="text-sm text-gray-600">{person.role}</p> : <p className="text-sm text-gray-400">Role</p>}
        {person?.phone ? <p className="mt-1 text-sm text-gray-700">{person.phone}</p> : <p className="mt-1 text-sm text-gray-400">Number</p>}
      </div>
    </div>
  );
};

const About = () => {
  const [aboutContent, setAboutContent] = useState({
    aboutText: '',
    vicarName: '',
    vicarImageUrl: '',
    assistantVicarName: '',
    assistantVicarImageUrl: '',
  });
  const [people, setPeople] = useState([]);

  useEffect(() => {
    const unsubAbout = onSnapshot(doc(db, 'global_settings', 'aboutContent'), (snap) => {
      if (snap.exists()) setAboutContent((prev) => ({ ...prev, ...snap.data() }));
    });
    const unsubPeople = onSnapshot(collection(db, 'about_people'), (snap) => {
      setPeople(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => {
      unsubAbout();
      unsubPeople();
    };
  }, []);

  const grouped = useMemo(() => {
    const buckets = new Map();
    people.forEach((p) => {
      const key = normalizeCategory(p.category);
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(p);
    });
    return buckets;
  }, [people]);

  const sections = useMemo(() => {
    const labelByKey = new Map(CATEGORY_LABELS.map((c) => [c.key, c.label]));
    const usedKeys = new Set();

    const ordered = [];
    CATEGORY_LABELS.forEach((c) => {
      if (usedKeys.has(c.label)) return;
      usedKeys.add(c.label);
      ordered.push({ label: c.label, keys: CATEGORY_LABELS.filter((x) => x.label === c.label).map((x) => x.key) });
    });

    const otherKeys = [...grouped.keys()].filter((k) => !labelByKey.has(k));
    if (otherKeys.length) ordered.push({ label: 'Other', keys: otherKeys });
    return ordered;
  }, [grouped]);

  return (
    <section id="about" className="bg-white py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-sapphire">About</h2>

        <div className="mt-6 rounded-3xl border border-sapphire/10 bg-sapphire/5 p-6">
          <h3 className="text-xl font-semibold text-sapphire">About St. Sebastian Church</h3>
          <p className="mt-3 text-gray-700">
            {aboutContent.aboutText || 'Add about text from Admin Dashboard → About Section.'}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="rounded-3xl border border-sapphire/10 bg-white p-6 shadow-sm">
            <div className="mx-auto h-64 w-64 overflow-hidden rounded-3xl border border-sapphire/10 bg-gray-50">
              {aboutContent.vicarImageUrl ? (
                <img src={aboutContent.vicarImageUrl} alt="Vicar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">Vicar Image</div>
              )}
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm font-semibold tracking-wide text-sapphire">VICAR</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{aboutContent.vicarName || 'NAME'}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-sapphire/10 bg-white p-6 shadow-sm">
            <div className="mx-auto h-64 w-64 overflow-hidden rounded-3xl border border-sapphire/10 bg-gray-50">
              {aboutContent.assistantVicarImageUrl ? (
                <img src={aboutContent.assistantVicarImageUrl} alt="Assistant Vicar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">Assistant Image</div>
              )}
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm font-semibold tracking-wide text-sapphire">ASSISTANT VICAR</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{aboutContent.assistantVicarName || 'NAME'}</p>
            </div>
          </div>
        </div>

        {sections.map((section) => {
          const sectionPeople = section.keys.flatMap((k) => grouped.get(k) || []);
          return (
            <div key={section.label} className="mt-12">
              <h3 className="text-center text-xl font-bold text-gray-900">{section.label.toUpperCase()}</h3>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {(sectionPeople.length ? sectionPeople : Array.from({ length: 6 }).map(() => ({}))).map((p, idx) =>
                  personCard(p, idx)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default About;

