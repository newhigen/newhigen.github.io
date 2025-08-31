# Scripts

이 디렉토리에는 블로그 관리를 위한 다양한 스크립트들이 포함되어 있습니다.

## 📸 스크린샷 기능

### 개요
PR 변경사항을 스크린샷으로 캡처하고, 이미지를 병합하여 GitHub 댓글에 자동으로 첨부하는 기능입니다.

### 주요 특징
- **Edge + Puppeteer 기반**: 안정적인 브라우저 자동화
- **이미지 병합**: 여러 스크린샷을 가로로 병합하여 하나의 이미지로 생성
- **자동 정리**: 개별 스크린샷 파일들을 자동으로 삭제
- **PR 댓글 자동 첨부**: GitHub CLI를 통한 스크린샷 포함 댓글 작성
- **통합 워크플로우**: 스크린샷 촬영부터 병합, 댓글 작성까지 원클릭 실행

### 설치 및 설정

1. **의존성 설치**
```bash
npm install
```

2. **GitHub CLI 설정** (이미 설정되어 있어야 함)
```bash
gh auth status
```

### 사용법

#### 1. 로컬 사이트 스크린샷 + 병합
```bash
# 기본 사용법
node _scripts/puppeteer_screenshot_and_comment.js local

# 커스텀 출력 이름
node _scripts/puppeteer_screenshot_and_comment.js local custom_name
```

#### 2. PR 스크린샷 + 병합
```bash
# 기본 사용법
node _scripts/puppeteer_screenshot_and_comment.js pr <PR번호>

# 커스텀 출력 이름
node _scripts/puppeteer_screenshot_and_comment.js pr 57 custom_name
```

#### 3. 전체 워크플로우 (스크린샷 + 병합 + 댓글)
```bash
# 기본 사용법
node _scripts/puppeteer_screenshot_and_comment.js full <PR번호>

# 커스텀 메시지
node _scripts/puppeteer_screenshot_and_comment.js full 57 "변경사항 확인 완료"

# 커스텀 메시지 + 출력 이름
node _scripts/puppeteer_screenshot_and_comment.js full 57 "변경사항 확인" custom_name
```

#### 4. 기존 스크린샷으로 댓글 작성
```bash
# 기본 사용법
node _scripts/comment_with_files.js <PR번호> [메시지] [날짜]

# 예시
node _scripts/comment_with_files.js 57 "스크린샷 첨부" 2025-08-31
```

### 파일 구조

```
_scripts/
├── puppeteer_screenshot.js              # Puppeteer 스크린샷 클래스
├── comment_with_files.js                # PR 댓글 작성 클래스
├── puppeteer_screenshot_and_comment.js  # 통합 워크플로우 (스크린샷 + 병합 + 댓글)
└── README.md                            # 이 파일

assets/
└── screenshots/                         # 스크린샷 저장 디렉토리
    ├── 2025-08-31_merged_local.jpg      # 병합된 이미지
    └── ...
```

### 워크플로우

1. **로컬 사이트 모드**
   - 메인 페이지 스크린샷
   - About 페이지 스크린샷
   - 두 이미지를 가로로 병합
   - 개별 파일 자동 삭제

2. **PR 스크린샷 모드**
   - PR 헤더 정보 스크린샷
   - 변경된 파일 목록 스크린샷
   - 커밋 히스토리 스크린샷
   - 모든 이미지를 가로로 병합
   - 개별 파일 자동 삭제

3. **전체 워크플로우 모드**
   - PR 스크린샷 촬영
   - 이미지 병합
   - 개별 파일 정리
   - PR에 댓글 자동 작성

### 이미지 병합 기능

- **고정 높이**: 모든 이미지를 600px 높이로 통일
- **가로 배치**: 이미지들을 가로로 순서대로 배치
- **배경색**: 흰색 배경으로 통일
- **품질**: 90% JPEG 품질로 최적화
- **자동 정리**: 병합 후 개별 파일 자동 삭제

### 주의사항

- Edge 브라우저가 설치되어 있어야 합니다
- 로컬 사이트 스크린샷 시 Jekyll 서버가 실행 중이어야 합니다
- GitHub CLI가 로그인되어 있어야 합니다
- GitHub Pages에 배포된 후에 이미지가 보입니다

### 문제 해결

1. **브라우저 초기화 실패**
   - Edge 브라우저가 설치되어 있는지 확인
   - 시스템 권한 설정 확인

2. **스크린샷 실패**
   - 로컬 서버가 실행 중인지 확인
   - 네트워크 연결 상태 확인

3. **댓글 작성 실패**
   - GitHub CLI가 로그인되어 있는지 확인
   - `gh auth status` 명령어로 상태 확인

4. **이미지 병합 실패**
   - Sharp 라이브러리가 설치되어 있는지 확인
   - 이미지 파일이 손상되지 않았는지 확인

## 기타 스크립트

### 블로그 유지보수 도구

- `blog_monitor.rb`: 블로그 상태 모니터링
- `new_post.rb`: 새 포스트 생성
- `test_suite.rb`: 테스트 스위트 실행

자세한 내용은 각 스크립트의 주석을 참조하세요.
