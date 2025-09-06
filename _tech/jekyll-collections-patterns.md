---
title: Jekyll 컬렉션 패턴 정리
description: 포스트 외 콘텐츠(프로젝트/문서)를 컬렉션으로 운영하는 방법.
tags: [jekyll, collections, architecture]
date: 2025-09-01
---

컬렉션은 URL·레이아웃·메타 스키마를 독립적으로 설계할 수 있다는 점이 핵심입니다.

- 스키마: 컬렉션별 필수 필드 정의(예: 프로젝트의 `tech`, `thumbnail`)
- 레이아웃: 공통 레이아웃 상속 + 컬렉션 전용 섹션 구성
- 인덱스: 목록 UI는 컬렉션 성격에 맞게(카드 vs 타임라인)
- SEO: JSON-LD 타입 분리(Article vs CreativeWork)

적절한 컬렉션 분리는 구조적 확장성을 만듭니다.

