---
layout: page
title: 읽은 책들
permalink: /books_read/
---

<style>
.heatmap-container {
  margin: 30px 0;
  padding: 24px;
  background: #ffffff;
  border: 1px solid #e1e4e8;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.heatmap {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
  justify-content: center;
}

.heatmap-column {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: fit-content;
}

.heatmap-cell {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  background-color: #ebedf0;
  border: 1px solid #e1e4e8;
  transition: all 0.2s ease;
  cursor: pointer;
}

.heatmap-cell:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  z-index: 10;
  position: relative;
}

.heatmap-cell.level-1 { background-color: #9be9a8; border-color: #9be9a8; }
.heatmap-cell.level-2 { background-color: #40c463; border-color: #40c463; }
.heatmap-cell.level-3 { background-color: #30a14e; border-color: #30a14e; }
.heatmap-cell.level-4 { background-color: #216e39; border-color: #216e39; }

.heatmap-legend {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #586069;
  justify-content: center;
}

.heatmap-legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.heatmap-legend-cell {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  border: 1px solid #e1e4e8;
}

.heatmap-title {
  font-size: 16px;
  font-weight: 600;
  color: #24292e;
  margin-bottom: 16px;
  text-align: center;
}

.year-label {
  font-size: 11px;
  color: #586069;
  text-align: center;
  margin-top: 8px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .heatmap-container {
    padding: 16px;
    margin: 20px 0;
  }

  .heatmap-cell {
    width: 14px;
    height: 14px;
  }

  .heatmap-legend {
    flex-direction: column;
    gap: 4px;
  }
}
</style>

<div class="heatmap-container">
  <div class="heatmap-title">📚 독서 히트맵</div>
  <div id="reading-heatmap"></div>
  <div class="heatmap-stats" style="text-align: center; margin: 16px 0; font-size: 14px; color: #586069;">
    <span id="total-books">총 41권의 책을 읽었습니다</span>
  </div>
  <div class="heatmap-legend">
    <span>적게 읽음</span>
    <div class="heatmap-legend-item">
      <div class="heatmap-legend-cell" style="background-color: #ebedf0;"></div>
      <div class="heatmap-legend-cell" style="background-color: #9be9a8;"></div>
      <div class="heatmap-legend-cell" style="background-color: #40c463;"></div>
      <div class="heatmap-legend-cell" style="background-color: #30a14e;"></div>
      <div class="heatmap-legend-cell" style="background-color: #216e39;"></div>
    </div>
    <span>많이 읽음</span>
  </div>
</div>

<script>
// 책 읽기 데이터 (년월별) - 실제 읽은 책들 기반
const readingData = {
  // 2025년 - 총 22권 (포스트가 있는 책들 + 추가 책들)
  "2025-01": 3,  // 왜 나는 항상 결심만 할까?, 무엇이 1등 팀을 만드는가?, 나 홀로 유럽
  "2025-02": 2,  // 진홍색 연구, 그리고 아무도 없었다
  "2025-03": 1,  // 모든 것은 예측 가능하다
  "2025-04": 2,  // 주문하신 대만 간식 나왔습니다, 연직 약사가 알려주는 영양제 특강
  "2025-05": 2,  // 우리는 왜 잠을 자야할까, 더 머니북
  "2025-06": 2,  // (사용자를) 생각하게 하지 마!, 80:20 학습법
  "2025-07": 4,  // 내게 남은 스물다섯 번의 계절, 경험과 지식, 도덕적 불확실성, 권력 N과 권력 S
  "2025-08": 8,  // INFJ 의사의 병원 일기, 안다는 착각, 노트의 품격, 달리기를 말할 때 내가 하고 싶은 이야기, 단 한 번의 삶, 책 잘 읽는 방법, 전문가를 바라보며, 편향 깨기
  "2025-09": 0,
  "2025-10": 0,
  "2025-11": 0,
  "2025-12": 0,

  // 2024년 - 총 17권 (포스트가 있는 책들 + 추가 책들)
  "2024-01": 1,  // 어린왕자
  "2024-02": 2,  // 이방인, 죽음의 수용소에서
  "2024-03": 1,  // 오늘을 사는 이유
  "2024-04": 2,  // 그림으로 배우는 HTTP & Network Basics, 피플웨어
  "2024-05": 1,  // Tidy First?
  "2024-06": 1,  // 제텔카스텐
  "2024-07": 2,  // 1만 시간의 재발견, 가상 면접 사례로 배우는 머신러닝 시스템 설계 기초
  "2024-08": 1,  // 거인의 노트
  "2024-09": 1,  // 이동진 독서법
  "2024-10": 1,  // 개발자의 글쓰기
  "2024-11": 2,  // 이펙티브 엔지니어, Deep Work
  "2024-12": 2,  // 함께 자라기, 유난한 도전

  // 2023년 - 총 2권
  "2023-01": 0,
  "2023-02": 0,
  "2023-03": 0,
  "2023-04": 0,
  "2023-05": 0,
  "2023-06": 0,
  "2023-07": 0,
  "2023-08": 0,
  "2023-09": 0,
  "2023-10": 0,
  "2023-11": 0,
  "2023-12": 2   // 메이크타임, 진작 이렇게 책을 읽었더라면
};

function createHeatmap() {
  const container = document.getElementById('reading-heatmap');
  const currentYear = new Date().getFullYear();
  const startYear = 2023;

  // 히트맵과 라벨을 감싸는 컨테이너
  const heatmapWrapper = document.createElement('div');
  heatmapWrapper.style.cssText = 'display: flex; align-items: flex-start; gap: 8px;';

  // 월별 라벨 추가 (왼쪽에 세로로 배치)
  const monthLabels = document.createElement('div');
  monthLabels.className = 'month-labels';
  monthLabels.style.cssText = 'display: flex; flex-direction: column; gap: 4px; justify-content: space-between; height: 200px; min-width: 40px;';

  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월',
                     '7월', '8월', '9월', '10월', '11월', '12월'];

  for (let i = 0; i < 12; i++) {
    const monthLabel = document.createElement('div');
    monthLabel.style.cssText = 'height: 16px; line-height: 16px; text-align: right; font-size: 10px; color: #586069; font-weight: 500; padding-right: 8px;';
    monthLabel.textContent = monthNames[i];
    monthLabels.appendChild(monthLabel);
  }

  // 히트맵 컬럼들을 담을 컨테이너
  const heatmapColumns = document.createElement('div');
  heatmapColumns.style.cssText = 'display: flex; gap: 4px;';

  // 년도별로 컬럼 생성
  for (let year = startYear; year <= currentYear; year++) {
    const column = document.createElement('div');
    column.className = 'heatmap-column';

    // 12개월 셀 생성
    for (let month = 1; month <= 12; month++) {
      const cell = document.createElement('div');
      cell.className = 'heatmap-cell';

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

      // 툴팁 추가
      cell.title = `${year}년 ${monthNames[month-1]}: ${count}권 읽음`;

      column.appendChild(cell);
    }

    // 년도 라벨 추가
    const yearLabel = document.createElement('div');
    yearLabel.className = 'year-label';
    yearLabel.textContent = year;
    column.appendChild(yearLabel);

    heatmapColumns.appendChild(column);
  }

  heatmapWrapper.appendChild(monthLabels);
  heatmapWrapper.appendChild(heatmapColumns);
  container.appendChild(heatmapWrapper);
}

// 총 책 수 계산
function calculateTotalBooks() {
  let total = 0;
  for (const key in readingData) {
    total += readingData[key];
  }
  return total;
}

// 페이지 로드 시 히트맵 생성
document.addEventListener('DOMContentLoaded', function() {
  createHeatmap();

  // 총 책 수 업데이트
  const totalBooks = calculateTotalBooks();
  const totalBooksElement = document.getElementById('total-books');
  if (totalBooksElement) {
    totalBooksElement.textContent = `총 ${totalBooks}권의 책을 읽었습니다`;
  }
});
</script>

## 2025

1. [INFJ 의사의 병원 일기 →]({% post_url 2025-08-10-infj-doctor %})
2. [안다는 착각 →]({% post_url 2025-08-09-did-i-understand %})
3. [노트의 품격 →]({% post_url 2025-08-12-note-premium %})
4. 왜 나는 항상 결심만 할까?
5. [달리기를 말할 때 내가 하고 싶은 이야기 →]({% post_url 2025-08-12-running-story %})
6. [단 한 번의 삶 →]({% post_url 2025-08-10-one-life %})
7. [내게 남은 스물다섯 번의 계절 →]({% post_url 2025-07-31-25-seasons %})
8. 무엇이 1등 팀을 만드는가?
9.  나 홀로 유럽
10. 진홍색 연구
11. 그리고 아무도 없었다
12. 모든 것은 예측 가능하다
13. 주문하신 대만 간식 나왔습니다
14. 연직 약사가 알려주는 영양제 특강
15. 우리는 왜 잠을 자야할까
16. 더 머니북
17. (사용자를) 생각하게 하지 마!
18. 책 잘 읽는 방법
19. 80:20 학습법
20. 비만코드
21. 불안한 완벽주의자를 위한 책
22. 아티스트의 탁구 노트

## 2024

1. 어린왕자
2. 이방인
3. 죽음의 수용소에서
4. 오늘을 사는 이유
5. 그림으로 배우는 HTTP & Network Basics
6. 피플웨어
7. Tidy First?
8. 제텔카스텐
9.  1만 시간의 재발견
10. 가상 면접 사례로 배우는 머신러닝 시스템 설계 기초
11. 거인의 노트
12. 이동진 독서법
13. 개발자의 글쓰기
14. 이펙티브 엔지니어
15. Deep Work
16. 함께 자라기
17. 유난한 도전

## 2023

1. 메이크타임
2. 진작 이렇게 책을 읽었더라면
