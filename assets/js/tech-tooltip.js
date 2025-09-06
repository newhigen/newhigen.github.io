/* ========================================
   기술 스택 툴팁 JavaScript
   ======================================== */

/**
 * 기술 스택 툴팁을 표시합니다.
 * @param {HTMLElement} element - 툴팁을 표시할 요소
 * @param {string} techName - 기술 이름
 */
function showTechTooltip(element, techName) {
    // 기존 툴팁 제거
    hideTechTooltip();

    // 툴팁 컨테이너 생성
    const tooltip = document.createElement('div');
    tooltip.className = 'tech-tooltip';
    tooltip.style.cssText = 'position: fixed; background: #24292e; color: white; padding: 8px 12px; border-radius: 6px; font-size: 12px; z-index: 1000; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); pointer-events: none; white-space: nowrap;';
    tooltip.textContent = techName;

    // 위치 계산
    const rect = element.getBoundingClientRect();
    let left = rect.left + (rect.width / 2);
    let top = rect.top - 35;

    // 화면 밖으로 나가지 않도록 조정
    const tooltipWidth = tooltip.offsetWidth || 100;
    const tooltipHeight = 30;

    if (left - tooltipWidth / 2 < 10) {
        left = 10 + tooltipWidth / 2;
    } else if (left + tooltipWidth / 2 > window.innerWidth - 10) {
        left = window.innerWidth - 10 - tooltipWidth / 2;
    }

    if (top < 10) {
        top = rect.bottom + 5;
    }

    tooltip.style.left = (left - tooltipWidth / 2) + 'px';
    tooltip.style.top = top + 'px';

    document.body.appendChild(tooltip);
}

/**
 * 기술 스택 툴팁을 숨깁니다.
 */
function hideTechTooltip() {
    const existingTooltip = document.querySelector('.tech-tooltip');
    if (existingTooltip) {
        existingTooltip.remove();
    }
}

/**
 * 기술 스택 툴팁 이벤트를 초기화합니다.
 */
function initTechTooltips() {
    // 모든 기술 스택 태그에 이벤트 추가
    const techTags = document.querySelectorAll('.tech-tag');

    techTags.forEach(tag => {
        const techName = tag.getAttribute('title');
        if (techName) {
            tag.addEventListener('mouseenter', function () {
                showTechTooltip(this, techName);
            });

            tag.addEventListener('mouseleave', function () {
                hideTechTooltip();
            });
        }
    });
}

// DOM이 로드되면 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTechTooltips);
} else {
    initTechTooltips();
}
