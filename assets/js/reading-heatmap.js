/* ========================================
   독서 히트맵 JavaScript
   ======================================== */

// ========================================
// 1. 전역 변수 및 데이터 관리
// ========================================

let readingData = {};        // 히트맵 데이터 (년월별 책 개수)
let booksList = [];          // 전체 책 목록
let postMetadata = {};       // 포스트 메타데이터 (길이 정보 포함)

// ========================================
// 2. 초기화 및 데이터 로드
// ========================================

/**
 * CSV 문자열을 파싱하여 객체 배열로 변환합니다.
 * @param {string} csv - CSV 문자열
 * @returns {Array} 파싱된 객체 배열
 */
function parseCSV(csv) {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const obj = {};

        for (let j = 0; j < headers.length; j++) {
            let value = values[j] || '';

            // 따옴표로 감싸진 값 처리
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }

            // 숫자 변환
            if (headers[j] === 'year' || headers[j] === 'month') {
                value = parseInt(value) || 0;
            }



            obj[headers[j]] = value;
        }
        result.push(obj);
    }

    return result;
}

/**
 * 페이지 로드 시 실행되는 메인 함수
 * 모든 데이터를 로드하고 UI를 초기화합니다.
 */
async function loadBooksData() {
    try {
        // 1. CSV 파일에서 책 데이터 로드
        const response = await fetch('/assets/data/books.csv');
        const csvText = await response.text();
        booksList = parseCSV(csvText);

        // 2. 포스트 메타데이터 로드
        const metadataResponse = await fetch('/assets/data/post_metadata.json');
        postMetadata = await metadataResponse.json();

        // 3. 히트맵 데이터 생성
        generateHeatmapData();

        // 4. 히트맵 생성
        createHeatmap();

        // 5. 책 목록 생성
        generateBooksList();

        // 6. 총 책 수 업데이트
        updateTotalBooks();
    } catch (error) {
        console.error('책 데이터를 로드하는 중 오류가 발생했습니다:', error);
    }
}

// ========================================
// 3. 포스트 길이 확인 및 제목 가져오기
// ========================================

/**
 * 포스트의 실제 제목을 가져옵니다.
 * @param {string} postKey - 포스트 키
 * @returns {string} 실제 제목
 */
function getPostTitle(postKey) {
    // 실제 제목 매핑
    const titleMap = {
        'infj-doctor': 'INFJ 의사의 병원 일기',
        'stare-at-professional': '전문가의 표정',
        '25-seasons': '내게 남은 스물다섯 번의 계절',
        'useful-macos-apps': '유용한 맥OS 앱들',
        'health-newbie': '헬스는 쪼렙입니다만',
        'running-story': '달리기를 말할 때 내가 하고 싶은 이야기',
        'writing-model': '글쓰기',
        'how-to-read': '독서법',
        'note-premium': '노트의 품격',
        'one-life': '단 한 번의 삶',
        'fake-senior-junior': '시니어처럼 보이고 싶은 주니어 - 인지적 편향 부수기 (2)',
        'experience-and-knowledge': '경험 + 지식 = 숙련',
        'appreciation-as-word': 'Appreciation as Word',
        'power-n-and-power-s': '파워 N과 파워 S가 결혼하면',
        'breaking-bias': '책을 고르는 시야 - 인지적 편향 부수기 (1)',
        'moral-uncertainty': '불확실성과 개인의 한계에서의 도덕적 선택',
        'did-i-understand': '안다는 착각'
    };

    return titleMap[postKey] || postMetadata[postKey]?.title || postKey;
}

/**
 * 포스트가 짧은 포스트인지 확인 (JSON 메타데이터 사용)
 * @param {string} postName - 포스트 URL
 * @returns {boolean} 짧은 포스트 여부
 */
function isShortPost(postName) {
    // JSON 메타데이터에서 확인
    return postMetadata[postName] ? postMetadata[postName].is_short : false;
}

// ========================================
// 4. 히트맵 데이터 생성
// ========================================

/**
 * 책 목록에서 히트맵 데이터를 생성합니다.
 * 년월별로 읽은 책의 개수를 계산합니다.
 */
function generateHeatmapData() {
    readingData = {};

    booksList.forEach(book => {
        const key = `${book.year}-${book.month.toString().padStart(2, '0')}`;
        readingData[key] = (readingData[key] || 0) + 1;
    });
}

// ========================================
// 5. 히트맵 UI 생성
// ========================================

/**
 * 히트맵을 생성하고 화면에 표시합니다.
 * GitHub 스타일의 히트맵을 구현합니다.
 */
function createHeatmap() {
    const container = document.getElementById('reading-heatmap');
    const currentYear = new Date().getFullYear();
    const startYear = 2022;

    // 히트맵과 라벨을 감싸는 컨테이너
    const heatmapWrapper = document.createElement('div');
    heatmapWrapper.style.cssText = 'display: flex; align-items: flex-start; gap: 8px; justify-content: center; flex-wrap: wrap; width: 100%;';

    // 년도별 라벨 추가 (왼쪽에 세로로 배치)
    const yearLabels = document.createElement('div');
    yearLabels.className = 'year-labels';

    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월',
        '7월', '8월', '9월', '10월', '11월', '12월'];

    // 화면 크기에 따라 셀 크기 결정
    const isMobile = window.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 480;
    const cellSize = isSmallMobile ? 12 : (isMobile ? 14 : 16);
    const fontSize = isSmallMobile ? 8 : (isMobile ? 9 : 10);

    // 년도 라벨 생성 (내림차순: 2025 → 2024)
    for (let year = currentYear; year >= startYear; year--) {
        const yearLabel = document.createElement('div');
        yearLabel.style.cssText = `height: ${cellSize}px; line-height: ${cellSize}px; text-align: right; font-size: ${fontSize}px; color: #586069; font-weight: 500; padding-right: 8px; display: flex; align-items: center; justify-content: flex-end; margin: 0; box-sizing: border-box;`;
        yearLabel.textContent = `${year}`;
        yearLabels.appendChild(yearLabel);
    }

    // 히트맵 행들을 담을 컨테이너
    const heatmapRows = document.createElement('div');
    heatmapRows.style.cssText = 'display: flex; flex-direction: column; gap: 4px; align-items: flex-start; justify-content: flex-start;';

    // 년도별로 행 생성 (내림차순: 2025 → 2024)
    for (let year = currentYear; year >= startYear; year--) {
        const row = document.createElement('div');
        row.className = 'heatmap-row';
        row.style.cssText = 'display: flex; gap: 4px; align-items: center;';

        // 12개월 셀 생성
        for (let month = 1; month <= 12; month++) {
            const cell = document.createElement('div');
            cell.className = 'heatmap-cell';
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;

            // 현재 날짜 확인
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth() + 1;

            // 미래의 달인지 확인
            const isFutureMonth = (year > currentYear) || (year === currentYear && month > currentMonth);

            if (isFutureMonth) {
                // 미래의 달은 비워둠
                cell.style.visibility = 'hidden';
                cell.title = '';
            } else {
                // 과거/현재 달만 데이터 표시
                const key = `${year}-${month.toString().padStart(2, '0')}`;
                const count = readingData[key] || 0;

                // 레벨 결정 (0-4) - GitHub 스타일
                let level = 0;
                if (count > 0) {
                    if (count === 1) level = 1;
                    else if (count <= 2) level = 2;
                    else if (count <= 3) level = 3;
                    else level = 4;
                }

                if (level > 0) {
                    cell.classList.add(`level-${level}`);
                }

                // 책 목록 표시 기능 추가
                if (count > 0) {
                    const booksInMonth = booksList.filter(book =>
                        book.year === year && book.month === month
                    );

                    // hover 이벤트 추가
                    cell.addEventListener('mouseenter', function () {
                        showBookList(cell, booksInMonth, year, monthNames[month - 1]);
                    });

                    cell.addEventListener('mouseleave', function () {
                        hideBookList();
                    });
                }
            }

            row.appendChild(cell);
        }

        // 년도별 책 수 계산
        const yearBooks = booksList.filter(book => book.year === year).length;

        // 년도별 책 수 표시 (행 끝에) - 모든 화면에서 표시
        const yearCount = document.createElement('div');
        yearCount.style.cssText = `font-size: ${fontSize}px; color: #586069; font-weight: 400; text-align: right; min-width: 30px;`;
        yearCount.textContent = `${yearBooks}권`;
        row.appendChild(yearCount);

        heatmapRows.appendChild(row);
    }

    heatmapWrapper.appendChild(yearLabels);
    heatmapWrapper.appendChild(heatmapRows);
    container.appendChild(heatmapWrapper);
}

// ========================================
// 6. 책 목록 생성
// ========================================

/**
 * 책 목록을 2컬럼으로 나누어 화면에 표시합니다.
 * 왼쪽: 올해(2025), 오른쪽: 나머지 년도들
 */
function generateBooksList() {
    const container = document.getElementById('books-list');
    if (!container) return;

    // 책 인용 통계 가져오기
    const citationStats = postMetadata['_book_citation_stats'] || {};

    // 년도별로 책 그룹화
    const booksByYear = {};
    booksList.forEach(book => {
        if (!booksByYear[book.year]) {
            booksByYear[book.year] = [];
        }
        booksByYear[book.year].push(book);
    });

    // 년도별로 정렬 (최신순)
    const sortedYears = Object.keys(booksByYear).sort((a, b) => b - a);
    const currentYear = new Date().getFullYear();

    // 2컬럼 컨테이너 생성
    const twoColumnContainer = document.createElement('div');
    twoColumnContainer.style.cssText = 'display: flex; gap: 40px; justify-content: center;';

    // 왼쪽 컬럼 (올해)
    const leftColumn = document.createElement('div');
    leftColumn.style.cssText = 'flex: 1; max-width: 400px;';

    // 오른쪽 컬럼 (나머지 년도들)
    const rightColumn = document.createElement('div');
    rightColumn.style.cssText = 'flex: 1; max-width: 400px;';

    sortedYears.forEach(year => {
        const isCurrentYear = parseInt(year) === currentYear;
        const targetColumn = isCurrentYear ? leftColumn : rightColumn;

        // 년도 헤더 생성
        const yearHeader = document.createElement('h2');
        yearHeader.textContent = isCurrentYear ? `${year} (올해)` : year;
        yearHeader.style.cssText = 'font-size: 18px; margin-bottom: 10px;';
        targetColumn.appendChild(yearHeader);

        // 책 목록 생성
        const bookList = document.createElement('ul');
        bookList.style.cssText = 'margin-bottom: 30px; font-size: 13px; line-height: 1.6; list-style: none; padding-left: 0; margin-left: 0px;';

        let currentMonth = null;
        booksByYear[year].forEach((book, index) => {
            const listItem = document.createElement('li');

            // 같은 월인지 확인
            const isSameMonth = currentMonth === book.month;
            currentMonth = book.month;

            if (!isSameMonth) {
                // 월 표시 추가 (왼쪽에)
                const monthSpan = document.createElement('span');
                monthSpan.textContent = `${book.month}월 `;
                monthSpan.style.cssText = 'color: #586069; font-size: 11px; margin-right: 8px; display: inline-block; width: 25px; text-align: right;';
                listItem.appendChild(monthSpan);
            } else {
                // 같은 월이면 빈 공간 추가 (정렬 유지)
                const emptySpan = document.createElement('span');
                emptySpan.style.cssText = 'display: inline-block; width: 25px; margin-right: 8px;';
                listItem.appendChild(emptySpan);
            }

            // 책 제목 컨테이너 생성
            const titleContainer = document.createElement('span');
            titleContainer.style.cssText = 'display: inline-flex; align-items: center; gap: 2px;';

            if (book.post) {
                // 포스트가 있는 경우 링크 생성
                const link = document.createElement('a');
                link.href = `/${book.post}`;

                // 제목 길이 제한 (20자 초과시 말줄임표)
                const title = book.title;
                link.textContent = title.length > 20 ? title.substring(0, 20) + '...' : title;
                link.style.cssText = 'text-decoration: none; font-family: Pretendard-Light, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;';

                // 짧은 포스트인 경우 태그를 별도 요소로 추가
                const isShort = isShortPost(book.post);
                if (isShort) {
                    link.className = 'book-link no-highlight';
                    titleContainer.appendChild(link);

                    // 태그를 별도 요소로 추가
                    const tag = document.createElement('span');
                    tag.className = 'short-post-tag';
                    tag.textContent = '짧은 글';
                    tag.style.cssText = 'display: inline-block !important; font-size: 9px !important; color: #666666 !important; background-color: #e8e8e8 !important; padding: 1px 3px !important; margin-left: 3px !important; border-radius: 2px !important; border: none !important; font-weight: 500 !important; vertical-align: middle !important; opacity: 1 !important; position: relative !important; z-index: 1 !important; flex-shrink: 0 !important; white-space: nowrap !important;';
                    titleContainer.appendChild(tag);
                } else {
                    link.className = 'book-link';
                    titleContainer.appendChild(link);
                }
            } else {
                // 포스트가 없는 경우 일반 텍스트
                const titleSpan = document.createElement('span');
                // 제목 길이 제한 (20자 초과시 말줄임표)
                const title = book.title;
                titleSpan.textContent = title.length > 20 ? title.substring(0, 20) + '...' : title;
                titleSpan.style.cssText = 'font-family: Pretendard-Light, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;';
                titleContainer.appendChild(titleSpan);
            }

            // 인용 횟수 표시
            const citationCount = citationStats[book.title] || 0;
            if (citationCount > 0) {
                const citationButton = document.createElement('span');
                citationButton.textContent = citationCount;
                citationButton.style.cssText = 'display: inline-flex; align-items: center; justify-content: center; width: 10px; height: 10px; background-color: #e0f2f1; color: #26a69a; border: 0.5px solid #b2dfdb; border-radius: 6px 6px 6px 0px; font-size: 8px; font-weight: 700; margin-left: 1px; cursor: pointer; transition: all 0.2s ease; position: relative; top: -6px; line-height: 1; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;';
                citationButton.title = `${citationCount}개의 포스트에서 인용됨`;

                // 호버 효과 추가
                citationButton.addEventListener('mouseenter', function () {
                    this.style.backgroundColor = '#26a69a';
                    this.style.color = 'white';
                    this.style.borderColor = '#00897b';

                    // 인용한 포스트 목록 표시
                    showCitationList(this, book.title);
                });

                citationButton.addEventListener('mouseleave', function () {
                    this.style.backgroundColor = '#e0f2f1';
                    this.style.color = '#26a69a';
                    this.style.borderColor = '#b2dfdb';

                    // 툴팁 숨기기 (지연 시간 증가)
                    setTimeout(() => {
                        const tooltip = document.querySelector('.citation-tooltip');
                        if (tooltip && !tooltip.matches(':hover')) {
                            hideCitationList();
                        }
                    }, 300);
                });

                titleContainer.appendChild(citationButton);
            }

            listItem.appendChild(titleContainer);
            bookList.appendChild(listItem);
        });

        targetColumn.appendChild(bookList);
    });

    // 컬럼들을 메인 컨테이너에 추가
    twoColumnContainer.appendChild(leftColumn);
    twoColumnContainer.appendChild(rightColumn);
    container.appendChild(twoColumnContainer);
}

// ========================================
// 7. 툴팁 기능
// ========================================

/**
 * 인용한 포스트 목록을 표시합니다.
 * @param {HTMLElement} button - 인용 버튼 요소
 * @param {string} bookTitle - 책 제목
 */
function showCitationList(button, bookTitle) {
    // 기존 툴팁 제거
    hideCitationList();

    // 인용한 포스트 목록 찾기
    const citingPosts = [];
    Object.keys(postMetadata).forEach(postKey => {
        const post = postMetadata[postKey];
        if (post.book_citations && post.book_citations.includes(bookTitle)) {
            citingPosts.push({
                key: postKey,
                title: post.title,
                date: post.date
            });
        }
    });

    if (citingPosts.length === 0) return;

    // 툴팁 컨테이너 생성
    const tooltip = document.createElement('div');
    tooltip.className = 'citation-tooltip';
    tooltip.style.cssText = 'position: fixed; background: #24292e; color: white; padding: 12px; border-radius: 6px; font-size: 12px; max-width: 300px; z-index: 1000; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); pointer-events: auto;';

    // 툴팁 내용 생성
    const header = document.createElement('div');
    header.style.cssText = 'font-weight: 600; margin-bottom: 8px; color: #f6f8fa; border-bottom: 1px solid #586069; padding-bottom: 4px;';
    header.textContent = `"${bookTitle}" 인용한 포스트`;

    const content = document.createElement('div');
    content.style.cssText = 'max-height: 200px; overflow-y: auto;';

    citingPosts.forEach((post, index) => {
        const postItem = document.createElement('div');
        postItem.style.cssText = 'margin: 4px 0; line-height: 1.4; color: #e1e4e8;';

        // 년월 표시 (같은 년월이면 첫 항목에만)
        const postDate = new Date(post.date);
        const year = postDate.getFullYear();
        const month = postDate.getMonth() + 1;
        const currentDateKey = `${year}.${month.toString().padStart(2, '0')}`;

        const shouldShowDate = index === 0 ||
            (index > 0 && currentDateKey !== `${new Date(citingPosts[index - 1].date).getFullYear()}.${(new Date(citingPosts[index - 1].date).getMonth() + 1).toString().padStart(2, '0')}`);

        if (shouldShowDate) {
            const dateSpan = document.createElement('span');
            dateSpan.textContent = `${currentDateKey} `;
            dateSpan.style.cssText = 'color: #8b949e; font-size: 11px; margin-right: 6px;';
            postItem.appendChild(dateSpan);
        } else {
            // 같은 년월이면 빈 공간 추가 (정렬 유지)
            const emptySpan = document.createElement('span');
            emptySpan.style.cssText = 'display: inline-block; width: 45px; margin-right: 6px;';
            postItem.appendChild(emptySpan);
        }

        const link = document.createElement('a');
        link.href = `/${post.key}`;

        // 제목 길이 제한 (20자 초과시 말줄임표)
        const title = getPostTitle(post.key);
        link.textContent = title.length > 20 ? title.substring(0, 20) + '...' : title;
        link.style.cssText = 'color: #58a6ff; text-decoration: none;';
        link.target = '_blank';

        postItem.appendChild(link);
        content.appendChild(postItem);
    });

    tooltip.appendChild(header);
    tooltip.appendChild(content);

    // 위치 계산
    const rect = button.getBoundingClientRect();
    let left = rect.left;
    let top = rect.bottom + 5;

    // 화면 밖으로 나가지 않도록 조정
    const tooltipWidth = 300;
    const tooltipHeight = Math.min(citingPosts.length * 20 + 60, 200);

    if (left + tooltipWidth > window.innerWidth) {
        left = window.innerWidth - tooltipWidth - 10;
    }

    if (top + tooltipHeight > window.innerHeight) {
        top = rect.top - tooltipHeight - 5;
    }

    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';

    // 툴팁에 마우스 이벤트 추가
    tooltip.addEventListener('mouseenter', function () {
        // 툴팁 위에 마우스가 있으면 유지
    });

    tooltip.addEventListener('mouseleave', function () {
        // 툴팁에서 마우스가 나가면 숨기기
        hideCitationList();
    });

    document.body.appendChild(tooltip);
}

/**
 * 인용 툴팁을 숨깁니다.
 */
function hideCitationList() {
    const existingTooltip = document.querySelector('.citation-tooltip');
    if (existingTooltip) {
        existingTooltip.remove();
    }
}

/**
 * 히트맵 셀에 마우스를 올렸을 때 해당 월의 책 목록을 표시합니다.
 * @param {HTMLElement} cell - 히트맵 셀 요소
 * @param {Array} books - 해당 월의 책 목록
 * @param {number} year - 년도
 * @param {string} month - 월 이름
 */
function showBookList(cell, books, year, month) {
    // 기존 툴팁 제거
    hideBookList();

    // 툴팁 컨테이너 생성
    const tooltip = document.createElement('div');
    tooltip.className = 'book-tooltip';
    tooltip.innerHTML = `
    <div class="tooltip-header">${year}년 ${month}: ${books.length}권</div>
    <div class="tooltip-content">
      ${books.map(book => `<div class="tooltip-book">• ${book.title}</div>`).join('')}
    </div>
  `;

    // 위치 계산
    const rect = cell.getBoundingClientRect();
    let left = rect.left;
    let top = rect.bottom + 5;

    // 화면 밖으로 나가지 않도록 조정
    const tooltipWidth = 300;
    const tooltipHeight = Math.min(books.length * 20 + 60, 200);

    if (left + tooltipWidth > window.innerWidth) {
        left = window.innerWidth - tooltipWidth - 10;
    }

    if (top + tooltipHeight > window.innerHeight) {
        top = rect.top - tooltipHeight - 5;
    }

    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';

    document.body.appendChild(tooltip);
}

/**
 * 툴팁을 숨깁니다.
 */
function hideBookList() {
    const existingTooltip = document.querySelector('.book-tooltip');
    if (existingTooltip) {
        existingTooltip.remove();
    }
}

// ========================================
// 8. 통계 정보 업데이트
// ========================================

/**
 * 총 책 수를 계산합니다.
 * @returns {number} 총 책 수
 */
function calculateTotalBooks() {
    return booksList.length;
}

/**
 * 화면에 총 책 수를 표시합니다.
 */
function updateTotalBooks() {
    const totalBooks = calculateTotalBooks();
    const totalBooksElement = document.getElementById('total-books');
    if (totalBooksElement) {
        totalBooksElement.textContent = `총 ${totalBooks}권의 책을 읽었어요`;
    }
}

// ========================================
// 9. 이벤트 리스너
// ========================================

// 페이지 로드 시 책 데이터 로드
document.addEventListener('DOMContentLoaded', function () {
    loadBooksData();
});
