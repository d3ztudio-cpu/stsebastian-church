import React, { useEffect, useMemo, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { formatRelativeTime, toJsDate } from '../utils/time';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const buildMonthSlots = (year) =>
  MONTHS.map((label, idx) => ({
    id: `${year}-${String(idx + 1).padStart(2, '0')}`,
    year,
    month: idx + 1,
    label,
  }));

const ParishBulletins = () => {
  const year = useMemo(() => new Date().getFullYear(), []);
  const [loading, setLoading] = useState(true);
  const [bulletinsById, setBulletinsById] = useState({});
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((v) => v + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(query(collection(db, 'parish_bulletins'), where('year', '==', year)));
        const next = {};
        snapshot.docs.forEach((d) => {
          next[d.id] = { id: d.id, ...d.data() };
        });
        setBulletinsById(next);
      } catch (error) {
        console.error('Unable to load bulletins:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [year]);

  const slots = useMemo(() => buildMonthSlots(year), [year]);

  return (
    <section id="bulletin" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-sapphire">Parish Bulletin</h2>
            <p className="text-gray-600">
              <span className="font-semibold">വിശ്വാസദീപ്തി</span> • {year} timeline
            </p>
          </div>
          <p className="text-sm text-gray-500">Monthly digital copies for download</p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {slots.map((slot) => {
            const bulletin = bulletinsById[slot.id];
            const createdAt = toJsDate(bulletin?.createdAt);
            const subtitle = bulletin?.createdAt ? `Added ${formatRelativeTime(createdAt)} (updates)` : 'Not uploaded yet';
            return (
              <div key={slot.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{slot.label}</p>
                    <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-sapphire/10 px-3 py-1 text-xs font-semibold text-sapphire">
                    {String(slot.month).padStart(2, '0')}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <a
                    href={bulletin?.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      bulletin?.url
                        ? 'bg-sapphire text-white hover:bg-sapphire/90'
                        : 'cursor-not-allowed bg-gray-200 text-gray-500'
                    }`}
                    aria-disabled={!bulletin?.url}
                    onClick={(e) => {
                      if (!bulletin?.url) e.preventDefault();
                    }}
                  >
                    Download bulletin
                  </a>
                  {createdAt && (
                    <span className="text-xs text-gray-500" title={createdAt.toLocaleString()}>
                      {createdAt.toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {loading && <p className="mt-6 text-sm text-gray-500">Loading bulletins…</p>}
        {!loading && Object.keys(bulletinsById).length === 0 && (
          <p className="mt-6 text-sm text-gray-500">No bulletins published for {year} yet.</p>
        )}
        {/* tick is intentionally used to keep relative timestamps fresh */}
        <span className="sr-only">{tick}</span>
      </div>
    </section>
  );
};

export default ParishBulletins;

