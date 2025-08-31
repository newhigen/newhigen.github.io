// ========================================
// Table of Contents (TOC) JavaScript
// ========================================

document.addEventListener('DOMContentLoaded', function () {
    // TOC 생성 함수
    function generateTOC() {
        const postContent = document.querySelector('.post-content');
        if (!postContent) return;

        // h1, h2, h3, h4 헤더만 선택
        const headers = postContent.querySelectorAll('h1, h2, h3, h4');
        if (headers.length < 2) return; // 헤더가 2개 미만이면 TOC 생성하지 않음

        // TOC 컨테이너 생성
        const tocContainer = document.createElement('div');
        tocContainer.className = 'toc-container'; // 기본적으로 펼친 상태
        tocContainer.innerHTML = `
      <div class="toc-toggle">목차</div>
      <ul class="toc-list"></ul>
    `;

        const tocList = tocContainer.querySelector('.toc-list');

        // 각 헤더에 대해 TOC 항목 생성
        headers.forEach((header, index) => {
            // 헤더에 ID가 없으면 생성
            if (!header.id) {
                header.id = 'toc-' + index;
            }

            // 헤더 레벨 확인
            const level = parseInt(header.tagName.charAt(1));

            // TOC 항목 생성
            const tocItem = document.createElement('li');
            tocItem.className = `toc-item level-${level}`;

            const tocLink = document.createElement('a');
            tocLink.href = '#' + header.id;
            tocLink.textContent = header.textContent;
            tocLink.addEventListener('click', function (e) {
                e.preventDefault();
                smoothScrollTo(header);
            });

            tocItem.appendChild(tocLink);
            tocList.appendChild(tocItem);
        });

        // TOC를 body에 추가
        document.body.appendChild(tocContainer);

        // 포스트 본문에 TOC 여백 추가 (펼친 상태)
        postContent.classList.add('has-toc');

        // 토글 버튼 이벤트 리스너 추가
        const toggleButton = tocContainer.querySelector('.toc-toggle');
        toggleButton.addEventListener('click', function (e) {
            e.preventDefault(); // 기본 동작 방지
            e.stopPropagation(); // 이벤트 전파 방지
            toggleTOC(tocContainer, postContent);
        });

        // 로컬 스토리지에서 TOC 상태 복원 (기본값은 펼침)
        const isCollapsed = localStorage.getItem('toc-collapsed') === 'true';
        if (isCollapsed) {
            // 숨김 상태로 복원
            tocContainer.classList.add('collapsed');
            postContent.classList.remove('has-toc');
            postContent.classList.add('has-toc-collapsed');
        }

        // 스크롤 이벤트 리스너 추가
        window.addEventListener('scroll', updateActiveTOCItem);

        // 초기 활성 상태 설정
        updateActiveTOCItem();
    }

    // TOC 토글 함수
    function toggleTOC(tocContainer, postContent) {
        const isCollapsed = tocContainer.classList.contains('collapsed');

        if (isCollapsed) {
            // 펼치기 - 즉시 실행
            tocContainer.classList.remove('collapsed');
            postContent.classList.remove('has-toc-collapsed');
            postContent.classList.add('has-toc');
            localStorage.setItem('toc-collapsed', 'false');
        } else {
            // 숨기기 - 즉시 실행
            tocContainer.classList.add('collapsed');
            postContent.classList.add('has-toc-collapsed');
            postContent.classList.remove('has-toc');
            localStorage.setItem('toc-collapsed', 'true');
        }
    }

    // 부드러운 스크롤 함수
    function smoothScrollTo(targetElement) {
        const headerOffset = 80; // 헤더 높이만큼 오프셋
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    // 현재 활성 TOC 항목 업데이트
    function updateActiveTOCItem() {
        const headers = document.querySelectorAll('.post-content h1, .post-content h2, .post-content h3, .post-content h4');
        const tocLinks = document.querySelectorAll('.toc-container a');

        if (headers.length === 0 || tocLinks.length === 0) return;

        let currentActiveIndex = -1;
        const scrollPosition = window.scrollY + 100; // 헤더 오프셋

        // 현재 스크롤 위치에 해당하는 헤더 찾기
        headers.forEach((header, index) => {
            const headerTop = header.offsetTop;
            if (scrollPosition >= headerTop) {
                currentActiveIndex = index;
            }
        });

        // 모든 TOC 링크에서 active 클래스 제거
        tocLinks.forEach(link => {
            link.classList.remove('active');
        });

        // 현재 활성 항목에 active 클래스 추가
        if (currentActiveIndex >= 0 && tocLinks[currentActiveIndex]) {
            tocLinks[currentActiveIndex].classList.add('active');
        }
    }

    // TOC 생성 실행
    generateTOC();

    // 윈도우 리사이즈 시 TOC 위치 조정
    window.addEventListener('resize', function () {
        const tocContainer = document.querySelector('.toc-container');
        if (tocContainer) {
            // 모바일에서는 TOC 숨김
            if (window.innerWidth < 768) {
                tocContainer.style.display = 'none';
            } else {
                tocContainer.style.display = 'block';
            }
        }
    });
});
