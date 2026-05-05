import React, { useEffect, useMemo, useState } from 'react';
import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { toJsDate } from '../utils/time';

const NoticePopup = () => {
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [closed, setClosed] = useState(false);

  const hasLink = Boolean((notice?.linkUrl || '').trim() || (notice?.imageUrl || '').trim());
  const endAt = useMemo(() => toJsDate(notice?.endAt), [notice?.endAt]);
  const expired = endAt ? new Date() >= endAt : false;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const ref = doc(db, 'global_settings', 'noticePopup');
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setNotice(null);
          return;
        }
        const data = snap.data();
        setNotice({ id: snap.id, ...data });

        const end = toJsDate(data?.endAt);
        if (end && new Date() >= end) {
          try {
            await deleteDoc(ref);
          } catch (error) {
            console.error('Unable to delete expired notice:', error);
          }
          setNotice(null);
        }
      } catch (error) {
        console.error('Unable to load notice popup:', error);
        setNotice(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (!hasLink || expired || closed) return;
    const timer = setTimeout(() => setClosed(true), 10_000);
    return () => clearTimeout(timer);
  }, [hasLink, expired, closed]);

  if (loading) return null;
  if (!notice) return null;
  if (!hasLink) return null;
  if (expired) return null;
  if (closed) return null;

  const href = (notice.linkUrl || notice.imageUrl || '').trim();
  const title = (notice.title || '').trim() || 'Notice';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            {endAt && <p className="text-xs text-gray-500">Visible until {endAt.toLocaleString()}</p>}
          </div>
          <button
            type="button"
            onClick={() => setClosed(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition hover:bg-gray-50"
            aria-label="Close notice popup"
          >
            ×
          </button>
        </div>

        <div className="p-4">
          {notice.imageUrl ? (
            <div className="w-full overflow-hidden rounded-xl bg-gray-100">
              <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
                <img
                  src={notice.imageUrl}
                  alt={title}
                  className="absolute inset-0 h-full w-full object-contain"
                  loading="lazy"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-sapphire/5 p-6">
              <p className="text-sm text-gray-700">A new notice has been published.</p>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-sapphire px-4 py-2 text-sm font-semibold text-white transition hover:bg-sapphire/90"
            >
              Open notice
            </a>
            <p className="text-xs text-gray-500">Auto closes in 10 seconds</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticePopup;

