const puppeteer = require('puppeteer');
let browser = null;
let page = null;

const getBrowser = async _ => {
  if (!browser) {
    console.log('Opening browser');
    browser = await puppeteer.launch({
      args: ['--no-sandbox'],
      ignoreHTTPSErrors: true
    });
  }
};

const getPage = async _ => {
  await getBrowser();

  if (!page) {
    console.log('Getting page');
    page = await browser.newPage();
    await page.setViewport({
       width: 700,
       height: 600
     });
  }
  
  console.log('Returning page');
  return page;
};

const getNewPage = async _ => {
  await getBrowser();
  
  console.log('Getting new page');
  const newPage = await browser.newPage();
  return newPage;
};

const reset = async _ => {
  try {
    await browser.close();
  } catch (error) {
    console.log(error);
  }

  browser = null;
  page = null;
};

module.exports = {
  getPage,
  getNewPage,
  reset
};
