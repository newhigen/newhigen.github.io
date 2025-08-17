# Jekyll 블로그 유지보수 Makefile

.PHONY: help test build serve clean monitor ci new-post install

# 기본 타겟
help:
	@echo "Jekyll 블로그 유지보수 도구"
	@echo "=========================="
	@echo ""
	@echo "사용 가능한 명령어:"
	@echo "  make install     - 의존성 설치"
	@echo "  make build       - 블로그 빌드"
	@echo "  make serve       - 로컬 서버 실행"
	@echo "  make clean       - 빌드 파일 정리"
	@echo "  make test        - 전체 테스트 실행"
	@echo "  make monitor     - 블로그 상태 모니터링"
	@echo "  make ci          - CI 체크 실행"
	@echo "  make new-post    - 새 포스트 생성"
	@echo "  make deploy      - 배포 준비 및 체크"
	@echo ""

# 의존성 설치
install:
	@echo "📦 의존성 설치 중..."
	bundle install

# 블로그 빌드
build:
	@echo "🔨 블로그 빌드 중..."
	bundle exec jekyll build

# 로컬 서버 실행
serve:
	@echo "🚀 로컬 서버 시작 중..."
	bundle exec jekyll serve

# 빌드 파일 정리
clean:
	@echo "🧹 빌드 파일 정리 중..."
	bundle exec jekyll clean
	rm -rf _site

# 전체 테스트 실행
test:
	@echo "🧪 전체 테스트 실행 중..."
	ruby _tools/test_suite.rb

# 블로그 상태 모니터링
monitor:
	@echo "🔍 블로그 상태 모니터링 중..."
	ruby _tools/blog_monitor.rb

# CI 체크 실행
ci:
	@echo "🔍 CI 체크 실행 중..."
	./_scripts/ci_check.sh

# 새 포스트 생성
new-post:
	@echo "📝 새 포스트 생성 중..."
	ruby _tools/new_post.rb

# 배포 준비 및 체크
deploy: test ci monitor
	@echo ""
	@echo "🎉 배포 준비 완료!"
	@echo "다음 명령어로 배포하세요:"
	@echo "  git add . && git commit -m 'Update blog' && git push"

# 빠른 체크 (테스트 + 모니터링)
quick-check: test monitor
	@echo "✅ 빠른 체크 완료!"

# 전체 점검 (모든 도구 실행)
full-check: install test ci monitor
	@echo ""
	@echo "📊 전체 점검 완료!"
	@echo "결과를 확인하고 필요한 조치를 취하세요."

# 개발 모드 (빌드 + 테스트 + 서버)
dev: build test
	@echo "🚀 개발 모드 시작..."
	bundle exec jekyll serve --livereload

# 프로덕션 빌드
prod: clean build test ci
	@echo "✅ 프로덕션 빌드 완료!"

# 도움말 (기본값)
.DEFAULT_GOAL := help
