import React, { useMemo, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

const getYouTubeId = (url) => {
  if (!url) return '';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:(?:watch\?v=)|embed\/|v\/|shorts\/|live\/))([^&?\/\s]+)/);
  return match ? match[1] : '';
};

const EventTimeline = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeEvent, setActiveEvent] = useState(null);
  const [lightboxSlides, setLightboxSlides] = useState([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'church_events'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const eventsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(eventsData);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const openEvent = (event) => {
    setActiveEvent(event);
  };

  const closeEvent = () => {
    setActiveEvent(null);
  };

  const openImage = (event) => {
    if (!event?.imageUrl) return;
    setLightboxSlides([{ src: event.imageUrl, alt: event.title || 'Event image' }]);
    setLightboxOpen(true);
  };

  const activeVideoId = useMemo(() => getYouTubeId(activeEvent?.videoUrl), [activeEvent?.videoUrl]);

  return (
    <section id="events" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-sapphire">Church Events</h2>
        {loading ? (
          <div className="text-center py-16">
            <p className="text-gray-600">Loading events...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {events.map((event) => {
              const eventDate = event.date?.seconds ? new Date(event.date.seconds * 1000) : new Date(event.date);
              const isExpanded = expandedEventId === event.id;
              return (
                <div key={event.id} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex flex-col md:flex-row md:items-center md:gap-6">
                    <button onClick={() => openImage(event)} className="w-full md:w-1/3 mb-4 md:mb-0 focus:outline-none">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </button>
                    <div className="flex-1">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gold">{event.title}</h3>
                          <p className="text-gray-600">{eventDate.toLocaleDateString()}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setExpandedEventId((prev) => (prev === event.id ? null : event.id))}
                            className="inline-flex items-center gap-2 rounded bg-gray-100 px-4 py-2 text-sm text-gray-800 hover:bg-gray-200"
                            aria-expanded={isExpanded}
                            aria-controls={`event-desc-${event.id}`}
                          >
                            <span>{isExpanded ? 'Hide description' : 'Show description'}</span>
                            <span aria-hidden="true">{isExpanded ? '▲' : '▼'}</span>
                          </button>
                          {event.videoUrl ? (
                            <button
                              type="button"
                              onClick={() => openEvent(event)}
                              className="inline-flex items-center px-4 py-2 bg-sapphire text-white rounded hover:bg-blue-800"
                            >
                              Watch Video
                            </button>
                          ) : null}
                        </div>
                      </div>

                      <div
                        id={`event-desc-${event.id}`}
                        className={`${isExpanded ? 'mt-4 max-h-48 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden transition-all duration-300 ease-out`}
                      >
                        <div className="max-h-48 overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-gray-700 whitespace-pre-wrap">
                          {event.description}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Lightbox open={lightboxOpen} close={() => setLightboxOpen(false)} slides={lightboxSlides} />

      {activeEvent && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeEvent();
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl overflow-hidden max-w-4xl w-full shadow-2xl">
            <div className="flex items-center justify-between gap-3 p-4 border-b">
              <button onClick={closeEvent} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <span aria-hidden="true">←</span>
                <span>Back</span>
              </button>
              <h3 className="text-lg md:text-xl font-bold text-sapphire text-center flex-1">{activeEvent.title}</h3>
              <button onClick={closeEvent} className="rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100" aria-label="Close">
                ✕
              </button>
            </div>

            <div className="bg-black">
              {activeVideoId ? (
                <iframe
                  className="w-full h-72 md:h-96"
                  src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?modestbranding=1&rel=0&playsinline=1`}
                  title={activeEvent.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : null}
            </div>

            <div className="p-6">
              <div className="max-h-64 overflow-auto pr-2">
                <p className="text-gray-700 whitespace-pre-wrap">{activeEvent.description}</p>
              </div>
              {activeEvent.videoUrl ? (
                <div className="mt-4 border-t pt-4">
                  <p className="text-sm text-gray-500">Video URL</p>
                  <a
                    href={activeEvent.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block break-all text-sm text-sapphire hover:underline"
                  >
                    {activeEvent.videoUrl}
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default EventTimeline;
