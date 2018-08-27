const puppeteer = require('puppeteer');
const CREDS = require('./creds');

const getTokens = async _ => {
  console.log('Launching browser');
  const browser = await puppeteer.launch({ args: ['--no-sandbox']});
  
  try {
  
    const page = await browser.newPage();

    await page.goto('https://developer.twitter.com/en/apps/15669222');
    console.log('Page loaded');
    await logIn(page);
    console.log('Logged in');
    
    console.log('Going to keys tab');
    await goToKeysAndTokens(page);

    console.log('Creating token')
    await createAccessTokenIfNeeded(page);

    console.log('Getting tokens');
    const ACCESS_TOKEN_SELECTOR =
      '#feather-tab-group-6-tabpanel-1 > div > div > div.page-body > div:nth-child(3) > div > div > p:nth-child(1) > span.token-text';
    const TOKEN_SECRET_SELECTOR =
      '#feather-tab-group-6-tabpanel-1 > div > div > div.page-body > div:nth-child(3) > div > div > p:nth-child(2) > span.token-text';

    const accessToken = await page.$eval(ACCESS_TOKEN_SELECTOR, elem => elem.innerHTML);
    const tokenSecret = await page.$eval(TOKEN_SECRET_SELECTOR, elem => elem.innerHTML);
    
    console.log('Got them');
    console.log({ accessToken, tokenSecret });
    await browser.close();
    return { accessToken, tokenSecret };
  }
  catch(error) {
    console.error('There was an error');
    console.error(error.message);
    await browser.close();
    return null;
  }
};

const logIn = async page => {
  const USERNAME_SELECTOR =
    '#page-container > div > div.signin-wrapper > form > fieldset > div:nth-child(2) > input';
  const PASSWORD_SELECTOR =
    '#page-container > div > div.signin-wrapper > form > fieldset > div:nth-child(3) > input';
  const BUTTON_SELECTOR =
    '#page-container > div > div.signin-wrapper > form > div.clearfix > button';

  console.log('Waiting...');
  await page.waitFor(5000);

  console.log('Typing');
  await page.type(USERNAME_SELECTOR, CREDS.username);
  await page.type(PASSWORD_SELECTOR, CREDS.password);
  await page.click(BUTTON_SELECTOR);
  await page.waitForNavigation();
};

const goToKeysAndTokens = async page => {
  const KEYS_AND_TOKENS_SELECTOR = '#feather-tab-group-6-tab-1';
  await page.waitFor(KEYS_AND_TOKENS_SELECTOR);
  await page.click(KEYS_AND_TOKENS_SELECTOR);
};

const createAccessTokenIfNeeded = async page => {
  const CREATE_BUTTON =
    '#feather-tab-group-6-tabpanel-1 > div > div > div.page-body > div:nth-child(3) > button';
  const buttonEl = await page.$(CREATE_BUTTON);
  
  if (!buttonEl) {
    console.log('Could not find button to create');
    return;
  }
  await page.click(CREATE_BUTTON);
  await page.waitFor(2000);
};

module.exports = getTokens