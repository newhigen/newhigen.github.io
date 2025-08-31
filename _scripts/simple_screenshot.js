const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class SimpleScreenshot {
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
            this.browser = await puppeteer.launch({
                headless: "new",
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            });
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

    async capturePRChanges(prNumber) {
        try {
            await this.init();

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

            const results = [];

            for (let i = 0; i < urls.length; i++) {
                const url = urls[i];
                const selector = selectors[i];
                const name = `pr_${prNumber}_part_${i + 1}`;

                console.log(`스크린샷 촬영 중: ${url}`);
                const result = await this.takeScreenshot(url, selector, name);

                if (result) {
                    results.push(result);
                }
            }

            return results;
        } catch (error) {
            console.error('PR 스크린샷 촬영 실패:', error.message);
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

    async captureCustom(urls, selectors = [], name = 'custom') {
        try {
            await this.init();

            const results = [];

            for (let i = 0; i < urls.length; i++) {
                const url = urls[i];
                const selector = selectors[i] || 'body';
                const screenshotName = `${name}_part_${i + 1}`;

                console.log(`스크린샷 촬영 중: ${url}`);
                const result = await this.takeScreenshot(url, selector, screenshotName);

                if (result) {
                    results.push(result);
                }
            }

            return results;
        } catch (error) {
            console.error('커스텀 스크린샷 촬영 실패:', error.message);
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
}

// CLI 사용 예시
if (require.main === module) {
    const screenshot = new SimpleScreenshot();

    const args = process.argv.slice(2);
    const command = args[0];

    if (command === 'pr' && args[1]) {
        const prNumber = args[1];
        screenshot.capturePRChanges(prNumber)
            .then(results => {
                if (results && results.length > 0) {
                    console.log('완료! 생성된 파일들:');
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

    } else if (command === 'custom') {
        const urls = args.slice(1);
        if (urls.length > 0) {
            screenshot.captureCustom(urls, [], 'custom')
                .then(results => {
                    if (results && results.length > 0) {
                        console.log('완료! 생성된 파일들:');
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
            console.log('사용법: node simple_screenshot.js custom <url1> <url2> ...');
        }
    } else {
        console.log('사용법:');
        console.log('  node simple_screenshot.js pr <PR번호>');
        console.log('  node simple_screenshot.js custom <url1> <url2> ...');
    }
}

module.exports = SimpleScreenshot;
