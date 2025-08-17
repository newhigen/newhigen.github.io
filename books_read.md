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
      <div class="heatmap-legend-cell" style="background-color: #d0ebff;"></div>
      <div class="heatmap-legend-cell" style="background-color: #74c0fc;"></div>
      <div class="heatmap-legend-cell" style="background-color: #1971c2;"></div>
      <div class="heatmap-legend-cell" style="background-color: #0c4a6e;"></div>
    </div>
    <span>4권 이상</span>
  </div>
</div>

<div style="margin: 20px 0; padding: 12px; background-color: #f8f9fa; border-radius: 6px; font-size: 13px; color: #586069;">
  <strong>📝 짧은 포스트:</strong> 300자 이하의 포스트는 노란색 하이라이트로 표시됩니다.
</div>

<div id="books-list">
  <!-- 책 목록이 여기에 동적으로 생성됩니다 -->
</div>

<script src="{{ '/assets/js/reading-heatmap.js' | relative_url }}"></script>
