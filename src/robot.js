const puppeteer = require('puppeteer');
const { delay } = require('./utils');

const {LINK_PAGE, LOGIN, PASSWORD, PROJECT, TAG, TIME_MORNING_START, TIME_MORNING_END, TIME_AFTERNOON_START, TIME_AFTERNOON_END} = process.env;

async function login(page) {
  await page.waitForSelector('a[data-test-id="login-manual"]');
  await page.click('a[data-test-id="login-manual"]');

  await page.waitForSelector('input[name="email"]');
  await page.type('input[name="email"]', LOGIN);
  await page.type('input[name="password"]', PASSWORD);

  await page.waitForSelector('button[data-test-id="login-button"]');
  await page.click('button[data-test-id="login-button"]');

  console.log('Login successfully');
}

async function insertDescription(page, description) {
  await page.waitForSelector('input[name="autocomplete-input"]');
  await page.type('input[name="autocomplete-input"]', description);
}

async function insertProject(page) {
  await page.waitForSelector('project-picker-label', { timeout: 30000 });
  await page.evaluate(() => {
    const element = document.querySelector('project-picker-label > div > div > a')
    element.click();
  });
  await page.waitForSelector(`button[title="${PROJECT}"]`);
  await page.click(`button[title="${PROJECT}"]`);
}

async function insertTag(page) {
  await page.waitForSelector('div[class="tag-text"]', { timeout: 30000 });
  await page.evaluate(() => {
    const element = document.querySelector('div[class="tag-text"]')
    element.click();
  });

  await page.waitForSelector(`label[for="${TAG}"]`);
  await page.click(`label[for="${TAG}"]`);
  await page.click('body');
}

async function insertTaskID(page, id) {
  await page.waitForSelector('custom-field-value > div > input');
  await page.type('custom-field-value > div > input', id.toString());
}

// async function insertDate(page, date) {
//   await page.waitForSelector('input-single-date');
//   await page.click('input-single-date');

//   await page.waitForSelector('table[class="table-condensed"]');
//   const elements = await page.$$('table[class="table-condensed"] > tbody > tr > td.available');
//   for (const element of elements) {
//     const text = await page.evaluate(el => el.textContent, element);
//     if (text.trim() === date.toString()) {
//       await element.click();
//       break;
//     }
//   }
// }

async function insertTime(page, time) {
  await page.waitForSelector('input-time-ampm');
  await page.type('time-tracker-recorder input-time-ampm:first-child > input', time.morning , { delay: 100 });
  await page.type('time-tracker-recorder input-time-ampm:nth-of-type(2) > input', time.afternoon , { delay: 100 });
}

async function robot(description, id) {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto(LINK_PAGE);
  // Set screen size
  await page.setViewport({ width: 1440, height: 820 });

  // Login
  await login(page);
  await delay(5000);

  for (let i = 0; i < 2; i++) {
    await steep(page, description, id, i);
    await delay(1000);
  }

  await browser.close();
}

async function steep(page,description, id, i) {
  const morning = i == 0 ? ` ${TIME_MORNING_START.trim()} ` : ` ${TIME_AFTERNOON_START.trim()} `;
  const afternoon = i == 0 ?  ` ${TIME_MORNING_END.trim()} ` : ` ${TIME_AFTERNOON_END.trim()} `;
  
  await insertProject(page);
  await insertTag(page);
  await insertDescription(page, description);
  await insertTaskID(page, id);
  // await insertDate(page, date);
  await insertTime(page, { morning, afternoon });

  await page.waitForSelector('app-button:first-child > button[type="button"]', { timeout: 30000 });
  await page.click('app-button:first-child > button[type="button"]');

  console.log(`Project created for the day ${new Date().getDate()} with a successful ${i == 0 ? 'morning' : 'afternoon'} shift`);
}

module.exports = robot;