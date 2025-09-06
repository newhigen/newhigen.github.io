---
title: 정적 사이트 성능 미세 튜닝 노트
description: Lighthouse 95→99를 위한 작은 최적화 체크리스트.
tags: [performance, lighthouse, assets]
date: 2025-09-02
---

정적 사이트는 “큰 공사”보다 작은 체감 최적화가 더 효과적일 때가 많습니다. 다음을 점검합니다.

1) CSS 분리: 페이지 공통과 섹션별 스코프 분리, 미사용 규칙 정리
2) 폰트: 시스템 폰트 우선, 필요한 경우 `display: swap`
3) 이미지: 용량 100–200 KB 목표, width/height 명시
4) JS: `defer` 기본, 상호작용 없는 페이지는 로딩 제거
5) 메타: `theme-color`, `color-scheme` 지정으로 페인트 최적화

체크리스트는 반복 가능한 루틴이 되어야 합니다.

