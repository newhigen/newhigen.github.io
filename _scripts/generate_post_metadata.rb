#!/usr/bin/env ruby

require 'json'
require 'yaml'
require 'fileutils'

class PostMetadataGenerator
  def initialize
    @posts_dir = File.join(Dir.pwd, '_posts')
    @output_file = File.join(Dir.pwd, 'assets', 'data', 'post_metadata.json')
  end

  def generate
    puts "📝 포스트 메타데이터 생성 중..."

    metadata = {}

    Dir.glob(File.join(@posts_dir, '*.md')).each do |post_file|
      filename = File.basename(post_file, '.md')
      content = File.read(post_file)

      # Front matter와 본문 분리
      if content.start_with?('---')
        parts = content.split('---', 3)
        if parts.length >= 3
          front_matter = YAML.load(parts[1]) rescue {}
          body_content = parts[2]
        else
          front_matter = {}
          body_content = content
        end
      else
        front_matter = {}
        body_content = content
      end

      # 본문에서 HTML 태그 제거하고 순수 텍스트 추출
      clean_content = body_content.gsub(/<[^>]*>/, '').gsub(/\s+/, ' ').strip
      content_length = clean_content.length

      # URL 생성 (Jekyll 규칙에 따라)
      date_part = filename[0..9] # YYYY-MM-DD
      title_part = filename[11..-1] # 나머지 부분

      metadata[title_part] = {
        'filename' => filename,
        'date' => date_part,
        'title' => front_matter['title'] || title_part.gsub('-', ' '),
        'categories' => front_matter['categories'] || [],
        'tags' => front_matter['tags'] || [],
        'content_length' => content_length,
        'is_short' => content_length < 1000
      }
    end

    # JSON 파일로 저장
    FileUtils.mkdir_p(File.dirname(@output_file))
    File.write(@output_file, JSON.pretty_generate(metadata))

    puts "✅ 포스트 메타데이터가 생성되었습니다: #{@output_file}"
    puts "📊 총 #{metadata.length}개의 포스트 처리됨"

    # 짧은 글 통계
    short_posts = metadata.select { |_, data| data['is_short'] }
    puts "📝 짧은 글 (#{short_posts.length}개): #{short_posts.keys.join(', ')}"
  end
end

if __FILE__ == $0
  generator = PostMetadataGenerator.new
  generator.generate
end
