const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 390, height: 844 });

  async function runJumpTest(level, sectionId, label) {
    await page.goto('http://localhost:5174');
    await page.evaluate((lv) => {
      localStorage.setItem('easy-english-progress', JSON.stringify({
        streak: 0, lastStudiedDate: '', alphabetProgress: [], wordProgress: [],
        lessonProgress: [], lessonStars: {}, lessonCompletionCount: {},
        onboardingDone: true, difficultyLevel: lv
      }));
    }, level);
    await page.goto(`http://localhost:5174/jump/${sectionId}`);
    await page.waitForTimeout(1200);
    await page.click('text=계속하기');
    await page.waitForTimeout(1200);

    // 문제 유형과 번호를 수집
    const types = [];
    for (let i = 0; i < 15; i++) {
      const body = await page.textContent('body');
      const m = body.match(/(\d+)\/(\d+)/);
      if (!m) break;
      const total = parseInt(m[2]);
      // 유형 파악
      let type = '?';
      if (body.includes('문장 번역')) type = '📖 문장번역';
      else if (body.includes('빈칸을 채우세요')) type = '✏️ 빈칸';
      else if (body.includes('문장 작성하기')) type = '🧩 작성';
      else if (body.includes('의미선택')) type = '🔤 단어';
      types.push(type);
      if (i + 1 >= total) break;
      // 다음 문제로 진행 (아무 버튼이나 클릭)
      try {
        const btn = await page.$('button.bg-primary');
        if (btn) await btn.click();
        await page.waitForTimeout(300);
      } catch(e) { break; }
    }
    console.log(`\n=== ${label} (${sectionId}) ===`);
    console.log(`총 ${types.length}문제: ${types.join(' → ')}`);
  }

  await runJumpTest('intermediate', 'int-hotel',  '중급 int-hotel');
  await runJumpTest('intermediate', 'int-social', '중급 int-social');
  await runJumpTest('advanced',     'adv-biz',    '고급 adv-biz');
  await runJumpTest('advanced',     'adv-idiom',  '고급 adv-idiom');

  await browser.close();
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
