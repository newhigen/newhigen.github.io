---
layout: page
title: 읽은 책들
permalink: /books_read/
---

<link rel="stylesheet" href="{{ '/assets/css/reading-heatmap.css' | relative_url }}">

<div class="heatmap-container">
  <div class="heatmap-title">📚 독서 히트맵</div>
  <div id="reading-heatmap"></div>
  <div class="heatmap-stats" style="text-align: center; margin: 16px 0; font-size: 14px; color: #586069;">
    <span id="total-books">총 41권의 책을 읽었습니다</span>
  </div>
  <div class="heatmap-legend">
    <span>0권</span>
    <div class="heatmap-legend-item">
      <div class="heatmap-legend-cell" style="background-color: #ebedf0;"></div>
      <div class="heatmap-legend-cell" style="background-color: #9be9a8;"></div>
      <div class="heatmap-legend-cell" style="background-color: #40c463;"></div>
      <div class="heatmap-legend-cell" style="background-color: #30a14e;"></div>
      <div class="heatmap-legend-cell" style="background-color: #216e39;"></div>
    </div>
    <span>4권 이상</span>
  </div>
</div>

<div id="books-list">
  <!-- 책 목록이 여기에 동적으로 생성됩니다 -->
</div>

<script src="{{ '/assets/js/reading-heatmap.js' | relative_url }}"></script>
