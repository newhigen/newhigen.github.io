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
    }

    // 검색 팝업 닫기
    function closeSearch() {
        searchPopup.classList.remove('active');
        searchInput.value = '';
        searchResults.innerHTML = '';
        searchResults.classList.remove('has-results');
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

    // 검색 실행
    function performSearch(query) {
        if (!query.trim()) {
            searchResults.innerHTML = '';
            searchResults.classList.remove('has-results');
            return;
        }

        const searchTerm = query.toLowerCase();
        const results = searchData.filter(post => {
            const title = post.title.toLowerCase();
            const excerpt = post.excerpt.toLowerCase();
            const content = post.content.toLowerCase();

            return title.includes(searchTerm) ||
                excerpt.includes(searchTerm) ||
                content.includes(searchTerm);
        });

        displayResults(results, searchTerm);
    }

    // 결과 표시
    function displayResults(results, searchTerm) {
        if (results.length === 0) {
            searchResults.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">검색 결과가 없습니다.</div>';
            searchResults.classList.add('has-results');
            return;
        }

        const html = results.map(post => {
            // 검색어가 포함된 부분 찾기
            let matchedText = '';
            const searchTermLower = searchTerm.toLowerCase();

            if (post.title.toLowerCase().includes(searchTermLower)) {
                matchedText = post.title;
            } else if (post.excerpt.toLowerCase().includes(searchTermLower)) {
                matchedText = post.excerpt;
            } else if (post.content.toLowerCase().includes(searchTermLower)) {
                // 내용에서 검색어 주변 텍스트 추출
                const contentLower = post.content.toLowerCase();
                const index = contentLower.indexOf(searchTermLower);
                const start = Math.max(0, index - 50);
                const end = Math.min(post.content.length, index + searchTerm.length + 50);
                matchedText = '...' + post.content.substring(start, end) + '...';
            }

            return `
                <div class="search-result" onclick="window.location.href='${post.url}'">
                    <div class="search-result-title">${highlightText(post.title, searchTerm)}</div>
                    <div class="search-result-excerpt">${highlightText(matchedText || post.excerpt, searchTerm)}</div>
                </div>
            `;
        }).join('');

        searchResults.innerHTML = html;
        searchResults.classList.add('has-results');
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
