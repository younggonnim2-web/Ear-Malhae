const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto('http://localhost:5174');
  await page.evaluate(() => {
    localStorage.setItem('easy-english-progress', JSON.stringify({
      streak: 0, lastStudiedDate: '', alphabetProgress: [], wordProgress: [],
      lessonProgress: [], lessonStars: {}, lessonCompletionCount: {},
      onboardingDone: true, difficultyLevel: 'intermediate'
    }));
  });

  // 중급 섹션 2(여행·숙박) 건너뛰기 테스트
  await page.goto('http://localhost:5174/jump/int-hotel');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'ss-jump-intro.png' });
  const introText = await page.textContent('body');
  console.log('jump intro:', introText.slice(0, 200));

  // 계속하기 클릭
  await page.click('text=계속하기');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'ss-jump-quiz.png' });
  const quizText = await page.textContent('body');
  console.log('jump quiz:', quizText.slice(0, 400));

  await browser.close();
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
