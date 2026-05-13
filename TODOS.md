# TODOS

## Design Review — Easy English App (2026-05-13)

### ~~TODO-1: MatchingQuiz 오답 피드백 flash 테스트 확인~~ ✅ RESOLVED (2026-05-13 plan-eng-review)
- `tailwind.config.ts` flash 키프레임 추가, shake 제거
- `MatchingQuiz.tsx` animate-shake → animate-flash 수정
- `MatchingQuiz.test.tsx` flash 애니메이션 테스트 추가

### TODO-2: Noto Sans KR 로드 성능 모니터링 (Phase 2 시점)
- **What:** Google Fonts에서 Noto Sans KR weight 400, 700 로드 (~30KB) 성능 영향 확인
- **Why:** 노년층 사용자는 느린 네트워크(3G/LTE)에서 접속할 수 있음. 폰트 로드 전 flash of unstyled text(FOUT) 가능성
- **Pros:** 실제 성능 데이터 기반으로 font-display: swap 최적화 결정 가능
- **Cons:** MVP 단계에선 측정 도구 추가 필요
- **Context:** design-review에서 Noto Sans KR 채택 결정. MVP 범위에서는 수용, Phase 2 전 검토
- **Depends on:** 실제 배포 후 Lighthouse 측정
