const browser = require('./puppeteer/browser.js');

const takeScreenshots = async (url, retries) => {

  try {
    const page = await browser.getPage();

    console.log(`Try number ${retries}`);
    console.log('Going to url');
    
    await page.goto(url, { 
      timeout: retries > 3 ? 45000 : 30000,
      waitUntill: retries > 1 ? 'domcontentloaded' : 'load'
    });
    
    console.log('Page loaded, waiting 5 seconds for other things to load');
    await page.waitFor(5000);

    console.log('Taking screenshots...');
    const screenshotsPromises = Promise.all([
      page.screenshot({ 
        path: __dirname + '/.data/screenshot1.png',
        clip: {
          x: 0,
          y: 0,
          width: 700,
          height: 2000
        }
      }),
      page.screenshot({ 
        path: __dirname + '/.data/screenshot2.png',
        clip: {
          x: 0,
          y: 2000,
          width: 700,
          height: 2000
        }
      }),
      page.screenshot({ 
        path: __dirname + '/.data/screenshot3.png',
        clip: {
          x: 0,
          y: 4000,
          width: 700,
          height: 2000
        }
      })
    ]);
    
    const timeout = new Promise((resolve, reject) =>
      setTimeout(_ => {
        reject(new Error('Too long taking screenshots, aborting..'));
      }, 40000)
    );
    
    await Promise.race([screenshotsPromises, timeout]);

    console.log('Screenshots taken');
    await browser.reset();
  }
  
  catch(error) {
    await browser.reset();
    throw error;
  }
}

module.exports = takeScreenshots;