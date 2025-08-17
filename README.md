# newhigen.github.io

개인 블로그 프로젝트입니다. Jekyll을 기반으로 구축되었으며, 다양한 유지보수 도구들이 포함되어 있습니다.

## 🏗️ 프로젝트 구조

```
newhigen.github.io/
├── _posts/           # 블로그 포스트
├── _drafts/          # 초안 포스트
├── _layouts/         # Jekyll 레이아웃
├── _includes/        # Jekyll 포함 파일
├── _sass/           # SCSS 스타일
├── assets/          # 정적 파일 (CSS, JS, 이미지)
│   └── data/        # 데이터 파일 (리포트 등)
├── _tools/          # 블로그 유지보수 도구
├── _scripts/        # 실행 스크립트
├── _site/           # 빌드된 사이트 (자동 생성)
├── Makefile         # 프로젝트 관리 명령어
└── _config.yml      # Jekyll 설정
```

## 🚀 빠른 시작

### 1. 환경 설정
```bash
# 의존성 설치
make install

# 또는
bundle install
```

### 2. 로컬 개발
```bash
# 로컬 서버 실행
make serve

# 또는
bundle exec jekyll serve
```

### 3. 블로그 관리
```bash
# 새 포스트 작성
make new-post

# 블로그 상태 확인
make monitor

# 전체 테스트
make test
```

## 🛠️ 유지보수 도구

### _tools/ 디렉토리
- **test_suite.rb**: 종합 테스트 스위트 (14개 테스트 항목)
- **blog_monitor.rb**: 블로그 상태 모니터링 및 건강도 분석
- **new_post.rb**: 포스트 생성 도우미

### _scripts/ 디렉토리
- **ci_check.sh**: 배포 전 CI/CD 체크

## 📋 Makefile 명령어

```bash
make help          # 도움말 보기
make install       # 의존성 설치
make build         # 블로그 빌드
make serve         # 로컬 서버 실행
make clean         # 빌드 파일 정리
make test          # 전체 테스트 실행
make monitor       # 블로그 상태 모니터링
make ci            # CI 체크 실행
make new-post      # 새 포스트 생성
make deploy        # 배포 준비 및 체크
make quick-check   # 빠른 체크 (테스트 + 모니터링)
make full-check    # 전체 점검 (모든 도구 실행)
```

## 📊 현재 상태

- **건강도**: 🟢 EXCELLENT
- **총 포스트**: 15개
- **테스트 통과율**: 100%
- **빌드 상태**: ✅ 성공

## 🔧 개발 환경

- **Ruby**: 3.3.5+
- **Jekyll**: 4.3.3
- **테마**: minima
- **플러그인**: jekyll-feed, jekyll-paginate-v2, jekyll-sitemap, jekyll-seo-tag

## 📝 포스트 작성

### 새 포스트 생성
```bash
make new-post
```

### 포스트 형식
- 파일명: `YYYY-MM-DD-title.md`
- Front matter 필수: `title`, `date`, `layout`
- 지원 형식: Markdown

### 초안 작성
```bash
# 초안으로 생성
make new-post
# 초안 완성 후 _posts/ 디렉토리로 이동
```

## 🚀 배포

### GitHub Pages 배포
```bash
# 배포 준비
make deploy

# Git 커밋 및 푸시
git add .
git commit -m "Update blog"
git push
```

### 수동 배포
```bash
# 빌드
make build

# 테스트
make test

# 배포
git add . && git commit -m "Update blog" && git push
```

## 🔍 모니터링

### 정기적인 상태 확인
```bash
# 빠른 체크
make quick-check

# 상세 분석
make monitor
```

### 리포트 확인
- 콘솔 출력: 실시간 상태
- JSON 리포트: `assets/data/blog_health_report.json`

## 🤝 문제 해결

### 일반적인 문제들

**빌드 실패**
```bash
make clean
make install
make build
```

**테스트 실패**
```bash
make test
# 실패한 항목 확인 후 수정
```

**의존성 문제**
```bash
bundle install
bundle update
```

## 📚 추가 문서

- **유지보수 도구**: `_tools/README.md`
- **스크립트**: `_scripts/README.md`
- **상세 가이드**: `_tools/BLOG_MAINTENANCE.md`

## 📄 라이선스

개인 블로그 프로젝트입니다.

---

**💡 팁**: 정기적으로 `make quick-check`를 실행하여 블로그 상태를 모니터링하세요!
