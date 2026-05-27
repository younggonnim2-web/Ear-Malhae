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
      onboardingDone: true, difficultyLevel: 'advanced'
    }));
  });

  // 고급 섹션 — 감정·공감 건너뛰기 테스트
  await page.goto('http://localhost:5174/jump/adv-biz');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'ss-adv-biz-intro.png' });
  const introText = await page.textContent('body');
  console.log('adv-biz intro:', introText.slice(0, 250));

  await page.click('text=계속하기');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'ss-adv-biz-quiz.png' });
  const quizText = await page.textContent('body');
  console.log('adv-biz quiz:', quizText.slice(0, 400));

  // 고급 섹션 — 일상 대화 건너뛰기 테스트
  await page.goto('http://localhost:5174/jump/adv-idiom');
  await page.waitForTimeout(2000);
  const idiomIntro = await page.textContent('body');
  console.log('adv-idiom intro:', idiomIntro.slice(0, 250));

  await page.click('text=계속하기');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'ss-adv-idiom-quiz.png' });
  const idiomQuiz = await page.textContent('body');
  console.log('adv-idiom quiz:', idiomQuiz.slice(0, 400));

  // 고급 섹션 홈 화면 확인
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'ss-adv-home.png' });
  const homeText = await page.textContent('body');
  console.log('adv home:', homeText.slice(0, 500));

  await browser.close();
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
