// Centralized Campus Ecosystem Data & Local Sync Engine for CholoShareKori
// Provides rich authentic Jahangirnagar University (JU) campus listings, peer profiles, and live activity.

export const initialCampusListings = [
  {
    id: 101,
    title: 'Casio fx-991EX ClassWiz Scientific Calculator',
    description: 'Authentic high-speed ClassWiz with natural textbook display. Perfect for CSE, Physics, and Math midterms. Battery newly replaced with Maxell cell.',
    category: 'tools',
    listing_type: 'sell',
    price: 1100,
    quantity: 1,
    location: 'TSC (Teacher-Student Centre)',
    urgency: 'high',
    user_id: 99,
    user_name: 'Sadik Rahman',
    user_dept: 'Computer Science & Engineering',
    user_batch: 'Batch 50',
    trust_score: 99.4,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    condition: 'Like New (9/10)',
    pickup_spot: 'TSC Cafeteria or Bottola',
    views_count: 48,
    is_verified: true
  },
  {
    id: 102,
    title: 'Data Structures & Algorithm Analysis in C++ (Mark Allen Weiss)',
    description: 'Original hard copy textbook. Clean pages, no missing sheets. Minimal pencil notes on graph algorithms and dynamic programming chapters. Great for 2nd year students.',
    category: 'education materials',
    listing_type: 'sell',
    price: 380,
    quantity: 1,
    location: 'Al-Beruni Hall',
    urgency: 'low',
    user_id: 98,
    user_name: 'Nafis Iqbal',
    user_dept: 'Computer Science & Engineering',
    user_batch: 'Batch 49',
    trust_score: 98.8,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    condition: 'Gently Used (8/10)',
    pickup_spot: 'Al-Beruni Hall Gate',
    views_count: 62,
    is_verified: true
  },
  {
    id: 103,
    title: 'Chemistry Department Official Lab Coat (Size L, Unisex)',
    description: 'Freshly washed cotton lab coat with two front pockets. Available to borrow for organic chemistry practicals or term finals for up to 10 days.',
    category: 'clothing',
    listing_type: 'lend',
    price: 50,
    quantity: 1,
    location: 'Science Faculty',
    urgency: 'critical',
    user_id: 97,
    user_name: 'Fariha Yasmin',
    user_dept: 'Chemistry',
    user_batch: 'Batch 51',
    trust_score: 100,
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    condition: 'Crisp & Clean',
    pickup_spot: 'Science Faculty Ground Floor',
    views_count: 85,
    is_verified: true,
    max_days: 10,
    daily_rate: 10
  },
  {
    id: 104,
    title: 'Engineering Mini Drafter + 60cm Steel T-Scale',
    description: 'Heavy-duty steel clamp mini-drafter with dual protractor head. Essential for 1st year engineering drawing and CAD drafting. Smooth zero-drift arm.',
    category: 'tools',
    listing_type: 'lend',
    price: 80,
    quantity: 1,
    location: 'Shaheed Rafiq-Jabbar Hall',
    urgency: 'medium',
    user_id: 96,
    user_name: 'Tanvir Hossain',
    user_dept: 'Physics',
    user_batch: 'Batch 50',
    trust_score: 97.5,
    created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
    condition: 'Well Maintained',
    pickup_spot: 'Rafiq-Jabbar Hall Canteen',
    views_count: 41,
    is_verified: true,
    max_days: 14,
    daily_rate: 15
  },
  {
    id: 105,
    title: 'Discrete Mathematics Full Semester Hand-Written Lecture Notes',
    description: 'Complete binder containing 24 lectures: set theory, propositional logic, recurrence relations, and solved previous 5 years final question papers. Free to take for junior brothers/sisters.',
    category: 'education materials',
    listing_type: 'free',
    price: 0,
    quantity: 1,
    location: 'Central Library',
    urgency: 'low',
    user_id: 95,
    user_name: 'Sumaiya Akter',
    user_dept: 'Mathematics',
    user_batch: 'Batch 52',
    trust_score: 100,
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    condition: 'Complete Spiral Notebook',
    pickup_spot: 'Central Library Reference Section',
    views_count: 114,
    is_verified: true
  },
  {
    id: 106,
    title: 'Phoenix Campus Commuter Bicycle (Single Speed)',
    description: 'Fast campus commuter bike with sturdy front basket and combination cable lock. Both brakes recently serviced with new rubber pads. Moving out of hall after graduation.',
    category: 'outdoor',
    listing_type: 'sell',
    price: 2400,
    quantity: 1,
    location: 'Mir Mosharraf Hossain Hall',
    urgency: 'medium',
    user_id: 94,
    user_name: 'Kazi Mahir',
    user_dept: 'Economics',
    user_batch: 'Batch 48',
    trust_score: 96.2,
    created_at: new Date(Date.now() - 3600000 * 26).toISOString(),
    condition: 'Road-Ready (Good)',
    pickup_spot: 'MMH Hall Main Arch',
    views_count: 139,
    is_verified: true
  },
  {
    id: 107,
    title: 'Rechargeable LED Desk Study Lamp with 3 Color Modes',
    description: 'Touch dimmable warm/white study lamp with 2000mAh battery. Lasts 5 hours on full charge during hall load-shedding. Includes USB-C cable.',
    category: 'furniture',
    listing_type: 'sell',
    price: 450,
    quantity: 1,
    location: 'Pritilata Hall',
    urgency: 'low',
    user_id: 93,
    user_name: 'Anika Tabassum',
    user_dept: 'Pharmacy',
    user_batch: 'Batch 50',
    trust_score: 99.1,
    created_at: new Date(Date.now() - 3600000 * 32).toISOString(),
    condition: 'Like New (with box)',
    pickup_spot: 'Pritilata Hall Guest Room',
    views_count: 73,
    is_verified: true
  },
  {
    id: 108,
    title: 'UNI-T Digital Multimeter with Probes & Transistor Tester',
    description: 'High accuracy multimeter for circuit labs and robotics projects. Available for temporary 5-day loans. Please handle test leads with care.',
    category: 'tools',
    listing_type: 'lend',
    price: 0,
    quantity: 1,
    location: 'Central Cafeteria',
    urgency: 'medium',
    user_id: 92,
    user_name: 'Shakib Al Hasan',
    user_dept: 'Institute of Information Technology',
    user_batch: 'Batch 51',
    trust_score: 98.4,
    created_at: new Date(Date.now() - 3600000 * 40).toISOString(),
    condition: 'Calibrated & Working',
    pickup_spot: 'Cafeteria Tea Stalls',
    views_count: 55,
    is_verified: true,
    max_days: 7,
    daily_rate: 0
  },
  {
    id: 109,
    title: 'Organic Chemistry Model Kit (Molymod 50 Atom Set)',
    description: '3D molecular structure building set with flexible bonds. Ideal for visualizing stereochemistry, cyclohexane chair conformations, and chiral centers.',
    category: 'education materials',
    listing_type: 'lend',
    price: 60,
    quantity: 1,
    location: 'Science Faculty',
    urgency: 'low',
    user_id: 97,
    user_name: 'Fariha Yasmin',
    user_dept: 'Chemistry',
    user_batch: 'Batch 51',
    trust_score: 100,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    condition: 'All 50 atoms intact',
    pickup_spot: 'Chemistry Dept Notice Board',
    views_count: 36,
    is_verified: true,
    max_days: 14,
    daily_rate: 10
  },
  {
    id: 110,
    title: 'Winter Warm Fleece Blanket & Quilt Cover',
    description: 'Clean washed thick winter fleece blanket. Giving away for free to any 1st year fresher in need who just moved into residence hall without winter bedding.',
    category: 'clothing',
    listing_type: 'free',
    price: 0,
    quantity: 1,
    location: 'Maulana Bhasani Hall',
    urgency: 'high',
    user_id: 91,
    user_name: 'Rashidul Islam',
    user_dept: 'Archaeology',
    user_batch: 'Batch 49',
    trust_score: 100,
    created_at: new Date(Date.now() - 3600000 * 52).toISOString(),
    condition: 'Freshly Laundered',
    pickup_spot: 'Bhasani Hall Gate',
    views_count: 98,
    is_verified: true
  },
  {
    id: 111,
    title: 'Wooden Folding Laptop Table with Cup Holder',
    description: 'Ergonomic bed study table with anti-slip grooves. Foldable aluminum legs. Perfect for hall room study sessions on the bed.',
    category: 'furniture',
    listing_type: 'sell',
    price: 320,
    quantity: 1,
    location: 'Jahanara Imam Hall',
    urgency: 'low',
    user_id: 90,
    user_name: 'Moumita Sen',
    user_dept: 'English',
    user_batch: 'Batch 50',
    trust_score: 97.9,
    created_at: new Date(Date.now() - 3600000 * 60).toISOString(),
    condition: 'Clean & Sturdy',
    pickup_spot: 'Jahanara Imam Hall Counter',
    views_count: 67,
    is_verified: true
  },
  {
    id: 112,
    title: 'Scientific Biology Dissection Box with Scissors & Forceps',
    description: 'Complete stainless steel surgical dissection set with magnifying glass and scalpels. Borrowable for Botany & Zoology practical exams.',
    category: 'tools',
    listing_type: 'lend',
    price: 40,
    quantity: 1,
    location: 'Science Faculty',
    urgency: 'high',
    user_id: 89,
    user_name: 'Tariq Anowar',
    user_dept: 'Zoology',
    user_batch: 'Batch 51',
    trust_score: 99.0,
    created_at: new Date(Date.now() - 3600000 * 68).toISOString(),
    condition: 'Sterilized Instruments',
    pickup_spot: 'Biology Faculty Lawn',
    views_count: 52,
    is_verified: true,
    max_days: 7,
    daily_rate: 10
  }
];

export const demoStudents = [
  {
    id: 98,
    name: 'Nafis Iqbal',
    email: 'nafis.iqbal@juniv.edu',
    dept: 'Computer Science & Engineering',
    batch: 'Batch 49 (Session 2019-20)',
    location: 'Al-Beruni Hall',
    phone: '+880 1712-849201',
    trust_score: 98.8,
    karma_points: 460,
    items_shared: 24,
    on_time_rate: '100%',
    verified_student: true,
    bio: 'CSE 4th year student. Big believer in open notes and circular resource economy across JU campus. Ping me anytime at Al-Beruni.'
  },
  {
    id: 97,
    name: 'Fariha Yasmin',
    email: 'fariha.chem@juniv.edu',
    dept: 'Chemistry',
    batch: 'Batch 51 (Session 2021-22)',
    location: 'Pritilata Hall',
    phone: '+880 1845-938210',
    trust_score: 100,
    karma_points: 390,
    items_shared: 19,
    on_time_rate: '100%',
    verified_student: true,
    bio: 'Chemistry major. Glad to lend lab coats, model kits, and safety gear to juniors. Let us make science accessible to all!'
  },
  {
    id: 99,
    name: 'Sadik Rahman',
    email: 'sadik.rahman@juniv.edu',
    dept: 'Computer Science & Engineering',
    batch: 'Batch 50 (Session 2020-21)',
    location: 'Mir Mosharraf Hossain Hall',
    phone: '+880 1623-110294',
    trust_score: 99.4,
    karma_points: 520,
    items_shared: 31,
    on_time_rate: '98%',
    verified_student: true,
    bio: 'Tech enthusiast and open source advocate. Active around TSC and Central Cafeteria.'
  }
];

export const campusPulseEvents = [
  { id: 1, text: 'Casio ClassWiz calculators are in high demand ahead of Midterms', tag: 'Trending' },
  { id: 2, text: 'Nafis Iqbal just lent Algorithms textbook at Al-Beruni Hall', tag: 'Live Share' },
  { id: 3, text: '680 kg CO₂ emissions prevented by peer lending at Jahangirnagar University', tag: 'Eco Impact' },
  { id: 4, text: 'Sumaiya Akter gave away 5 sets of Discrete Math notes at Central Library', tag: 'Giveaway' },
  { id: 5, text: 'Fariha Yasmin achieved 100% on-time return rate with 19 items shared', tag: 'Star Lender' },
  { id: 6, text: 'Bottola and TSC verified meetup counters are active today', tag: 'Safety' }
];

export const campusStats = {
  activeListings: 142,
  itemsLent: 538,
  studentsHelped: 890,
  co2SavedKg: 680,
  avgResponseMins: 12
};

// --- Storage Synchronization Helpers ---

const STORAGE_KEY_LISTINGS = 'cs_campus_listings_v2';
const STORAGE_KEY_STARRED = 'cs_starred_items_v2';
const STORAGE_KEY_TRANSACTIONS = 'cs_user_transactions_v2';

export const getStoredCampusListings = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LISTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse stored campus listings', e);
  }
  localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(initialCampusListings));
  return initialCampusListings;
};

export const saveStoredCampusListing = (newListing) => {
  const current = getStoredCampusListings();
  const updated = [newListing, ...current];
  localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(updated));
  return updated;
};

export const updateStoredCampusListing = (id, updates) => {
  const current = getStoredCampusListings();
  const updated = current.map(item => Number(item.id) === Number(id) ? { ...item, ...updates } : item);
  localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(updated));
  return updated;
};

export const getStoredStarredIds = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STARRED);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const toggleStoredStar = (id) => {
  const current = getStoredStarredIds();
  const numId = Number(id);
  const exists = current.includes(numId);
  const next = exists ? current.filter(x => x !== numId) : [...current, numId];
  localStorage.setItem(STORAGE_KEY_STARRED, JSON.stringify(next));
  return { isStarred: !exists, count: next.length };
};

export const isItemStarred = (id) => {
  const current = getStoredStarredIds();
  return current.includes(Number(id));
};

export const getStoredTransactions = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const recordLocalTransaction = (tx) => {
  const current = getStoredTransactions();
  const newTx = {
    id: Date.now(),
    created_at: new Date().toISOString(),
    status: 'pending',
    ...tx
  };
  const updated = [newTx, ...current];
  localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(updated));
  return newTx;
};
