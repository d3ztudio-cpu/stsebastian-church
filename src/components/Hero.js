import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const getYouTubeId = (url) => {
  if (!url) return '';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:(?:watch\?v=)|embed\/|v\/|shorts\/|live\/))([^&?\/\s]+)/);
  return match ? match[1] : '';
};

const Hero = () => {
  const [liveUrl, setLiveUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const directionsUrl = 'https://maps.app.goo.gl/wHnimvMbz248WDbQ8';
  const mapEmbedUrl =
    'https://www.google.com/maps?q=St.%20Sebastian%20Church%20Puranattukara&t=k&z=17&output=embed';

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'global_settings', 'liveStream'), (doc) => {
      if (doc.exists()) {
        setLiveUrl(doc.data().url || '');
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const liveId = getYouTubeId(liveUrl);
  const thumbnailUrl = liveId ? `https://i.ytimg.com/vi/${liveId}/hqdefault.jpg` : '';

  return (
    <>
      <section id="home" className="relative min-h-screen flex items-center justify-center text-white">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: "url('https://i.ibb.co/MyXLdsxg/image.png')" }}
        ></div>
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Journeying Together in the Light of Christ</h1>
          <p className="text-lg md:text-xl mb-8">St Sebastain Church, Puranattukara</p>
        </div>
      </section>

      <section className="bg-sapphire text-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">YouTube Live Stream</h2>
          <div className="rounded-3xl bg-white bg-opacity-10 p-6 shadow-lg">
            {loading ? (
              <p className="text-white">Loading live stream...</p>
            ) : liveId ? (
              <button
                type="button"
                onClick={() => setIsPlayerOpen(true)}
                className="group relative w-full overflow-hidden rounded-2xl border border-white/20 bg-black/30"
                aria-label="Open live stream player"
              >
                <img src={thumbnailUrl} alt="Live stream preview" className="h-80 w-full object-cover opacity-95 transition group-hover:opacity-100" />
                <div className="absolute inset-0 bg-black/30 transition group-hover:bg-black/35" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="inline-flex items-center gap-3 rounded-full bg-white/15 px-5 py-3 text-white backdrop-blur-sm ring-1 ring-white/30 transition group-hover:bg-white/20">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gold text-sapphire">
                      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
                        <path d="M9 7.8v8.4L16.5 12 9 7.8z" />
                      </svg>
                    </span>
                    <span className="font-semibold">Watch Live</span>
                  </div>
                </div>
              </button>
            ) : (
              <p className="text-white">Live stream is currently offline. Check back later.</p>
            )}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-sapphire">Directions</h2>
              <p className="mt-2 text-gray-600">Find St. Sebastian Church (satellite view).</p>
            </div>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-sapphire px-5 py-3 font-semibold text-white shadow hover:bg-blue-800"
            >
              Open in Google Maps
            </a>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-sapphire/10 bg-white shadow-lg">
            <div className="h-[420px] w-full">
              <iframe
                title="St. Sebastian Church Directions"
                src={mapEmbedUrl}
                className="h-full w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {isPlayerOpen && liveId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsPlayerOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-5xl overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/10">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-black/60 px-4 py-3">
              <button
                type="button"
                onClick={() => setIsPlayerOpen(false)}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/10"
              >
                <span aria-hidden="true">←</span>
                <span>Back</span>
              </button>
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-white/80 hover:text-gold"
              >
                Open on YouTube
              </a>
              <button
                type="button"
                onClick={() => setIsPlayerOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/10"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <iframe
              className="h-[70vh] w-full"
              src={`https://www.youtube-nocookie.com/embed/${liveId}?modestbranding=1&rel=0&playsinline=1`}
              title="YouTube Live Stream"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Hero;
