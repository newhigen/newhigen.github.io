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
- **3. 메뉴 그룹**: 왼쪽(아이콘)과 중앙(카테고리)으로 단순화

### 메뉴 구조
- **왼쪽**: Home, 검색, About
- **중앙**: #생각, #책 (카테고리 링크)

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
