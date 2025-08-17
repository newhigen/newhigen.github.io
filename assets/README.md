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
│   └── books.csv            # 책 데이터
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

`assets/data/books.csv` 파일에서 책 정보를 관리합니다:

```csv
title,year,month,post,isShort
책 제목,2024,12,post-url,false
```

**필드 설명:**
- `title`: 책 제목 (필수)
- `year`: 읽은 년도 (필수)
- `month`: 읽은 월 (필수)
- `post`: 관련 포스트 URL (선택사항, 비어있으면 빈 문자열)
- `isShort`: 짧은 포스트 여부 (선택사항, true/false)

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
2. 책 데이터는 `books.csv`에서 관리됩니다
3. 포스트 글자수는 자동으로 계산되어 짧은 포스트를 구분합니다
4. 히트맵에 마우스를 올리면 해당 월의 책 목록이 표시됩니다

## 🔍 파일별 역할

- **reading-heatmap.css**: 모든 히트맵 관련 스타일
- **reading-heatmap.js**: 히트맵 생성, 데이터 처리, 인터랙션
- **books.csv**: 책 데이터 저장소
- **style.scss**: 기본 사이트 스타일 (Jekyll에서 컴파일됨)

---

# _layouts 폴더 구조 및 사용법

Jekyll 레이아웃 파일들이 포함되어 있습니다.

## 📁 폴더 구조

```
_layouts/
├── home.html              # 홈페이지 레이아웃
├── post.html              # 포스트 상세 페이지 레이아웃
└── google-analytics.html  # Google Analytics 추적 코드
```

## 🏠 홈페이지 레이아웃 (`home.html`)

### 주요 기능
- **1. 포스트 목록 필터링**: 홈페이지와 카테고리 페이지 구분
- **2. 포스트 목록 렌더링**: 년월별 그룹화된 포스트 목록
- **3. 페이지네이션**: 포스트가 많을 때 페이지 분할

### 커스터마이징 포인트
- 날짜 형식: `date_format` 변수 수정
- 포스트 그룹화: 년월별 그룹화 로직 수정
- 카테고리 표시: 홈페이지에서만 카테고리 표시

## 📝 포스트 레이아웃 (`post.html`)

### 주요 기능
- **1. 포스트 헤더**: 제목, 메타 정보 표시
- **2. 책 상세 정보**: 책 카테고리인 경우 저자, 출판년도 표시
- **3. 포스트 본문**: 마크다운 콘텐츠 렌더링
- **4. 댓글 시스템**: Disqus 댓글 (설정된 경우)

### 커스터마이징 포인트
- 책 정보 표시: `page.author`, `page.publication_year` 변수 활용
- 메타 정보 형식: `date_format` 변수 수정
- 댓글 시스템: `site.disqus.shortname` 설정

## 📊 Google Analytics (`google-analytics.html`)

프로덕션 환경에서만 로드되는 Google Analytics 추적 코드입니다.

---

# _includes 폴더 구조 및 사용법

Jekyll include 파일들이 포함되어 있습니다.

## 📁 폴더 구조

```
_includes/
├── head.html              # HTML head 섹션
├── header.html            # 사이트 헤더 (네비게이션)
└── custom-head.html       # 커스텀 폰트 및 스타일
```

## 🧠 Head 섹션 (`head.html`)

### 주요 기능
- **1. 기본 메타 태그**: 문자 인코딩, 뷰포트 설정
- **2. SEO 최적화**: Jekyll SEO 플러그인
- **3. 외부 리소스**: Font Awesome 아이콘
- **4. 사이트 스타일**: CSS 파일 로드
- **5. 파비콘**: 사이트 아이콘 설정
- **6. RSS 피드**: 블로그 피드 메타 태그
- **7. Google Analytics**: 프로덕션 환경에서만 로드
- **8. 커스텀 헤드**: 추가 스타일 및 스크립트

### 커스터마이징 포인트
- 파비콘 변경: `favicon.png` 파일 교체
- Google Analytics: `site.google_analytics` 설정
- 추가 스타일: `custom-head.html`에서 관리

## 🧭 헤더 네비게이션 (`header.html`)

### 주요 기능
- **1. 네비게이션 페이지 목록**: 동적 메뉴 생성
- **2. 모바일 메뉴**: 햄버거 메뉴 토글
- **3. 메뉴 그룹**: 왼쪽, 중앙, 오른쪽 그룹으로 분류

### 메뉴 구조
- **왼쪽**: Home
- **중앙**: #생각, #책 (카테고리)
- **오른쪽**: 읽은 책들, About

### 커스터마이징 포인트
- 메뉴 항목 추가/수정: `nav-group-*` div 내부 수정
- 활성 상태 스타일: `active` 클래스 활용
- 모바일 메뉴: `nav-trigger` 체크박스 활용

## 🎨 커스텀 폰트 (`custom-head.html`)

### 포함된 폰트
- **Noto Serif KR**: 본문용 세리프 폰트
- **NanumBarunpen**: 손글씨 스타일 폰트
- **Freesentation-3Light**: 얇은 폰트
- **Freesentation-6SemiBold**: 굵은 폰트

### 커스터마이징 포인트
- 폰트 추가: 새로운 `@font-face` 규칙 추가
- 폰트 변경: 기존 폰트 URL 수정
- 폰트 가중치: `font-weight` 값 조정
