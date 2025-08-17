# Jekyll 블로그 유지보수 도구

이 디렉토리에는 Jekyll 블로그의 유지보수와 개발을 돕는 다양한 도구들이 포함되어 있습니다.

## 🛠️ 도구 목록

### 1. `test_suite.rb` - 종합 테스트 스위트
블로그의 모든 핵심 기능을 테스트하는 종합적인 테스트 도구입니다.

**실행 방법:**
```bash
ruby test_suite.rb
```

**테스트 항목:**
- ✅ 설정 파일 존재 및 문법 검증
- ✅ Gemfile 존재 확인
- ✅ 필수 디렉토리 구조 확인
- ✅ 포스트 파일명 형식 검증 (YYYY-MM-DD-title.md)
- ✅ Front matter 형식 검증
- ✅ Jekyll 빌드 프로세스 테스트
- ✅ 필수 파일 생성 확인 (index.html, feed.xml, sitemap.xml)
- ✅ HTML 유효성 검사
- ✅ 내부 링크 검증
- ✅ CSS/JS 에셋 존재 확인
- ✅ SEO 요소 검증
- ✅ 페이지네이션 설정 확인
- ✅ RSS 피드 생성 확인

### 2. `ci_check.sh` - CI/CD 체크 스크립트
배포 전 필수 검증을 수행하는 CI 스크립트입니다.

**실행 방법:**
```bash
./ci_check.sh
```

**검증 항목:**
- 📋 Ruby 및 Bundler 환경 확인
- 📦 의존성 설치 상태 확인
- 🔨 Jekyll 빌드 테스트
- 📁 필수 파일 존재 확인
- 📝 포스트 형식 검증
- ⚙️ 설정 파일 문법 검증
- 🔗 링크 검증
- 📊 파일 크기 확인
- ⏱️ 빌드 성능 측정

### 3. `blog_monitor.rb` - 블로그 상태 모니터링
블로그의 전반적인 건강도를 분석하고 리포트를 생성합니다.

**실행 방법:**
```bash
ruby blog_monitor.rb
```

**분석 항목:**
- 📊 기본 통계 (포스트 수, 최근 포스트, 사이트 크기)
- 📝 포스트 품질 분석
- 🔨 빌드 상태 확인
- ⚡ 성능 분석 (빌드 시간, 파일 크기)
- 🔍 SEO 요소 분석
- 💡 개선 권장사항

**결과:**
- 콘솔에 상세한 리포트 출력
- `blog_health_report.json` 파일로 저장

### 4. `new_post.rb` - 포스트 생성 도우미
새로운 블로그 포스트를 쉽게 생성할 수 있는 도구입니다.

**실행 방법:**
```bash
ruby new_post.rb
```

**기능:**
- 📝 대화형 포스트 생성
- 🏷️ 카테고리 및 태그 설정
- 📅 자동 날짜 생성
- ✏️ 초안 모드 지원
- 🔧 Front matter 자동 생성
- 📂 에디터 자동 실행

## 🚀 사용 시나리오

### 일상적인 블로그 관리
```bash
# 1. 새 포스트 작성
ruby new_post.rb

# 2. 블로그 상태 확인
ruby blog_monitor.rb

# 3. 빌드 및 테스트
./ci_check.sh
```

### 배포 전 체크리스트
```bash
# 1. 종합 테스트 실행
ruby test_suite.rb

# 2. CI 체크 실행
./ci_check.sh

# 3. 상태 리포트 확인
ruby blog_monitor.rb
```

### 문제 해결
```bash
# 1. 빌드 오류 확인
bundle exec jekyll build

# 2. 링크 문제 확인
ruby test_suite.rb

# 3. 성능 문제 분석
ruby blog_monitor.rb
```

## 📋 권장 워크플로우

### 새 포스트 작성 시
1. `ruby new_post.rb`로 포스트 생성
2. 포스트 내용 작성
3. `ruby test_suite.rb`로 기본 검증
4. `bundle exec jekyll serve`로 로컬 확인
5. `./ci_check.sh`로 배포 준비 확인
6. Git 커밋 및 푸시

### 정기적인 유지보수
1. `ruby blog_monitor.rb`로 상태 확인
2. 발견된 문제점 수정
3. `ruby test_suite.rb`로 전체 테스트
4. 필요시 성능 최적화

## 🔧 문제 해결

### 일반적인 문제들

**빌드 실패**
```bash
# 의존성 재설치
bundle install

# 캐시 정리
bundle exec jekyll clean
```

**링크 오류**
```bash
# 링크 검증 실행
ruby test_suite.rb

# 수동으로 HTML 파일 확인
find _site -name "*.html" -exec grep -l "broken-link" {} \;
```

**성능 문제**
```bash
# 성능 분석
ruby blog_monitor.rb

# 큰 파일 찾기
find _site -size +1M
```

## 📊 건강도 점수

블로그 모니터는 다음 기준으로 건강도를 평가합니다:

- 🟢 **Excellent (90-100점)**: 모든 것이 완벽
- 🟡 **Good (70-89점)**: 대부분 양호, 일부 개선 필요
- 🟠 **Fair (50-69점)**: 몇 가지 문제점 존재
- 🔴 **Poor (30-49점)**: 상당한 문제점들
- 💀 **Critical (0-29점)**: 심각한 문제들

## 🤝 기여하기

이 도구들을 개선하거나 새로운 기능을 추가하고 싶다면:

1. 기존 스크립트 분석
2. 필요한 기능 식별
3. 테스트 코드 작성
4. 문서 업데이트

## 📝 참고사항

- 모든 스크립트는 Ruby 2.6+ 버전에서 테스트되었습니다
- macOS, Linux 환경에서 사용 가능합니다
- Windows에서는 WSL 사용을 권장합니다
- 필요한 gem: `nokogiri`, `yaml`, `json`, `time`, `fileutils`

---

**💡 팁**: 정기적으로 `ruby blog_monitor.rb`를 실행하여 블로그 상태를 모니터링하세요!
