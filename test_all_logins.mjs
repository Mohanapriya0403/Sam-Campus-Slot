import puppeteer from 'puppeteer-core';

async function testAllLogins() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  const accounts = [
    { role: 'admin', email: 'admin@sam.edu', pass: 'admin123', expectedUrl: '/admin/dashboard' },
    { role: 'admin', email: 'coordinator@sam.edu', pass: 'coordinator123', expectedUrl: '/admin/dashboard' },
    { role: 'faculty', email: 'faculty@sam.edu', pass: 'faculty123', expectedUrl: '/faculty/dashboard' },
    { role: 'faculty', email: 'lakshmi.narayanan@sam.edu', pass: 'faculty123', expectedUrl: '/faculty/dashboard' },
    { role: 'student', email: 'student@sam.edu', pass: 'student123', expectedUrl: '/student/dashboard' },
  ];

  for (const acc of accounts) {
    console.log(`\nTesting login for: ${acc.email} (${acc.role})...`);
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });

    // Clear and fill inputs
    const inputs = await page.$$('input');
    const emailInput = inputs[0];
    const passInput = inputs[1];

    await emailInput.click({ clickCount: 3 });
    await page.keyboard.press('Backspace');
    await emailInput.type(acc.email);

    await passInput.click({ clickCount: 3 });
    await page.keyboard.press('Backspace');
    await passInput.type(acc.pass);

    const submitBtn = await page.$('button[type="submit"]');
    await submitBtn.click();

    await new Promise(r => setTimeout(r, 2000));
    const url = page.url();
    console.log(`Result URL: ${url}`);

    if (url.includes(acc.expectedUrl)) {
      console.log(`✓ PASS: ${acc.email} correctly routed to ${acc.expectedUrl}`);
    } else {
      console.error(`✗ FAIL: ${acc.email} arrived at ${url} instead of ${acc.expectedUrl}`);
    }
  }

  await browser.close();
}

testAllLogins().catch(err => {
  console.error(err);
  process.exit(1);
});
