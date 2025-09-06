---
title: 독서 히트맵 위젯
summary: 월별 독서량을 GitHub 컨트리뷰션 보드처럼 시각화하는 위젯.
tech: [D3.js, CSS Grid]
thumbnail: /assets/screenshots/2025-08-31.jpg
date: 2025-08-31
tags: [visualization, reading]
---

사이트의 `books_read` 데이터를 기반으로 간단한 히트맵을 그립니다. 마우스 오버 시 해당 월의 목록을 툴팁으로 보여주고, 모바일에선 탭으로 동작합니다.

- 셀 색상은 0~4권 구간으로 단계화
- 연도 전환 시 애니메이션 최소화(가시성 유지)
- 접근성을 고려한 텍스트 대비 확보

