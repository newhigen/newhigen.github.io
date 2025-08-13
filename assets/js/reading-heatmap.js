// 책 데이터를 동적으로 로드하고 히트맵 데이터 생성
let readingData = {};
let booksList = [];

// JSON 파일에서 책 데이터 로드
async function loadBooksData() {
    try {
        const response = await fetch('/assets/data/books.json');
        booksList = await response.json();

        // 히트맵 데이터 생성
        generateHeatmapData();

        // 히트맵 생성
        createHeatmap();

        // 책 목록 생성
        generateBooksList();

        // 총 책 수 업데이트
        updateTotalBooks();
    } catch (error) {
        console.error('책 데이터를 로드하는 중 오류가 발생했습니다:', error);
    }
}

// 책 목록에서 히트맵 데이터 생성
function generateHeatmapData() {
    readingData = {};

    booksList.forEach(book => {
        const key = `${book.year}-${book.month.toString().padStart(2, '0')}`;
        readingData[key] = (readingData[key] || 0) + 1;
    });
}

function createHeatmap() {
    const container = document.getElementById('reading-heatmap');
    const currentYear = new Date().getFullYear();
    const startYear = 2022;

    // 히트맵과 라벨을 감싸는 컨테이너
    const heatmapWrapper = document.createElement('div');
    heatmapWrapper.style.cssText = 'display: flex; align-items: flex-start; gap: 8px; justify-content: center;';

    // 월별 라벨 추가 (왼쪽에 세로로 배치)
    const monthLabels = document.createElement('div');
    monthLabels.className = 'month-labels';

    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월',
        '7월', '8월', '9월', '10월', '11월', '12월'];

    for (let i = 0; i < 12; i++) {
        const monthLabel = document.createElement('div');
        monthLabel.style.cssText = 'height: 16px; line-height: 16px; text-align: right; font-size: 10px; color: #586069; font-weight: 500; padding-right: 8px; display: flex; align-items: center; justify-content: flex-end; margin: 0; box-sizing: border-box;';
        monthLabel.textContent = monthNames[i];
        monthLabels.appendChild(monthLabel);
    }

    // 히트맵 컬럼들을 담을 컨테이너
    const heatmapColumns = document.createElement('div');
    heatmapColumns.style.cssText = 'display: flex; gap: 4px; align-items: flex-start; justify-content: flex-start;';

    // 년도별로 컬럼 생성
    for (let year = startYear; year <= currentYear; year++) {
        const column = document.createElement('div');
        column.className = 'heatmap-column';

        // 12개월 셀 생성
        for (let month = 1; month <= 12; month++) {
            const cell = document.createElement('div');
            cell.className = 'heatmap-cell';

            // 현재 날짜 확인
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth() + 1; // getMonth()는 0부터 시작

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
                    else if (count <= 3) level = 2;
                    else if (count <= 5) level = 3;
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

            column.appendChild(cell);
        }

        // 년도별 책 수 계산
        const yearBooks = booksList.filter(book => book.year === year).length;

        // 년도 라벨 추가
        const yearLabel = document.createElement('div');
        yearLabel.className = 'year-label';
        yearLabel.textContent = `${year}`;
        column.appendChild(yearLabel);

        // 년도별 책 수 표시
        const yearCount = document.createElement('div');
        yearCount.className = 'year-count';
        yearCount.textContent = `${yearBooks}권`;
        column.appendChild(yearCount);

        heatmapColumns.appendChild(column);
    }

    heatmapWrapper.appendChild(monthLabels);
    heatmapWrapper.appendChild(heatmapColumns);
    container.appendChild(heatmapWrapper);
}

// 책 목록 생성
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
        bookList.style.cssText = 'margin-bottom: 30px; font-size: 14px; line-height: 1.4; list-style: none; padding-left: 0; margin-left: -10px;';

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
                link.href = `/${book.post}/`;
                link.textContent = `${book.title} →`;
                link.style.cssText = 'color: black; text-decoration: none;';
                link.className = 'book-link';
                listItem.appendChild(link);
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

// 책 목록 표시 함수
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

// 책 목록 숨기기 함수
function hideBookList() {
    const existingTooltip = document.querySelector('.book-tooltip');
    if (existingTooltip) {
        existingTooltip.remove();
    }
}

// 총 책 수 계산
function calculateTotalBooks() {
    return booksList.length;
}

// 총 책 수 업데이트
function updateTotalBooks() {
    const totalBooks = calculateTotalBooks();
    const totalBooksElement = document.getElementById('total-books');
    if (totalBooksElement) {
        totalBooksElement.textContent = `총 ${totalBooks}권의 책을 읽었습니다`;
    }
}

// 페이지 로드 시 책 데이터 로드
document.addEventListener('DOMContentLoaded', function () {
    loadBooksData();
});
