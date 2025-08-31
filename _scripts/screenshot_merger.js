const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

class ScreenshotMerger {
    constructor() {
        this.browser = null;
        this.screenshotsDir = path.join(__dirname, '../assets/screenshots');
        this.ensureScreenshotsDir();
    }

    ensureScreenshotsDir() {
        if (!fs.existsSync(this.screenshotsDir)) {
            fs.mkdirSync(this.screenshotsDir, { recursive: true });
        }
    }

    async init() {
        this.browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }

    async takeScreenshot(url, selector = 'body', name = 'screenshot') {
        const page = await this.browser.newPage();

        // 뷰포트 설정 (네모낳게)
        await page.setViewport({ width: 1200, height: 800 });

        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

            // 특정 요소가 있다면 해당 요소만 스크린샷
            let element = null;
            if (selector !== 'body') {
                await page.waitForSelector(selector, { timeout: 5000 });
                element = await page.$(selector);
            }

            const screenshot = await (element || page).screenshot({
                type: 'png',
                fullPage: false
            });

            const filename = `${name}_${Date.now()}.png`;
            const filepath = path.join(this.screenshotsDir, filename);
            fs.writeFileSync(filepath, screenshot);

            console.log(`스크린샷 저장: ${filename}`);
            return filepath;

        } catch (error) {
            console.error(`스크린샷 실패 (${url}):`, error.message);
            return null;
        } finally {
            await page.close();
        }
    }

    async mergeScreenshotsHorizontally(screenshotPaths, outputName) {
        if (screenshotPaths.length === 0) {
            console.error('병합할 스크린샷이 없습니다.');
            return null;
        }

        try {
            // 모든 이미지 로드
            const images = await Promise.all(
                screenshotPaths.map(path => loadImage(path))
            );

            // 전체 너비와 최대 높이 계산
            const totalWidth = images.reduce((sum, img) => sum + img.width, 0);
            const maxHeight = Math.max(...images.map(img => img.height));

            // 캔버스 생성
            const canvas = createCanvas(totalWidth, maxHeight);
            const ctx = canvas.getContext('2d');

            // 이미지들을 가로로 배치
            let xOffset = 0;
            for (const image of images) {
                ctx.drawImage(image, xOffset, 0);
                xOffset += image.width;
            }

            // 날짜별 파일명 생성
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
            const outputFilename = `${dateStr}_${outputName}.jpg`;
            const outputPath = path.join(this.screenshotsDir, outputFilename);

            // JPEG로 저장
            const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
            fs.writeFileSync(outputPath, buffer);

            console.log(`병합된 스크린샷 저장: ${outputFilename}`);

            // 임시 파일들 정리
            screenshotPaths.forEach(path => {
                if (fs.existsSync(path)) {
                    fs.unlinkSync(path);
                }
            });

            return outputPath;
        } catch (error) {
            console.error('이미지 병합 실패:', error);
            return null;
        }
    }

    async captureAndMerge(urls, selectors = [], outputName = 'merged') {
        await this.init();

        const screenshotPaths = [];

        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            const selector = selectors[i] || 'body';
            const name = `part_${i + 1}`;

            console.log(`스크린샷 촬영 중: ${url}`);
            const screenshotPath = await this.takeScreenshot(url, selector, name);

            if (screenshotPath) {
                screenshotPaths.push(screenshotPath);
            }
        }

        await this.browser.close();

        if (screenshotPaths.length > 0) {
            return await this.mergeScreenshotsHorizontally(screenshotPaths, outputName);
        }

        return null;
    }

    async capturePRChanges(prNumber, outputName = 'pr_changes') {
        // PR 관련 URL들
        const baseUrl = 'https://github.com/newhigen/newhigen.github.io';
        const urls = [
            `${baseUrl}/pull/${prNumber}`,
            `${baseUrl}/pull/${prNumber}/files`,
            `${baseUrl}/pull/${prNumber}/commits`
        ];

        const selectors = [
            '.gh-header',
            '.file',
            '.commit'
        ];

        return await this.captureAndMerge(urls, selectors, outputName);
    }
}

// CLI 사용 예시
if (require.main === module) {
    const merger = new ScreenshotMerger();

    const args = process.argv.slice(2);
    const command = args[0];

    if (command === 'pr' && args[1]) {
        const prNumber = args[1];
        merger.capturePRChanges(prNumber, `pr_${prNumber}`)
            .then(result => {
                if (result) {
                    console.log(`완료: ${result}`);
                } else {
                    console.error('스크린샷 생성 실패');
                    process.exit(1);
                }
            });
    } else if (command === 'custom') {
        const urls = args.slice(1);
        if (urls.length > 0) {
            merger.captureAndMerge(urls, [], 'custom')
                .then(result => {
                    if (result) {
                        console.log(`완료: ${result}`);
                    } else {
                        console.error('스크린샷 생성 실패');
                        process.exit(1);
                    }
                });
        } else {
            console.log('사용법: node screenshot_merger.js custom <url1> <url2> ...');
        }
    } else {
        console.log('사용법:');
        console.log('  node screenshot_merger.js pr <PR번호>');
        console.log('  node screenshot_merger.js custom <url1> <url2> ...');
    }
}

module.exports = ScreenshotMerger;
