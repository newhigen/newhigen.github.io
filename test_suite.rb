#!/usr/bin/env ruby

require 'fileutils'
require 'yaml'
require 'json'
require 'open3'
require 'nokogiri'
require 'time'

class JekyllBlogTestSuite
  def initialize
    @blog_root = File.dirname(__FILE__)
    @site_dir = File.join(@blog_root, '_site')
    @posts_dir = File.join(@blog_root, '_posts')
    @config_file = File.join(@blog_root, '_config.yml')
    @gemfile = File.join(@blog_root, 'Gemfile')
  end

  def run_all_tests
    puts "🚀 Jekyll 블로그 테스트 스위트 시작"
    puts "=" * 50

    tests = [
      :test_config_file_exists,
      :test_config_syntax,
      :test_gemfile_exists,
      :test_required_directories,
      :test_posts_format,
      :test_front_matter,
      :test_build_process,
      :test_generated_files,
      :test_html_validity,
      :test_links_internal,
      :test_assets_exist,
      :test_seo_elements,
      :test_pagination,
      :test_feed_generation
    ]

    results = { passed: 0, failed: 0, errors: [] }

    tests.each do |test_method|
      begin
        puts "\n📋 #{test_method.to_s.gsub('_', ' ').capitalize}..."
        if send(test_method)
          puts "✅ 통과"
          results[:passed] += 1
        else
          puts "❌ 실패"
          results[:failed] += 1
        end
      rescue => e
        puts "💥 오류: #{e.message}"
        results[:failed] += 1
        results[:errors] << { test: test_method, error: e.message }
      end
    end

    print_summary(results)
  end

  private

  def test_config_file_exists
    File.exist?(@config_file)
  end

  def test_config_syntax
    config = YAML.load_file(@config_file)
    required_keys = ['title', 'description', 'url', 'theme']
    required_keys.all? { |key| config.key?(key) }
  end

  def test_gemfile_exists
    File.exist?(@gemfile)
  end

  def test_required_directories
    required_dirs = ['_posts', '_layouts', '_includes', '_sass', 'assets']
    required_dirs.all? { |dir| Dir.exist?(File.join(@blog_root, dir)) }
  end

  def test_posts_format
    return true unless Dir.exist?(@posts_dir)

    posts = Dir.glob(File.join(@posts_dir, '*.md'))
    posts.all? do |post|
      filename = File.basename(post)
      # YYYY-MM-DD-title.md 형식 확인
      filename.match?(/^\d{4}-\d{2}-\d{2}-.+\.md$/)
    end
  end

  def test_front_matter
    return true unless Dir.exist?(@posts_dir)

    posts = Dir.glob(File.join(@posts_dir, '*.md'))
    posts.all? do |post|
      content = File.read(post)
      # YAML front matter가 있는지 확인
      content.start_with?('---') && content.include?('title:')
    end
  end

  def test_build_process
    puts "  🔨 Jekyll 빌드 테스트 중..."

    # 빌드 전 _site 디렉토리 정리
    FileUtils.rm_rf(@site_dir) if Dir.exist?(@site_dir)

    # Jekyll 빌드 실행
    cmd = "cd #{@blog_root} && bundle exec jekyll build --quiet"
    stdout, stderr, status = Open3.capture3(cmd)

    if status.success?
      puts "  ✅ 빌드 성공"
      return true
    else
      puts "  ❌ 빌드 실패: #{stderr}"
      return false
    end
  end

  def test_generated_files
    return false unless Dir.exist?(@site_dir)

    required_files = ['index.html', 'feed.xml', 'sitemap.xml']
    required_files.all? { |file| File.exist?(File.join(@site_dir, file)) }
  end

  def test_html_validity
    return true unless Dir.exist?(@site_dir)

    html_files = Dir.glob(File.join(@site_dir, '**/*.html'))
    html_files.all? do |file|
      # 404.html은 특별한 경우로 제외
      next true if File.basename(file) == '404.html'

      content = File.read(file)
      # 기본적인 HTML 구조 확인 (DOCTYPE 포함)
      content.include?('<!DOCTYPE html>') && content.include?('<html') && content.include?('</html>')
    end
  end

  def test_links_internal
    return true unless Dir.exist?(@site_dir)

    html_files = Dir.glob(File.join(@site_dir, '**/*.html'))
    broken_links = []

    html_files.each do |file|
      content = File.read(file)
      doc = Nokogiri::HTML(content)

      # 내부 링크 확인
      doc.css('a[href^="/"]').each do |link|
        href = link['href']
        target_file = File.join(@site_dir, href.sub(/^\//, ''))
        unless File.exist?(target_file) || File.exist?(target_file + '.html')
          broken_links << "#{file} -> #{href}"
        end
      end
    end

    if broken_links.empty?
      puts "  ✅ 모든 내부 링크가 유효합니다"
      return true
    else
      puts "  ❌ 깨진 링크 발견: #{broken_links.join(', ')}"
      return false
    end
  end

  def test_assets_exist
    return true unless Dir.exist?(@site_dir)

    html_files = Dir.glob(File.join(@site_dir, '**/*.html'))
    missing_assets = []

    html_files.each do |file|
      content = File.read(file)
      doc = Nokogiri::HTML(content)

      # CSS 파일 확인
      doc.css('link[rel="stylesheet"]').each do |css|
        href = css['href']
        if href.start_with?('/')
          asset_path = File.join(@site_dir, href.sub(/^\//, ''))
          unless File.exist?(asset_path)
            missing_assets << "CSS: #{href}"
          end
        end
      end

      # JS 파일 확인
      doc.css('script[src]').each do |js|
        src = js['src']
        if src.start_with?('/')
          asset_path = File.join(@site_dir, src.sub(/^\//, ''))
          unless File.exist?(asset_path)
            missing_assets << "JS: #{src}"
          end
        end
      end
    end

    if missing_assets.empty?
      puts "  ✅ 모든 에셋이 존재합니다"
      return true
    else
      puts "  ❌ 누락된 에셋: #{missing_assets.join(', ')}"
      return false
    end
  end

  def test_seo_elements
    return true unless Dir.exist?(@site_dir)

    index_file = File.join(@site_dir, 'index.html')
    return false unless File.exist?(index_file)

    content = File.read(index_file)
    doc = Nokogiri::HTML(content)

    # 기본 SEO 요소 확인
    has_title = doc.at_css('title')
    has_canonical = doc.at_css('link[rel="canonical"]')

    # Jekyll SEO 태그가 있으면 메타 설명은 자동 생성됨
    has_seo_tag = content.include?('Begin Jekyll SEO tag')

    has_title && has_canonical && has_seo_tag
  end

  def test_pagination
    return true unless Dir.exist?(@site_dir)

    # 페이지네이션 설정 확인
    config = YAML.load_file(@config_file)
    pagination_enabled = config.dig('pagination', 'enabled')

    if pagination_enabled
      # 페이지네이션 관련 파일들이 생성되었는지 확인
      index_file = File.join(@site_dir, 'index.html')
      return File.exist?(index_file)
    end

    true
  end

  def test_feed_generation
    return true unless Dir.exist?(@site_dir)

    feed_file = File.join(@site_dir, 'feed.xml')
    return false unless File.exist?(feed_file)

    content = File.read(feed_file)
    # RSS/Atom 피드 형식 확인
    content.include?('<rss') || content.include?('<feed')
  end

  def print_summary(results)
    puts "\n" + "=" * 50
    puts "📊 테스트 결과 요약"
    puts "=" * 50
    puts "✅ 통과: #{results[:passed]}"
    puts "❌ 실패: #{results[:failed]}"
    puts "📈 성공률: #{(results[:passed].to_f / (results[:passed] + results[:failed]) * 100).round(1)}%"

    if results[:errors].any?
      puts "\n💥 오류 상세:"
      results[:errors].each do |error|
        puts "  - #{error[:test]}: #{error[:error]}"
      end
    end

    if results[:failed] == 0
      puts "\n🎉 모든 테스트가 통과했습니다!"
    else
      puts "\n⚠️  일부 테스트가 실패했습니다. 위의 오류를 확인해주세요."
    end
  end
end

# 테스트 실행
if __FILE__ == $0
  test_suite = JekyllBlogTestSuite.new
  test_suite.run_all_tests
end
