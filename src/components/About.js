import React, { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

const About = () => {
  const [aboutContent, setAboutContent] = useState({
    aboutText: '',
    vicarName: '',
    vicarImageUrl: '',
    assistantVicarName: '',
    assistantVicarImageUrl: '',
  });
  const [aboutSections, setAboutSections] = useState([]);

  useEffect(() => {
    const unsubAbout = onSnapshot(doc(db, 'global_settings', 'aboutContent'), (snap) => {
      if (snap.exists()) setAboutContent((prev) => ({ ...prev, ...snap.data() }));
    });
    const sectionsQuery = query(collection(db, 'about_sections'), orderBy('order', 'asc'));
    const unsubSections = onSnapshot(sectionsQuery, (snap) => {
      const sections = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAboutSections(sections);
    });
    return () => {
      unsubAbout();
      unsubSections();
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

        {/* People sections (Trustees/Units/Teams) */}
        {aboutSections.length > 0 && (
          <div className="mt-14 space-y-12">
            {aboutSections.map((section) => {
              const members = Array.isArray(section.members) ? section.members : [];
              return (
                <div key={section.id} className="rounded-3xl border border-sapphire/10 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-sapphire">{section.title || 'Section'}</h3>
                      {section.description && <p className="mt-2 text-gray-700">{section.description}</p>}
                    </div>
                    {section.imageUrl && (
                      <div className="h-44 w-full overflow-hidden rounded-3xl border border-sapphire/10 bg-gray-50 md:h-40 md:w-56">
                        <img src={section.imageUrl} alt={section.title || 'Section'} className="h-full w-full object-cover" />
                      </div>
                    )}
                  </div>

                  {members.length > 0 ? (
                    <div className="mt-8 flex flex-wrap justify-center gap-5">
                      {members.map((member, idx) => {
                        const contactNumber = (member?.contactNumber ?? member?.phone ?? '').toString().trim();
                        const hasContact = Boolean(contactNumber);
                        return (
                          <div
                            key={`${section.id}_${idx}`}
                            className="w-[calc(50%-10px)] rounded-3xl border border-sapphire/10 bg-sapphire/5 p-5 text-center shadow-sm md:w-[calc(25%-15px)]"
                          >
                            <div className="mx-auto h-24 w-24 overflow-hidden rounded-3xl border border-sapphire/10 bg-white shadow-sm">
                              {member?.imageUrl ? (
                                <img src={member.imageUrl} alt={member?.name || 'Member'} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">Photo</div>
                              )}
                            </div>

                            <p className="mt-4 text-base font-semibold text-gray-900">{member?.name || 'Name'}</p>
                            {member?.role ? <p className="mt-1 text-sm font-semibold text-gray-700">{member.role}</p> : null}

                            {hasContact && (
                              <p className="mt-1 text-sm font-semibold text-gray-700">{contactNumber}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-6 text-sm text-gray-500">No members added yet.</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default About;
