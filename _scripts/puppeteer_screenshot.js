const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class PuppeteerScreenshot {
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

            // 뷰포트 설정 (네모낳게)
            await page.setViewport({ width: 1200, height: 800 });

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
                type: 'jpeg',
                quality: 90,
                fullPage: false
            });

            // 날짜별 파일명 생성
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
            const filename = `${dateStr}_${name}.jpg`;
            const filepath = path.join(this.screenshotsDir, filename);
            fs.writeFileSync(filepath, screenshot);

            console.log(`스크린샷 저장: ${filename}`);
            return filepath;

        } catch (error) {
            console.error(`스크린샷 실패 (${url}):`, error.message);
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

    async captureLocalSite(pages = []) {
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

    async capturePRChanges(prNumber) {
        try {
            await this.init();

            const baseUrl = 'https://github.com/newhigen/newhigen.github.io';
            const pages = [
                { url: `${baseUrl}/pull/${prNumber}`, selector: '.gh-header', name: `pr_${prNumber}_header` },
                { url: `${baseUrl}/pull/${prNumber}/files`, selector: '.file', name: `pr_${prNumber}_files` },
                { url: `${baseUrl}/pull/${prNumber}/commits`, selector: '.commit', name: `pr_${prNumber}_commits` }
            ];

            return await this.captureLocalSite(pages);
        } catch (error) {
            console.error('PR 스크린샷 촬영 실패:', error.message);
            return [];
        }
    }
}

// CLI 사용 예시
if (require.main === module) {
    const screenshot = new PuppeteerScreenshot();

    const args = process.argv.slice(2);
    const command = args[0];

    if (command === 'local') {
        const pages = [
            { url: 'http://localhost:4000', name: 'main_page' },
            { url: 'http://localhost:4000/about/', name: 'about_page' }
        ];

        screenshot.captureLocalSite(pages)
            .then(results => {
                if (results && results.length > 0) {
                    console.log('\n완료! 생성된 파일들:');
                    results.forEach(file => console.log(`  - ${file}`));
                } else {
                    console.error('스크린샷 생성 실패');
                    process.exit(1);
                }
            })
            .catch(error => {
                console.error('스크립트 실행 실패:', error.message);
                process.exit(1);
            });

    } else if (command === 'pr' && args[1]) {
        const prNumber = args[1];
        screenshot.capturePRChanges(prNumber)
            .then(results => {
                if (results && results.length > 0) {
                    console.log('\n완료! 생성된 파일들:');
                    results.forEach(file => console.log(`  - ${file}`));
                } else {
                    console.error('스크린샷 생성 실패');
                    process.exit(1);
                }
            })
            .catch(error => {
                console.error('스크립트 실행 실패:', error.message);
                process.exit(1);
            });

    } else {
        console.log('사용법:');
        console.log('  node puppeteer_screenshot.js local');
        console.log('  node puppeteer_screenshot.js pr <PR번호>');
        console.log('');
        console.log('예시:');
        console.log('  node puppeteer_screenshot.js local');
        console.log('  node puppeteer_screenshot.js pr 57');
    }
}

module.exports = PuppeteerScreenshot;
