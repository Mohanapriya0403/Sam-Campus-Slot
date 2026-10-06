import puppeteer from 'puppeteer-core';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => consoleLogs.push(`[PAGE ERROR] ${err.toString()}`));

  console.log('1. Loading http://localhost:5173/login ...');
  page.on('request', req => {
    if (req.url().includes('/api/auth/login')) {
      console.log('LOGIN REQUEST URL:', req.url(), 'POST DATA:', req.postData());
    }
  });
  page.on('response', async res => {
    if (res.url().includes('/api/auth/login')) {
      console.log('LOGIN RESPONSE STATUS:', res.status());
      try {
        const body = await res.text();
        console.log('LOGIN RESPONSE BODY:', body);
      } catch (e) {}
    }
  });
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
  console.log('Loaded login page. Title:', await page.title());

  const inputs = await page.$$('input');
  console.log(`Found ${inputs.length} inputs`);
  for (let i = 0; i < inputs.length; i++) {
    const type = await inputs[i].evaluate(el => el.type);
    const placeholder = await inputs[i].evaluate(el => el.placeholder);
    console.log(`Input [${i}]: type=${type}, placeholder=${placeholder}`);
  }

  console.log('3. Submitting login form directly with prefilled credentials...');
  const submitBtn = await page.$('button[type="submit"]');
  await submitBtn.click();

  await new Promise(r => setTimeout(r, 2000));
  console.log('4. URL after submit:', page.url());

  // Check if student dashboard works
  if (page.url().includes('/student/dashboard')) {
    console.log('✓ Successfully arrived at Student Dashboard!');
  } else {
    console.log('✗ Did not arrive at Student Dashboard, URL:', page.url());
  }

  // Check student venue page
  console.log('5. Testing /student/venue ...');
  await page.goto('http://localhost:5173/student/venue', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  console.log('Venue URL:', page.url());

  // Check student timetable page
  console.log('6. Testing /student/timetable ...');
  await page.goto('http://localhost:5173/student/timetable', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  console.log('Timetable URL:', page.url());

  console.log('\n--- BROWSER CONSOLE MESSAGES ---');
  consoleLogs.forEach(c => console.log(c));

  await browser.close();
}

main().catch(err => {
  console.error('Browser test failed:', err);
  process.exit(1);
});
