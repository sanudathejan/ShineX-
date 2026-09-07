import { useState, useRef, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { createBooking } from '../services/bookingService';
import { SERVICES as SERVICE_DATA, bookablePackages } from '../data/services';
import './Book.css';

const DUBAI_AREAS = [
  'Dubai Marina', 'Downtown Dubai', 'Palm Jumeirah', 'Jumeirah Village Circle',
  'Business Bay', 'Deira', 'Al Barsha', 'Al Quoz', 'Dubai Hills', 'Mirdif',
  'Bur Dubai', 'Karama', 'Satwa', 'Meadows', 'Springs', 'Arabian Ranches',
  'Dubai Silicon Oasis', 'Al Nahda', 'Al Rashidiya', 'International City',
  'Jumeirah Lake Towers', 'The Greens', 'Al Quoz Industrial', 'Sheikh Zayed Road',
  'Motor City', 'Sports City', 'Discovery Gardens', 'Jumeirah Beach Residence'
];

// Approximate neighbourhood centers — used only to pan/zoom the map when an
// area is picked, not for validation or storage, so survey-level precision
// isn't needed here.
const AREA_CENTERS = {
  'Dubai Marina': { lat: 25.0805, lng: 55.1403, zoom: 14 },
  'Downtown Dubai': { lat: 25.1972, lng: 55.2744, zoom: 14 },
  'Palm Jumeirah': { lat: 25.1124, lng: 55.1390, zoom: 13 },
  'Jumeirah Village Circle': { lat: 25.0515, lng: 55.2065, zoom: 13 },
  'Business Bay': { lat: 25.1857, lng: 55.2633, zoom: 14 },
  'Deira': { lat: 25.2697, lng: 55.3095, zoom: 13 },
  'Al Barsha': { lat: 25.1107, lng: 55.2007, zoom: 13 },
  'Al Quoz': { lat: 25.1372, lng: 55.2280, zoom: 13 },
  'Dubai Hills': { lat: 25.1042, lng: 55.2494, zoom: 13 },
  'Mirdif': { lat: 25.2170, lng: 55.4210, zoom: 13 },
  'Bur Dubai': { lat: 25.2582, lng: 55.2963, zoom: 14 },
  'Karama': { lat: 25.2462, lng: 55.3047, zoom: 14 },
  'Satwa': { lat: 25.2285, lng: 55.2708, zoom: 14 },
  'Meadows': { lat: 25.0715, lng: 55.1660, zoom: 13 },
  'Springs': { lat: 25.0637, lng: 55.1730, zoom: 13 },
  'Arabian Ranches': { lat: 25.0512, lng: 55.2696, zoom: 13 },
  'Dubai Silicon Oasis': { lat: 25.1216, lng: 55.3773, zoom: 13 },
  'Al Nahda': { lat: 25.2934, lng: 55.3703, zoom: 13 },
  'Al Rashidiya': { lat: 25.2394, lng: 55.3908, zoom: 13 },
  'International City': { lat: 25.1667, lng: 55.4090, zoom: 13 },
  'Jumeirah Lake Towers': { lat: 25.0693, lng: 55.1420, zoom: 14 },
  'The Greens': { lat: 25.0921, lng: 55.1670, zoom: 14 },
  'Al Quoz Industrial': { lat: 25.1280, lng: 55.2350, zoom: 13 },
  'Sheikh Zayed Road': { lat: 25.1930, lng: 55.2680, zoom: 12 },
  'Motor City': { lat: 25.0450, lng: 55.2350, zoom: 13 },
  'Sports City': { lat: 25.0410, lng: 55.2200, zoom: 13 },
  'Discovery Gardens': { lat: 25.0450, lng: 55.1400, zoom: 14 },
  'Jumeirah Beach Residence': { lat: 25.0757, lng: 55.1330, zoom: 14 },
};

// Icons are the only thing Book keeps locally — names, packages, and prices
// all come from the shared data module so they can't drift out of sync with
// what the Services page advertises (see src/data/services.js for why that
// mattered: it used to cause AED 0 bookings).
const SERVICE_ICONS = {
  'home-cleaning': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  'furniture-cleaning': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"/>
      <path d="M2 11a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8z"/>
      <line x1="6" y1="19" x2="6" y2="21"/>
      <line x1="18" y1="19" x2="18" y2="21"/>
    </svg>
  ),
  'car-wash': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 17h14M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h8l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2M5 17v2h2v-2m10 0v2h2v-2"/>
      <circle cx="7.5" cy="12.5" r="1.5"/>
      <circle cx="16.5" cy="12.5" r="1.5"/>
    </svg>
  ),
};

// Only fixed-price packages are selectable here — packages marked `custom`
// in the shared data (Villa/Custom, Full Furniture Set) route customers to
// a quote request on the Contact page instead.
const SERVICES = SERVICE_DATA.map(s => ({
  id: s.id,
  name: s.name,
  desc: s.shortDesc,
  icon: SERVICE_ICONS[s.id],
  packages: bookablePackages(s.id).map(p => ({ id: p.id, name: p.name, price: p.price })),
}));

const TIME_SLOTS = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

/**
 * Searchable replacement for a native <select> — same brand styling as the
 * rest of the form, plus a filter box since there are ~28 areas to scan.
 */
function AreaSelect({ id, value, onChange, error, options }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  const filtered = query
    ? options.filter(a => a.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const openDropdown = () => {
    setOpen(true);
    setQuery('');
    setActiveIndex(Math.max(0, options.indexOf(value)));
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const select = (area) => {
    onChange(area);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[activeIndex]) select(filtered[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className={`area-select${error ? ' has-error' : ''}`} ref={wrapRef}>
      <button
        type="button"
        id={id}
        className={`area-select__trigger${open ? ' open' : ''}`}
        onClick={() => (open ? setOpen(false) : openDropdown())}
      >
        <svg className="area-select__pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        <span className={value ? '' : 'placeholder'}>{value || 'Select your area...'}</span>
        <svg className="area-select__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div className="area-select__panel">
          <div className="area-select__search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search areas..."
              value={query}
              onChange={e => { setQuery(e.target.value); setActiveIndex(0); }}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="area-select__list" role="listbox">
            {filtered.length === 0 ? (
              <div className="area-select__empty">No areas match &ldquo;{query}&rdquo;</div>
            ) : filtered.map((area, i) => (
              <button
                type="button"
                key={area}
                role="option"
                aria-selected={area === value}
                className={`area-select__option${area === value ? ' selected' : ''}${i === activeIndex ? ' active' : ''}`}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => select(area)}
              >
                {area}
                {area === value && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toISODateLocal(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDisplayDate(isoDate) {
  if (!isoDate) return '';
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

// Generates exactly enough weeks (5 or 6 rows) to cover the month, using
// JS Date's own day-of-month rollover instead of manual prev/next bookkeeping.
function buildMonthGrid(year, month) {
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;
  return Array.from({ length: totalCells }, (_, i) => new Date(year, month, i - startWeekday + 1));
}

/**
 * Custom calendar replacing the native <input type="date"> — same min-date
 * rule as before (earliest bookable day is tomorrow), just styled to match
 * the rest of the form instead of the browser's own date widget.
 */
function DatePicker({ id, value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const minDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 1);
    return d;
  }, []);

  const selectedDate = value ? new Date(`${value}T00:00:00`) : null;
  const [viewDate, setViewDate] = useState(selectedDate || minDate);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const cells = buildMonthGrid(year, month);
  const canGoPrev = year > minDate.getFullYear() || (year === minDate.getFullYear() && month > minDate.getMonth());

  const selectDay = (d) => {
    if (d < minDate) return;
    onChange(toISODateLocal(d));
    setOpen(false);
  };

  const jumpToEarliest = () => {
    onChange(toISODateLocal(minDate));
    setViewDate(minDate);
    setOpen(false);
  };

  const displayLabel = selectedDate
    ? selectedDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    : 'Select a date...';

  return (
    <div className={`date-picker${error ? ' has-error' : ''}`} ref={wrapRef}>
      <button
        type="button"
        id={id}
        className={`date-picker__trigger${open ? ' open' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <svg className="date-picker__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span className={selectedDate ? '' : 'placeholder'}>{displayLabel}</span>
      </button>

      {open && (
        <div className="date-picker__panel">
          <div className="date-picker__header">
            <button
              type="button"
              className="date-picker__nav"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              disabled={!canGoPrev}
              aria-label="Previous month"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="date-picker__month">{MONTH_NAMES[month]} {year}</span>
            <button
              type="button"
              className="date-picker__nav"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              aria-label="Next month"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          <div className="date-picker__weekdays">
            {WEEKDAYS.map(w => <span key={w}>{w}</span>)}
          </div>

          <div className="date-picker__grid">
            {cells.map((d, i) => {
              const inMonth = d.getMonth() === month;
              const disabled = d < minDate;
              const isSelected = selectedDate && sameDay(d, selectedDate);
              const isToday = sameDay(d, new Date());
              return (
                <button
                  type="button"
                  key={i}
                  className={`date-picker__day${!inMonth ? ' outside' : ''}${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}`}
                  onClick={() => selectDay(d)}
                  disabled={disabled}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          <div className="date-picker__footer">
            <button type="button" className="date-picker__link" onClick={() => { onChange(''); setOpen(false); }}>Clear</button>
            <button type="button" className="date-picker__link" onClick={jumpToEarliest}>Earliest available</button>
          </div>
        </div>
      )}
    </div>
  );
}

const DUBAI_CENTER = { lat: 25.2048, lng: 55.2708 };

// Shared across every mount of LocationPicker (e.g. navigating Back and
// forward through the wizard again) so the script tag is only ever added once.
let googleMapsLoadPromise = null;
function loadGoogleMaps() {
  // Checked specifically for .places, not just .maps — an earlier page load
  // (e.g. during dev, via HMR) could have loaded the script without the
  // places library if this ever ships without it again.
  if (window.google?.maps?.places) return Promise.resolve();
  if (googleMapsLoadPromise) return googleMapsLoadPromise;

  googleMapsLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });
  return googleMapsLoadPromise;
}

// Google sometimes names an area slightly differently than our own list —
// maps Google's name → our canonical entry. Exact-match only, never a
// fuzzy guess, so it's safe to silently find nothing.
const AREA_NAME_ALIASES = { 'Marsa Dubai': 'Dubai Marina', 'JBR': 'Jumeirah Beach Residence' };
const SKIP_COMPONENT_TYPES = new Set(['route', 'street_number', 'postal_code', 'country', 'plus_code']);

function matchKnownArea(addressComponents) {
  if (!addressComponents) return null;
  for (const component of addressComponents) {
    if (component.types.some(t => SKIP_COMPONENT_TYPES.has(t))) continue;
    for (const name of [component.long_name, component.short_name]) {
      if (DUBAI_AREAS.includes(name)) return name;
      if (AREA_NAME_ALIASES[name]) return AREA_NAME_ALIASES[name];
    }
  }
  return null;
}

/**
 * Lets the customer pin their exact location instead of relying on a
 * free-text address that's error-prone to find later — click/drag on the
 * map, search for a place, use GPS, or pick an Area above and have the map
 * jump there. The Address Details field further down still captures
 * building/villa/floor info none of those give you.
 */
function LocationPicker({ id, lat, lng, onChange, areaCenter, onAreaMatch, error }) {
  const mapElRef = useRef(null);
  const searchElRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);
  // Latest callbacks without needing them in the init effect's deps below —
  // that effect must run only once per mount, not on every parent re-render.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onAreaMatchRef = useRef(onAreaMatch);
  onAreaMatchRef.current = onAreaMatch;

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState('');
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [addressLabel, setAddressLabel] = useState('');
  const [resolvingAddress, setResolvingAddress] = useState(false);

  // Turns coordinates into something readable instead of raw numbers — used
  // after every click/drag/GPS pin placement. Search-selected places skip
  // this entirely since Places already returns a formatted_address for free.
  const reverseGeocode = (coords) => {
    if (!geocoderRef.current) return;
    setResolvingAddress(true);
    geocoderRef.current.geocode({ location: coords }, (results, status) => {
      setResolvingAddress(false);
      setAddressLabel(status === 'OK' && results?.[0] ? results[0].formatted_address : '');
    });
  };

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then(() => { if (!cancelled) setMapReady(true); })
      .catch(() => { if (!cancelled) setMapError('Could not load Google Maps. Please refresh and try again.'); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapElRef.current || mapRef.current) return;

    const initialPos = (lat != null && lng != null) ? { lat, lng } : DUBAI_CENTER;
    const map = new window.google.maps.Map(mapElRef.current, {
      center: initialPos,
      zoom: (lat != null && lng != null) ? 15 : 11,
      disableDefaultUI: true,
      zoomControl: true,
      streetViewControl: false,
      fullscreenControl: false,
    });
    const marker = new window.google.maps.Marker({ position: initialPos, map, draggable: true });
    const geocoder = new window.google.maps.Geocoder();
    geocoderRef.current = geocoder;

    marker.addListener('dragend', () => {
      const pos = marker.getPosition();
      const coords = { lat: pos.lat(), lng: pos.lng() };
      onChangeRef.current(coords);
      reverseGeocode(coords);
    });
    map.addListener('click', (e) => {
      const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      marker.setPosition(e.latLng);
      onChangeRef.current(coords);
      reverseGeocode(coords);
    });

    // Search box — typing an address/place jumps the map + pin straight to
    // it, same as clicking, plus a best-effort match against our own area
    // list so the Area dropdown can follow along too.
    if (searchElRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(searchElRef.current, {
        componentRestrictions: { country: 'ae' },
        fields: ['geometry', 'formatted_address', 'address_components'],
      });
      autocomplete.bindTo('bounds', map);
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry?.location) return;
        const coords = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
        marker.setPosition(coords);
        map.panTo(coords);
        map.setZoom(16);
        onChangeRef.current(coords);
        // Places already gives us a formatted address — no need for a
        // separate reverse-geocode call here.
        setAddressLabel(place.formatted_address || '');

        const matchedArea = matchKnownArea(place.address_components);
        if (matchedArea) onAreaMatchRef.current?.(matchedArea);
      });
    }

    // If we're initializing with an already-picked location (e.g. Back then
    // forward through the wizard), resolve its address too.
    if (lat != null && lng != null) reverseGeocode(initialPos);

    mapRef.current = map;
    markerRef.current = marker;
    // Deliberately init-once: re-running on every lat/lng change would fight
    // with the user mid-drag instead of just reading the final result.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady]);

  // Area dropdown → map: pan/zoom to the picked neighbourhood. Doesn't move
  // the pin itself — the user still needs to confirm the exact spot — so
  // picking an area never silently satisfies the "pin your location" check.
  useEffect(() => {
    if (!mapRef.current || !areaCenter) return;
    mapRef.current.panTo({ lat: areaCenter.lat, lng: areaCenter.lng });
    mapRef.current.setZoom(areaCenter.zoom);
  }, [areaCenter]);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Your browser doesn't support location detection — please select on the map instead.");
      return;
    }
    setLocating(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        onChange(coords);
        if (mapRef.current && markerRef.current) {
          mapRef.current.setCenter(coords);
          mapRef.current.setZoom(16);
          markerRef.current.setPosition(coords);
        }
        reverseGeocode(coords);
        setLocating(false);
      },
      (err) => {
        setGeoError(
          err.code === 1
            ? 'Location access denied — please allow it in your browser, or select on the map instead.'
            : 'Could not detect your location — please select it on the map instead.'
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className={`location-picker${error ? ' has-error' : ''}`}>
      <div className="location-picker__toolbar">
        <button type="button" className="location-picker__gps-btn" onClick={useMyLocation} disabled={locating || !mapReady}>
          {locating ? <span className="spinner dark" /> : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
              <line x1="12" y1="1" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="23"/>
              <line x1="1" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="23" y2="12"/>
            </svg>
          )}
          {locating ? 'Locating...' : 'Use my current location'}
        </button>
      </div>

      {lat != null && lng != null && (
        <div className="location-picker__selected">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          {resolvingAddress ? (
            <span className="location-picker__resolving"><span className="spinner dark small" /> Looking up address...</span>
          ) : (
            <span>{addressLabel || `${lat.toFixed(5)}, ${lng.toFixed(5)}`}</span>
          )}
        </div>
      )}

      <div className="location-picker__map-wrap">
        <div id={id} ref={mapElRef} className="location-picker__map" />

        {mapReady && (
          <div className="location-picker__search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input ref={searchElRef} type="text" placeholder="Search for an address or place..." />
          </div>
        )}

        {!mapReady && !mapError && (
          <div className="location-picker__overlay"><span className="spinner dark" /> Loading map...</div>
        )}
        {mapError && <div className="location-picker__overlay location-picker__overlay--error">{mapError}</div>}
      </div>

      {geoError && <p className="form-error" role="alert">{geoError}</p>}
      <p className="location-picker__hint">Search, click, or drag the pin to set your exact location — picking an Area above also re-centers the map there.</p>
    </div>
  );
}

export default function Book() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [form, setForm] = useState({
    service: searchParams.get('service') || '',
    package: searchParams.get('package') || '',
    area: searchParams.get('area') || '',
    address: '',
    latitude: null,
    longitude: null,
    date: '',
    time: '',
    name: '',
    phone: '',
    email: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  const selectedService = SERVICES.find(s => s.id === form.service);
  const selectedPackage = selectedService?.packages.find(p => p.name === form.package || p.id === form.package);
  const totalPrice = selectedPackage ? selectedPackage.price : null;

  const setField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const setLocation = ({ lat, lng }) => {
    setForm(prev => ({ ...prev, latitude: lat, longitude: lng }));
    setErrors(prev => ({ ...prev, location: '' }));
  };

  const validateStep = () => {
    const errs = {};
    if (step === 1) {
      if (!form.service) errs.service = 'Please select a service';
      if (!form.package) errs.package = 'Please select a package';
    }
    if (step === 2) {
      if (!form.area) errs.area = 'Please select your area';
      if (form.latitude == null || form.longitude == null) errs.location = 'Please pin your exact location on the map';
      if (!form.address) errs.address = 'Please enter building/villa details';
      if (!form.date) errs.date = 'Please select a date';
      if (!form.time) errs.time = 'Please select a time slot';
    }
    if (step === 3) {
      if (!form.name) errs.name = 'Please enter your name';
      if (!form.phone || form.phone.length < 9) errs.phone = 'Please enter a valid phone number';
      if (form.email && !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Please enter a valid email';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setIsSubmitting(true);
    setSubmitError('');

    const bookingData = {
      name: form.name,
      phone: form.phone,
      email: form.email || '',
      service: form.service,
      serviceName: selectedService?.name || form.service,
      package: form.package,
      area: form.area,
      address: form.address,
      latitude: form.latitude,
      longitude: form.longitude,
      date: form.date,
      time: form.time,
      total: totalPrice || 0,
      notes: form.notes || '',
    };

    try {
      // The API saves to Firestore and sends the notification email
      // server-side in one call (see server/src/controllers/bookings.controller.js) —
      // it still shows success even if the email leg fails there, since the
      // booking itself is already saved by that point.
      const result = await createBooking(bookingData);
      if (result.success) {
        setSubmitted(true);
      } else {
        setSubmitError(result.error || 'Something went wrong. Please try again or call us directly.');
      }
    } catch (error) {
      console.error('Booking submission error:', error);
      setSubmitError('Something went wrong. Please try again or call us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="book-page">
        <div className="container book-success-container">
          <div className="book-success">
            <div className="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h1>Booking Confirmed! 🎉</h1>
            <p>Thank you, <strong>{form.name}</strong>! Your booking has been received successfully.</p>

            <div className="success-summary">
              <div className="summary-row">
                <span>Service</span>
                <strong>{selectedService?.name}</strong>
              </div>
              <div className="summary-row">
                <span>Package</span>
                <strong>{form.package}</strong>
              </div>
              <div className="summary-row">
                <span>Location</span>
                <strong>{form.area}</strong>
              </div>
              <div className="summary-row">
                <span>Date &amp; Time</span>
                <strong>{formatDisplayDate(form.date)} at {form.time}</strong>
              </div>
              {totalPrice && (
                <div className="summary-row total">
                  <span>Total Amount</span>
                  <strong>AED {totalPrice}</strong>
                </div>
              )}
            </div>

            <p className="success-note">
              Our team will contact you at <strong>{form.phone}</strong> to confirm your booking within 30 minutes.
              <br/><br/>
              <span style={{ color: 'var(--primary-dark)', fontWeight: '500' }}>📸 Capture a screenshot of your booking details for your convenience.</span>
            </p>
            <Link to="/" className="btn btn-primary" id="success-go-home">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="book-page">
      {/* Header */}
      <section className="book-header">
        <div className="container">
          <p className="section-eyebrow" style={{ color: '#81C784' }}>Easy Booking</p>
          <h1>Book Your Cleaning Service</h1>
          <p>Simple, fast, and confirmed in seconds</p>
        </div>
      </section>

      <div className="container book-container">
        {/* Steps indicator */}
        <div className="book-steps">
          {['Select Service', 'Schedule', 'Your Details'].map((label, i) => (
            <div key={i} className={`book-step-item ${step === i + 1 ? 'active' : step > i + 1 ? 'completed' : ''}`}>
              <div className="step-circle">
                {step > i + 1 ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (i + 1)}
              </div>
              <span>{label}</span>
              {i < 2 && <div className="step-line" />}
            </div>
          ))}
        </div>

        <div className="book-layout">
          <form className="book-form" onSubmit={handleSubmit} id="booking-form">
            {/* STEP 1: Service Selection */}
            {step === 1 && (
              <div className="book-step">
                <h2>Choose Your Service</h2>

                <div className="service-selector">
                  {SERVICES.map(s => (
                    <button
                      type="button"
                      key={s.id}
                      id={`select-service-${s.id}`}
                      className={`service-option${form.service === s.id ? ' selected' : ''}`}
                      onClick={() => { setField('service', s.id); setField('package', ''); }}
                    >
                      <div className="service-option__icon">{s.icon}</div>
                      <div>
                        <strong>{s.name}</strong>
                        <span>{s.desc}</span>
                      </div>
                      <div className="service-option__check">
                        {form.service === s.id && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {errors.service && <p className="form-error" role="alert">{errors.service}</p>}

                {form.service && (
                  <div className="package-selector">
                    <h3>Select Package</h3>
                    <div className="package-options">
                      {selectedService?.packages.map(pkg => (
                        <button
                          type="button"
                          key={pkg.id}
                          id={`select-pkg-${pkg.id}`}
                          className={`package-option${form.package === pkg.name ? ' selected' : ''}`}
                          onClick={() => setField('package', pkg.name)}
                        >
                          <span className="pkg-opt-name">{pkg.name}</span>
                          <span className="pkg-opt-price">AED {pkg.price}</span>
                        </button>
                      ))}
                    </div>
                    {errors.package && <p className="form-error" role="alert">{errors.package}</p>}
                    <p className="package-custom-note">
                      Need a villa, a bigger job, or something not listed?{' '}
                      <Link to="/contact?subject=quote">Get a custom quote</Link>
                    </p>
                  </div>
                )}

                <div className="book-actions">
                  <button type="button" className="btn btn-primary" onClick={handleNext} id="step1-next">
                    Continue <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Schedule */}
            {step === 2 && (
              <div className="book-step">
                <h2>Schedule & Location</h2>

                <div className="form-group">
                  <label htmlFor="area-select">Area in Dubai *</label>
                  <AreaSelect
                    id="area-select"
                    value={form.area}
                    onChange={v => setField('area', v)}
                    error={!!errors.area}
                    options={DUBAI_AREAS}
                  />
                  {errors.area && <p className="form-error" role="alert">{errors.area}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="location-map">Exact Location *</label>
                  <LocationPicker
                    id="location-map"
                    lat={form.latitude}
                    lng={form.longitude}
                    onChange={setLocation}
                    areaCenter={AREA_CENTERS[form.area]}
                    onAreaMatch={area => setField('area', area)}
                    error={!!errors.location}
                  />
                  {errors.location && <p className="form-error" role="alert">{errors.location}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="address-input">Address Details *</label>
                  <input
                    id="address-input"
                    type="text"
                    placeholder="Building name, villa number, floor..."
                    value={form.address}
                    onChange={e => setField('address', e.target.value)}
                    className={errors.address ? 'error' : ''}
                  />
                  {errors.address && <p className="form-error" role="alert">{errors.address}</p>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="date-input">Preferred Date *</label>
                    <DatePicker
                      id="date-input"
                      value={form.date}
                      onChange={v => setField('date', v)}
                      error={!!errors.date}
                    />
                    {errors.date && <p className="form-error" role="alert">{errors.date}</p>}
                  </div>

                  <div className="form-group">
                    <label>Preferred Time *</label>
                    <div className="time-slots">
                      {TIME_SLOTS.map(slot => (
                        <button
                          type="button"
                          key={slot}
                          id={`time-${slot.replace(/[: ]/g, '-')}`}
                          className={`time-slot${form.time === slot ? ' selected' : ''}`}
                          onClick={() => setField('time', slot)}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                    {errors.time && <p className="form-error" role="alert">{errors.time}</p>}
                  </div>
                </div>

                <div className="book-actions">
                  <button type="button" className="btn btn-outline" onClick={handleBack} id="step2-back">Back</button>
                  <button type="button" className="btn btn-primary" onClick={handleNext} id="step2-next">
                    Continue <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Personal Details */}
            {step === 3 && (
              <div className="book-step">
                <h2>Your Contact Details</h2>

                <div className="form-group">
                  <label htmlFor="name-input">Full Name *</label>
                  <input
                    id="name-input"
                    type="text"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={e => setField('name', e.target.value)}
                    className={errors.name ? 'error' : ''}
                  />
                  {errors.name && <p className="form-error" role="alert">{errors.name}</p>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone-input">Phone Number *</label>
                    <div className="phone-input-wrap">
                      <span className="phone-prefix">+971</span>
                      <input
                        id="phone-input"
                        type="tel"
                        placeholder="55 664 5537"
                        value={form.phone}
                        onChange={e => setField('phone', e.target.value)}
                        className={errors.phone ? 'error' : ''}
                      />
                    </div>
                    {errors.phone && <p className="form-error" role="alert">{errors.phone}</p>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email-input">Email Address (optional)</label>
                    <input
                      id="email-input"
                      type="email"
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={e => setField('email', e.target.value)}
                      className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <p className="form-error" role="alert">{errors.email}</p>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="notes-input">Special Notes (optional)</label>
                  <textarea
                    id="notes-input"
                    placeholder="Any specific requirements, access instructions, or special requests..."
                    rows={4}
                    value={form.notes}
                    onChange={e => setField('notes', e.target.value)}
                  />
                </div>

                {submitError && (
                  <div className="form-error" role="alert" style={{ textAlign: 'center', marginBottom: '12px', fontSize: '14px' }}>
                    {submitError}
                  </div>
                )}

                <div className="book-actions">
                  <button type="button" className="btn btn-outline" onClick={handleBack} id="step3-back" disabled={isSubmitting}>Back</button>
                  <button type="submit" className="btn btn-accent" id="submit-booking" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span className="spinner" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Confirm Booking
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Summary Sidebar */}
          <div className="book-sidebar">
            <div className="booking-summary">
              <h3>Booking Summary</h3>
              {form.service ? (
                <>
                  <div className="summary-item">
                    <span>Service</span>
                    <strong>{selectedService?.name}</strong>
                  </div>
                  {form.package && (
                    <div className="summary-item">
                      <span>Package</span>
                      <strong>{form.package}</strong>
                    </div>
                  )}
                  {form.area && (
                    <div className="summary-item">
                      <span>Area</span>
                      <strong>{form.area}</strong>
                    </div>
                  )}
                  {form.date && (
                    <div className="summary-item">
                      <span>Date</span>
                      <strong>{formatDisplayDate(form.date)}</strong>
                    </div>
                  )}
                  {form.time && (
                    <div className="summary-item">
                      <span>Time</span>
                      <strong>{form.time}</strong>
                    </div>
                  )}
                  {totalPrice && (
                    <div className="summary-total">
                      <span>Total</span>
                      <strong>AED {totalPrice}</strong>
                    </div>
                  )}
                </>
              ) : (
                <p className="summary-empty">Select a service to see your booking summary.</p>
              )}
            </div>

            <div className="book-guarantee">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <div>
                <strong>100% Satisfaction Guarantee</strong>
                <p>Not happy? We'll re-clean for free.</p>
              </div>
            </div>

            <div className="book-contact-help">
              <p>Need help?</p>
              <a href="mailto:reviews.shinex@gmail.com">reviews.shinex@gmail.com</a>
              <a href="https://wa.me/971556645537" target="_blank" rel="noopener noreferrer">
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
