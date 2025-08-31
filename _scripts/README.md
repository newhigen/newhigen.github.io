# Scripts

이 디렉토리에는 블로그 관리를 위한 다양한 스크립트들이 포함되어 있습니다.

## 📸 스크린샷 기능

### 개요
PR 변경사항을 스크린샷으로 캡처하고 GitHub 댓글에 자동으로 첨부하는 기능입니다.

### 주요 특징
- **macOS screencapture 기반**: 안정적인 시스템 명령어 사용
- **날짜별 파일 관리**: `{YYYY-MM-DD}_{name}.png` 형식으로 자동 저장
- **PR 댓글 자동 첨부**: GitHub CLI를 통한 스크린샷 포함 댓글 작성
- **통합 워크플로우**: 스크린샷 촬영부터 댓글 작성까지 원클릭 실행

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

#### 1. PR 스크린샷 + 댓글 작성
```bash
# 기본 사용법
node _scripts/mac_screenshot_and_comment.js pr <PR번호>

# 예시
node _scripts/mac_screenshot_and_comment.js pr 57
```

#### 2. 커스텀 스크린샷 + 댓글 작성
```bash
# 기본 사용법
node _scripts/mac_screenshot_and_comment.js custom <PR번호> <name1> <name2> ... [메시지]

# 예시
node _scripts/mac_screenshot_and_comment.js custom 57 main_page about_page "커스텀 스크린샷"
```

#### 3. 단일 스크린샷
```bash
# 기본 사용법
node _scripts/mac_screenshot.js single [name]

# 예시
node _scripts/mac_screenshot.js single test
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
├── mac_screenshot.js              # macOS 스크린샷 클래스
├── comment_with_files.js          # PR 댓글 작성 클래스
├── mac_screenshot_and_comment.js  # 통합 워크플로우
└── README.md                      # 이 파일

assets/
└── screenshots/                   # 스크린샷 저장 디렉토리
    ├── 2025-08-31_test.png
    ├── 2025-08-31_pr_57_header.png
    └── ...
```

### 워크플로우

1. **PR 스크린샷 모드**
   - PR 헤더 정보 스크린샷
   - 변경된 파일 목록 스크린샷
   - 커밋 히스토리 스크린샷
   - 자동으로 PR에 댓글 작성

2. **커스텀 스크린샷 모드**
   - 사용자가 지정한 이름으로 스크린샷 촬영
   - 각 스크린샷마다 3초 대기 시간 제공
   - 자동으로 PR에 댓글 작성

### 주의사항

- 스크린샷 촬영 시 원하는 창을 활성화해야 합니다
- 각 스크린샷 사이에 3초의 대기 시간이 있습니다
- 같은 날짜의 같은 이름으로 촬영하면 파일이 덮어씌워집니다
- GitHub Pages에 배포된 후에 이미지가 보입니다

### 문제 해결

1. **스크린샷이 생성되지 않는 경우**
   - 화면 권한이 허용되어 있는지 확인
   - 터미널에 스크린샷 권한이 있는지 확인

2. **댓글 작성이 실패하는 경우**
   - GitHub CLI가 로그인되어 있는지 확인
   - `gh auth status` 명령어로 상태 확인

3. **이미지가 보이지 않는 경우**
   - GitHub Pages 배포가 완료되었는지 확인
   - 이미지 URL이 올바른지 확인

## 기타 스크립트

### 블로그 유지보수 도구

- `blog_monitor.rb`: 블로그 상태 모니터링
- `new_post.rb`: 새 포스트 생성
- `test_suite.rb`: 테스트 스위트 실행

자세한 내용은 각 스크립트의 주석을 참조하세요.
