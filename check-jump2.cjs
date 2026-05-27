const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 390, height: 844 });

  // 중급 — int-hotel 건너뛰기 테스트
  await page.goto('http://localhost:5174');
  await page.evaluate(() => {
    localStorage.setItem('easy-english-progress', JSON.stringify({
      streak: 0, lastStudiedDate: '', alphabetProgress: [], wordProgress: [],
      lessonProgress: [], lessonStars: {}, lessonCompletionCount: {},
      onboardingDone: true, difficultyLevel: 'intermediate'
    }));
  });
  await page.goto('http://localhost:5174/jump/int-hotel');
  await page.waitForTimeout(1500);
  await page.click('text=계속하기');
  await page.waitForTimeout(1500);
  const intQ = await page.textContent('body');
  console.log('=== 중급 int-hotel JumpTest ===');
  console.log(intQ.slice(0, 500));

  // 고급 — adv-biz 건너뛰기 테스트
  await page.goto('http://localhost:5174');
  await page.evaluate(() => {
    localStorage.setItem('easy-english-progress', JSON.stringify({
      streak: 0, lastStudiedDate: '', alphabetProgress: [], wordProgress: [],
      lessonProgress: [], lessonStars: {}, lessonCompletionCount: {},
      onboardingDone: true, difficultyLevel: 'advanced'
    }));
  });
  await page.goto('http://localhost:5174/jump/adv-biz');
  await page.waitForTimeout(1500);
  await page.click('text=계속하기');
  await page.waitForTimeout(1500);
  const advQ = await page.textContent('body');
  console.log('\n=== 고급 adv-biz JumpTest ===');
  console.log(advQ.slice(0, 500));

  await browser.close();
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
