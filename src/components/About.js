import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const About = () => {
  const [aboutContent, setAboutContent] = useState({
    aboutText: '',
    vicarName: '',
    vicarImageUrl: '',
    assistantVicarName: '',
    assistantVicarImageUrl: '',
  });

  useEffect(() => {
    const unsubAbout = onSnapshot(doc(db, 'global_settings', 'aboutContent'), (snap) => {
      if (snap.exists()) setAboutContent((prev) => ({ ...prev, ...snap.data() }));
    });
    return () => {
      unsubAbout();
    };
  }, []);

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

        {/* People sections (Trustees/Units/Teams) temporarily hidden */}
      </div>
    </section>
  );
};

export default About;
