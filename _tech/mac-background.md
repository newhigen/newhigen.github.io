---
layout: tech
title: 맥 배경화면 메뉴바 조절기
description: 이미지를 16:9 배경화면으로 변환하고 메뉴바 높이를 조절하여 4K PNG로 출력하는 도구
permalink: /tools/mac-background/
thumbnail: /assets/images/mac-background-menubar-tool.png
tags: [MacOS]
tech: [Vibe Coding]
date: 2025-09-07
---

<div class="tool-mac-bg">
  <style>
    .tool-mac-bg { font-size: 0.95rem; }
    .tool-mac-bg .panel { display: grid; gap: 12px; grid-template-columns: 1fr; max-width: 980px; margin: 0 auto; }
    .tool-mac-bg h2 { font-size: 1.1rem; margin: 0 0 8px; }
    .tool-mac-bg .controls { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
    .tool-mac-bg .controls > * { background: #fff; border: 1px solid #e5e7eb; color: inherit; border-radius: 8px; padding: 8px 10px; }
    .tool-mac-bg .controls input[type="number"]{ width: 80px; }
    .tool-mac-bg .controls select{ min-width: 200px; }
    .tool-mac-bg button.primary{ background: #2563eb; border-color: #2563eb; color: #fff; cursor: pointer; border-radius: 8px; padding: 8px 12px; }
    .tool-mac-bg .download-btn{
      position: static; /* 프리뷰 아래 배치 */
      margin: 12px 0 0 auto; /* 오른쪽 정렬 */
      background: #2563eb;
      color: #fff;
      border: none;
      border-radius: 12px;
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      transition: all 0.2s ease;
      display: none;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }
    .tool-mac-bg .download-btn:hover{
      background: #1d4ed8;
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
    }
    .tool-mac-bg .download-btn:active{
      transform: translateY(0);
    }
    .tool-mac-bg .download-btn svg{
      flex-shrink: 0;
    }
    .tool-mac-bg button.ghost{ background: #f8fafc; border: 1px solid #e5e7eb; cursor: pointer; border-radius: 999px; padding: 6px 10px; }
    .tool-mac-bg .drop{ border: 2px dashed #cbd5e1; border-radius: 12px; padding: 16px; text-align: center; color: #475569; background: #f8fafc; }
    .tool-mac-bg .drop.drag{ background: #eef2ff; border-color: #6366f1; }
    /* Safari 호환: 파일 입력을 완전히 숨기지 않고 시각적으로만 숨김 */
    .tool-mac-bg .drop input{
      position: absolute;
      width: 1px;
      height: 1px;
      opacity: 0;
      pointer-events: none;
    }
    .tool-mac-bg .drop .hint{ opacity: .9; font-size: 14px; }
    .tool-mac-bg .preview-wrap{ position: relative; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; background: #fff; }
    .tool-mac-bg .preview{ position: relative; width: 100%; aspect-ratio: 16/9; background: url('/assets/images/sonoma.jpg') center/cover no-repeat; }
    /* 맥 메뉴바 샘플(고정 높이, 경계선 제거하여 실제와 유사하게) */
    .tool-mac-bg .sysbar{
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 24px; /* 초기값, 스크립트에서 비율로 스케일 */
      background: rgba(255,255,255,.82);
      z-index: 3;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 8px; /* 패딩은 작게 유지, 필요하면 스케일 가능 */
      font-size: 11px; /* 초기값, 스크립트에서 비율로 스케일 */
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #333;
      backdrop-filter: blur(20px);
    }
    .tool-mac-bg .menubar-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .tool-mac-bg .menubar-right {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tool-mac-bg .apple-logo {
      width: var(--icon-size, 12px);
      height: var(--icon-size, 12px);
      background: #333;
      border-radius: 2px;
      position: relative;
      flex-shrink: 0;
    }
    .tool-mac-bg .apple-logo::before {
      content: '';
      position: absolute;
      top: var(--apple-dot-top, 1px);
      right: var(--apple-dot-right, 2px);
      width: var(--apple-dot-size, 2px);
      height: var(--apple-dot-size, 2px);
      background: #fff;
      border-radius: 50%;
    }
    .tool-mac-bg .menu-item { font-weight: 500; opacity: 0.9; }
    .tool-mac-bg .status-icon {
      width: var(--status-size, 10px);
      height: var(--status-size, 10px);
      background: #666;
      border-radius: 1px;
      opacity: 0.8;
      flex-shrink: 0;
    }
    /* 오른쪽 절반에만 적용되는 검정 마스크(선택값 50/70을 비율로 스케일). 메뉴바 위로 올라오도록 z-index > sysbar */
    .tool-mac-bg .mask{ position: absolute; top: 0; right: 0; width: 50%; height: 0; background: #000; opacity: 1; pointer-events: none; z-index: 4; }
    .tool-mac-bg .img{ position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: none; }
    .tool-mac-bg .row{ display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
    .tool-mac-bg small{ color: #64748b; }
  </style>

  <div class="panel">
    <h2>맥 배경화면 메뉴바 높이 조절</h2>

    <div class="controls">
      <div class="row">
        <strong>출력 해상도: 3840×2160 (4K UHD)</strong>
      </div>

      <label class="row">메뉴바 높이(px)
        <input id="barH" type="number" min="0" step="1" value="72" />
        <span class="chips">
          <button type="button" class="ghost" data-bar="50">메뉴바 높이만큼 (50)</button>
          <button type="button" class="ghost" data-bar="72">앱 전체화면 시 빈틈 없게 (72)</button>
        </span>
      </label>

    </div>

    <div class="drop" id="drop" role="region" aria-label="이미지 드래그 앤 드롭 영역">
      <input id="file" type="file" accept="image/*" />
      <div><strong>이미지를 드래그해서 이곳에 놓으세요.</strong></div>
      <div class="hint">이미지는 16:9로 맞추고, 위에서 선택한 높이만큼 검정 오버레이가 적용됩니다.</div>
    </div>

    <div class="preview-wrap">
      <div class="preview" id="preview">
        <img id="img" class="img" alt="preview" />
        <div id="sysbar" class="sysbar" aria-hidden="true">
          <div class="menubar-left">
            <div class="apple-logo"></div>
            <span class="menu-item">Finder</span>
            <span class="menu-item">File</span>
            <span class="menu-item">Edit</span>
            <span class="menu-item">View</span>
          </div>
          <div class="menubar-right">
            <div class="status-icon"></div>
            <div class="status-icon"></div>
            <div class="status-icon"></div>
            <span style="font-size: 9px; opacity: 0.8;">12:34</span>
          </div>
        </div>
        <div id="mask" class="mask half-right" aria-hidden="true"></div>
      </div>
    </div>
    <button id="download" class="download-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7,10 12,15 17,10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        PNG 다운로드
      </button>
  </div>

  <script>
    (function () {
      const fileInput = document.getElementById('file');
      const drop = document.getElementById('drop');
      const imgEl = document.getElementById('img');
      const sysbar = document.getElementById('sysbar');
      const mask = document.getElementById('mask');
      const barH = document.getElementById('barH');
      const downloadBtn = document.getElementById('download');
      const preview = document.getElementById('preview');

      // 4K 고정
      const OUTPUT_WIDTH = 3840;
      const OUTPUT_HEIGHT = 2160;

      // 프리뷰 메뉴바는 4K 기준 50px 높이를 비율로 반영
      const MENUBAR_PRESET_4K = 50; // 실제 메뉴바 높이(4K px)
      const DEFAULT_BAR_4K = 72;    // 전체화면 가리기 높이(4K px)

      // 상태
      let imageBitmap = null;
      let naturalW = 0, naturalH = 0;

      // 초기값: 전체화면 가리기 높이
      barH.value = DEFAULT_BAR_4K;

      // 바 값 변경 시: 마스크만 갱신 (메뉴바는 고정)
      const presetButtons = Array.from(document.querySelectorAll('[data-bar]'));
      function syncPresetActive() {
        const v = parseInt(barH.value || '0', 10);
        let matched = false;
        presetButtons.forEach(btn => {
          if (parseInt(btn.dataset.bar, 10) === v) {
            btn.classList.add('active');
            matched = true;
          } else {
            btn.classList.remove('active');
          }
        });
        if (!matched) presetButtons.forEach(btn => btn.classList.remove('active'));
      }

      barH.addEventListener('input', () => { updateMaskHeight(); syncPresetActive(); });
      presetButtons.forEach(b => {
        b.addEventListener('click', () => { barH.value = b.dataset.bar; updateMaskHeight(); syncPresetActive(); });
      });

      function updateSysbarDimensions() {
        const rect = preview.getBoundingClientRect();
        const previewH = rect.height; // CSS px
        const barPx = Math.max(0, parseInt(barH.value || '0', 10));

        // 프리뷰 메뉴바는 4K 기준 50px을 비율로 스케일
        const sysH = Math.round(previewH * (MENUBAR_PRESET_4K / OUTPUT_HEIGHT));
        sysbar.style.height = sysH + 'px';
        // 텍스트 크기도 메뉴바 높이에 맞춰 비율로 스케일 (기본 24px -> 11px 비례)
        const fontPx = Math.max(9, Math.round(sysH * (11/24)));
        sysbar.style.fontSize = fontPx + 'px';

        // 아이콘 크기를 메뉴바 높이에 맞춰 스케일
        const iconSize = Math.max(8, Math.round(sysH * (12/24)));
        const statusSize = Math.max(8, Math.round(sysH * (10/24)));
        const dotSize = Math.max(1, Math.round(sysH * (2/24)));
        const dotTop = Math.max(1, Math.round(sysH * (1/24)));
        const dotRight = Math.max(1, Math.round(sysH * (2/24)));
        sysbar.style.setProperty('--icon-size', iconSize + 'px');
        sysbar.style.setProperty('--status-size', statusSize + 'px');
        sysbar.style.setProperty('--apple-dot-size', dotSize + 'px');
        sysbar.style.setProperty('--apple-dot-top', dotTop + 'px');
        sysbar.style.setProperty('--apple-dot-right', dotRight + 'px');

        // 마스크도 함께 갱신 (초기/리사이즈 시)
        const maskH = Math.round(previewH * (barPx / OUTPUT_HEIGHT));
        mask.style.height = maskH + 'px';
      }
      function updateMaskHeight() {
        const rect = preview.getBoundingClientRect();
        const previewH = rect.height;
        const barPx = Math.max(0, parseInt(barH.value || '0', 10));
        const maskH = Math.round(previewH * (barPx / OUTPUT_HEIGHT));
        mask.style.height = maskH + 'px';
      }
      window.addEventListener('resize', updateSysbarDimensions);
      updateSysbarDimensions();
      syncPresetActive();

      // 파일 로드
      function setImage(file) {
        if (!file) return;
        const url = URL.createObjectURL(file);
        imgEl.src = url;
        imgEl.style.display = 'block'; // 이미지가 로드되면 표시
        downloadBtn.style.display = 'flex'; // 다운로드 버튼 표시
        imgEl.onload = async () => {
          // ImageBitmap으로 보관 (고속 드로잉)
          imageBitmap = await createImageBitmap(file);
          naturalW = imageBitmap.width;
          naturalH = imageBitmap.height;
          URL.revokeObjectURL(url);
        }
      }

      fileInput.addEventListener('change', e => setImage(e.target.files[0]));
      // 드롭
      ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('drag'); }));
      ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('drag'); }));
      // 클릭으로 파일 선택 창을 열지 않음 (드래그 앤 드롭만 허용)
      drop.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const f = e.dataTransfer.files?.[0];
        if (f && f.type.startsWith('image/')) setImage(f);
      });

      // 캔버스에 cover 방식으로 그리기
      function drawCover(ctx, img, cw, ch) {
        const iw = img.width, ih = img.height;
        const cr = cw / ch;        // canvas ratio
        const ir = iw / ih;        // image ratio
        let dw, dh, dx, dy;
        if (ir > cr) {
          // 이미지가 더 가로로 김 -> 높이에 맞추고 좌우 잘라내기
          dh = ch;
          dw = Math.round(ch * ir);
          dx = Math.round((cw - dw) / 2);
          dy = 0;
        } else {
          // 이미지가 더 세로로 김 -> 너비에 맞추고 상하 잘라내기
          dw = cw;
          dh = Math.round(cw / ir);
          dx = 0;
          dy = Math.round((ch - dh) / 2);
        }
        ctx.drawImage(img, dx, dy, dw, dh);
      }

      // 다운로드
      downloadBtn.addEventListener('click', async () => {
        if (!imageBitmap) {
          alert('먼저 이미지를 올려라.');
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = OUTPUT_WIDTH;
        canvas.height = OUTPUT_HEIGHT;
        const ctx = canvas.getContext('2d');

        // 배경 검정
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

        // 이미지 cover
        drawCover(ctx, imageBitmap, OUTPUT_WIDTH, OUTPUT_HEIGHT);

        // 메뉴바 오버레이
        const barPx = Math.max(0, parseInt(barH.value || '0', 10));
        if (barPx > 0) {
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, OUTPUT_WIDTH, barPx);
        }

        // 저장
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `wallpaper_4K_${OUTPUT_WIDTH}x${OUTPUT_HEIGHT}_bar${barPx}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      });

    })();
  </script>
</div>
