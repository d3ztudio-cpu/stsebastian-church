import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';

const getYouTubeId = (url) => {
  if (!url) return '';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([^&?\/\s]+)/);
  return match ? match[1] : '';
};

const EventTimeline = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeEvent, setActiveEvent] = useState(null);

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
              return (
                <div key={event.id} className="flex flex-col md:flex-row items-center bg-white p-6 rounded-lg shadow-md">
                  <button onClick={() => openEvent(event)} className="w-full md:w-1/3 mb-4 md:mb-0 md:mr-6 focus:outline-none">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </button>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 text-gold">{event.title}</h3>
                    <p className="text-gray-600 mb-2">{eventDate.toLocaleDateString()}</p>
                    <p className="text-gray-700">{event.description}</p>
                    <button onClick={() => openEvent(event)} className="mt-4 inline-flex items-center px-4 py-2 bg-sapphire text-white rounded hover:bg-blue-800">
                      View Media
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {activeEvent && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl overflow-hidden max-w-4xl w-full shadow-2xl">
            <div className="flex justify-between items-start p-4 border-b">
              <div>
                <h3 className="text-xl font-bold text-sapphire">{activeEvent.title}</h3>
                <p className="text-gray-600 mt-1">{activeEvent.description}</p>
              </div>
              <button onClick={closeEvent} className="text-gray-500 hover:text-gray-900">Close</button>
            </div>
            <div className="bg-black">
              {activeEvent.videoUrl ? (
                <iframe
                  className="w-full h-96"
                  src={`https://www.youtube.com/embed/${getYouTubeId(activeEvent.videoUrl)}`}
                  title={activeEvent.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <img src={activeEvent.imageUrl} alt={activeEvent.title} className="w-full object-cover h-96" />
              )}
            </div>
            <div className="p-6">
              <p className="text-gray-700">{activeEvent.description}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default EventTimeline;