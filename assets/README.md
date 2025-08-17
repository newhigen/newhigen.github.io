# Assets 폴더 구조 및 사용법

이 폴더는 독서 히트맵과 관련된 모든 커스텀 파일들을 포함합니다.

## 📁 폴더 구조

```
assets/
├── css/
│   ├── reading-heatmap.css    # 히트맵 스타일
│   └── style.scss            # 기본 스타일
├── js/
│   └── reading-heatmap.js    # 히트맵 기능
├── data/
│   └── books.json           # 책 데이터
└── images/                  # 이미지 파일들
```

## 🎨 스타일 커스터마이징

### 후기 색상 변경하기

`assets/css/reading-heatmap.css` 파일의 **5. 책 목록 링크 스타일** 섹션에서 색상을 변경할 수 있습니다:

```css
/* 짧은 후기 링크 스타일 (300자 이하) */
.book-link.short-post {
    background: linear-gradient(to bottom, transparent 70%, #d0ebff 90%) !important;
}

/* 일반 후기 링크 스타일 (300자 초과) */
.book-link:not(.short-post) {
    background: linear-gradient(to bottom, transparent 70%, #d0bfff 90%) !important;
}
```

### 히트맵 색상 변경하기

같은 파일의 **2. 히트맵 셀 및 색상 레벨** 섹션에서 히트맵 색상을 변경할 수 있습니다:

```css
.heatmap-cell.level-1 { background-color: #d0ebff; }  /* 1권 */
.heatmap-cell.level-2 { background-color: #74c0fc; }  /* 2권 */
.heatmap-cell.level-3 { background-color: #1971c2; }  /* 3권 */
.heatmap-cell.level-4 { background-color: #0c4a6e; }  /* 4권 이상 */
```

## 📊 데이터 관리

### 책 데이터 추가/수정

`assets/data/books.json` 파일에서 책 정보를 관리합니다:

```json
{
  "title": "책 제목",
  "author": "저자명",
  "year": 2024,
  "month": 12,
  "post": "post-url"  // 포스트가 있는 경우만
}
```

### 짧은 포스트 기준 변경

`assets/js/reading-heatmap.js` 파일의 `isShortPost` 함수에서 기준을 변경할 수 있습니다:

```javascript
function isShortPost(postName) {
    return postLengths[postName] && postLengths[postName] <= 300; // 300자 기준
}
```

## 🔧 기능 커스터마이징

### 히트맵 레벨 기준 변경

`assets/js/reading-heatmap.js` 파일의 `createHeatmap` 함수에서 레벨 기준을 변경할 수 있습니다:

```javascript
// 레벨 결정 (0-4) - GitHub 스타일
let level = 0;
if (count > 0) {
    if (count === 1) level = 1;      // 1권
    else if (count <= 2) level = 2;  // 2권
    else if (count <= 3) level = 3;  // 3권
    else level = 4;                  // 4권 이상
}
```

### 툴팁 스타일 변경

`assets/css/reading-heatmap.css` 파일의 **6. 툴팁 스타일** 섹션에서 툴팁 디자인을 변경할 수 있습니다.

## 📱 반응형 디자인

모바일 환경을 위한 스타일은 **7. 반응형 디자인 (모바일)** 섹션에서 관리됩니다.

## 🚀 사용법

1. **books_read.md** 페이지에서 히트맵이 자동으로 로드됩니다
2. 책 데이터는 `books.json`에서 관리됩니다
3. 포스트 글자수는 자동으로 계산되어 짧은 포스트를 구분합니다
4. 히트맵에 마우스를 올리면 해당 월의 책 목록이 표시됩니다

## 🔍 파일별 역할

- **reading-heatmap.css**: 모든 히트맵 관련 스타일
- **reading-heatmap.js**: 히트맵 생성, 데이터 처리, 인터랙션
- **books.json**: 책 데이터 저장소
- **style.scss**: 기본 사이트 스타일 (Jekyll에서 컴파일됨)
