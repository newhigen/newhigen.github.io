document.addEventListener('DOMContentLoaded', function () {
    // 요소들 가져오기
    const searchIcon = document.querySelector('.search-icon');
    const searchPopup = document.getElementById('search-popup');
    const searchInput = document.getElementById('search-input');
    const searchClose = document.getElementById('search-close');
    const searchResults = document.getElementById('search-results');

    // 검색 데이터
    let searchData = [];

    // 검색 팝업 열기
    function openSearch() {
        searchPopup.classList.add('active');
        searchInput.focus();
        loadSearchData();
        // 검색창 상자에서 결과 클래스 제거
        document.querySelector('.search-content').classList.remove('has-results');
    }

    // 검색 팝업 닫기
    function closeSearch() {
        searchPopup.classList.remove('active');
        searchInput.value = '';
        searchResults.innerHTML = '';
        searchResults.classList.remove('has-results');
        document.querySelector('.search-content').classList.remove('has-results');

        // 검색창 크기 초기화
        const searchContent = document.querySelector('.search-content');
        searchContent.style.height = 'auto';
    }

    // 검색 데이터 로드
    async function loadSearchData() {
        try {
            const response = await fetch('/search.json');
            searchData = await response.json();
            console.log('검색 데이터 로드됨:', searchData.length + '개 포스트');
        } catch (error) {
            console.error('검색 데이터 로드 실패:', error);
        }
    }

    // 텍스트 하이라이트 함수
    function highlightText(text, searchTerm) {
        if (!searchTerm) return text;

        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<mark style="background-color: #ffeb3b; padding: 1px 2px; border-radius: 2px;">$1</mark>');
    }

    // Fuzzy search 함수 (Levenshtein distance 기반)
    function fuzzySearch(text, searchTerm) {
        const words = text.toLowerCase().split(/\s+/);
        const searchWords = searchTerm.toLowerCase().split(/\s+/);
        let totalSimilarity = 0;
        let similarWords = [];

        for (const searchWord of searchWords) {
            let bestMatch = null;
            let bestDistance = Infinity;

            for (const word of words) {
                const distance = levenshteinDistance(word, searchWord);
                const maxLength = Math.max(word.length, searchWord.length);
                const similarity = 1 - (distance / maxLength);

                if (similarity > 0.7 && distance < bestDistance) { // 70% 이상 유사한 경우
                    bestMatch = word;
                    bestDistance = distance;
                }
            }

            if (bestMatch) {
                totalSimilarity += (1 - (bestDistance / Math.max(bestMatch.length, searchWord.length)));
                similarWords.push(bestMatch);
            }
        }

        return {
            similarity: totalSimilarity,
            similarWords: similarWords
        };
    }

    // Levenshtein distance 계산 함수
    function levenshteinDistance(str1, str2) {
        const matrix = [];
        const len1 = str1.length;
        const len2 = str2.length;

        for (let i = 0; i <= len2; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= len1; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= len2; i++) {
            for (let j = 1; j <= len1; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[len2][len1];
    }

    // Fuzzy 하이라이트 함수
    function highlightFuzzyText(text, searchTerm, similarWords) {
        if (!similarWords || similarWords.length === 0) return text;

        let result = text;
        for (const word of similarWords) {
            const regex = new RegExp(`(${word})`, 'gi');
            result = result.replace(regex, '<mark class="fuzzy">$1</mark>');
        }
        return result;
    }

    // 검색 실행
    function performSearch(query) {
        if (!query.trim()) {
            searchResults.innerHTML = '';
            searchResults.classList.remove('has-results');
            document.querySelector('.search-content').classList.remove('has-results');
            return;
        }

        const searchTerm = query.toLowerCase();
        const results = searchData.map(post => {
            const title = post.title.toLowerCase();
            const excerpt = post.excerpt.toLowerCase();
            const content = post.content.toLowerCase();
            const fullText = `${post.title} ${post.excerpt} ${post.content}`.toLowerCase();

            // 정확한 매치 확인
            const exactMatch = title.includes(searchTerm) ||
                excerpt.includes(searchTerm) ||
                content.includes(searchTerm);

            // Fuzzy search
            const fuzzyResult = fuzzySearch(fullText, searchTerm);

            return {
                ...post,
                exactMatch: exactMatch,
                fuzzySimilarity: fuzzyResult.similarity,
                similarWords: fuzzyResult.similarWords
            };
        }).filter(post => post.exactMatch || post.fuzzySimilarity > 0);

        // 검색 결과 정렬 (우선순위: 정확한 매치 > 제목 매치 > 발견 횟수 > Fuzzy 유사도 > 날짜)
        results.sort((a, b) => {
            const aTitle = a.title.toLowerCase();
            const bTitle = b.title.toLowerCase();
            const aContent = a.content.toLowerCase();
            const bContent = b.content.toLowerCase();
            const aExcerpt = a.excerpt.toLowerCase();
            const bExcerpt = b.excerpt.toLowerCase();

            // 1. 정확한 매치 여부
            if (a.exactMatch && !b.exactMatch) return -1;
            if (!a.exactMatch && b.exactMatch) return 1;

            // 2. 제목에서 발견 여부
            const aTitleMatch = aTitle.includes(searchTerm);
            const bTitleMatch = bTitle.includes(searchTerm);

            if (aTitleMatch && !bTitleMatch) return -1;
            if (!aTitleMatch && bTitleMatch) return 1;

            // 3. 발견 횟수 계산 (정확한 매치만)
            const aMatches = (aTitle.match(new RegExp(searchTerm, 'gi')) || []).length +
                (aExcerpt.match(new RegExp(searchTerm, 'gi')) || []).length +
                (aContent.match(new RegExp(searchTerm, 'gi')) || []).length;

            const bMatches = (bTitle.match(new RegExp(searchTerm, 'gi')) || []).length +
                (bExcerpt.match(new RegExp(searchTerm, 'gi')) || []).length +
                (bContent.match(new RegExp(searchTerm, 'gi')) || []).length;

            if (aMatches !== bMatches) {
                return bMatches - aMatches;
            }

            // 4. Fuzzy 유사도
            if (a.fuzzySimilarity !== b.fuzzySimilarity) {
                return b.fuzzySimilarity - a.fuzzySimilarity;
            }

            // 5. 날짜 (최신이 우선)
            const aDate = new Date(a.date || '1970-01-01');
            const bDate = new Date(b.date || '1970-01-01');
            return bDate - aDate;
        });

        displayResults(results, searchTerm);
    }

    // 결과 표시
    function displayResults(results, searchTerm) {
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="search-section-divider">일치하는 단어 찾기</div>
                <div style="padding: 20px; text-align: center; color: #666;">검색 결과가 없습니다.</div>
                <div class="search-section-divider">비슷한 단어 찾기</div>
                <div style="padding: 20px; text-align: center; color: #666;">검색 결과가 없습니다.</div>
            `;
            searchResults.classList.add('has-results');
            document.querySelector('.search-content').classList.add('has-results');
            return;
        }

        // 정확한 매치와 fuzzy 매치 분리
        const exactMatches = results.filter(post => {
            const titleMatches = (post.title.match(new RegExp(searchTerm, 'gi')) || []).length;
            const excerptMatches = (post.excerpt.match(new RegExp(searchTerm, 'gi')) || []).length;
            const contentMatches = (post.content.match(new RegExp(searchTerm, 'gi')) || []).length;
            return titleMatches + excerptMatches + contentMatches > 0;
        });

        const fuzzyMatches = results.filter(post => {
            const titleMatches = (post.title.match(new RegExp(searchTerm, 'gi')) || []).length;
            const excerptMatches = (post.excerpt.match(new RegExp(searchTerm, 'gi')) || []).length;
            const contentMatches = (post.content.match(new RegExp(searchTerm, 'gi')) || []).length;
            return titleMatches + excerptMatches + contentMatches === 0 && post.similarWords && post.similarWords.length > 0;
        });

        let html = '';

        // 정확한 매치 결과 (항상 표시)
        html += '<div class="search-section-divider">일치하는 단어 찾기</div>';
        if (exactMatches.length > 0) {
            html += exactMatches.map(post => createResultHTML(post, searchTerm, true)).join('');
        } else {
            html += '<div style="padding: 20px; text-align: center; color: #666;">검색 결과가 없습니다.</div>';
        }

        // Fuzzy 매치 결과 (항상 표시)
        html += '<div class="search-section-divider">비슷한 단어 찾기</div>';
        if (fuzzyMatches.length > 0) {
            html += fuzzyMatches.map(post => createResultHTML(post, searchTerm, false)).join('');
        } else {
            html += '<div style="padding: 20px; text-align: center; color: #666;">검색 결과가 없습니다.</div>';
        }

        searchResults.innerHTML = html;
        searchResults.classList.add('has-results');
        document.querySelector('.search-content').classList.add('has-results');

        // 검색 결과 높이에 따라 검색창 크기 조정
        setTimeout(() => {
            const searchContent = document.querySelector('.search-content');
            const searchResults = document.getElementById('search-results');
            const searchHeader = document.querySelector('.search-header');

            const headerHeight = searchHeader.offsetHeight;
            const resultsHeight = searchResults.scrollHeight;
            const totalHeight = headerHeight + resultsHeight;

            // 최소 높이와 최대 높이 설정
            const minHeight = headerHeight + 100; // 헤더 + 최소 여백
            const maxHeight = window.innerHeight * 0.8; // 화면 높이의 80%

            const targetHeight = Math.max(minHeight, Math.min(totalHeight, maxHeight));
            searchContent.style.height = targetHeight + 'px';
        }, 10);
    }

    // 결과 HTML 생성 함수
    function createResultHTML(post, searchTerm, isExactMatch) {
        // 검색어가 포함된 부분 찾기
        let matchedText = '';
        const searchTermLower = searchTerm.toLowerCase();
        const isTitleMatch = post.title.toLowerCase().includes(searchTermLower);

        // 발견 횟수 계산 (정확한 매치만)
        const titleMatches = (post.title.match(new RegExp(searchTerm, 'gi')) || []).length;
        const excerptMatches = (post.excerpt.match(new RegExp(searchTerm, 'gi')) || []).length;
        const contentMatches = (post.content.match(new RegExp(searchTerm, 'gi')) || []).length;
        const totalMatches = titleMatches + excerptMatches + contentMatches;

        // Fuzzy 매치 정보
        const fuzzyInfo = post.similarWords && post.similarWords.length > 0 ?
            `비슷한 단어 수: ${post.similarWords.length} (${post.similarWords.join(', ')})` : '';

        // 카운트 표시 (정확한 매치가 있으면 그것을, 없으면 fuzzy 정보를)
        const countDisplay = totalMatches > 0 ?
            `일치하는 단어 수: ${totalMatches}` :
            fuzzyInfo;

        if (isTitleMatch) {
            // 제목에서 찾아진 경우 내용 표시하지 않음
            return `
                <div class="search-result" onclick="window.location.href='${post.url}'">
                    <div class="search-result-date">${post.date}</div>
                    <div class="search-result-count">${countDisplay}</div>
                    <div class="search-result-title">${highlightText(post.title, searchTerm)}</div>
                </div>
            `;
        } else if (post.excerpt.toLowerCase().includes(searchTermLower)) {
            matchedText = post.excerpt;
        } else if (post.content.toLowerCase().includes(searchTermLower)) {
            // 내용에서 검색어 주변 텍스트 추출
            const contentLower = post.content.toLowerCase();
            const index = contentLower.indexOf(searchTermLower);
            const start = Math.max(0, index - 50);
            const end = Math.min(post.content.length, index + searchTerm.length + 50);
            matchedText = '...' + post.content.substring(start, end) + '...';
        } else if (post.similarWords && post.similarWords.length > 0) {
            // Fuzzy 매치만 있는 경우
            matchedText = post.excerpt;
        }

        // 하이라이트 적용 (정확한 매치가 있으면 그것을, 없으면 fuzzy 하이라이트)
        const highlightedTitle = totalMatches > 0 ?
            highlightText(post.title, searchTerm) :
            highlightFuzzyText(post.title, searchTerm, post.similarWords);

        const highlightedExcerpt = totalMatches > 0 ?
            highlightText(matchedText || post.excerpt, searchTerm) :
            highlightFuzzyText(matchedText || post.excerpt, searchTerm, post.similarWords);

        return `
            <div class="search-result" onclick="window.location.href='${post.url}'">
                <div class="search-result-date">${post.date}</div>
                <div class="search-result-count">${countDisplay}</div>
                <div class="search-result-title">${highlightedTitle}</div>
                <div class="search-result-excerpt">${highlightedExcerpt}</div>
            </div>
        `;
    }

    // 이벤트 리스너 등록
    searchIcon.addEventListener('click', openSearch);
    searchClose.addEventListener('click', closeSearch);

    // ESC 키로 닫기
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && searchPopup.classList.contains('active')) {
            closeSearch();
        }
    });

    // 팝업 외부 클릭으로 닫기
    searchPopup.addEventListener('click', function (e) {
        if (e.target === searchPopup) {
            closeSearch();
        }
    });

    // 검색 입력 이벤트
    searchInput.addEventListener('input', function () {
        performSearch(this.value);
    });

    // 엔터 키 이벤트
    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch(this.value);
        }
    });
});
