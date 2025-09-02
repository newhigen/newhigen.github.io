def fix_body_newlines(body)
  # 빈 줄로 구분된 문단들을 찾아서 처리
  paragraphs = body.split(/\n\s*\n/)

  fixed_paragraphs = paragraphs.map do |paragraph|
    lines = paragraph.strip.split("\n")

    # 빈 문단이나 한 줄만 있는 문단은 그대로 반환
    if lines.empty? || lines.length == 1
      paragraph
    # 제목 줄(#으로 시작하는 줄)은 건드리지 않음
    elsif lines.first.strip.start_with?('#')
      paragraph
    else
      # 일반 문단인 경우 문장들을 하나로 합침
      # 단, 리스트 항목(-, *, 숫자로 시작하는 줄)은 건드리지 않음
      # 각주([^숫자])도 건드리지 않음
      # 링크 참조도 건드리지 않음

      sentences = []
      current_sentence = ""

      lines.each do |line|
        line = line.strip
        next if line.empty?

        # 리스트 항목, 각주, 링크 참조 등은 건드리지 않음
        if line.start_with?('-', '*', /\d+\./, '[^', '[[', '---', '|', '```')
          # 이전 문장이 있으면 저장
          if !current_sentence.empty?
            sentences << current_sentence.strip
            current_sentence = ""
          end
          sentences << line
        else
          # 일반 문장인 경우 이어붙이기
          if current_sentence.empty?
            current_sentence = line
          else
            current_sentence += " " + line
          end
        end
      end

      # 마지막 문장 처리
      if !current_sentence.empty?
        sentences << current_sentence.strip
      end

      sentences.join("\n")
    end
  end

  # 추가: 연속된 빈 줄을 하나로 합치고, 문단 내 연속 문장들을 더 정확하게 처리
  result = fixed_paragraphs.join("\n\n")

  # 문단 내에서 연속된 문장들을 찾아서 합치기 (더 세밀한 처리)
  result = result.gsub(/([^#\n])\n([^#\-\*\d\[\|\`\n])/) { "#{$1} #{$2}" }
  result = result.gsub(/([^#\n])\n([^#\-\*\d\[\|\`\n])/) { "#{$1} #{$2}" } # 한 번 더 실행

  result
end
