import React from 'react';

const MassTimings = () => {
  const timings = [
    { day: 'Sunday', time: '7:00 AM, 9:00 AM, 11:00 AM' },
    { day: 'Monday to Saturday', time: '6:30 AM' },
    // Add more as needed
  ];

  return (
    <section id="mass" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-sapphire">Mass Timings</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {timings.map((timing, index) => (
            <div key={index} className="bg-gray-100 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2 text-gold">{timing.day}</h3>
              <p className="text-gray-700">{timing.time}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MassTimings;