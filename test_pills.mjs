import puppeteer from 'puppeteer-core';

async function testPills() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => console.log(`[PAGE ERROR] ${err.toString()}`));

  page.on('request', req => {
    if (req.url().includes('/api/auth/login')) {
      console.log('REQUEST POST DATA:', req.postData());
    }
  });
  page.on('response', async res => {
    if (res.url().includes('/api/auth/login') && res.status() !== 204 && res.request().method() === 'POST') {
      try {
        console.log('RESPONSE:', res.status(), await res.text());
      } catch (e) {}
    }
  });

  const accounts = [
    { name: 'Admin', expected: '/admin/dashboard' },
    { name: 'Coordinator', expected: '/admin/dashboard' },
    { name: 'Faculty (CSE)', expected: '/faculty/dashboard' },
    { name: 'Faculty (MECH)', expected: '/faculty/dashboard' },
    { name: 'Student (CSE)', expected: '/student/dashboard' },
  ];

  for (const acc of accounts) {
    console.log(`\nTesting Pill for: ${acc.name}`);
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });

    // Find button containing text
    const buttons = await page.$$('button[type="button"]');
    let pillFound = false;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes(acc.name)) {
        await btn.click();
        pillFound = true;
        break;
      }
    }

    if (!pillFound) {
      console.error(`Could not find pill button for ${acc.name}`);
      continue;
    }

    await new Promise(r => setTimeout(r, 500));
    const submitBtn = await page.$('button[type="submit"]');
    await submitBtn.click();

    await new Promise(r => setTimeout(r, 2000));
    const url = page.url();
    console.log(`URL after submit: ${url}`);
    if (url.includes(acc.expected)) {
      console.log(`✓ SUCCESS: ${acc.name} -> ${url}`);
    } else {
      console.error(`✗ FAILED: ${acc.name} -> ${url} (Expected: ${acc.expected})`);
    }
  }

  await browser.close();
}

testPills().catch(console.error);
