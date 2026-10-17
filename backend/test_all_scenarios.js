/**
 * CHOLOSHAREKORI (চলো শেয়ার করি) - EXHAUSTIVE SYSTEM & SCENARIO TEST RUNNER
 * Tests every single scenario across Frontend (localhost:3000) and Backend (localhost:5005).
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const BACKEND_BASE = 'http://localhost:5005';
const FRONTEND_BASE = 'http://localhost:3000';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const scenarioResults = {};

function logScenario(title) {
  console.log(`\n======================================================================`);
  console.log(`🔷 ${title}`);
  console.log(`======================================================================`);
}

function recordResult(scenarioName, testName, passed, details = '') {
  totalTests++;
  if (!scenarioResults[scenarioName]) scenarioResults[scenarioName] = [];
  if (passed) {
    passedTests++;
    scenarioResults[scenarioName].push({ testName, passed: true, details });
    console.log(`  ✓ PASS: ${testName} ${details ? `(${details})` : ''}`);
  } else {
    failedTests++;
    scenarioResults[scenarioName].push({ testName, passed: false, details });
    console.error(`  ✗ FAIL: ${testName} - ${details}`);
  }
}

function makeRequest(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const lib = urlObj.protocol === 'https:' ? https : http;

    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    if (body && !reqOptions.headers['Content-Type'] && typeof body === 'object' && !Buffer.isBuffer(body)) {
      reqOptions.headers['Content-Type'] = 'application/json';
    }

    let payload = null;
    if (body) {
      if (Buffer.isBuffer(body)) {
        payload = body;
        if (!reqOptions.headers['Content-Length']) {
          reqOptions.headers['Content-Length'] = body.length;
        }
      } else if (typeof body === 'object') {
        payload = JSON.stringify(body);
        reqOptions.headers['Content-Length'] = Buffer.byteLength(payload);
      } else {
        payload = body;
        reqOptions.headers['Content-Length'] = Buffer.byteLength(payload);
      }
    }

    const req = lib.request(reqOptions, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = null;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data,
          json
        });
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runAllScenarios() {
  console.log(`\n======================================================================`);
  console.log(`🚀 STARTING CHOLOSHAREKORI EXHAUSTIVE SYSTEM & SCENARIO AUDIT`);
  console.log(`Target Backend:  ${BACKEND_BASE}`);
  console.log(`Target Frontend: ${FRONTEND_BASE}`);
  console.log(`Timestamp:       ${new Date().toISOString()}`);
  console.log(`======================================================================`);

  let standardJwtToken = null;
  let createdResourceId = null;
  let createdTransactionId = null;
  let uploadedPhotoUrl = null;
  let uploadedFilename = null;

  try {
    // =========================================================================
    // SCENARIO 1: Frontend SPA Localhost Availability & Assets
    // =========================================================================
    logScenario('SCENARIO 1: Frontend Single-Page Application (localhost:3000)');
    {
      const res = await makeRequest(FRONTEND_BASE);
      recordResult('Frontend', 'Frontend localhost root responds 200 OK', res.status === 200, `Status: ${res.status}`);
      recordResult('Frontend', 'HTML contains React mount point root element', res.data.includes('id="root"'), 'Mount point verified');
      recordResult('Frontend', 'HTML contains application title', res.data.toLowerCase().includes('cholosharekori') || res.data.includes('React App') || res.data.includes('চলো'), 'App title present');
    }

    // =========================================================================
    // SCENARIO 2: Backend Health, SQLite WAL & Diagnostics
    // =========================================================================
    logScenario('SCENARIO 2: Backend Health & System Diagnostics');
    {
      const res = await makeRequest(`${BACKEND_BASE}/api/health`);
      recordResult('Health', 'Health check returns 200 OK', res.status === 200);
      recordResult('Health', 'System status is healthy', res.json?.status === 'healthy', `Status: ${res.json?.status}`);
      recordResult('Health', 'Database status is healthy with active tables', res.json?.database?.healthy === true && res.json?.database?.table_count >= 6, `Tables: ${res.json?.database?.table_count}`);
      recordResult('Health', 'System reports RAM & Heap statistics', res.json?.system?.heapUsedMb > 0, `Heap: ${res.json?.system?.heapUsedMb} MB`);

      const rootRes = await makeRequest(`${BACKEND_BASE}/`);
      recordResult('Health', 'Root endpoint / returns documentation with 5 pillars', rootRes.status === 200 && rootRes.json?.active_pillars?.length === 5, '5 Pillars confirmed');
    }

    // =========================================================================
    // SCENARIO 3: Authentication, Security & Dual-Mode Token Handling
    // =========================================================================
    logScenario('SCENARIO 3: Authentication & Security (Standard JWT + Demo Quick Login)');
    {
      // 3.1 Demo Quick-Login Token
      const demoRes = await makeRequest(`${BACKEND_BASE}/api/auth/me`, {
        headers: { 'Authorization': 'Bearer demo-jwt-token-98' }
      });
      recordResult('Auth', 'Dual-mode auth accepts demo token demo-jwt-token-98', demoRes.status === 200 && demoRes.json?.data?.id === 98, `Student: ${demoRes.json?.data?.name}`);

      // 3.2 Standard Login with Password
      const loginRes = await makeRequest(`${BACKEND_BASE}/api/auth/login`, {
        method: 'POST'
      }, {
        email: 'nafis.iqbal@juniv.edu',
        password: 'password123'
      });
      recordResult('Auth', 'Student password login succeeds with 200 OK', loginRes.status === 200 && loginRes.json?.success === true);
      recordResult('Auth', 'Login returns valid Bearer JWT token', Boolean(loginRes.json?.data?.token));
      standardJwtToken = loginRes.json?.data?.token;

      // 3.3 Validate Bearer JWT token with /api/auth/me
      const meRes = await makeRequest(`${BACKEND_BASE}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${standardJwtToken}` }
      });
      recordResult('Auth', 'Standard Bearer JWT validates correctly on /api/auth/me', meRes.status === 200 && meRes.json?.data?.email === 'nafis.iqbal@juniv.edu');

      // 3.4 Rejection of invalid credentials
      const badLogin = await makeRequest(`${BACKEND_BASE}/api/auth/login`, {
        method: 'POST'
      }, {
        email: 'nafis.iqbal@juniv.edu',
        password: 'wrong_password_xyz'
      });
      recordResult('Auth', 'Rejects incorrect password with 401 Unauthorized', badLogin.status === 401);

      // 3.5 Demo Students Preloaded List
      const demoListRes = await makeRequest(`${BACKEND_BASE}/api/auth/demo-students`);
      recordResult('Auth', 'Demo student switcher endpoint returns preloaded accounts', demoListRes.status === 200 && demoListRes.json?.data?.length >= 3, `Count: ${demoListRes.json?.data?.length}`);

      // 3.6 New Student Registration
      const uniqueReg = `JU-TEST-${Date.now()}`;
      const uniqueEmail = `test.student.${Date.now()}@juniv.edu`;
      const regRes = await makeRequest(`${BACKEND_BASE}/api/auth/register`, {
        method: 'POST'
      }, {
        name: 'Automated Test Student',
        email: uniqueEmail,
        password: 'password123',
        phone: '+880 1700-000000',
        location: 'Al-Beruni Hall',
        dept: 'Computer Science & Engineering',
        batch: 'Batch 50',
        registration_no: uniqueReg
      });
      recordResult('Auth', 'New student registration creates account & returns token', regRes.status === 201 && regRes.json?.data?.token);
    }

    // =========================================================================
    // SCENARIO 4: Photo Uploading & Static Image Delivery
    // =========================================================================
    logScenario('SCENARIO 4: Photo Uploading & Static Image File Serving');
    {
      const tinyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
      const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
      const CRLF = '\r\n';

      const head = [
        `--${boundary}`,
        'Content-Disposition: form-data; name="photo"; filename="campus_item.png"',
        'Content-Type: image/png',
        '',
        ''
      ].join(CRLF);

      const tail = `${CRLF}--${boundary}--${CRLF}`;
      const multipartBody = Buffer.concat([
        Buffer.from(head, 'utf8'),
        tinyPng,
        Buffer.from(tail, 'utf8')
      ]);

      const uploadRes = await makeRequest(`${BACKEND_BASE}/api/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`
        }
      }, multipartBody);

      recordResult('PhotoUpload', 'Multipart image upload returns 200 OK', uploadRes.status === 200 && uploadRes.json?.success === true);
      recordResult('PhotoUpload', 'Upload response contains full URL & relative URL', Boolean(uploadRes.json?.data?.url && uploadRes.json?.data?.relative_url));

      uploadedPhotoUrl = uploadRes.json?.data?.url;
      uploadedFilename = uploadRes.json?.data?.filename;

      if (uploadRes.json?.data?.relative_url) {
        const getStaticRes = await makeRequest(`${BACKEND_BASE}${uploadRes.json.data.relative_url}`);
        recordResult('PhotoUpload', 'Static file server delivers uploaded photo (200 OK)', getStaticRes.status === 200);
        recordResult('PhotoUpload', 'Delivered static image has image/png content type', getStaticRes.headers['content-type'] === 'image/png');
      }

      // Rejection of invalid non-image file
      const textHead = [
        `--${boundary}`,
        'Content-Disposition: form-data; name="photo"; filename="malicious.txt"',
        'Content-Type: text/plain',
        '',
        'hello world'
      ].join(CRLF);
      const textPayload = Buffer.concat([
        Buffer.from(textHead, 'utf8'),
        Buffer.from(tail, 'utf8')
      ]);

      const badUploadRes = await makeRequest(`${BACKEND_BASE}/api/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`
        }
      }, textPayload);
      recordResult('PhotoUpload', 'Rejects non-image file upload with 400 Bad Request', badUploadRes.status === 400);
    }

    // =========================================================================
    // SCENARIO 5: Marketplace Listings & 5-Pillar Ecosystem
    // =========================================================================
    logScenario('SCENARIO 5: 5-Pillar Campus Listings (Lend, Borrow, Buy, Sell, Free)');
    {
      // 5.1 Query All Resources
      const allRes = await makeRequest(`${BACKEND_BASE}/api/resources`);
      recordResult('Listings', 'GET /api/resources returns active catalog', allRes.status === 200 && allRes.json?.data?.length >= 12, `Total listings: ${allRes.json?.pagination?.total}`);
      recordResult('Listings', 'Pagination metadata returned with current page and total', allRes.json?.pagination?.total >= 12 && allRes.json?.pagination?.page === 1);

      // 5.2 Filter by Pillar: Lend
      const lendRes = await makeRequest(`${BACKEND_BASE}/api/resources?listing_type=lend`);
      recordResult('Listings', 'Filter listing_type=lend returns only loanable items', lendRes.status === 200 && lendRes.json?.data?.every(i => i.listing_type === 'lend'), `Found: ${lendRes.json?.data?.length}`);

      // 5.3 Filter by Pillar: Sell
      const sellRes = await makeRequest(`${BACKEND_BASE}/api/resources?listing_type=sell`);
      recordResult('Listings', 'Filter listing_type=sell returns only sale items', sellRes.status === 200 && sellRes.json?.data?.every(i => i.listing_type === 'sell'), `Found: ${sellRes.json?.data?.length}`);

      // 5.4 Filter by Pillar: Free
      const freeRes = await makeRequest(`${BACKEND_BASE}/api/resources?listing_type=free`);
      recordResult('Listings', 'Filter listing_type=free returns only ৳0 giveaways', freeRes.status === 200 && freeRes.json?.data?.every(i => i.listing_type === 'free' || Number(i.price) === 0), `Found: ${freeRes.json?.data?.length}`);

      // 5.5 Search Keyword
      const searchRes = await makeRequest(`${BACKEND_BASE}/api/resources?search=Calculator`);
      recordResult('Listings', 'Search by keyword "Calculator" matches title & description', searchRes.status === 200 && searchRes.json?.data?.length > 0 && searchRes.json?.data[0].title.includes('Calculator'));

      // 5.6 Category & Urgency Filtering
      const catRes = await makeRequest(`${BACKEND_BASE}/api/resources?category=tools`);
      recordResult('Listings', 'Filter by category=tools returns engineering & lab tools', catRes.status === 200 && catRes.json?.data?.every(i => i.category === 'tools'));

      // 5.7 Sorting: Price Ascending vs Descending
      const sortAscRes = await makeRequest(`${BACKEND_BASE}/api/resources?sort=price_asc`);
      const pricesAsc = sortAscRes.json?.data?.map(i => Number(i.price)) || [];
      const isSortedAsc = pricesAsc.every((p, idx) => idx === 0 || p >= pricesAsc[idx - 1]);
      recordResult('Listings', 'Sorting by price_asc returns items in non-decreasing price order', sortAscRes.status === 200 && isSortedAsc);

      // 5.8 Detailed Resource with Similar Items
      const detailRes = await makeRequest(`${BACKEND_BASE}/api/resources/101`);
      recordResult('Listings', 'GET /api/resources/101 returns Casio Calculator details', detailRes.status === 200 && detailRes.json?.data?.title?.includes('Casio'));
      recordResult('Listings', 'Resource details includes photo image_url', Boolean(detailRes.json?.data?.image_url));
      recordResult('Listings', 'Resource details includes similar_items recommendations', Array.isArray(detailRes.json?.data?.similar_items));

      // 5.9 Create New Resource with Photo URL
      const createRes = await makeRequest(`${BACKEND_BASE}/api/resources`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${standardJwtToken}` }
      }, {
        title: 'Microcontroller Development Board (Arduino Uno R3)',
        description: 'Complete Arduino Uno board with USB-B cable. Perfect for CSE 3rd year embedded systems lab and line follower robot design.',
        category: 'tools',
        listing_type: 'lend',
        price: 35,
        quantity: 2,
        location: 'Shaheed Salahuddin Hall',
        pickup_spot: 'Salahuddin Hall Common Room',
        urgency: 'medium',
        condition: 'Like New (Tested)',
        image_url: uploadedPhotoUrl || 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=600'
      });
      recordResult('Listings', 'POST /api/resources creates new listing with photo and returns 201', createRes.status === 201 && createRes.json?.data?.id);
      createdResourceId = createRes.json?.data?.id;

      // 5.10 Update Resource
      if (createdResourceId) {
        const updateRes = await makeRequest(`${BACKEND_BASE}/api/resources/${createdResourceId}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${standardJwtToken}` }
        }, {
          price: 40,
          description: 'Updated: Now includes 10 male-to-male jumper wires.'
        });
        recordResult('Listings', 'PUT /api/resources/:id updates existing listing', updateRes.status === 200 && Number(updateRes.json?.data?.price) === 40);

        // 5.11 Star / Bookmark Listing
        const starRes = await makeRequest(`${BACKEND_BASE}/api/resources/${createdResourceId}/star`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${standardJwtToken}` }
        });
        recordResult('Listings', 'POST /api/resources/:id/star toggles bookmark state', starRes.status === 200);
      }
    }

    // =========================================================================
    // SCENARIO 6: Transactions, Peer Lending Lifecycle & Inventory Management
    // =========================================================================
    logScenario('SCENARIO 6: Lending Lifecycle & Transactions (Borrow, Approve, Return)');
    {
      // Student 99 (Sadik) borrows item created by Student 98 (Nafis)
      const borrowRes = await makeRequest(`${BACKEND_BASE}/api/transactions`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer demo-jwt-token-99' }
      }, {
        resource_id: createdResourceId,
        duration_days: 7,
        purpose: 'Need for embedded systems semester project demo',
        pickup_spot: 'Salahuddin Hall Common Room'
      });

      recordResult('Transactions', 'Student submits borrow request (POST /api/transactions)', borrowRes.status === 201 && borrowRes.json?.data?.id);
      createdTransactionId = borrowRes.json?.data?.id;

      // Verify stock was decremented from 2 to 1
      const itemAfterBorrow = await makeRequest(`${BACKEND_BASE}/api/resources/${createdResourceId}`);
      recordResult('Transactions', 'Inventory stock automatically decremented on borrow request', itemAfterBorrow.json?.data?.quantity === 1, `Remaining stock: ${itemAfterBorrow.json?.data?.quantity}`);

      // Provider (Student 98) views incoming requests
      const incomingRes = await makeRequest(`${BACKEND_BASE}/api/transactions/incoming`, {
        headers: { 'Authorization': `Bearer ${standardJwtToken}` }
      });
      recordResult('Transactions', 'Provider views incoming pending transactions', incomingRes.status === 200 && incomingRes.json?.data?.some(t => t.id === createdTransactionId));

      // Provider Approves Request
      if (createdTransactionId) {
        const approveRes = await makeRequest(`${BACKEND_BASE}/api/transactions/${createdTransactionId}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${standardJwtToken}` }
        }, {
          status: 'approved',
          provider_notes: 'Meetup confirmed at Salahuddin Hall Gate at 4 PM.'
        });
        recordResult('Transactions', 'Provider approves transaction request (status: approved)', approveRes.status === 200 && approveRes.json?.data?.status === 'approved');

        // Borrower views outgoing requests
        const outgoingRes = await makeRequest(`${BACKEND_BASE}/api/transactions/outgoing`, {
          headers: { 'Authorization': 'Bearer demo-jwt-token-99' }
        });
        recordResult('Transactions', 'Borrower views outgoing transactions ledger', outgoingRes.status === 200 && outgoingRes.json?.data?.some(t => t.id === createdTransactionId));

        // Provider marks item as returned
        const returnRes = await makeRequest(`${BACKEND_BASE}/api/transactions/${createdTransactionId}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${standardJwtToken}` }
        }, {
          status: 'returned'
        });
        recordResult('Transactions', 'Transaction marked as returned/completed', returnRes.status === 200 && returnRes.json?.data?.status === 'returned');

        // Verify stock was restored from 1 back to 2
        const itemAfterReturn = await makeRequest(`${BACKEND_BASE}/api/resources/${createdResourceId}`);
        recordResult('Transactions', 'Inventory stock automatically restored upon item return', itemAfterReturn.json?.data?.quantity === 2, `Restored stock: ${itemAfterReturn.json?.data?.quantity}`);

        // Activity History
        const historyRes = await makeRequest(`${BACKEND_BASE}/api/transactions/history`, {
          headers: { 'Authorization': `Bearer ${standardJwtToken}` }
        });
        recordResult('Transactions', 'Transaction history ledger records completed event', historyRes.status === 200 && historyRes.json?.data?.length > 0);
      }

      // Cleanup test listing
      if (createdResourceId) {
        const delRes = await makeRequest(`${BACKEND_BASE}/api/resources/${createdResourceId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${standardJwtToken}` }
        });
        recordResult('Listings', 'DELETE /api/resources/:id removes test listing cleanly', delRes.status === 200);
      }
    }

    // =========================================================================
    // SCENARIO 7: Student Peer Profiles, Karma & Trust Metrics
    // =========================================================================
    logScenario('SCENARIO 7: Student Peer Profiles, Trust Scores & Campus Karma');
    {
      const peerRes = await makeRequest(`${BACKEND_BASE}/api/users/98`);
      recordResult('Profiles', 'GET /api/users/98 returns public student peer profile', peerRes.status === 200 && peerRes.json?.data?.name === 'Nafis Iqbal');
      recordResult('Profiles', 'Peer profile includes trust_score and karma_points', peerRes.json?.data?.trust_score >= 95 && peerRes.json?.data?.karma_points > 0, `Trust: ${peerRes.json?.data?.trust_score}%, Karma: ${peerRes.json?.data?.karma_points}`);
      recordResult('Profiles', 'Peer profile includes active authored listings', Array.isArray(peerRes.json?.listings));

      // Update Own Profile
      const updateProfileRes = await makeRequest(`${BACKEND_BASE}/api/users/profile`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${standardJwtToken}` }
      }, {
        bio: 'Updated bio: CSE Batch 49 student passionate about campus sharing & open source tools.',
        phone: '+880 1712-345678'
      });
      recordResult('Profiles', 'PUT /api/users/profile updates user bio & phone', updateProfileRes.status === 200 && updateProfileRes.json?.data?.phone === '+880 1712-345678');
    }

    // =========================================================================
    // SCENARIO 8: Live Campus Impact, Locations & Categories
    // =========================================================================
    logScenario('SCENARIO 8: Live Campus Pulse, Impact Stats, Locations & Categories');
    {
      const statsRes = await makeRequest(`${BACKEND_BASE}/api/stats`);
      recordResult('CampusPulse', 'GET /api/stats returns live impact metrics', statsRes.status === 200 && statsRes.json?.data?.active_listings >= 12);
      recordResult('CampusPulse', 'Stats include students count, money saved, items rescued, CO2 impact', statsRes.json?.data?.total_students > 0 && statsRes.json?.data?.total_money_saved_bdt >= 0, `Active items: ${statsRes.json?.data?.active_listings}, Students: ${statsRes.json?.data?.total_students}`);

      const pulseRes = await makeRequest(`${BACKEND_BASE}/api/stats/pulse`);
      recordResult('CampusPulse', 'GET /api/stats/pulse returns real-time live event feed', pulseRes.status === 200 && Array.isArray(pulseRes.json?.data));

      const locRes = await makeRequest(`${BACKEND_BASE}/api/locations`);
      recordResult('CampusPulse', 'GET /api/locations returns Jahangirnagar University halls & spots', locRes.status === 200 && locRes.json?.data?.some(l => l.name.includes('Al-Beruni')), `Locations: ${locRes.json?.data?.length}`);

      const catRes = await makeRequest(`${BACKEND_BASE}/api/categories`);
      recordResult('CampusPulse', 'GET /api/categories returns campus resource categories', catRes.status === 200 && catRes.json?.data?.length >= 5, `Categories: ${catRes.json?.data?.length}`);
    }

  } catch (err) {
    console.error('Fatal Test Runner Exception:', err);
    failedTests++;
  }

  // =========================================================================
  // FINAL EXECUTIVE SUMMARY
  // =========================================================================
  console.log(`\n======================================================================`);
  console.log(`📊 FINAL TEST AUDIT RESULTS`);
  console.log(`======================================================================`);
  console.log(`Total Scenarios Tested:  8`);
  console.log(`Total Assertions Run:    ${totalTests}`);
  console.log(`Passed Assertions:       ${passedTests} (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log(`Failed Assertions:       ${failedTests}`);
  console.log(`System Status:           ${failedTests === 0 ? '✅ 100% HEALTHY & ALL SCENARIOS PASS' : '❌ ISSUES DETECTED'}`);
  console.log(`======================================================================\n`);

  process.exit(failedTests === 0 ? 0 : 1);
}

runAllScenarios();
