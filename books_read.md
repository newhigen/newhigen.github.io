---
layout: page
title: 읽은 책들
permalink: /books_read/
---

<link rel="stylesheet" href="{{ '/assets/css/reading-heatmap.css' | relative_url }}">

<div class="heatmap-container">
  <div class="heatmap-title">📅&nbsp;&nbsp;독서 달력</div>
  <div id="reading-heatmap"></div>
  <div class="heatmap-legend">
    <span style="color: rgb(142, 150, 162);">0권</span>
    <div class="heatmap-legend-item">
      <div class="heatmap-legend-cell" style="background-color: #ebedf0;"></div>
      <div class="heatmap-legend-cell" style="background-color: #d0ebff;"></div>
      <div class="heatmap-legend-cell" style="background-color: #74c0fc;"></div>
      <div class="heatmap-legend-cell" style="background-color: #1971c2;"></div>
      <div class="heatmap-legend-cell" style="background-color: #0c4a6e;"></div>
    </div>
    <span style="color:rgb(142, 150, 162);">4권 이상</span>
  </div>
  <div class="heatmap-stats" style="text-align: center; margin: 8px 0 0 0; font-size: 14px; color: #586069;">
    <span id="total-books"></span>
  </div>
</div>
<div class="books-note">
  <strong style="background: linear-gradient(to bottom, transparent 70%, #74c0fc 90%);">후기 있는 책</strong>
</div>

<div id="books-list">
  <!-- 책 목록이 여기에 동적으로 생성됩니다 -->
</div>

<script src="{{ '/assets/js/reading-heatmap.js' | relative_url }}"></script>
