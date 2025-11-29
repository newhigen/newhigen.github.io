---
layout: default-with-date
title: GitHub
permalink: github
published_date: 2025-11-25
nav_order: 3
---

## 개인 프로젝트 기본 설정

### General

Pull Requests
- ☑ Disable `Allow merge commits`
- ☑ `Allow squash merging` > Default commit message: `Pull request title`
- ☑ Disable `Allow rebase commits`
- ☑ Enable `Automatically delete head branches`

### Branches

Add branch ruleset
- ☑ Enable `Require a pull request before merging`

## GitHub 웹 UI 개선: `Refined GitHub` Browser Extension

설치: [github.com/refined-github/refined-github](https://github.com/refined-github/refined-github)
* ☑ `README`의 `Install`에서 맞는 브라우져로 설치

확장 옵션에서
* ☑ `Personal token` 추가
* ☑ `Custom CSS` 설정

<details>
<summary>내 Custom CSS 설정</summary>

<pre>
<code>
@import url('https://fonts.googleapis.com/css2?family=Google+Sans+Code:ital,wght@0,300..800;1,300..800&family=Outfit:wght@100..900&display=swap');

code,
pre,
.blob-code,
.blob-num,
.blob-code-content,
.blob-code-inner,
.blob-code-marker,
.cm-editor,
.cm-line,
.commit-ref,
.files > tbody > tr > td.content a,
.head-ref,
.input-monospace,
.react-blob-print-hide,
.react-code-lines,
.react-code-text {
  font-family: 'Google Sans Code', monospace !important;
}
</code>
</pre>

</details>