const PRCommenter = require('./comment_with_files');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

class PuppeteerScreenshotAndComment {
    constructor() {
        this.commenter = new PRCommenter();
        this.screenshotsDir = path.join(__dirname, '../assets/screenshots');
        this.browser = null;
        this.ensureScreenshotsDir();
    }

    ensureScreenshotsDir() {
        if (!fs.existsSync(this.screenshotsDir)) {
            fs.mkdirSync(this.screenshotsDir, { recursive: true });
        }
    }

    async init() {
        try {
            console.log('Edge 브라우저 초기화 중...');

            // Edge 실행 파일 경로 찾기
            const edgePaths = [
                '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
                '/usr/bin/microsoft-edge',
                '/usr/bin/edge'
            ];

            let executablePath = null;
            for (const path of edgePaths) {
                if (fs.existsSync(path)) {
                    executablePath = path;
                    break;
                }
            }

            if (!executablePath) {
                console.log('Edge를 찾을 수 없습니다. 기본 Chromium을 사용합니다.');
            } else {
                console.log(`Edge 실행 파일 발견: ${executablePath}`);
            }

            this.browser = await puppeteer.launch({
                headless: "new",
                executablePath: executablePath,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor'
                ]
            });
            console.log('브라우저 초기화 완료');
        } catch (error) {
            console.error('브라우저 초기화 실패:', error.message);
            throw error;
        }
    }

    async takeScreenshot(url, selector = 'body', name = 'screenshot') {
        let page = null;

        try {
            page = await this.browser.newPage();

            // 뷰포트 설정 (컴팩트한 크기)
            await page.setViewport({ width: 1024, height: 768 });

            // 타임아웃 설정
            page.setDefaultTimeout(30000);
            page.setDefaultNavigationTimeout(30000);

            console.log(`페이지 로딩 중: ${url}`);
            await page.goto(url, {
                waitUntil: 'domcontentloaded',
                timeout: 30000
            });

            // 페이지가 완전히 로드될 때까지 잠시 대기
            await page.waitForTimeout(2000);

            // 웹폰트 로딩 대기
            await page.evaluateHandle('document.fonts.ready');
            await page.waitForTimeout(1000); // 폰트 렌더링 대기

            // 특정 요소가 있다면 해당 요소만 스크린샷
            let element = null;
            if (selector !== 'body') {
                try {
                    await page.waitForSelector(selector, { timeout: 5000 });
                    element = await page.$(selector);
                    console.log(`선택자 ${selector} 찾음`);
                } catch (error) {
                    console.warn(`선택자 ${selector}를 찾을 수 없습니다. 전체 페이지를 스크린샷합니다.`);
                }
            }

            console.log(`스크린샷 촬영 중: ${url}`);
            const screenshot = await (element || page).screenshot({
                quality: 95,
                type: 'jpeg',
                fullPage: false
            });

            // 파일명 생성
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];
            const filename = `${dateStr}_${name}.jpg`;
            const filePath = path.join(this.screenshotsDir, filename);

            // 파일 저장
            fs.writeFileSync(filePath, screenshot);
            console.log(`스크린샷 저장: ${filename}`);

            return filePath;

        } catch (error) {
            console.error(`스크린샷 촬영 실패 (${url}):`, error.message);
            return null;
        } finally {
            if (page) {
                try {
                    await page.close();
                } catch (error) {
                    console.warn('페이지 닫기 실패:', error.message);
                }
            }
        }
    }

    async captureLocalSite(pages) {
        try {
            await this.init();

            const results = [];
            for (let i = 0; i < pages.length; i++) {
                const { url, selector = 'body', name } = pages[i];
                console.log(`\n${i + 1}/${pages.length} 번째 스크린샷 준비 중...`);

                const result = await this.takeScreenshot(url, selector, name);
                if (result) {
                    results.push(result);
                }
            }

            return results;
        } catch (error) {
            console.error('로컬 사이트 스크린샷 촬영 실패:', error.message);
            return [];
        } finally {
            if (this.browser) {
                try {
                    await this.browser.close();
                } catch (error) {
                    console.warn('브라우저 닫기 실패:', error.message);
                }
            }
        }
    }

    // 공통 스크린샷 구성
    getCommonPages() {
        return [
            { url: 'http://localhost:4000', name: 'main_page' },
            { url: 'http://localhost:4000/did-i-understand/', name: 'sample_post' },
            { url: 'http://localhost:4000/books_read/', name: 'books_read_page' },
            { url: 'http://localhost:4000/thought/', name: 'thoughts_page' },
            { url: 'http://localhost:4000/about/', name: 'about_page' }
        ];
    }

    // 공통 URL 목록
    getCommonUrls() {
        return [
            'http://localhost:4000',
            'http://localhost:4000/did-i-understand/',
            'http://localhost:4000/books_read/',
            'http://localhost:4000/thought/',
            'http://localhost:4000/about/'
        ];
    }

    async mergeImagesVertically(imagePaths, urls, outputName) {
        try {
            console.log('이미지 세로 병합 중...');

            if (imagePaths.length === 0) {
                console.error('병합할 이미지가 없습니다.');
                return null;
            }

            // 모든 이미지를 동일한 너비로 리사이즈
            const targetWidth = 900; // 고정 너비 (컴팩트한 크기)
            const resizedImages = await Promise.all(
                imagePaths.map(async (imagePath) => {
                    return sharp(imagePath)
                        .resize({
                            width: targetWidth,
                            fit: 'contain',
                            background: { r: 255, g: 255, b: 255, alpha: 1 }
                        })
                        .toBuffer();
                })
            );

            // 각 이미지의 실제 높이 계산
            const imageHeights = await Promise.all(
                resizedImages.map(async (buffer) => {
                    const metadata = await sharp(buffer).metadata();
                    return metadata.height;
                })
            );

            // URL 텍스트 높이 (각 이미지 위에 추가)
            const urlTextHeight = 30;
            const totalHeight = imageHeights.reduce((sum, height) => sum + height + urlTextHeight, 0);

            // 병합된 이미지 생성
            const compositeImages = [];
            let yOffset = 0;

            for (let i = 0; i < resizedImages.length; i++) {
                // URL 텍스트 추가
                const urlText = urls[i] || `Image ${i + 1}`;
                const urlImage = await this.createTextImage(urlText, targetWidth, urlTextHeight);

                compositeImages.push({
                    input: urlImage,
                    left: 0,
                    top: yOffset
                });
                yOffset += urlTextHeight;

                // 스크린샷 이미지 추가
                compositeImages.push({
                    input: resizedImages[i],
                    left: 0,
                    top: yOffset
                });
                yOffset += imageHeights[i];
            }

            // 날짜별 파일명 생성
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];
            const outputFilename = `${dateStr}.jpg`;
            const outputPath = path.join(this.screenshotsDir, outputFilename);

            // 병합된 이미지 저장
            await sharp({
                create: {
                    width: targetWidth,
                    height: totalHeight,
                    channels: 3,
                    background: { r: 255, g: 255, b: 255 }
                }
            })
                .composite(compositeImages)
                .jpeg({ quality: 95, mozjpeg: true })
                .toFile(outputPath);

            console.log(`병합된 이미지 저장: ${outputFilename}`);
            return outputPath;

        } catch (error) {
            console.error('이미지 병합 실패:', error);
            return null;
        }
    }

    async createTextImage(text, width, height) {
        const svg = `
            <svg width="${width}" height="${height}">
                <rect width="100%" height="100%" fill="#f8f9fa" stroke="#dee2e6" stroke-width="1"/>
                <text x="10" y="20" font-family="Arial, sans-serif" font-size="14" fill="#495057">${text}</text>
            </svg>
        `;

        return Buffer.from(svg);
    }

    async captureAndMergeLocalSite(outputName = 'merged_local') {
        try {
            console.log('로컬 사이트 스크린샷 촬영 및 병합 시작...');

            // 1. 스크린샷 촬영 (공통 구성)
            const screenshotResults = await this.captureLocalSite(this.getCommonPages());

            if (!screenshotResults || screenshotResults.length === 0) {
                console.error('스크린샷 생성에 실패했습니다.');
                return null;
            }

            console.log(`스크린샷 생성 완료: ${screenshotResults.length}개 파일`);

            // 2. 이미지 병합 (URL 정보 포함)
            const mergedPath = await this.mergeImagesVertically(screenshotResults, this.getCommonUrls(), outputName);

            if (mergedPath) {
                console.log('✅ 모든 작업이 완료되었습니다!');

                // 3. 개별 파일들 정리
                console.log('개별 파일들 정리 중...');
                screenshotResults.forEach(filePath => {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                        console.log(`삭제됨: ${path.basename(filePath)}`);
                    }
                });

                return mergedPath;
            }

            return null;

        } catch (error) {
            console.error('작업 중 오류 발생:', error);
            return null;
        }
    }

    async captureAndMergePR(prNumber, outputName = null) {
        try {
            if (!outputName) {
                outputName = `merged_pr_${prNumber}`;
            }

            console.log(`PR #${prNumber} 스크린샷 촬영 및 병합 시작...`);

            // 1. 로컬 사이트 스크린샷 촬영 (공통 구성)
            const screenshotResults = await this.captureLocalSite(this.getCommonPages());

            if (!screenshotResults || screenshotResults.length === 0) {
                console.error('스크린샷 생성에 실패했습니다.');
                return null;
            }

            console.log(`스크린샷 생성 완료: ${screenshotResults.length}개 파일`);

            // 2. 이미지 병합 (URL 정보 포함)
            const mergedPath = await this.mergeImagesVertically(screenshotResults, this.getCommonUrls(), outputName);

            if (mergedPath) {
                console.log('✅ 모든 작업이 완료되었습니다!');

                // 3. 개별 파일들 정리
                console.log('개별 파일들 정리 중...');
                screenshotResults.forEach(filePath => {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                        console.log(`삭제됨: ${path.basename(filePath)}`);
                    }
                });

                return mergedPath;
            }

            return null;

        } catch (error) {
            console.error('작업 중 오류 발생:', error);
            return null;
        }
    }

    async captureMergeAndComment(prNumber, message = null, outputName = null) {
        try {
            console.log(`PR #${prNumber} 전체 워크플로우 시작...`);

            // 1. 스크린샷 촬영 및 병합
            const mergedPath = await this.captureAndMergePR(prNumber, outputName);

            if (!mergedPath) {
                console.error('스크린샷 촬영 및 병합에 실패했습니다.');
                return false;
            }

            // 2. PR에 댓글 작성
            console.log('PR 댓글 작성 중...');
            const defaultMessage = `## 📸 PR 변경사항 스크린샷

PR #${prNumber}의 주요 변경사항을 스크린샷으로 캡처했습니다.

### 포함된 내용:
- PR 헤더 정보
- 변경된 파일 목록
- 커밋 히스토리

---
*자동 생성된 병합 스크린샷입니다.*`;

            const filename = path.basename(mergedPath);
            const result = await this.commenter.commentOnPR(
                prNumber,
                message || defaultMessage,
                [filename]
            );

            if (result) {
                console.log('✅ 모든 작업이 완료되었습니다!');
                return true;
            } else {
                console.error('❌ 댓글 작성에 실패했습니다.');
                return false;
            }

        } catch (error) {
            console.error('작업 중 오류 발생:', error);
            return false;
        }
    }
}

// CLI 사용 예시
if (require.main === module) {
    const screenshotAndComment = new PuppeteerScreenshotAndComment();

    const args = process.argv.slice(2);
    const command = args[0];

    if (command === 'pr' && args[1]) {
        const prNumber = args[1];
        const outputName = args[2];

        screenshotAndComment.captureAndMergePR(prNumber, outputName)
            .then(result => {
                if (result) {
                    console.log(`\n완료! 병합된 파일: ${result}`);
                } else {
                    console.error('작업 실패');
                    process.exit(1);
                }
            });

    } else if (command === 'full' && args[1]) {
        const prNumber = args[1];
        const message = args[2];
        const outputName = args[3];

        screenshotAndComment.captureMergeAndComment(prNumber, message, outputName)
            .then(success => {
                if (!success) {
                    process.exit(1);
                }
            });

    } else {
        console.log('사용법:');
        console.log('  node puppeteer_screenshot_and_comment.js pr <PR번호> [output_name]');
        console.log('  node puppeteer_screenshot_and_comment.js full <PR번호> [메시지] [output_name]');
        console.log('');
        console.log('예시:');
        console.log('  node puppeteer_screenshot_and_comment.js pr 57');
        console.log('  node puppeteer_screenshot_and_comment.js full 57 "변경사항 확인"');
    }
}

module.exports = PuppeteerScreenshotAndComment;
