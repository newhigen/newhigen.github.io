# Jekyll 블로그 유지보수 Makefile

.PHONY: help test build serve clean monitor ci new-post install

# 기본 타겟
help:
	@echo "Jekyll 블로그 유지보수 도구"
	@echo "=========================="
	@echo ""
	@echo "🚀 자동화된 워크플로우:"
	@echo "  git commit       - 커밋 시 자동 테스트 (pre-commit hook)"
	@echo ""
	@echo "⚡ 빠른 명령어:"
	@echo "  make smart-test  - 변경된 파일만 테스트 (5초)"
	@echo "  make quick-check - 빠른 체크 (30초)"
	@echo "  make pre-commit-check - 커밋 전 최소 체크"
	@echo ""
	@echo "📝 개발 도구:"
	@echo "  make install     - 의존성 설치"
	@echo "  make build       - 블로그 빌드"
	@echo "  make serve       - 로컬 서버 실행"
	@echo "  make clean       - 빌드 파일 정리"
	@echo "  make new-post    - 새 포스트 생성"
	@echo ""
	@echo "🔍 검증 도구:"
	@echo "  make test        - 전체 테스트 실행"
	@echo "  make monitor     - 블로그 상태 모니터링"
	@echo "  make ci          - CI 체크 실행"
	@echo "  make deploy      - 배포 준비 및 체크"
	@echo "  make full-check  - 전체 점검 (모든 도구)"
	@echo ""
	@echo "📸 스크린샷 도구:"
	@echo "  make pr PR=123   - PR 스크린샷 + 댓글 작성"
	@echo ""
	@echo "💡 팁: git commit 시 자동으로 테스트가 실행됩니다!"
	@echo ""

# 의존성 설치
install:
	@echo "📦 의존성 설치 중..."
	bundle install

# 블로그 빌드
build:
	@echo "🔨 블로그 빌드 중..."
	@echo "📝 포스트 메타데이터 생성 중..."
	ruby _scripts/generate_post_metadata.rb
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

# 스마트 테스트 (변경된 파일에 따라 선택적 실행)
smart-test:
	@echo "🧠 스마트 테스트 실행 중..."
	@if git diff --name-only HEAD | grep -q '_posts/'; then \
		echo "📝 포스트가 변경되었습니다. 포스트 관련 테스트 실행..."; \
		ruby _tools/test_suite.rb 2>/dev/null | grep -E "(Test posts format|Test front matter)"; \
	fi
	@if git diff --name-only HEAD | grep -q '_config\.yml'; then \
		echo "⚙️  설정이 변경되었습니다. 설정 파일 검증..."; \
		ruby -e "require 'yaml'; YAML.load_file('_config.yml')" && echo "✅ 설정 파일 문법 OK"; \
	fi
	@if git diff --name-only HEAD | grep -q '\.(scss|css|js)'; then \
		echo "🎨 스타일/스크립트가 변경되었습니다. 빌드 테스트..."; \
		bundle exec jekyll build --quiet && echo "✅ 빌드 성공"; \
	fi
	@echo "✅ 스마트 테스트 완료!"

# 전체 점검 (모든 도구 실행)
full-check: install test ci monitor
	@echo ""
	@echo "📊 전체 점검 완료!"
	@echo "결과를 확인하고 필요한 조치를 취하세요."

# 개발 모드 (빌드 + 테스트 + 서버)
dev: build test
	@echo "🚀 개발 모드 시작..."
	bundle exec jekyll serve

# 프로덕션 빌드
prod: clean build test ci
	@echo "✅ 프로덕션 빌드 완료!"

# 커밋 전 체크 (pre-commit hook과 동일한 로직)
pre-commit-check:
	@echo "🔍 커밋 전 체크 실행 중..."
	@bundle exec jekyll build --quiet || (echo "❌ 빌드 실패!" && exit 1)
	@echo "✅ 커밋 준비 완료!"

# PR 스크린샷 + 댓글 작성
pr:
	@if [ -z "$(PR)" ]; then \
		echo "❌ PR 번호를 지정해주세요: make pr PR=123"; \
		exit 1; \
	fi
	@echo "📸 PR #$(PR) 스크린샷 촬영 및 댓글 작성 중..."
	@node _scripts/puppeteer_screenshot_and_comment.js full $(PR)

# 도움말 (기본값)
.DEFAULT_GOAL := help
