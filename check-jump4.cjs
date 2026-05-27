const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 390, height: 844 });

  async function check(level, sectionId) {
    await page.goto('http://localhost:5174');
    await page.evaluate((lv) => {
      localStorage.setItem('easy-english-progress', JSON.stringify({
        streak: 0, lastStudiedDate: '', alphabetProgress: [], wordProgress: [],
        lessonProgress: [], lessonStars: {}, lessonCompletionCount: {},
        onboardingDone: true, difficultyLevel: lv
      }));
    }, level);
    await page.goto(`http://localhost:5174/jump/${sectionId}`);
    await page.waitForTimeout(1500);
    await page.click('text=계속하기');
    await page.waitForTimeout(1500);
    const body = await page.textContent('body');
    // 헤더 문제 유형과 카운터만 추출
    const counterMatch = body.match(/([📖✏️🧩🔤][^\d]+)(\d+)\/(\d+)/);
    const qType = counterMatch ? counterMatch[1].trim() : '?';
    const total = counterMatch ? counterMatch[3] : '?';
    console.log(`${level}/${sectionId}: Q1유형="${qType}" | 총 ${total}문제`);
    console.log('  첫 줄:', body.replace(/\s+/g, ' ').slice(0, 200));
  }

  await check('intermediate', 'int-hotel');
  await check('intermediate', 'int-social');
  await check('advanced', 'adv-biz');
  await check('advanced', 'adv-idiom');
  await browser.close();
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
