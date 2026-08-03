/**
 * Single source of truth for services, packages, pricing, and inclusions.
 *
 * The Services page (marketing) and the Book page (booking flow) used to keep
 * their own separate copies of this data. They'd drifted: Services advertised
 * packages — "Villa / Custom", "Dining Chair Set (4)", "Full Furniture Set" —
 * that didn't exist in Book's list. Clicking "Book" on one of those landed on
 * the booking form with a package name set but no matching price, so
 * validation passed and the booking saved with `total: 0`.
 *
 * Both pages now import from here. Packages that don't have a fixed price
 * are marked `custom: true` — the booking flow (which needs a fixed price to
 * total up) excludes them and routes those customers to a quote request via
 * the Contact page instead.
 */

export const HOME_CLEANING_PACKAGES = [
  { id: 'studio', name: 'Studio', price: 199, hours: '2 hrs', rooms: '1 Room + 1 Bath' },
  { id: '1bed', name: '1 Bedroom', price: 249, hours: '3 hrs', rooms: '1 Bed + 1 Bath' },
  { id: '2bed', name: '2 Bedrooms', price: 329, hours: '4 hrs', rooms: '2 Beds + 2 Baths' },
  { id: '3bed', name: '3 Bedrooms', price: 419, hours: '5 hrs', rooms: '3 Beds + 2 Baths', popular: true },
  { id: '4bed', name: '4 Bedrooms', price: 549, hours: '7 hrs', rooms: '4 Beds + 3 Baths' },
  { id: 'villa', name: 'Villa / Custom', hours: 'Custom', rooms: 'All sizes', custom: true },
];

export const FURNITURE_PACKAGES = [
  { id: '2seater', name: '2-Seater Sofa', price: 149 },
  { id: '3seater', name: '3-Seater Sofa', price: 189 },
  { id: 'lshape', name: 'L-Shape Sofa', price: 249 },
  { id: 'single_mattress', name: 'Single Mattress', price: 99 },
  { id: 'double_mattress', name: 'Double Mattress', price: 149 },
  { id: 'king_mattress', name: 'King Mattress', price: 189, popular: true },
  { id: 'dining_chairs', name: 'Dining Chair Set (4)', price: 179 },
  { id: 'full_set', name: 'Full Furniture Set', priceFrom: 399, custom: true },
];

export const CAR_WASH_PACKAGES = [
  { id: 'normal', name: 'Normal Cleaning', price: 29, desc: 'Quick exterior wash' },
  { id: 'full', name: 'Full Cleaning', price: 59, desc: 'Inside & outside', popular: true },
];

export const HOME_CLEANING_INCLUSIONS = [
  'Living Room & Common Areas', 'Kitchen & Appliances', 'Bathrooms & Toilets',
  'Bedrooms & Wardrobes', 'Windows (interior)', 'Balcony Sweep',
  'Dusting & Vacuuming', 'Mopping & Floor Cleaning',
];

export const FURNITURE_INCLUSIONS = [
  'Sofa & Couch Cleaning', 'Armchairs & Recliners', 'Mattress Deep Clean',
  'Dining Chairs', 'Office Chairs', 'Curtain Cleaning',
  'Stain & Odor Removal', 'Allergen Treatment',
];

export const CAR_WASH_INCLUSIONS = [
  'Exterior Hand Wash', 'Interior Vacuuming', 'Dashboard & Console Wipe',
  'Window Cleaning', 'Tire & Rim Cleaning', 'Air Freshener',
];

export const SERVICES = [
  {
    id: 'home-cleaning',
    name: 'Home Cleaning',
    shortDesc: 'Full apartment or villa cleaning service',
    fromPrice: 199,
    packages: HOME_CLEANING_PACKAGES,
    inclusions: HOME_CLEANING_INCLUSIONS,
  },
  {
    id: 'furniture-cleaning',
    name: 'Furniture Cleaning',
    shortDesc: 'Deep sofa, mattress & furniture cleaning',
    fromPrice: 149,
    packages: FURNITURE_PACKAGES,
    inclusions: FURNITURE_INCLUSIONS,
  },
  {
    id: 'car-wash',
    name: 'Car Wash',
    shortDesc: 'Normal or full car cleaning at your location',
    fromPrice: 29,
    packages: CAR_WASH_PACKAGES,
    inclusions: CAR_WASH_INCLUSIONS,
  },
];

export function findService(serviceId) {
  return SERVICES.find(s => s.id === serviceId);
}

/** Packages with a fixed price — the only ones the booking flow can total up. */
export function bookablePackages(serviceId) {
  return findService(serviceId)?.packages.filter(p => !p.custom) || [];
}
