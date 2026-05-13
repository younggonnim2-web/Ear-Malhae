# Vendored Skills & Commands

이 디렉토리의 스킬은 외부 리포에서 복사해 온 것(vendored)이며, 버전이 고정되어 있다.
업데이트가 필요하면 원본 리포에서 최신 버전을 확인 후 수동으로 교체한다.

## 출처 및 고정 버전 (2026-04-15 기준, 마지막 업데이트 2026-05-13)

### G-Stack
- 원본: https://github.com/garrytan/gstack
- 고정 커밋: `2300067` (office-hours, plan-design-review)
- 포함된 스킬:
  - `.claude/skills/gstack/office-hours/` — 아이디어 검증 (YC Office Hours 방식)
  - `.claude/skills/gstack/plan-design-review/` — UX/디자인 플랜 리뷰
  - `.claude/skills/gstack/plan-eng-review/` — 아키텍처·엔지니어링 플랜 리뷰 ← **2026-05-13 추가, 커밋 `7489506`**
  - `.claude/skills/gstack/bin/` — 보조 스크립트
  - `.claude/skills/gstack/lib/` — 공용 유틸

### Superpowers
- 원본: https://github.com/obra/superpowers
- 고정 커밋: `f9b088f`
- 포함된 스킬:
  - `.claude/skills/brainstorming/` — 옵션 탐색
  - `.claude/skills/writing-plans/` — 구현 플랜 작성
  - `.claude/skills/subagent-driven-development/` — 서브에이전트 기반 구현
  - `.claude/skills/using-superpowers/` — 공통 메타 스킬
  - `.claude/skills/verification-before-completion/` — 완료 전 검증

## 업데이트 방법

```bash
# 1. 최신 소스 클론
git clone https://github.com/garrytan/gstack.git /tmp/gstack
git clone https://github.com/obra/superpowers.git /tmp/superpowers

# 2. 필요한 스킬만 덮어쓰기 (예시)
rsync -a --delete /tmp/gstack/office-hours/ .claude/skills/gstack/office-hours/
rsync -a --delete /tmp/superpowers/skills/writing-plans/ .claude/skills/writing-plans/

# 3. 이 파일의 고정 커밋 해시 갱신
git -C /tmp/gstack rev-parse --short HEAD
git -C /tmp/superpowers rev-parse --short HEAD
```

## 라이선스

- G-Stack: MIT (`.claude/skills/gstack/LICENSE` 참조)
- Superpowers: `.claude/skills/LICENSE-superpowers` 참조
