import React, { useMemo, useState } from 'react';

const nfc = (value) => (value || '').toString().normalize('NFC');

const UNITS = [
  { no: 1, ml: nfc('സെന്റ് ജോർജ്ജ്'), en: 'St. George' },
  { no: 2, ml: nfc('ക്രൈസ്റ്റ് ദ കിംഗ്'), en: 'Christ the King' },
  { no: 3, ml: nfc('ജോൺപോൾ II'), en: 'John Paul II' },
  { no: 4, ml: nfc('സെന്റ് ജോൺ'), en: 'St. John' },
  { no: 5, ml: nfc('ലിറ്റിൽ ഫ്ലവർ'), en: 'Little Flower' },
  { no: 6, ml: nfc('സെന്റ് അലോഷ്യസ്'), en: 'St. Aloysius' },
  { no: 7, ml: nfc('സെന്റ് പീറ്റർ'), en: 'St. Peter' },
  { no: 8, ml: nfc('സെന്റ് ജോസഫ്'), en: 'St. Joseph' },
  { no: 9, ml: nfc('സെന്റ് റാഫേൽ'), en: 'St. Raphael' },
  { no: 10, ml: nfc('സെന്റ് അൽഫോൺസ'), en: 'St. Alphonsa' },
  { no: 11, ml: nfc('സെന്റ് സെബാസ്റ്റ്യൻ'), en: 'St. Sebastian' },
  { no: 12, ml: nfc('മേരിറാണി'), en: 'Mary Rani' },
  { no: 13, ml: nfc('അമലോത്ഭവനാഥ'), en: 'Ambalothbhavanatha (Immaculate Conception)' },
  { no: 14, ml: nfc('ഡോൺബോസ്കോ'), en: 'Don Bosco' },
  { no: 15, ml: nfc('ഇൻഫന്റ് ജീസസ്'), en: 'Infant Jesus' },
  { no: 16, ml: nfc('സെന്റ് ആന്റണി'), en: 'St. Anthony' },
  { no: 17, ml: nfc('ഹോളിഫാമിലി'), en: 'Holy Family' },
  { no: 18, ml: nfc('ഹോളി ഏഞ്ചൽ'), en: 'Holy Angel' },
  { no: 19, ml: nfc('സെന്റ് ആൽബർട്ട്'), en: 'St. Albert' },
  { no: 20, ml: nfc('സേക്രട്ട് ഹാർട്ട്'), en: 'Sacred Heart' },
  { no: 21, ml: nfc('സെന്റ് റോസ്'), en: 'St. Rose' },
  { no: 22, ml: nfc('സെന്റ് തോമസ്'), en: 'St. Thomas' },
  { no: 23, ml: nfc('വിമലനാഥ'), en: 'Vimalanatha' },
  { no: 24, ml: nfc('മേരിഗിരി'), en: 'Marygiri' },
  { no: 25, ml: nfc('സെന്റ് മേരീസ്'), en: "St. Mary's" },
  { no: 26, ml: nfc('മദർതെരേസ'), en: 'Mother Teresa' },
  { no: 27, ml: nfc('ഏവുപ്രാസ്യാമ്മ'), en: 'Euphrasiamma' },
];

const normalize = (value) => (value || '').toString().toLowerCase().trim();

const ParishUnits = () => {
  const [query, setQuery] = useState('');

  const filteredUnits = useMemo(() => {
    const q = normalize(query);
    if (!q) return UNITS;
    return UNITS.filter((unit) => {
      const haystack = `${unit.no} ${unit.ml} ${unit.en}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query]);

  return (
    <section id="parish-units" className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-sapphire">Parish Units</h2>
            <p className="mt-1 text-gray-600">
              <span className="malayalam-modern font-semibold">ഇടവക യൂണിറ്റുകൾ</span> • St. Sebastian Church, Puranattukara
            </p>
          </div>

          <div className="w-full md:w-96">
            <label className="sr-only" htmlFor="unit-search">
              Search parish units
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-500" fill="currentColor" aria-hidden="true">
                <path d="M10 2a8 8 0 105.3 14l4.4 4.4 1.4-1.4-4.4-4.4A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z" />
              </svg>
              <input
                id="unit-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search unit…"
                className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
              />
              <span className="hidden text-xs text-gray-500 sm:inline">
                {filteredUnits.length}/{UNITS.length}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUnits.map((unit) => (
            <article
              key={unit.no}
              className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-sapphire">{unit.en}</p>
                  <p className="malayalam-modern mt-1 text-sm font-semibold text-gray-700">{unit.ml}</p>
                </div>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-sapphire/10 text-sm font-bold text-sapphire">
                  {unit.no}
                </span>
              </div>
            </article>
          ))}
        </div>

        {filteredUnits.length === 0 && (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
            <p className="text-sm font-semibold text-gray-900">No matching units.</p>
            <p className="mt-1 text-sm text-gray-600">Try a different search term.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ParishUnits;
