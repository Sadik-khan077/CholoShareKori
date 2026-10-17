const http = require('http');
const fs = require('fs');
const path = require('path');

// 1. Create a tiny 1x1 transparent PNG buffer
const tinyPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
);

// 2. Prepare multipart/form-data boundary
const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
const CRLF = '\r\n';

const head = [
  `--${boundary}`,
  'Content-Disposition: form-data; name="photo"; filename="test_book.png"',
  'Content-Type: image/png',
  '',
  ''
].join(CRLF);

const tail = `${CRLF}--${boundary}--${CRLF}`;

const payload = Buffer.concat([
  Buffer.from(head, 'utf8'),
  tinyPng,
  Buffer.from(tail, 'utf8')
]);

const req = http.request(
  {
    hostname: 'localhost',
    port: 5005,
    path: '/api/upload',
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': payload.length
    }
  },
  (res) => {
    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', () => {
      console.log('Upload Status:', res.statusCode);
      console.log('Upload Response:', data);
      try {
        const json = JSON.parse(data);
        if (json.success && json.data && json.data.relative_url) {
          console.log('✓ Photo Upload PASSED!');
          console.log('Static URL:', json.data.url);

          // Now test GET on the uploaded static file
          http.get(`http://localhost:5005${json.data.relative_url}`, (staticRes) => {
            console.log('Static GET Status:', staticRes.statusCode);
            console.log('Static Content-Type:', staticRes.headers['content-type']);
            if (staticRes.statusCode === 200) {
              console.log('✓ Static File Serving PASSED!');
              process.exit(0);
            } else {
              console.error('✗ Static file serving failed');
              process.exit(1);
            }
          });
        } else {
          console.error('✗ Photo upload did not return success');
          process.exit(1);
        }
      } catch (e) {
        console.error('Parse error:', e);
        process.exit(1);
      }
    });
  }
);

req.on('error', (err) => {
  console.error('Request error:', err);
  process.exit(1);
});

req.write(payload);
req.end();
