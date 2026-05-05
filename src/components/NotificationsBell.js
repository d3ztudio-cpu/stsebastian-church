import React, { useEffect, useMemo, useState } from 'react';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
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

const STORAGE_KEY = 'stsebastian.notifications.lastSeenAtMs';

const NotificationsBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [tick, setTick] = useState(0);
  const [lastSeenMs, setLastSeenMs] = useState(() => {
    const raw = Number(window.localStorage.getItem(STORAGE_KEY) || 0);
    return Number.isFinite(raw) ? raw : 0;
  });

  useEffect(() => {
    const interval = setInterval(() => setTick((v) => v + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'site_notifications'), orderBy('createdAt', 'desc'), limit(20));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const next = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setNotifications(next);
      },
      (error) => {
        console.error('Unable to load notifications:', error);
      }
    );
    return () => unsub();
  }, []);

  const newestAt = useMemo(() => {
    const newest = notifications[0]?.createdAt;
    const newestDate = toJsDate(newest);
    return newestDate ? newestDate.getTime() : 0;
  }, [notifications]);

  const hasUnread = newestAt > lastSeenMs;

  const markSeen = () => {
    const now = Date.now();
    window.localStorage.setItem(STORAGE_KEY, String(now));
    setLastSeenMs(now);
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-gold hover:text-gold"
        aria-label="Open notifications"
        aria-expanded={open}
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) markSeen();
        }}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M12 22a2.5 2.5 0 002.45-2h-4.9A2.5 2.5 0 0012 22zm7-6V11a7 7 0 00-5-6.7V3a2 2 0 10-4 0v1.3A7 7 0 005 11v5l-1.5 1.5V19h17v-1.5L19 16z" />
        </svg>
        {hasUnread && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500" aria-hidden="true" />}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-label="Close notifications"
          />
          <div className="absolute right-0 z-50 mt-3 w-80 overflow-hidden rounded-2xl border border-white/10 bg-sapphire/95 text-white shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <p className="text-sm font-semibold">Notifications</p>
              <button
                type="button"
                className="text-white/80 hover:text-white"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="max-h-80 overflow-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-4 text-sm text-white/70">No notifications yet.</p>
              ) : (
                notifications.map((n) => {
                  const createdAt = toJsDate(n.createdAt);
                  const monthLabel = n.month ? MONTHS[Math.max(0, Math.min(11, Number(n.month) - 1))] : '';
                  const text =
                    n.type === 'bulletin'
                      ? `വിശ്വാസദീപ്തി - ${monthLabel || 'Bulletin'} published`
                      : n.text || 'Update published';
                  return (
                    <div key={n.id} className="border-b border-white/10 px-4 py-3 last:border-b-0">
                      <p className="text-sm">{text}</p>
                      {createdAt && <p className="mt-1 text-xs text-white/70">{formatRelativeTime(createdAt)} (updates)</p>}
                    </div>
                  );
                })
              )}
            </div>
            {/* tick is intentionally used to keep relative timestamps fresh */}
            <span className="sr-only">{tick}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsBell;
