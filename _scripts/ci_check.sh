#!/bin/bash

# Jekyll 블로그 CI 체크 스크립트
# 배포 전 필수 검증을 수행합니다

set -e  # 오류 발생 시 스크립트 중단

echo "🚀 Jekyll 블로그 CI 체크 시작"
echo "=================================="

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 함수 정의
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Ruby와 Bundler 확인
echo "📋 Ruby 환경 확인..."
if command -v ruby &> /dev/null; then
    RUBY_VERSION=$(ruby -v | cut -d' ' -f2)
    log_success "Ruby 버전: $RUBY_VERSION"
else
    log_error "Ruby가 설치되지 않았습니다"
    exit 1
fi

if command -v bundle &> /dev/null; then
    log_success "Bundler가 설치되어 있습니다"
else
    log_error "Bundler가 설치되지 않았습니다"
    exit 1
fi

# 2. 의존성 설치 확인
echo "📦 의존성 확인..."
if [ -f "Gemfile.lock" ]; then
    log_success "Gemfile.lock이 존재합니다"
else
    log_warning "Gemfile.lock이 없습니다. bundle install을 실행합니다..."
    bundle install
fi

# 3. Jekyll 빌드 테스트
echo "🔨 Jekyll 빌드 테스트..."
if bundle exec jekyll build --quiet; then
    log_success "Jekyll 빌드 성공"
else
    log_error "Jekyll 빌드 실패"
    exit 1
fi

# 4. 필수 파일 존재 확인
echo "📁 필수 파일 확인..."
required_files=("_site/index.html" "_site/feed.xml" "_site/sitemap.xml")
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        log_success "$file 존재"
    else
        log_error "$file 누락"
        exit 1
    fi
done

# 5. 포스트 형식 검증
echo "📝 포스트 형식 검증..."
posts_dir="_posts"
if [ -d "$posts_dir" ]; then
    invalid_posts=()
    for post in "$posts_dir"/*.md; do
        if [ -f "$post" ]; then
            filename=$(basename "$post")
            # YYYY-MM-DD-title.md 형식 확인
            if ! [[ $filename =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}-.+\.md$ ]]; then
                invalid_posts+=("$filename")
            fi
        fi
    done

    if [ ${#invalid_posts[@]} -eq 0 ]; then
        log_success "모든 포스트가 올바른 형식입니다"
    else
        log_error "잘못된 형식의 포스트: ${invalid_posts[*]}"
        exit 1
    fi
fi

# 6. 설정 파일 검증
echo "⚙️  설정 파일 검증..."
if [ -f "_config.yml" ]; then
    if ruby -e "require 'yaml'; YAML.load_file('_config.yml')" 2>/dev/null; then
        log_success "_config.yml 문법이 올바릅니다"
    else
        log_error "_config.yml 문법 오류"
        exit 1
    fi
else
    log_error "_config.yml 파일이 없습니다"
    exit 1
fi

# 7. 링크 검증 (간단한 버전)
echo "🔗 링크 검증..."
if command -v ruby &> /dev/null; then
    if ruby _tools/test_suite.rb 2>/dev/null | grep -q "모든 테스트가 통과했습니다"; then
        log_success "링크 검증 통과"
    else
        log_warning "일부 링크에 문제가 있을 수 있습니다"
    fi
else
    log_warning "Ruby가 없어 링크 검증을 건너뜁니다"
fi

# 8. 파일 크기 확인
echo "📊 파일 크기 확인..."
large_files=$(find _site -name "*.html" -size +1M 2>/dev/null || true)
if [ -z "$large_files" ]; then
    log_success "모든 HTML 파일이 적절한 크기입니다"
else
    log_warning "큰 HTML 파일 발견:"
    echo "$large_files"
fi

# 9. 빌드 시간 측정
echo "⏱️  빌드 성능 확인..."
start_time=$(date +%s)
bundle exec jekyll build --quiet
end_time=$(date +%s)
build_time=$((end_time - start_time))

if [ $build_time -lt 30 ]; then
    log_success "빌드 시간: ${build_time}초 (양호)"
elif [ $build_time -lt 60 ]; then
    log_warning "빌드 시간: ${build_time}초 (보통)"
else
    log_error "빌드 시간: ${build_time}초 (느림)"
fi

echo ""
echo "=================================="
log_success "CI 체크 완료! 블로그가 배포 준비가 되었습니다."
echo ""
echo "다음 명령어로 로컬 서버를 실행할 수 있습니다:"
echo "  bundle exec jekyll serve"
echo ""
echo "GitHub Pages에 배포하려면:"
echo "  git add . && git commit -m 'Update blog' && git push"
