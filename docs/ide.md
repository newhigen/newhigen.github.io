---
layout: default-with-date
title: IDE
permalink: ide
published_date: 2025-11-29
nav_order: 5
---

## VScode 계열 IDE

### 확장

Git

* `Git Graph`
* `GitHub Actions`
* `GitHub Pull Requests`
* (optional) `GitLens` - `compare with` 기능은 좋은데 나머지 딸려오는 기능들이 너무 많고 유료인 것들도 있긴함

Python

* `autopep8`
* `isort`
* `Python`
* `Python Indent`
* `Pylance`
* `Jupyter`

Development Environment

* `Remote - SSH`
* `Remote Developement`

CSV
* `Rainbow CSV`
* `Edit CSV`

Markdown
* `Markdown All in One`
* `GitHUb Markdown Preview`

Etc.
* `Project Manager`
* `TODO Highlight`
* `Korean Language Pack for Visual Studio Code`

내가 사용하는 테마 (가끔씩 바뀝니다.)

* Color Theme: `Gruvbox` or `Bearded Theme`
* File Icon Theme: `Bearded Icons`
* Product Icon Theme: `Material Product Icons`

### 설정: `settings.json`

```JSON
// Minimap 설정
"editor.minimap.maxColumn": 80,
"editor.minimap.showSlider": "always",
"editor.minimap.side": "left",

// 최대 120 기준, 120에 세로선을 기준선처럼 보이기
"editor.rulers": [120],

// 코드 길이가 화면 밖을 넘었는지 확인하기 좋음.
"editor.wordWrap": "on",
"editor.wrappingIndent": "same",

// GitGraph 확장 설정
"git-graph.commitDetailsView.location": "Docked to Bottom",
"git-graph.dialog.fetchRemote.prune": true,
"git-graph.dialog.fetchRemote.pruneTags": true,
"git-graph.graph.colours": [
    "#3B82F6", // 블루
    "#10B981", // 에메랄드 그린
    "#8B5CF6", // 바이올렛
    "#F97316", // 따뜻한 오렌지
    "#06B6D4", // 시안
    "#EF4444", // 모던 레드
    "#14B8A6", // 티얼
    "#EAB308", // 골드 옐로우
    "#F43F5E", // 로즈 레드
    "#84CC16", // 라임
    "#A855F7", // 퍼플
    "#FB923C" // 라이트 오렌지
],
"git-graph.repository.fetchAndPrune": true,
"git-graph.repository.fetchAndPruneTags": true,

// Python 설정
"[python]": {
    "diffEditor.ignoreTrimWhitespace": false,
    "editor.codeActionsOnSave": {
        "source.fixAll": "always",  // 이 설정해줘야 안 쓰는 import 저장시 삭제
        "source.organizeImports": "always",  // isort 자동 적용
        "source.unusedImports": "explicit",
    },
    "editor.defaultFormatter": "ms-python.autopep8",
    "editor.formatOnSave": true,
},
"autopep8.args": [
    "max-line-length-120",
    "--select=E,W"  // 이 설정해줘야 autopep8 작동
]
```