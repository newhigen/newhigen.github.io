#!/usr/bin/env ruby

require 'fileutils'
require 'yaml'
require 'time'

class PostGenerator
  def initialize
    @posts_dir = File.join(Dir.pwd, '_posts')
    @drafts_dir = File.join(Dir.pwd, '_drafts')
  end

  def create_post
    puts "📝 새로운 블로그 포스트 생성"
    puts "=" * 40

    # 포스트 정보 입력받기
    title = get_title
    return if title.nil?

    # 카테고리/태그 입력받기
    categories = get_categories
    tags = get_tags

    # 초안 여부 확인
    draft = ask_draft?

    # 파일명 생성
    filename = generate_filename(title, draft)

    # Front matter 생성
    front_matter = generate_front_matter(title, categories, tags, draft)

    # 파일 생성
    create_post_file(filename, front_matter, draft)

    puts "\n✅ 포스트가 생성되었습니다!"
    puts "파일 위치: #{filename}"

    if draft
      puts "초안 모드입니다. 완성 후 _posts 디렉토리로 이동하세요."
    else
      puts "포스트를 작성하고 저장한 후 다음 명령어로 빌드하세요:"
      puts "  bundle exec jekyll build"
    end
  end

  private

  def get_title
    print "포스트 제목을 입력하세요: "
    title = gets.chomp.strip

    if title.empty?
      puts "❌ 제목을 입력해주세요."
      return nil
    end

    title
  end

  def get_categories
    print "카테고리를 입력하세요 (쉼표로 구분, 없으면 엔터): "
    input = gets.chomp.strip
    return [] if input.empty?

    input.split(',').map(&:strip).reject(&:empty?)
  end

  def get_tags
    print "태그를 입력하세요 (쉼표로 구분, 없으면 엔터): "
    input = gets.chomp.strip
    return [] if input.empty?

    input.split(',').map(&:strip).reject(&:empty?)
  end

  def ask_draft?
    print "초안으로 생성하시겠습니까? (y/N): "
    response = gets.chomp.strip.downcase
    ['y', 'yes'].include?(response)
  end

  def generate_filename(title, draft)
    # 제목을 파일명으로 변환
    safe_title = title.downcase
      .gsub(/[^\w\s-]/, '')  # 특수문자 제거
      .gsub(/\s+/, '-')      # 공백을 하이픈으로
      .gsub(/-+/, '-')       # 연속된 하이픈을 하나로
      .chomp('-')            # 끝의 하이픈 제거

    if draft
      # 초안은 날짜 없이
      File.join(@drafts_dir, "#{safe_title}.md")
    else
      # 일반 포스트는 날짜 포함
      date = Time.now.strftime('%Y-%m-%d')
      File.join(@posts_dir, "#{date}-#{safe_title}.md")
    end
  end

  def generate_front_matter(title, categories, tags, draft)
    front_matter = {
      'layout' => 'post',
      'title' => title,
      'date' => Time.now.strftime('%Y-%m-%d %H:%M:%S %z'),
      'author' => 'newhigen'
    }

    front_matter['categories'] = categories unless categories.empty?
    front_matter['tags'] = tags unless tags.empty?

    if draft
      front_matter['published'] = false
    end

    # YAML로 변환
    front_matter.to_yaml + "---\n\n"
  end

  def create_post_file(filename, front_matter, draft)
    # 디렉토리 생성
    dir = File.dirname(filename)
    FileUtils.mkdir_p(dir) unless Dir.exist?(dir)

    # 파일 생성
    File.write(filename, front_matter)

    # 에디터로 열기 (선택사항)
    if ask_open_editor?
      open_in_editor(filename)
    end
  end

  def ask_open_editor?
    print "에디터로 포스트를 여시겠습니까? (y/N): "
    response = gets.chomp.strip.downcase
    ['y', 'yes'].include?(response)
  end

  def open_in_editor(filename)
    editors = ['code', 'vim', 'nano', 'subl']

    editors.each do |editor|
      if system("which #{editor} > /dev/null 2>&1")
        system("#{editor} #{filename}")
        break
      end
    end
  end
end

# 스크립트 실행
if __FILE__ == $0
  generator = PostGenerator.new
  generator.create_post
end
