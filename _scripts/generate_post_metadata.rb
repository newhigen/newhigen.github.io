#!/usr/bin/env ruby

require 'json'
require 'yaml'
require 'fileutils'

class PostMetadataGenerator
  def initialize
    @posts_dir = File.join(Dir.pwd, '_posts')
    @output_file = File.join(Dir.pwd, 'assets', 'data', 'post_metadata.json')
    @books_file = File.join(Dir.pwd, 'assets', 'data', 'books.csv')
  end

  def load_books
    books = {}
    if File.exist?(@books_file)
      lines = File.readlines(@books_file)
      headers = lines[0].strip.split(',')

      lines[1..-1].each do |line|
        values = line.strip.split(',')
        title = values[headers.index('title')]&.gsub('"', '')&.strip
        books[title] = true if title
      end
    end
    books
  end

  def extract_book_citations(content, books)
    citations = []

    # 책 제목을 찾는 패턴들
    patterns = [
      /《([^》]+)》/,           # 《책제목》
      /"([^"]+)"\s*\(책\)/,     # "책제목" (책)
      /\*\*([^*]+)\*\*\s*\(책\)/, # **책제목** (책)
      /\[([^\]]+)\]\(책\)/,     # [책제목](책)
    ]

    patterns.each do |pattern|
      content.scan(pattern).each do |match|
        book_title = match[0].strip
        if books[book_title]
          citations << book_title
        end
      end
    end

    # footnote에서 도서 정보 추출
    footnote_pattern = /\[(\^[0-9]+)\]:\s*\[\[도서\]\s*([^,]+),\s*([^,]+),\s*([0-9]+)\]/i
    content.scan(footnote_pattern).each do |match|
      footnote_num = match[0]
      book_title = match[1].strip
      author = match[2].strip
      year = match[3].strip

      # 책 목록에서 해당 책 찾기
      if books[book_title]
        citations << book_title
      end
    end

    citations.uniq
  end

  def generate
    puts "📝 포스트 메타데이터 생성 중..."

    # 책 목록 로드
    books = load_books
    puts "📚 #{books.length}권의 책 정보 로드됨"

    metadata = {}
    book_citation_count = Hash.new(0)

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

      # 책 인용 추출
      citations = extract_book_citations(body_content, books)
      citations.each { |book| book_citation_count[book] += 1 }

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
        'is_short' => content_length < 1000,
        'book_citations' => citations
      }
    end

    # 책 인용 통계 추가
    metadata['_book_citation_stats'] = book_citation_count

    # JSON 파일로 저장
    FileUtils.mkdir_p(File.dirname(@output_file))
    File.write(@output_file, JSON.pretty_generate(metadata))

    puts "✅ 포스트 메타데이터가 생성되었습니다: #{@output_file}"
    puts "📊 총 #{metadata.length - 1}개의 포스트 처리됨" # _book_citation_stats 제외

    # 짧은 글 통계
    short_posts = metadata.select { |key, data| key != '_book_citation_stats' && data['is_short'] }
    puts "📝 짧은 글 (#{short_posts.length}개): #{short_posts.keys.join(', ')}"

    # 책 인용 통계
    puts "📚 책 인용 통계:"
    book_citation_count.sort_by { |_, count| -count }.each do |book, count|
      puts "  - #{book}: #{count}회 인용"
    end
  end
end

if __FILE__ == $0
  generator = PostMetadataGenerator.new
  generator.generate
end
