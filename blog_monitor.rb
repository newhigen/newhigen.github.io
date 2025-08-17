#!/usr/bin/env ruby

require 'fileutils'
require 'yaml'
require 'json'
require 'time'
require 'open3'

class BlogMonitor
  def initialize
    @blog_root = File.dirname(__FILE__)
    @site_dir = File.join(@blog_root, '_site')
    @posts_dir = File.join(@blog_root, '_posts')
    @config_file = File.join(@blog_root, '_config.yml')
    @report_file = File.join(@blog_root, 'blog_health_report.json')
  end

  def generate_health_report
    puts "🔍 블로그 상태 모니터링 시작..."

    report = {
      timestamp: Time.now.iso8601,
      overall_health: 'unknown',
      issues: [],
      warnings: [],
      stats: {},
      recommendations: []
    }

    # 기본 통계 수집
    report[:stats] = collect_basic_stats

    # 포스트 분석
    post_analysis = analyze_posts
    report[:stats].merge!(post_analysis[:stats])
    report[:issues].concat(post_analysis[:issues])
    report[:warnings].concat(post_analysis[:warnings])

    # 빌드 상태 확인
    build_status = check_build_status
    report[:stats].merge!(build_status[:stats])
    report[:issues].concat(build_status[:issues])

    # 성능 분석
    performance = analyze_performance
    report[:stats].merge!(performance[:stats])
    report[:warnings].concat(performance[:warnings])

    # SEO 분석
    seo_analysis = analyze_seo
    report[:stats].merge!(seo_analysis[:stats])
    report[:issues].concat(seo_analysis[:issues])
    report[:warnings].concat(seo_analysis[:warnings])

    # 전체 건강도 평가
    report[:overall_health] = calculate_health_score(report)

    # 권장사항 생성
    report[:recommendations] = generate_recommendations(report)

    # 리포트 저장
    save_report(report)

    # 콘솔 출력
    print_report(report)

    report
  end

  private

  def collect_basic_stats
    stats = {}

    # 포스트 수
    if Dir.exist?(@posts_dir)
      stats[:total_posts] = Dir.glob(File.join(@posts_dir, '*.md')).count
    else
      stats[:total_posts] = 0
    end

    # 최근 포스트
    if stats[:total_posts] > 0
      posts = Dir.glob(File.join(@posts_dir, '*.md')).sort.reverse
      latest_post = posts.first
      stats[:latest_post_date] = extract_date_from_filename(latest_post)
      stats[:days_since_last_post] = days_since(extract_date_from_filename(latest_post))
    end

    # 빌드된 사이트 크기
    if Dir.exist?(@site_dir)
      stats[:site_size_mb] = calculate_directory_size(@site_dir)
      stats[:html_files_count] = Dir.glob(File.join(@site_dir, '**/*.html')).count
    end

    stats
  end

  def analyze_posts
    issues = []
    warnings = []
    stats = {}

    return { issues: issues, warnings: warnings, stats: stats } unless Dir.exist?(@posts_dir)

    posts = Dir.glob(File.join(@posts_dir, '*.md'))

    # 포스트 형식 검증
    invalid_posts = []
    posts_without_front_matter = []
    posts_without_content = []

    posts.each do |post|
      filename = File.basename(post)
      content = File.read(post)

      # 파일명 형식 확인
      unless filename.match?(/^\d{4}-\d{2}-\d{2}-.+\.md$/)
        invalid_posts << filename
      end

      # Front matter 확인
      unless content.start_with?('---') && content.include?('title:')
        posts_without_front_matter << filename
      end

      # 내용 확인 (front matter 제외)
      content_without_front_matter = content.gsub(/^---.*?---/m, '').strip
      if content_without_front_matter.empty?
        posts_without_content << filename
      end
    end

    if invalid_posts.any?
      issues << "잘못된 형식의 포스트: #{invalid_posts.join(', ')}"
    end

    if posts_without_front_matter.any?
      issues << "Front matter가 없는 포스트: #{posts_without_front_matter.join(', ')}"
    end

    if posts_without_content.any?
      warnings << "내용이 없는 포스트: #{posts_without_content.join(', ')}"
    end

    # 포스트 통계
    stats[:valid_posts] = posts.count - invalid_posts.count
    stats[:invalid_posts] = invalid_posts.count

    { issues: issues, warnings: warnings, stats: stats }
  end

  def check_build_status
    issues = []
    stats = {}

    # 빌드 시도
    cmd = "cd #{@blog_root} && bundle exec jekyll build --quiet 2>&1"
    stdout, stderr, status = Open3.capture3(cmd)

    if status.success?
      stats[:build_success] = true
      stats[:build_time_seconds] = measure_build_time
    else
      stats[:build_success] = false
      issues << "빌드 실패: #{stderr}"
    end

    # 필수 파일 확인
    required_files = ['index.html', 'feed.xml', 'sitemap.xml']
    missing_files = []

    required_files.each do |file|
      unless File.exist?(File.join(@site_dir, file))
        missing_files << file
      end
    end

    if missing_files.any?
      issues << "누락된 필수 파일: #{missing_files.join(', ')}"
    end

    { issues: issues, stats: stats }
  end

  def analyze_performance
    warnings = []
    stats = {}

    return { warnings: warnings, stats: stats } unless Dir.exist?(@site_dir)

    # 큰 파일 확인
    large_files = []
    Dir.glob(File.join(@site_dir, '**/*')).each do |file|
      if File.file?(file)
        size_mb = File.size(file) / (1024.0 * 1024.0)
        if size_mb > 1.0
          large_files << { file: file.gsub(@site_dir, ''), size_mb: size_mb.round(2) }
        end
      end
    end

    if large_files.any?
      warnings << "큰 파일 발견: #{large_files.map { |f| "#{f[:file]} (#{f[:size_mb]}MB)" }.join(', ')}"
    end

    stats[:large_files_count] = large_files.count
    stats[:largest_file_mb] = large_files.map { |f| f[:size_mb] }.max || 0

    # 빌드 시간 분석
    build_time = measure_build_time
    stats[:build_time_seconds] = build_time

    if build_time > 60
      warnings << "빌드 시간이 오래 걸립니다: #{build_time}초"
    end

    { warnings: warnings, stats: stats }
  end

  def analyze_seo
    issues = []
    warnings = []
    stats = {}

    return { issues: issues, warnings: warnings, stats: stats } unless Dir.exist?(@site_dir)

    index_file = File.join(@site_dir, 'index.html')
    return { issues: issues, warnings: warnings, stats: stats } unless File.exist?(index_file)

    content = File.read(index_file)

    # 기본 SEO 요소 확인
    has_title = content.include?('<title>')
    has_meta_description = content.include?('meta name="description"')
    has_canonical = content.include?('rel="canonical"')
    has_robots = content.include?('robots.txt') || File.exist?(File.join(@site_dir, 'robots.txt'))

    stats[:seo_elements] = {
      title: has_title,
      meta_description: has_meta_description,
      canonical: has_canonical,
      robots: has_robots
    }

    unless has_title
      issues << "페이지 제목이 없습니다"
    end

    unless has_meta_description
      warnings << "메타 설명이 없습니다"
    end

    unless has_canonical
      warnings << "Canonical URL이 없습니다"
    end

    # 피드 확인
    feed_file = File.join(@site_dir, 'feed.xml')
    if File.exist?(feed_file)
      stats[:feed_exists] = true
      stats[:feed_size_kb] = (File.size(feed_file) / 1024.0).round(2)
    else
      stats[:feed_exists] = false
      warnings << "RSS 피드가 없습니다"
    end

    # 사이트맵 확인
    sitemap_file = File.join(@site_dir, 'sitemap.xml')
    if File.exist?(sitemap_file)
      stats[:sitemap_exists] = true
    else
      stats[:sitemap_exists] = false
      warnings << "사이트맵이 없습니다"
    end

    { issues: issues, warnings: warnings, stats: stats }
  end

  def calculate_health_score(report)
    score = 100

    # 이슈당 10점 차감
    score -= report[:issues].count * 10

    # 경고당 5점 차감
    score -= report[:warnings].count * 5

    # 최근 포스트가 오래된 경우
    if report[:stats][:days_since_last_post] && report[:stats][:days_since_last_post] > 30
      score -= 10
    end

    # 빌드 실패 시
    if report[:stats][:build_success] == false
      score = 0
    end

    score = [score, 0].max

    case score
    when 90..100
      'excellent'
    when 70..89
      'good'
    when 50..69
      'fair'
    when 30..49
      'poor'
    else
      'critical'
    end
  end

  def generate_recommendations(report)
    recommendations = []

    # 포스트 관련
    if report[:stats][:days_since_last_post] && report[:stats][:days_since_last_post] > 30
      recommendations << "최근 포스트가 #{report[:stats][:days_since_last_post]}일 전입니다. 새로운 포스트를 작성하는 것을 고려해보세요."
    end

    if report[:stats][:invalid_posts] && report[:stats][:invalid_posts] > 0
      recommendations << "잘못된 형식의 포스트를 수정하세요."
    end

    # 빌드 관련
    if report[:stats][:build_success] == false
      recommendations << "빌드 오류를 수정하세요."
    end

    # 성능 관련
    if report[:stats][:build_time_seconds] && report[:stats][:build_time_seconds] > 60
      recommendations << "빌드 시간이 오래 걸립니다. 불필요한 플러그인이나 큰 이미지를 확인해보세요."
    end

    if report[:stats][:large_files_count] && report[:stats][:large_files_count] > 0
      recommendations << "큰 파일들을 최적화하세요."
    end

    # SEO 관련
    if report[:stats][:seo_elements] && !report[:stats][:seo_elements][:meta_description]
      recommendations << "메타 설명을 추가하세요."
    end

    if report[:stats][:feed_exists] == false
      recommendations << "RSS 피드를 활성화하세요."
    end

    if report[:stats][:sitemap_exists] == false
      recommendations << "사이트맵을 생성하세요."
    end

    recommendations
  end

  def save_report(report)
    File.write(@report_file, JSON.pretty_generate(report))
  end

  def print_report(report)
    puts "\n" + "=" * 60
    puts "📊 블로그 건강도 리포트"
    puts "=" * 60
    puts "생성 시간: #{report[:timestamp]}"
    puts "전체 건강도: #{health_status_emoji(report[:overall_health])} #{report[:overall_health].upcase}"

    puts "\n📈 기본 통계:"
    puts "  • 총 포스트: #{report[:stats][:total_posts]}개"
    if report[:stats][:latest_post_date]
      puts "  • 최근 포스트: #{report[:stats][:latest_post_date]} (#{report[:stats][:days_since_last_post]}일 전)"
    end
    puts "  • 사이트 크기: #{report[:stats][:site_size_mb]}MB" if report[:stats][:site_size_mb]
    puts "  • HTML 파일: #{report[:stats][:html_files_count]}개" if report[:stats][:html_files_count]

    if report[:issues].any?
      puts "\n❌ 문제점:"
      report[:issues].each { |issue| puts "  • #{issue}" }
    end

    if report[:warnings].any?
      puts "\n⚠️  경고:"
      report[:warnings].each { |warning| puts "  • #{warning}" }
    end

    if report[:recommendations].any?
      puts "\n💡 권장사항:"
      report[:recommendations].each { |rec| puts "  • #{rec}" }
    end

    puts "\n" + "=" * 60
  end

  def health_status_emoji(status)
    case status
    when 'excellent' then '🟢'
    when 'good' then '🟡'
    when 'fair' then '🟠'
    when 'poor' then '🔴'
    when 'critical' then '💀'
    else '⚪'
    end
  end

  def extract_date_from_filename(filepath)
    filename = File.basename(filepath)
    if match = filename.match(/^(\d{4}-\d{2}-\d{2})-/)
      match[1]
    end
  end

  def days_since(date_string)
    return nil unless date_string
    date = Date.parse(date_string)
    (Date.today - date).to_i
  end

  def calculate_directory_size(dir_path)
    total_size = 0
    Dir.glob(File.join(dir_path, '**/*')).each do |file|
      total_size += File.size(file) if File.file?(file)
    end
    (total_size / (1024.0 * 1024.0)).round(2)
  end

  def measure_build_time
    start_time = Time.now
    cmd = "cd #{@blog_root} && bundle exec jekyll build --quiet 2>/dev/null"
    system(cmd)
    end_time = Time.now
    (end_time - start_time).round(2)
  end
end

# 스크립트 실행
if __FILE__ == $0
  monitor = BlogMonitor.new
  monitor.generate_health_report
end
