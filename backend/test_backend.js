/**
 * Comprehensive Backend Health & Integration Test Suite
 * Tests all 5 core sharing pillars, auth, transactions, user profiles, and error handling.
 */
const http = require('http');

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5005,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING BACKEND INTEGRATION TEST SUITE ---\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName, extraInfo = '') {
    if (condition) {
      console.log(`✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${testName} ${extraInfo}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.body.status === 'healthy', 'Health check endpoint returns 200 & healthy');

    // 2. Fetch Resources
    const resList = await request('GET', '/api/resources');
    assert(resList.status === 200 && resList.body.data.length >= 12, 'GET /api/resources returns all 12 authentic campus items', `Count: ${resList.body?.data?.length}`);

    // Verify first resource attributes
    const firstItem = resList.body.data[0];
    assert(firstItem && firstItem.title && typeof firstItem.price === 'number', 'Resource has formatted numeric price & title');

    // 3. Filter Resources by listing_type=lend
    const lendItems = await request('GET', '/api/resources?listing_type=lend');
    assert(lendItems.status === 200 && lendItems.body.data.every(i => i.listing_type === 'lend'), 'Filter by listing_type=lend');

    // 4. Search Resources
    const searchRes = await request('GET', '/api/resources?search=Casio');
    assert(searchRes.status === 200 && searchRes.body.data.some(i => i.title.includes('Casio')), 'Search by keyword "Casio"');

    // 5. Get Resource Details with similar items
    const singleRes = await request('GET', '/api/resources/101');
    assert(singleRes.status === 200 && singleRes.body.data.title.includes('Casio'), 'GET /api/resources/101 returns Casio Calculator');
    assert(Array.isArray(singleRes.body.data.similar_items), 'Resource details includes similar_items array');

    // 6. User Profile (Nafis Iqbal - ID 98)
    const userProfile = await request('GET', '/api/users/98');
    assert(userProfile.status === 200 && userProfile.body.data.name === 'Nafis Iqbal', 'GET /api/users/98 returns Nafis Iqbal');
    assert(userProfile.body.data.trust_score >= 98, 'User profile has trust_score metric');

    // 7. Demo Quick-Login Authentication Token ('demo-jwt-token-98')
    const meDemo = await request('GET', '/api/auth/me', null, {
      Authorization: 'Bearer demo-jwt-token-98'
    });
    assert(meDemo.status === 200 && meDemo.body.data.id === 98, 'GET /api/auth/me works seamlessly with demo token "demo-jwt-token-98"');

    // 8. User Login with standard credentials
    const loginRes = await request('POST', '/api/auth/login', {
      email: 'tanjim@juniv.edu',
      password: 'password123'
    });
    assert(loginRes.status === 200 && loginRes.body.data.token, 'POST /api/auth/login succeeds with valid credentials');
    const jwtToken = loginRes.body?.data?.token;

    // 9. Standard JWT verification on /me
    const meJwt = await request('GET', '/api/auth/me', null, {
      Authorization: `Bearer ${jwtToken}`
    });
    assert(meJwt.status === 200 && meJwt.body.data.name === 'Tanjim Hossain', 'GET /api/auth/me succeeds with standard Bearer JWT');

    // 10. Create Resource with authenticated user
    const createRes = await request('POST', '/api/resources', {
      title: 'Graph Theory & Combinatorics Notes',
      category: 'education materials',
      listing_type: 'free',
      price: 0,
      quantity: 1,
      location: 'Al-Beruni Hall',
      description: 'Handwritten spiral notes covering Eulerian graphs and colorings.',
      urgency: 'low'
    }, { Authorization: `Bearer ${jwtToken}` });
    assert(createRes.status === 201 && createRes.body.data.id, 'POST /api/resources creates new resource');
    const createdId = createRes.body?.data?.id;

    // 11. Edit Resource
    const editRes = await request('PUT', `/api/resources/${createdId}`, {
      title: 'Graph Theory Notes (Updated with Exam Qs)',
      price: 0
    }, { Authorization: `Bearer ${jwtToken}` });
    assert(editRes.status === 200, 'PUT /api/resources/:id updates existing resource');

    // 12. Create Transaction Request on the newly created resource
    const txRes = await request('POST', '/api/transactions', {
      resource_id: createdId,
      provider_id: 1, // Tanjim Hossain is provider
      transaction_type: 'borrow_request',
      quantity: 1,
      duration_days: 7,
      pickup_spot: 'Al-Beruni Hall Gate',
      total_price: 0
    }, { Authorization: 'Bearer demo-jwt-token-98' });
    assert(txRes.status === 201 && txRes.body.transaction_id, 'POST /api/transactions creates borrow request with demo token');
    const newTxId = txRes.body?.transaction_id;

    // 13. Fetch Incoming Requests for Provider (User 1)
    const incomingRes = await request('GET', '/api/transactions/incoming', null, {
      Authorization: `Bearer ${jwtToken}`
    });
    assert(incomingRes.status === 200 && incomingRes.body.data.some(t => t.id === newTxId), 'GET /api/transactions/incoming retrieves pending request for provider');

    // 14. Approve Transaction by Provider
    const approveRes = await request('PUT', `/api/transactions/${newTxId}`, {
      status: 'approved'
    }, { Authorization: `Bearer ${jwtToken}` });
    assert(approveRes.status === 200, 'PUT /api/transactions/:id marks request as approved');

    // 15. Fetch Transaction History Ledger
    const historyRes = await request('GET', '/api/transactions/history', null, {
      Authorization: 'Bearer demo-jwt-token-98'
    });
    assert(historyRes.status === 200 && historyRes.body.data.length > 0, 'GET /api/transactions/history returns activity ledger');

    // 16. Complete and clean up test transaction and resource
    await request('PUT', `/api/transactions/${newTxId}`, { status: 'completed' }, { Authorization: `Bearer ${jwtToken}` });
    const deleteRes = await request('DELETE', `/api/resources/${createdId}`, null, {
      Authorization: `Bearer ${jwtToken}`
    });
    assert(deleteRes.status === 200, 'DELETE /api/resources/:id removes resource cleanly');

    // 17. Campus Stats & Locations
    const statsRes = await request('GET', '/api/stats');
    assert(statsRes.status === 200 && statsRes.body.data.activeListings >= 12, 'GET /api/stats returns live impact metrics');

    const locationsRes = await request('GET', '/api/locations');
    assert(locationsRes.status === 200 && locationsRes.body.data.length >= 20, 'GET /api/locations returns JU residential halls and spots');

    console.log(`\n=========================================================`);
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`=========================================================\n`);
    process.exit(failed > 0 ? 1 : 0);

  } catch (err) {
    console.error('Fatal Test Exception:', err);
    process.exit(1);
  }
}

runTests();
