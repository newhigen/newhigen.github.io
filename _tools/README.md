# 블로그 유지보수 도구

이 디렉토리에는 Jekyll 블로그의 유지보수와 개발을 돕는 Ruby 도구들이 포함되어 있습니다.

## 📁 파일 목록

### `test_suite.rb`
- **목적**: 블로그의 모든 핵심 기능을 테스트
- **실행**: `ruby test_suite.rb` 또는 `make test`
- **기능**: 설정, 빌드, 링크, SEO 등 14개 테스트 항목

### `blog_monitor.rb`
- **목적**: 블로그 상태 모니터링 및 건강도 분석
- **실행**: `ruby blog_monitor.rb` 또는 `make monitor`
- **출력**: 콘솔 리포트 + `assets/data/blog_health_report.json`

### `new_post.rb`
- **목적**: 새로운 블로그 포스트 생성 도우미
- **실행**: `ruby new_post.rb` 또는 `make new-post`
- **기능**: 대화형 포스트 생성, Front matter 자동 생성

## 🚀 빠른 시작

```bash
# 루트 디렉토리에서 실행
cd /path/to/your/blog

# 전체 테스트
make test

# 상태 모니터링
make monitor

# 새 포스트 작성
make new-post
```

## 📊 테스트 항목

### test_suite.rb
1. 설정 파일 존재 및 문법 검증
2. Gemfile 존재 확인
3. 필수 디렉토리 구조 확인
4. 포스트 파일명 형식 검증
5. Front matter 형식 검증
6. Jekyll 빌드 프로세스 테스트
7. 필수 파일 생성 확인
8. HTML 유효성 검사
9. 내부 링크 검증
10. CSS/JS 에셋 존재 확인
11. SEO 요소 검증
12. 페이지네이션 설정 확인
13. RSS 피드 생성 확인

## 🔧 커스터마이징

### 새로운 테스트 추가
`test_suite.rb`의 `run_all_tests` 메서드에 새로운 테스트 메서드를 추가하세요:

```ruby
tests = [
  :test_config_file_exists,
  :test_your_new_test,  # 새 테스트 추가
  # ...
]
```

### 모니터링 항목 추가
`blog_monitor.rb`에 새로운 분석 메서드를 추가하고 `generate_health_report`에서 호출하세요.

## 📝 참고사항

- 모든 도구는 루트 디렉토리에서 실행해야 합니다
- Ruby 2.6+ 버전이 필요합니다
- 필요한 gem: `nokogiri`, `yaml`, `json`, `time`, `fileutils`
- 리포트 파일은 `assets/data/` 디렉토리에 저장됩니다

## 🤝 문제 해결

### 경로 오류
도구가 경로를 찾지 못하는 경우, 루트 디렉토리에서 실행하고 있는지 확인하세요.

### 권한 오류
스크립트 실행 권한이 없는 경우:
```bash
chmod +x _tools/*.rb
```

### 의존성 오류
필요한 gem이 설치되지 않은 경우:
```bash
bundle install
```
