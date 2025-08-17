/* ========================================
   독서 히트맵 JavaScript
   ======================================== */

// ========================================
// 1. 전역 변수 및 데이터 관리
// ========================================

let readingData = {};        // 히트맵 데이터 (년월별 책 개수)
let booksList = [];          // 전체 책 목록

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

            // boolean 변환
            if (headers[j] === 'isShort') {
                value = value === 'true';
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

        // 2. 히트맵 데이터 생성
        generateHeatmapData();

        // 3. 히트맵 생성
        createHeatmap();

        // 4. 책 목록 생성
        generateBooksList();

        // 5. 총 책 수 업데이트
        updateTotalBooks();
    } catch (error) {
        console.error('책 데이터를 로드하는 중 오류가 발생했습니다:', error);
    }
}

// ========================================
// 3. 포스트 길이 확인
// ========================================

/**
 * 포스트가 짧은 포스트인지 확인 (JSON 파일의 isShort 속성 사용)
 * @param {string} postName - 포스트 URL
 * @returns {boolean} 짧은 포스트 여부
 */
function isShortPost(postName) {
    const book = booksList.find(book => book.post === postName);
    return book ? book.isShort === true : false;
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
    heatmapWrapper.style.cssText = 'display: flex; align-items: flex-start; gap: 8px; justify-content: center; flex-wrap: wrap;';

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
 * 책 목록을 년도별로 정렬하여 화면에 표시합니다.
 * 짧은 포스트와 일반 포스트를 구분하여 표시합니다.
 */
function generateBooksList() {
    const container = document.getElementById('books-list');
    if (!container) return;

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

    sortedYears.forEach(year => {
        // 년도 헤더 생성
        const yearHeader = document.createElement('h2');
        yearHeader.textContent = year;
        yearHeader.style.cssText = 'font-size: 18px; margin-bottom: 10px;';
        container.appendChild(yearHeader);

        // 책 목록 생성
        const bookList = document.createElement('ul');
        bookList.style.cssText = 'margin-bottom: 30px; font-size: 14px; line-height: 1.4; list-style: none; padding-left: 0; margin-left: 0px;';

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
                monthSpan.style.cssText = 'color: #586069; font-size: 12px; margin-right: 8px; display: inline-block; width: 25px; text-align: right;';
                listItem.appendChild(monthSpan);
            } else {
                // 같은 월이면 빈 공간 추가 (정렬 유지)
                const emptySpan = document.createElement('span');
                emptySpan.style.cssText = 'display: inline-block; width: 25px; margin-right: 8px;';
                listItem.appendChild(emptySpan);
            }

            if (book.post) {
                // 포스트가 있는 경우 링크 생성
                const link = document.createElement('a');
                link.href = `/${book.post}`;
                link.textContent = book.title;

                link.style.cssText = 'text-decoration: none;';

                // 짧은 포스트인 경우 태그를 별도 요소로 추가
                const isShort = isShortPost(book.post);
                if (isShort) {
                    link.className = 'book-link no-highlight';
                    listItem.appendChild(link);

                    // 태그를 별도 요소로 추가
                    const tag = document.createElement('span');
                    tag.className = 'short-post-tag';
                    tag.textContent = '짧은 글';
                    listItem.appendChild(tag);
                } else {
                    link.className = 'book-link';
                    listItem.appendChild(link);
                }
            } else {
                // 포스트가 없는 경우 일반 텍스트
                const titleSpan = document.createElement('span');
                titleSpan.textContent = book.title;
                listItem.appendChild(titleSpan);
            }

            bookList.appendChild(listItem);
        });

        container.appendChild(bookList);
    });
}

// ========================================
// 7. 툴팁 기능
// ========================================

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
        totalBooksElement.textContent = `총 ${totalBooks}권의 책을 읽었습니다`;
    }
}

// ========================================
// 9. 이벤트 리스너
// ========================================

// 페이지 로드 시 책 데이터 로드
document.addEventListener('DOMContentLoaded', function () {
    loadBooksData();
});
