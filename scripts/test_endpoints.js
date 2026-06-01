const http = require('http');

const request = (options, body) => new Promise((resolve, reject) => {
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
  });
  req.on('error', reject);
  if (body) req.write(body);
  req.end();
});

(async () => {
  try {
    console.log('GET /');
    const root = await request({ method: 'GET', host: 'localhost', port: 3000, path: '/' });
    console.log(root.body);

    console.log('\nPOST /api/v1/auth/signup');
    const signupBody = JSON.stringify({ fullName: 'Test User', email: 'test+1@example.com', password: 'Pass1234!', passwordConfirm: 'Pass1234!' });
    const signup = await request({ method: 'POST', host: 'localhost', port: 3000, path: '/api/v1/auth/signup', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(signupBody) } }, signupBody);
    console.log(signup.statusCode, signup.body);

    console.log('\nPOST /api/v1/auth/login');
    const loginBody = JSON.stringify({ email: 'test+1@example.com', password: 'Pass1234!' });
    const login = await request({ method: 'POST', host: 'localhost', port: 3000, path: '/api/v1/auth/login', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginBody) } }, loginBody);
    console.log(login.statusCode, login.body);

    console.log('\nGET /api/v1/audience/startups');
    const startups = await request({ method: 'GET', host: 'localhost', port: 3000, path: '/api/v1/audience/startups' });
    console.log(startups.statusCode, startups.body);

  } catch (err) {
    console.error('Error', err);
    process.exitCode = 1;
  }
})();
