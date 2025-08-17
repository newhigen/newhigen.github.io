document.addEventListener('DOMContentLoaded', function () {
    // 요소들 가져오기
    const searchIcon = document.querySelector('.search-icon');
    const searchPopup = document.getElementById('search-popup');
    const searchInput = document.getElementById('search-input');
    const searchClose = document.getElementById('search-close');
    const searchResults = document.getElementById('search-results');

    // 검색 데이터
    let searchData = [];

    // 유의어 API 엔드포인트 (무료 서비스 사용)
    const SYNONYM_API_ENDPOINTS = {
        // Datamuse API (무료, 영어 유의어)
        datamuse: 'https://api.datamuse.com/words?rel_syn=',
        // Free Dictionary API (무료, 영어 정의 및 유의어)
        freedictionary: 'https://api.dictionaryapi.dev/api/v2/entries/en/',
        // 한국어 유의어 API (무료)
        korean: {
            // 국립국어원 한국어기초사전 API (무료, API 키 필요)
            krdict: 'https://krdict.korean.go.kr/api/search',
            // 네이버 사전 API (무료, API 키 필요)
            naver: 'https://openapi.naver.com/v1/papago/n2mt',
            // 간단한 한국어 유의어 매핑 (API 키 불필요)
            simple: null
        }
    };

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

    // 유의어 검색 함수 (무료 API 사용)
    async function findSynonyms(searchTerm) {
        const synonyms = [];
        const searchWords = searchTerm.toLowerCase().split(/\s+/);

        for (const word of searchWords) {
            try {
                // 영어 단어인지 확인 (간단한 정규식)
                if (/^[a-zA-Z]+$/.test(word)) {
                    // Datamuse API 사용 (무료)
                    const response = await fetch(`${SYNONYM_API_ENDPOINTS.datamuse}${word}&max=10`);
                    if (response.ok) {
                        const data = await response.json();
                        const wordSynonyms = data.map(item => item.word);
                        synonyms.push(...wordSynonyms);
                    }

                    // Free Dictionary API 사용 (무료)
                    try {
                        const dictResponse = await fetch(`${SYNONYM_API_ENDPOINTS.freedictionary}${word}`);
                        if (dictResponse.ok) {
                            const dictData = await dictResponse.json();
                            if (dictData[0] && dictData[0].meanings) {
                                for (const meaning of dictData[0].meanings) {
                                    if (meaning.synonyms) {
                                        synonyms.push(...meaning.synonyms);
                                    }
                                }
                            }
                        }
                    } catch (dictError) {
                        console.log('Free Dictionary API 오류:', dictError);
                    }
                } else {
                    // 한국어 단어 처리
                    const koreanSynonyms = await getKoreanSynonyms(word);
                    synonyms.push(...koreanSynonyms);
                }
            } catch (error) {
                console.log('유의어 검색 오류:', error);
            }
        }

        return [...new Set(synonyms)]; // 중복 제거
    }

    // 한국어 유의어 검색 (무료 API + 간단 매핑)
    async function getKoreanSynonyms(word) {
        const synonyms = [];

        try {
            // 1. 간단한 매핑 (API 키 불필요)
            const simpleSynonyms = getSimpleKoreanSynonyms(word);
            synonyms.push(...simpleSynonyms);

            // 2. 국립국어원 API 시도 (API 키가 있는 경우)
            const krdictSynonyms = await getKrdictSynonyms(word);
            synonyms.push(...krdictSynonyms);

            // 3. 네이버 사전 API 시도 (API 키가 있는 경우)
            // const naverSynonyms = await getNaverSynonyms(word);
            // synonyms.push(...naverSynonyms);

        } catch (error) {
            console.log('한국어 유의어 검색 오류:', error);
        }

        return [...new Set(synonyms)]; // 중복 제거
    }

    // 간단한 한국어 유의어 매핑 (API 키 불필요)
    function getSimpleKoreanSynonyms(word) {
        const koreanSynonyms = {
            // 감정 관련
            '행복': ['기쁨', '즐거움', '만족', '희열', '환희', '즐거움', '기쁨'],
            '슬픔': ['우울', '비통', '애도', '비탄', '절망', '슬픔', '우울함'],
            '사랑': ['애정', '정', '연정', '애착', '호감', '사랑', '애정'],
            '기쁨': ['행복', '즐거움', '환희', '희열', '기쁨', '즐거움'],
            '우울': ['슬픔', '비통', '절망', '우울함', '슬픔'],

            // 학습/지식 관련
            '학습': ['공부', '교육', '훈련', '습득', '익힘', '학습', '공부'],
            '지식': ['학문', '정보', '지혜', '교양', '학식', '지식', '정보'],
            '독서': ['읽기', '책읽기', '문학', '독서법', '읽는법', '독서'],
            '공부': ['학습', '교육', '훈련', '습득', '익힘', '공부'],
            '교육': ['학습', '훈련', '가르침', '지도', '교육'],

            // 성장/발전 관련
            '성장': ['발전', '진보', '향상', '발달', '성숙', '성장', '발전'],
            '발전': ['성장', '진보', '향상', '발달', '발전', '성장'],
            '진보': ['발전', '성장', '향상', '진보', '발전'],
            '향상': ['개선', '발전', '성장', '향상', '개선'],

            // 경험/생활 관련
            '경험': ['체험', '경험담', '지식', '노하우', '경력', '경험'],
            '체험': ['경험', '실험', '시도', '체험', '경험'],
            '인생': ['삶', '생애', '인생관', '세상', '세월', '인생'],
            '삶': ['인생', '생애', '세상', '삶', '인생'],

            // 건강/신체 관련
            '건강': ['웰빙', '피트니스', '운동', '건강관리', '체력', '건강'],
            '운동': ['스포츠', '피트니스', '건강', '운동', '스포츠'],
            '체력': ['건강', '힘', '체력', '건강'],

            // 사고/정신 관련
            '생각': ['사고', '고민', '반성', '성찰', '명상', '생각'],
            '사고': ['생각', '고민', '반성', '사고', '생각'],
            '고민': ['생각', '사고', '고민', '생각'],

            // 목표/계획 관련
            '목표': ['계획', '꿈', '비전', '야망', '희망', '목표'],
            '계획': ['목표', '계획', '목표'],
            '꿈': ['목표', '희망', '꿈', '목표'],

            // 성공/실패 관련
            '성공': ['달성', '이룸', '성취', '달성', '완수', '성공'],
            '실패': ['좌절', '낙담', '실망', '좌절감', '패배', '실패'],
            '성취': ['성공', '달성', '완수', '성취', '성공'],

            // 도전/용기 관련
            '도전': ['시도', '모험', '도전정신', '용기', '과감함', '도전'],
            '용기': ['도전', '과감함', '용기', '도전'],
            '시도': ['도전', '시도', '도전'],

            // 시간 관련
            '시간': ['세월', '기간', '시기', '순간', '때', '시간'],
            '세월': ['시간', '세월', '시간'],
            '기간': ['시간', '기간', '시간'],

            // 경제/재정 관련
            '돈': ['자금', '재산', '경제', '재정', '수입', '돈'],
            '자금': ['돈', '재산', '경제', '자금', '돈'],
            '경제': ['돈', '재정', '경제', '돈'],

            // 일/직업 관련
            '일': ['업무', '직장', '일터', '직업', '생업', '일'],
            '업무': ['일', '직장', '업무', '일'],
            '직장': ['일', '업무', '직장', '일'],
            '직업': ['일', '생업', '직업', '일'],

            // 관계/사회 관련
            '관계': ['인맥', '사교', '친분', '연줄', '네트워크', '관계'],
            '인맥': ['관계', '연줄', '인맥', '관계'],
            '친분': ['관계', '친분', '관계'],

            // 의미/가치 관련
            '의미': ['가치', '중요성', '의의', '함의', '뜻', '의미'],
            '가치': ['의미', '중요성', '가치', '의미'],
            '중요성': ['의미', '가치', '중요성', '의미'],

            // 기타 자주 사용되는 단어들
            '문제': ['이슈', '과제', '문제', '이슈'],
            '해결': ['해결', '처리', '해결'],
            '방법': ['방법', '수단', '방법'],
            '이유': ['이유', '원인', '이유'],
            '결과': ['결과', '성과', '결과'],
            '변화': ['변화', '변경', '변화'],
            '개선': ['개선', '향상', '개선'],
            '발견': ['발견', '찾음', '발견'],
            '이해': ['이해', '앎', '이해'],
            '배움': ['학습', '공부', '배움'],
            '성장': ['발전', '진보', '성장'],
            '경험': ['체험', '경험', '체험'],
            '지식': ['학문', '정보', '지식'],
            '생각': ['사고', '고민', '생각'],
            '목표': ['계획', '꿈', '목표'],
            '성공': ['달성', '성취', '성공'],
            '실패': ['좌절', '실패', '좌절'],
            '도전': ['시도', '용기', '도전'],
            '인생': ['삶', '생애', '인생'],
            '시간': ['세월', '기간', '시간'],
            '돈': ['자금', '경제', '돈'],
            '일': ['업무', '직장', '일'],
            '관계': ['인맥', '친분', '관계'],
            '의미': ['가치', '중요성', '의미']
        };

        return koreanSynonyms[word] || [];
    }

    // 국립국어원 API 사용 (API 키 필요)
    async function getKrdictSynonyms(word) {
        // API 키를 여기에 입력하세요
        const API_KEY = 'your_api_key_here'; // 발급받은 API 키로 교체

        if (API_KEY === 'your_api_key_here') {
            return []; // API 키가 설정되지 않은 경우 빈 배열 반환
        }

        try {
            const response = await fetch(
                `${SYNONYM_API_ENDPOINTS.korean.krdict}?key=${API_KEY}&q=${encodeURIComponent(word)}&type=search&part=word&sort=dict`
            );

            if (response.ok) {
                const data = await response.json();
                const synonyms = [];

                // 응답에서 유의어 추출
                if (data.channel && data.channel.item) {
                    for (const item of data.channel.item) {
                        if (item.sense && item.sense.length > 0) {
                            for (const sense of item.sense) {
                                if (sense.synonym) {
                                    synonyms.push(...sense.synonym.split('|'));
                                }
                            }
                        }
                    }
                }

                return synonyms.filter(s => s.trim() !== '');
            }
        } catch (error) {
            console.log('국립국어원 API 오류:', error);
        }

        return [];
    }

    // 네이버 사전 API 사용 (API 키 필요)
    async function getNaverSynonyms(word) {
        // API 키가 필요한 경우 사용
        // const CLIENT_ID = 'your_client_id_here';
        // const CLIENT_SECRET = 'your_client_secret_here';
        // 구현 예정
        return [];
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

    // 유의어 하이라이트 함수
    function highlightSynonymText(text, searchTerm, synonymWords) {
        if (!synonymWords || synonymWords.length === 0) return text;

        let result = text;
        for (const word of synonymWords) {
            const regex = new RegExp(`(${word})`, 'gi');
            result = result.replace(regex, '<mark class="synonym">$1</mark>');
        }
        return result;
    }

    // 검색 실행
    async function performSearch(query) {
        if (!query.trim()) {
            searchResults.innerHTML = '';
            searchResults.classList.remove('has-results');
            document.querySelector('.search-content').classList.remove('has-results');
            return;
        }

        const searchTerm = query.toLowerCase();

        // 유의어 찾기 (비동기)
        const synonyms = await findSynonyms(searchTerm);

        const results = searchData.map(post => {
            const title = post.title.toLowerCase();
            const excerpt = post.excerpt.toLowerCase();
            const content = post.content.toLowerCase();
            const fullText = `${post.title} ${post.excerpt} ${post.content}`.toLowerCase();

            // 정확한 매치 확인
            const exactMatch = title.includes(searchTerm) ||
                excerpt.includes(searchTerm) ||
                content.includes(searchTerm);

            // 유의어 매치 확인
            let synonymMatch = false;
            let synonymWords = [];
            if (synonyms.length > 0) {
                for (const synonym of synonyms) {
                    if (title.includes(synonym) || excerpt.includes(synonym) || content.includes(synonym)) {
                        synonymMatch = true;
                        synonymWords.push(synonym);
                    }
                }
            }

            // Fuzzy search
            const fuzzyResult = fuzzySearch(fullText, searchTerm);

            return {
                ...post,
                exactMatch: exactMatch,
                synonymMatch: synonymMatch,
                synonymWords: synonymWords,
                fuzzySimilarity: fuzzyResult.similarity,
                similarWords: fuzzyResult.similarWords
            };
        }).filter(post => post.exactMatch || post.synonymMatch || post.fuzzySimilarity > 0);

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
                <div class="search-section-divider">일치하는 단어 찾기 (0개)</div>
                <div class="search-section search-section-exact">
                    <div style="padding: 20px; text-align: center; color: #666;">검색 결과가 없습니다.</div>
                </div>
                <div class="search-section-divider">유의어 찾기 (0개)</div>
                <div class="search-section search-section-synonym">
                    <div style="padding: 20px; text-align: center; color: #666;">검색 결과가 없습니다.</div>
                </div>
                <div class="search-section-divider">비슷한 단어 찾기 (0개)</div>
                <div class="search-section search-section-fuzzy">
                    <div style="padding: 20px; text-align: center; color: #666;">검색 결과가 없습니다.</div>
                </div>
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

        const synonymMatches = results.filter(post => {
            const titleMatches = (post.title.match(new RegExp(searchTerm, 'gi')) || []).length;
            const excerptMatches = (post.excerpt.match(new RegExp(searchTerm, 'gi')) || []).length;
            const contentMatches = (post.content.match(new RegExp(searchTerm, 'gi')) || []).length;
            return titleMatches + excerptMatches + contentMatches === 0 && post.synonymMatch;
        });

        const fuzzyMatches = results.filter(post => {
            const titleMatches = (post.title.match(new RegExp(searchTerm, 'gi')) || []).length;
            const excerptMatches = (post.excerpt.match(new RegExp(searchTerm, 'gi')) || []).length;
            const contentMatches = (post.content.match(new RegExp(searchTerm, 'gi')) || []).length;
            return titleMatches + excerptMatches + contentMatches === 0 &&
                !post.synonymMatch &&
                post.similarWords && post.similarWords.length > 0;
        });

        let html = '';

        // 정확한 매치 결과 (항상 표시)
        const exactCount = exactMatches.length > 0 ? ` (${exactMatches.length}개)` : '';
        html += `<div class="search-section-divider">일치하는 단어 찾기${exactCount}</div>`;
        html += '<div class="search-section search-section-exact">';
        if (exactMatches.length > 0) {
            html += exactMatches.map((post, index) => createResultHTML(post, searchTerm, true, index + 1)).join('');
        } else {
            html += '<div style="padding: 20px; text-align: center; color: #666;">검색 결과가 없습니다.</div>';
        }
        html += '</div>';

        // 유의어 매치 결과 (항상 표시)
        const synonymCount = synonymMatches.length > 0 ? ` (${synonymMatches.length}개)` : '';
        html += `<div class="search-section-divider">유의어 찾기${synonymCount}</div>`;
        html += '<div class="search-section search-section-synonym">';
        if (synonymMatches.length > 0) {
            html += synonymMatches.map((post, index) => createResultHTML(post, searchTerm, false, exactMatches.length + index + 1, true)).join('');
        } else {
            html += '<div style="padding: 20px; text-align: center; color: #666;">검색 결과가 없습니다.</div>';
        }
        html += '</div>';

        // Fuzzy 매치 결과 (항상 표시)
        const fuzzyCount = fuzzyMatches.length > 0 ? ` (${fuzzyMatches.length}개)` : '';
        html += `<div class="search-section-divider">비슷한 단어 찾기${fuzzyCount}</div>`;
        html += '<div class="search-section search-section-fuzzy">';
        if (fuzzyMatches.length > 0) {
            html += fuzzyMatches.map((post, index) => createResultHTML(post, searchTerm, false, exactMatches.length + synonymMatches.length + index + 1)).join('');
        } else {
            html += '<div style="padding: 20px; text-align: center; color: #666;">검색 결과가 없습니다.</div>';
        }
        html += '</div>';

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
    function createResultHTML(post, searchTerm, isExactMatch, index, isSynonymMatch = false) {
        // 검색어가 포함된 부분 찾기
        let matchedText = '';
        const searchTermLower = searchTerm.toLowerCase();
        const isTitleMatch = post.title.toLowerCase().includes(searchTermLower);

        // 유의어 매치에서 제목에 유의어가 있는지 확인
        const isTitleSynonymMatch = !isTitleMatch && post.synonymWords &&
            post.synonymWords.some(word => post.title.toLowerCase().includes(word.toLowerCase()));

        // Fuzzy 매치에서 제목에 비슷한 단어가 있는지 확인
        const isTitleFuzzyMatch = !isTitleMatch && !isTitleSynonymMatch && post.similarWords &&
            post.similarWords.some(word => post.title.toLowerCase().includes(word.toLowerCase()));

        // 발견 횟수 계산 (정확한 매치만)
        const titleMatches = (post.title.match(new RegExp(searchTerm, 'gi')) || []).length;
        const excerptMatches = (post.excerpt.match(new RegExp(searchTerm, 'gi')) || []).length;
        const contentMatches = (post.content.match(new RegExp(searchTerm, 'gi')) || []).length;
        const totalMatches = titleMatches + excerptMatches + contentMatches;

        // 유의어 매치 정보
        const synonymInfo = post.synonymWords && post.synonymWords.length > 0 ?
            `유의어 수: ${post.synonymWords.length} (${post.synonymWords.join(', ')})` : '';

        // Fuzzy 매치 정보
        const fuzzyInfo = post.similarWords && post.similarWords.length > 0 ?
            `비슷한 단어 수: ${post.similarWords.length} (${post.similarWords.join(', ')})` : '';

        // 카운트 표시 (우선순위: 정확한 매치 > 유의어 > fuzzy)
        let countDisplay = '';
        if (totalMatches > 0) {
            countDisplay = `일치하는 단어 수: ${totalMatches}`;
        } else if (post.synonymWords && post.synonymWords.length > 0) {
            countDisplay = synonymInfo;
        } else {
            countDisplay = fuzzyInfo;
        }

        if (isTitleMatch || isTitleSynonymMatch || isTitleFuzzyMatch) {
            // 제목에서 찾아진 경우 (정확한 매치, 유의어, 또는 fuzzy 매치) 내용 표시하지 않음
            let highlightedTitle;
            if (totalMatches > 0) {
                highlightedTitle = highlightText(post.title, searchTerm);
            } else if (post.synonymWords && post.synonymWords.length > 0) {
                highlightedTitle = highlightSynonymText(post.title, searchTerm, post.synonymWords);
            } else {
                highlightedTitle = highlightFuzzyText(post.title, searchTerm, post.similarWords);
            }

            return `
                <div class="search-result" onclick="window.location.href='${post.url}'">
                    <div class="search-result-date">${post.date}</div>
                    <div class="search-result-count">${countDisplay}</div>
                    <div class="search-result-index">${index}</div>
                    <div class="search-result-title">${highlightedTitle}</div>
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

        // 하이라이트 적용 (우선순위: 정확한 매치 > 유의어 > fuzzy)
        let highlightedTitle, highlightedExcerpt;

        if (totalMatches > 0) {
            highlightedTitle = highlightText(post.title, searchTerm);
            highlightedExcerpt = highlightText(matchedText || post.excerpt, searchTerm);
        } else if (post.synonymWords && post.synonymWords.length > 0) {
            highlightedTitle = highlightSynonymText(post.title, searchTerm, post.synonymWords);
            highlightedExcerpt = highlightSynonymText(matchedText || post.excerpt, searchTerm, post.synonymWords);
        } else {
            highlightedTitle = highlightFuzzyText(post.title, searchTerm, post.similarWords);
            highlightedExcerpt = highlightFuzzyText(matchedText || post.excerpt, searchTerm, post.similarWords);
        }

        return `
            <div class="search-result" onclick="window.location.href='${post.url}'">
                <div class="search-result-date">${post.date}</div>
                <div class="search-result-count">${countDisplay}</div>
                <div class="search-result-index">${index}</div>
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
        performSearch(this.value).catch(error => {
            console.error('검색 오류:', error);
        });
    });

    // 엔터 키 이벤트
    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch(this.value).catch(error => {
                console.error('검색 오류:', error);
            });
        }
    });
});
