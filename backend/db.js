const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

let dbInstance = null;
let initPromise = null;

/**
 * Safely adds columns to a table if they do not exist.
 */
async function ensureColumnExists(db, table, columnDef) {
  const columnName = columnDef.split(' ')[0].trim();
  try {
    const tableInfo = await db.all(`PRAGMA table_info(${table})`);
    const exists = tableInfo.some(col => col.name.toLowerCase() === columnName.toLowerCase());
    if (!exists) {
      await db.run(`ALTER TABLE ${table} ADD COLUMN ${columnDef}`);
    }
  } catch (err) {
    // Column might already exist or table is fresh
  }
}

/**
 * Initializes and returns the SQLite database connection.
 * Configured with Foreign Keys, WAL mode for concurrency, and schema migrations.
 */
async function getDb() {
  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const dbPath = path.join(__dirname, 'database.sqlite');
      const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      // Concurrency and integrity optimizations
      await db.run('PRAGMA foreign_keys = ON');
      await db.run('PRAGMA journal_mode = WAL');
      await db.run('PRAGMA synchronous = NORMAL');

      // Execute schema definition
      const schemaPath = path.join(__dirname, 'src', 'config', 'sqlite_init.sql');
      if (fs.existsSync(schemaPath)) {
        const initSql = fs.readFileSync(schemaPath, 'utf8');
        await db.exec(initSql);
      }

      // Safe column migrations for existing databases
      await ensureColumnExists(db, 'users', 'dept VARCHAR(150) DEFAULT "Computer Science & Engineering"');
      await ensureColumnExists(db, 'users', 'batch VARCHAR(50) DEFAULT "Batch 50"');
      await ensureColumnExists(db, 'users', 'bio TEXT DEFAULT NULL');
      await ensureColumnExists(db, 'users', 'trust_score DECIMAL(5, 2) DEFAULT 99.0');
      await ensureColumnExists(db, 'users', 'avatar_url TEXT DEFAULT NULL');
      await ensureColumnExists(db, 'users', 'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

      await ensureColumnExists(db, 'resources', 'pickup_spot VARCHAR(150) DEFAULT NULL');
      await ensureColumnExists(db, 'resources', 'image_url TEXT DEFAULT NULL');
      await ensureColumnExists(db, 'resources', 'condition VARCHAR(100) DEFAULT "Verified Student Item"');
      await ensureColumnExists(db, 'resources', 'views_count INTEGER DEFAULT 0');
      await ensureColumnExists(db, 'resources', 'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

      await ensureColumnExists(db, 'transactions', 'pickup_spot VARCHAR(150) DEFAULT NULL');
      await ensureColumnExists(db, 'transactions', 'total_price DECIMAL(10, 2) DEFAULT 0.00');
      await ensureColumnExists(db, 'transactions', 'rating_given INTEGER DEFAULT NULL');
      await ensureColumnExists(db, 'transactions', 'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

      // Ensure starred table exists
      await db.exec(`
        CREATE TABLE IF NOT EXISTS starred (
          id              INTEGER         PRIMARY KEY AUTOINCREMENT,
          user_id         INTEGER         NOT NULL,
          resource_id     INTEGER         NOT NULL,
          created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
          UNIQUE (user_id, resource_id),
          FOREIGN KEY (user_id)     REFERENCES users(id)     ON DELETE CASCADE,
          FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_starred_user ON starred(user_id);
      `);

      // Seed JU campus ecosystem data
      await seedCampusData(db);

      dbInstance = db;
      return dbInstance;
    } catch (err) {
      console.error('Fatal Database Initialization Error:', err);
      initPromise = null;
      throw err;
    }
  })();

  return initPromise;
}

/**
 * Seeds rich Jahangirnagar University campus listings, peer profiles, and demo history.
 */
async function seedCampusData(db) {
  try {
    const defaultPasswordHash = await bcrypt.hash('password123', 10);

    // 1. Seed Demo Students (Matches frontend demo students 98, 97, 99 and active peers)
    const seedStudents = [
      {
        id: 98,
        name: 'Nafis Iqbal',
        email: 'nafis.iqbal@juniv.edu',
        password: defaultPasswordHash,
        phone: '+880 1712-849201',
        location: 'Al-Beruni Hall',
        dept: 'Computer Science & Engineering',
        batch: 'Batch 49 (Session 2019-20)',
        registration_no: 'JU-CSE-49-NI',
        bio: 'CSE 4th year student. Big believer in open notes and circular resource economy across JU campus. Ping me anytime at Al-Beruni.',
        trust_score: 98.8,
        karma_points: 460,
        on_time_rate: '100%',
        role: 'user'
      },
      {
        id: 97,
        name: 'Fariha Yasmin',
        email: 'fariha.chem@juniv.edu',
        password: defaultPasswordHash,
        phone: '+880 1845-938210',
        location: 'Pritilata Hall',
        dept: 'Chemistry',
        batch: 'Batch 51 (Session 2021-22)',
        registration_no: 'JU-CHEM-51-FY',
        bio: 'Chemistry major. Glad to lend lab coats, model kits, and safety gear to juniors. Let us make science accessible to all!',
        trust_score: 100,
        karma_points: 390,
        on_time_rate: '100%',
        role: 'user'
      },
      {
        id: 99,
        name: 'Sadik Rahman',
        email: 'sadik.rahman@juniv.edu',
        password: defaultPasswordHash,
        phone: '+880 1623-110294',
        location: 'Mir Mosharraf Hossain Hall',
        dept: 'Computer Science & Engineering',
        batch: 'Batch 50 (Session 2020-21)',
        registration_no: 'JU-CSE-50-SR',
        bio: 'Tech enthusiast and open source advocate. Active around TSC and Central Cafeteria.',
        trust_score: 99.4,
        karma_points: 520,
        on_time_rate: '98%',
        role: 'user'
      },
      {
        id: 96,
        name: 'Tanvir Hossain',
        email: 'tanvir.phy@juniv.edu',
        password: defaultPasswordHash,
        phone: '+880 1733-456789',
        location: 'Shaheed Rafiq-Jabbar Hall',
        dept: 'Physics',
        batch: 'Batch 50',
        registration_no: 'JU-PHY-50-TH',
        bio: 'Physics researcher and lab demonstrator. Available around Rafiq-Jabbar Hall.',
        trust_score: 97.5,
        karma_points: 320,
        on_time_rate: '100%',
        role: 'user'
      },
      {
        id: 95,
        name: 'Sumaiya Akter',
        email: 'sumaiya.math@juniv.edu',
        password: defaultPasswordHash,
        phone: '+880 1922-345678',
        location: 'Central Library',
        dept: 'Mathematics',
        batch: 'Batch 52',
        registration_no: 'JU-MATH-52-SA',
        bio: 'Math enthusiast sharing curated handwritten notes for junior batches.',
        trust_score: 100,
        karma_points: 410,
        on_time_rate: '100%',
        role: 'user'
      },
      {
        id: 94,
        name: 'Kazi Mahir',
        email: 'mahir.econ@juniv.edu',
        password: defaultPasswordHash,
        phone: '+880 1811-234567',
        location: 'Mir Mosharraf Hossain Hall',
        dept: 'Economics',
        batch: 'Batch 48',
        registration_no: 'JU-ECON-48-KM',
        bio: 'Graduating senior passing on campus essentials and commuter gear.',
        trust_score: 96.2,
        karma_points: 290,
        on_time_rate: '95%',
        role: 'user'
      },
      {
        id: 93,
        name: 'Anika Tabassum',
        email: 'anika.pharm@juniv.edu',
        password: defaultPasswordHash,
        phone: '+880 1755-678901',
        location: 'Pritilata Hall',
        dept: 'Pharmacy',
        batch: 'Batch 50',
        registration_no: 'JU-PHARM-50-AT',
        bio: 'Pharmacy student supporting campus mutual aid and sustainable sharing.',
        trust_score: 99.1,
        karma_points: 370,
        on_time_rate: '100%',
        role: 'user'
      },
      {
        id: 92,
        name: 'Shakib Al Hasan',
        email: 'shakib.iit@juniv.edu',
        password: defaultPasswordHash,
        phone: '+880 1688-901234',
        location: 'Central Cafeteria',
        dept: 'Institute of Information Technology',
        batch: 'Batch 51',
        registration_no: 'JU-IIT-51-SH',
        bio: 'Hardware tinkerer and electronics peer lender.',
        trust_score: 98.4,
        karma_points: 330,
        on_time_rate: '100%',
        role: 'user'
      },
      {
        id: 91,
        name: 'Rashidul Islam',
        email: 'rashid.arch@juniv.edu',
        password: defaultPasswordHash,
        phone: '+880 1977-890123',
        location: 'Maulana Bhasani Hall',
        dept: 'Archaeology',
        batch: 'Batch 49',
        registration_no: 'JU-ARCH-49-RI',
        bio: 'Campus mutual aid organizer at Maulana Bhasani Hall.',
        trust_score: 100,
        karma_points: 400,
        on_time_rate: '100%',
        role: 'user'
      },
      {
        id: 90,
        name: 'Moumita Sen',
        email: 'moumita.eng@juniv.edu',
        password: defaultPasswordHash,
        phone: '+880 1833-210987',
        location: 'Jahanara Imam Hall',
        dept: 'English',
        batch: 'Batch 50',
        registration_no: 'JU-ENG-50-MS',
        bio: 'Dorm life enthusiast and literature student.',
        trust_score: 97.9,
        karma_points: 310,
        on_time_rate: '100%',
        role: 'user'
      },
      {
        id: 89,
        name: 'Tariq Anowar',
        email: 'tariq.zoo@juniv.edu',
        password: defaultPasswordHash,
        phone: '+880 1766-543210',
        location: 'Science Faculty',
        dept: 'Zoology',
        batch: 'Batch 51',
        registration_no: 'JU-ZOO-51-TA',
        bio: 'Zoology researcher lending sterilized lab gear to classmates.',
        trust_score: 99.0,
        karma_points: 360,
        on_time_rate: '100%',
        role: 'user'
      },
      {
        id: 1,
        name: 'Tanjim Hossain',
        email: 'tanjim@juniv.edu',
        password: defaultPasswordHash,
        phone: '+880 1711-234567',
        location: 'Al-Beruni Hall, Room 312',
        dept: 'Computer Science & Engineering',
        batch: 'Batch 50',
        registration_no: 'JU-CSE-50-TH',
        bio: 'Lead campus builder & software engineer. Active at Bottola and CSE lab.',
        trust_score: 99.5,
        karma_points: 480,
        on_time_rate: '100%',
        role: 'admin'
      }
    ];

    for (const student of seedStudents) {
      await db.run(
        `INSERT INTO users 
        (id, name, email, password, phone, location, dept, batch, registration_no, bio, trust_score, karma_points, on_time_rate, role, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          email = excluded.email,
          phone = excluded.phone,
          location = excluded.location,
          dept = excluded.dept,
          batch = excluded.batch,
          registration_no = excluded.registration_no,
          bio = excluded.bio,
          trust_score = excluded.trust_score,
          karma_points = excluded.karma_points,
          on_time_rate = excluded.on_time_rate`,
        [
          student.id, student.name, student.email, student.password, student.phone,
          student.location, student.dept, student.batch, student.registration_no,
          student.bio, student.trust_score, student.karma_points, student.on_time_rate, student.role
        ]
      );
    }

    // 2. Seed All 12 Authentic Campus Items (Matching frontend campusData.js IDs 101 to 112)
    const seedResources = [
      {
        id: 101,
        user_id: 99,
        type: 'offer',
        listing_type: 'sell',
        title: 'Casio fx-991EX ClassWiz Scientific Calculator',
        description: 'Authentic high-speed ClassWiz with natural textbook display. Perfect for CSE, Physics, and Math midterms. Battery newly replaced with Maxell cell.',
        category: 'tools',
        quantity: 1,
        price: 1100.00,
        location: 'TSC (Teacher-Student Centre)',
        pickup_spot: 'TSC Cafeteria or Bottola',
        image_url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80',
        urgency: 'high',
        condition: 'Like New (9/10)',
        views_count: 48,
        status: 'available'
      },
      {
        id: 102,
        user_id: 98,
        type: 'offer',
        listing_type: 'sell',
        title: 'Data Structures & Algorithm Analysis in C++ (Mark Allen Weiss)',
        description: 'Original hard copy textbook. Clean pages, no missing sheets. Minimal pencil notes on graph algorithms and dynamic programming chapters. Great for 2nd year students.',
        category: 'education materials',
        quantity: 1,
        price: 380.00,
        location: 'Al-Beruni Hall',
        pickup_spot: 'Al-Beruni Hall Gate',
        image_url: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=600&auto=format&fit=crop&q=80',
        urgency: 'low',
        condition: 'Gently Used (8/10)',
        views_count: 62,
        status: 'available'
      },
      {
        id: 103,
        user_id: 97,
        type: 'offer',
        listing_type: 'lend',
        title: 'Chemistry Department Official Lab Coat (Size L, Unisex)',
        description: 'Freshly washed cotton lab coat with two front pockets. Available to borrow for organic chemistry practicals or term finals for up to 10 days.',
        category: 'clothing',
        quantity: 1,
        price: 50.00,
        location: 'Science Faculty',
        pickup_spot: 'Science Faculty Ground Floor',
        image_url: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=600&auto=format&fit=crop&q=80',
        urgency: 'critical',
        condition: 'Crisp & Clean',
        views_count: 85,
        status: 'available'
      },
      {
        id: 104,
        user_id: 96,
        type: 'offer',
        listing_type: 'lend',
        title: 'Engineering Mini Drafter + 60cm Steel T-Scale',
        description: 'Heavy-duty steel clamp mini-drafter with dual protractor head. Essential for 1st year engineering drawing and CAD drafting. Smooth zero-drift arm.',
        category: 'tools',
        quantity: 1,
        price: 80.00,
        location: 'Shaheed Rafiq-Jabbar Hall',
        pickup_spot: 'Rafiq-Jabbar Hall Canteen',
        image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
        urgency: 'medium',
        condition: 'Well Maintained',
        views_count: 41,
        status: 'available'
      },
      {
        id: 105,
        user_id: 95,
        type: 'offer',
        listing_type: 'free',
        title: 'Discrete Mathematics Full Semester Hand-Written Lecture Notes',
        description: 'Complete binder containing 24 lectures: set theory, propositional logic, recurrence relations, and solved previous 5 years final question papers. Free to take for junior brothers/sisters.',
        category: 'education materials',
        quantity: 1,
        price: 0.00,
        location: 'Central Library',
        pickup_spot: 'Central Library Reference Section',
        image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
        urgency: 'low',
        condition: 'Complete Spiral Notebook',
        views_count: 114,
        status: 'available'
      },
      {
        id: 106,
        user_id: 94,
        type: 'offer',
        listing_type: 'sell',
        title: 'Phoenix Campus Commuter Bicycle (Single Speed)',
        description: 'Fast campus commuter bike with sturdy front basket and combination cable lock. Both brakes recently serviced with new rubber pads. Moving out of hall after graduation.',
        category: 'outdoor',
        quantity: 1,
        price: 2400.00,
        location: 'Mir Mosharraf Hossain Hall',
        pickup_spot: 'MMH Hall Main Arch',
        image_url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop&q=80',
        urgency: 'medium',
        condition: 'Road-Ready (Good)',
        views_count: 139,
        status: 'available'
      },
      {
        id: 107,
        user_id: 93,
        type: 'offer',
        listing_type: 'sell',
        title: 'Rechargeable LED Desk Study Lamp with 3 Color Modes',
        description: 'Touch dimmable warm/white study lamp with 2000mAh battery. Lasts 5 hours on full charge during hall load-shedding. Includes USB-C cable.',
        category: 'furniture',
        quantity: 1,
        price: 450.00,
        location: 'Pritilata Hall',
        pickup_spot: 'Pritilata Hall Guest Room',
        image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
        urgency: 'low',
        condition: 'Like New (with box)',
        views_count: 73,
        status: 'available'
      },
      {
        id: 108,
        user_id: 92,
        type: 'offer',
        listing_type: 'lend',
        title: 'UNI-T Digital Multimeter with Probes & Transistor Tester',
        description: 'High accuracy multimeter for circuit labs and robotics projects. Available for temporary 5-day loans. Please handle test leads with care.',
        category: 'tools',
        quantity: 1,
        price: 0.00,
        location: 'Central Cafeteria',
        pickup_spot: 'Cafeteria Tea Stalls',
        image_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80',
        urgency: 'medium',
        condition: 'Calibrated & Working',
        views_count: 55,
        status: 'available'
      },
      {
        id: 109,
        user_id: 97,
        type: 'offer',
        listing_type: 'lend',
        title: 'Organic Chemistry Model Kit (Molymod 50 Atom Set)',
        description: '3D molecular structure building set with flexible bonds. Ideal for visualizing stereochemistry, cyclohexane chair conformations, and chiral centers.',
        category: 'education materials',
        quantity: 1,
        price: 60.00,
        location: 'Science Faculty',
        pickup_spot: 'Chemistry Dept Notice Board',
        image_url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=80',
        urgency: 'low',
        condition: 'All 50 atoms intact',
        views_count: 36,
        status: 'available'
      },
      {
        id: 110,
        user_id: 91,
        type: 'offer',
        listing_type: 'free',
        title: 'Winter Warm Fleece Blanket & Quilt Cover',
        description: 'Clean washed thick winter fleece blanket. Giving away for free to any 1st year fresher in need who just moved into residence hall without winter bedding.',
        category: 'clothing',
        quantity: 1,
        price: 0.00,
        location: 'Maulana Bhasani Hall',
        pickup_spot: 'Bhasani Hall Gate',
        image_url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80',
        urgency: 'high',
        condition: 'Freshly Laundered',
        views_count: 98,
        status: 'available'
      },
      {
        id: 111,
        user_id: 90,
        type: 'offer',
        listing_type: 'sell',
        title: 'Wooden Folding Laptop Table with Cup Holder',
        description: 'Ergonomic bed study table with anti-slip grooves. Foldable aluminum legs. Perfect for hall room study sessions on the bed.',
        category: 'furniture',
        quantity: 1,
        price: 320.00,
        location: 'Jahanara Imam Hall',
        pickup_spot: 'Jahanara Imam Hall Counter',
        image_url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&auto=format&fit=crop&q=80',
        urgency: 'low',
        condition: 'Clean & Sturdy',
        views_count: 67,
        status: 'available'
      },
      {
        id: 112,
        user_id: 89,
        type: 'offer',
        listing_type: 'lend',
        title: 'Scientific Biology Dissection Box with Scissors & Forceps',
        description: 'Complete stainless steel surgical dissection set with magnifying glass and scalpels. Borrowable for Botany & Zoology practical exams.',
        category: 'tools',
        quantity: 1,
        price: 40.00,
        location: 'Science Faculty',
        pickup_spot: 'Biology Faculty Lawn',
        image_url: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=600&auto=format&fit=crop&q=80',
        urgency: 'high',
        condition: 'Sterilized Instruments',
        views_count: 52,
        status: 'available'
      }
    ];

    for (const r of seedResources) {
      await db.run(
        `INSERT INTO resources 
        (id, user_id, type, listing_type, title, description, category, quantity, price, location, pickup_spot, image_url, urgency, condition, views_count, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          description = excluded.description,
          category = excluded.category,
          price = excluded.price,
          location = excluded.location,
          pickup_spot = excluded.pickup_spot,
          image_url = excluded.image_url,
          urgency = excluded.urgency,
          condition = excluded.condition,
          views_count = excluded.views_count,
          status = excluded.status`,
        [
          r.id, r.user_id, r.type, r.listing_type, r.title, r.description,
          r.category, r.quantity, r.price, r.location, r.pickup_spot,
          r.image_url, r.urgency, r.condition, r.views_count, r.status
        ]
      );
    }

    // 3. Seed Demo Transactions (Matching History.jsx IDs 901, 902, 903)
    const seedTransactions = [
      {
        id: 901,
        resource_id: 101,
        requester_id: 98,
        provider_id: 99,
        transaction_type: 'borrow_request',
        quantity: 1,
        payment_method: 'cash_on_pickup',
        duration_days: 3,
        pickup_spot: 'TSC Cafeteria',
        total_price: 0.00,
        status: 'completed',
        rating_given: 5
      },
      {
        id: 902,
        resource_id: 102,
        requester_id: 99,
        provider_id: 98,
        transaction_type: 'order',
        quantity: 1,
        payment_method: 'Cash on Handover',
        duration_days: null,
        pickup_spot: 'Al-Beruni Hall Gate',
        total_price: 380.00,
        status: 'completed',
        rating_given: 5
      },
      {
        id: 903,
        resource_id: 103,
        requester_id: 98,
        provider_id: 97,
        transaction_type: 'borrow_request',
        quantity: 1,
        payment_method: 'cash_on_pickup',
        duration_days: 6,
        pickup_spot: 'Science Faculty Ground Floor',
        total_price: 30.00,
        status: 'pending',
        rating_given: null
      }
    ];

    for (const tx of seedTransactions) {
      await db.run(
        `INSERT INTO transactions 
        (id, resource_id, requester_id, provider_id, transaction_type, quantity, payment_method, duration_days, pickup_spot, total_price, status, rating_given)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          status = excluded.status,
          total_price = excluded.total_price`,
        [
          tx.id, tx.resource_id, tx.requester_id, tx.provider_id,
          tx.transaction_type, tx.quantity, tx.payment_method, tx.duration_days,
          tx.pickup_spot, tx.total_price, tx.status, tx.rating_given
        ]
      );
    }

    // 4. Seed Standard Categories
    const seedCategories = [
      ['education materials', 'Books & Textbooks', 'book'],
      ['tools', 'Tools & Calculators', 'tool'],
      ['clothing', 'Lab Wear & Clothing', 'shirt'],
      ['food', 'Pantry & Food', 'coffee'],
      ['furniture', 'Dorm & Living', 'home'],
      ['outdoor', 'Cycles & Sports', 'activity']
    ];

    for (const cat of seedCategories) {
      await db.run(
        'INSERT OR IGNORE INTO categories (name, label, icon) VALUES (?, ?, ?)',
        cat
      );
    }

    // 5. Seed Campus Locations
    const seedLocations = [
      ['Al-Beruni Hall', 'hall', 'Bottola Corridor'],
      ['Mir Mosharraf Hossain Hall', 'hall', 'MMH Main Arch'],
      ['Shaheed Salahuddin Hall', 'hall', 'East Gate'],
      ['Maulana Bhasani Hall', 'hall', 'Bhasani Gate'],
      ['Bangabandhu Sheikh Mujibur Rahman Hall', 'hall', 'North Side'],
      ['Syed Nazrul Islam Hall', 'hall', 'West Lawn'],
      ['Shaheed Rafiq-Jabbar Hall', 'hall', 'Near Canteen'],
      ['A. F. M. Kamaluddin Hall', 'hall', 'Near Lake'],
      ['Bishwabidyalay Hall', 'hall', 'Main Compound'],
      ['Jahanara Imam Hall', 'hall', 'Female Dorm Area'],
      ['Pritilata Hall', 'hall', 'Female Dorm Area'],
      ['Noorjahan Hall', 'hall', 'Female Dorm Area'],
      ['Sufia Kamal Hall', 'hall', 'Female Dorm Area'],
      ['Fatema Mernissi Hall', 'hall', 'Female Dorm Area'],
      ['Bangamata Sheikh Fazilatunnesa Mujib Hall', 'hall', 'Female Dorm Area'],
      ['Central Cafeteria', 'facility', 'TSC Complex'],
      ['TSC (Teacher-Student Centre)', 'facility', 'Main Square'],
      ['Central Library', 'facility', 'Library Steps'],
      ['Science Faculty', 'academic', 'Ground Floor Corridor'],
      ['Arts Faculty', 'academic', 'Open Gazebo'],
      ['Social Science Faculty', 'academic', 'Faculty Entrance'],
      ['Main Gate Area', 'landmark', 'Dairy Gate'],
      ['Medical Centre', 'facility', 'Opposite Shaheed Minar']
    ];

    for (const loc of seedLocations) {
      await db.run(
        'INSERT OR IGNORE INTO locations (name, type, landmark) VALUES (?, ?, ?)',
        loc
      );
    }

    console.log('✓ CholoShareKori campus ecosystem database initialized and verified.');
  } catch (err) {
    console.error('Seeding notice:', err.message);
  }
}

/**
 * Universal pool adapter supporting both MySQL-compatible query conventions
 * and SQLite execution with error normalization and connection safety.
 */
const pool = {
  /**
   * Executes a SQL query with parameter binding.
   * Returns [rows, metadata] matching standard node mysql2/promise interface.
   */
  query: async (sql, params = []) => {
    const db = await getDb();
    const trimmed = sql.trim();
    const upper = trimmed.toUpperCase();
    const isSelect = upper.startsWith('SELECT') || upper.startsWith('WITH') || upper.startsWith('PRAGMA');

    try {
      if (isSelect) {
        const rows = await db.all(trimmed, params);
        return [rows, []];
      } else {
        const result = await db.run(trimmed, params);
        return [{ insertId: result.lastID, affectedRows: result.changes }, []];
      }
    } catch (err) {
      // Normalize unique constraint violations across SQLite and MySQL
      if (err.message && (err.message.includes('UNIQUE constraint') || err.message.includes('PRIMARY KEY'))) {
        err.code = 'ER_DUP_ENTRY';
      }
      throw err;
    }
  },

  /**
   * Alias for execute (compatible with mysql2 pool.execute)
   */
  execute: async (sql, params = []) => {
    return pool.query(sql, params);
  },

  /**
   * Executes a callback within a managed database transaction.
   */
  transaction: async (callback) => {
    const db = await getDb();
    await db.run('BEGIN TRANSACTION');
    try {
      const result = await callback(db);
      await db.run('COMMIT');
      return result;
    } catch (err) {
      try {
        await db.run('ROLLBACK');
      } catch (rbErr) {
        // Ignore rollback failure if already rolled back
      }
      throw err;
    }
  },

  /**
   * Health check utility for backend health monitor.
   */
  healthCheck: async () => {
    const start = Date.now();
    try {
      const db = await getDb();
      await db.get('SELECT 1');
      const tables = await db.all("SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
      const tableCount = tables && tables[0] ? Number(tables[0].count) : 7;
      return {
        healthy: true,
        engine: 'sqlite3 (WAL)',
        table_count: tableCount,
        latencyMs: Date.now() - start
      };
    } catch (err) {
      return {
        healthy: false,
        engine: 'sqlite3',
        error: err.message
      };
    }
  }
};

module.exports = pool;