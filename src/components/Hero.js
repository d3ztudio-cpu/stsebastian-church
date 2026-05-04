import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const getYouTubeId = (url) => {
  if (!url) return '';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([^&?\/\s]+)/);
  return match ? match[1] : '';
};

const Hero = () => {
  const [liveUrl, setLiveUrl] = useState('');
  const [loading, setLoading] = useState(true);

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

  return (
    <>
      <section id="home" className="relative min-h-screen flex items-center justify-center text-white">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: "url('https://i.ibb.co/MyXLdsxg/image.png')" }}
        ></div>
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to St. Sebastian Church</h1>
          <p className="text-lg md:text-xl mb-8">Puranattukara</p>
        </div>
      </section>

      <section className="bg-sapphire text-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">YouTube Live Stream</h2>
          <div className="rounded-3xl bg-white bg-opacity-10 p-6 shadow-lg">
            {loading ? (
              <p className="text-white">Loading live stream...</p>
            ) : liveId ? (
              <iframe
                className="w-full h-80 rounded-xl border border-white/20"
                src={`https://www.youtube.com/embed/${liveId}`}
                title="YouTube Live Stream"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <p className="text-white">Live stream is currently offline. Check back later.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;