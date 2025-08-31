const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class MacScreenshot {
    constructor() {
        this.screenshotsDir = path.join(__dirname, '../assets/screenshots');
        this.ensureScreenshotsDir();
    }

    ensureScreenshotsDir() {
        if (!fs.existsSync(this.screenshotsDir)) {
            fs.mkdirSync(this.screenshotsDir, { recursive: true });
        }
    }

    async takeScreenshot(name = 'screenshot', mode = 'window') {
        try {
            // 날짜별 파일명 생성
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
            const filename = `${dateStr}_${name}.jpg`;
            const filepath = path.join(this.screenshotsDir, filename);

            console.log(`스크린샷 촬영 중: ${name} (모드: ${mode})`);

            let command;
            switch (mode) {
                case 'window':
                    // -w: 활성 창 캡처
                    command = `screencapture -x -w -t jpg "${filepath}"`;
                    break;
                case 'area':
                    // -i: 대화형 영역 선택
                    command = `screencapture -x -i -t jpg "${filepath}"`;
                    break;
                case 'full':
                default:
                    // 전체 화면 캡처
                    command = `screencapture -x -t jpg "${filepath}"`;
                    break;
            }

            execSync(command, { stdio: 'inherit' });

            console.log(`스크린샷 저장: ${filename}`);
            return filepath;

        } catch (error) {
            console.error(`스크린샷 실패 (${name}):`, error.message);
            return null;
        }
    }

    async takeMultipleScreenshots(screenshots = []) {
        const results = [];

        for (let i = 0; i < screenshots.length; i++) {
            const { name, mode = 'window' } = screenshots[i];
            console.log(`\n${i + 1}/${screenshots.length} 번째 스크린샷 준비 중...`);

            if (mode === 'window') {
                console.log('3초 후 활성 창을 캡처합니다. 원하는 창을 활성화하세요.');
            } else if (mode === 'area') {
                console.log('3초 후 영역을 선택할 수 있습니다. 캡처할 영역을 준비하세요.');
            } else {
                console.log('3초 후 전체 화면을 캡처합니다.');
            }

            // 3초 대기
            await new Promise(resolve => setTimeout(resolve, 3000));

            const result = await this.takeScreenshot(name, mode);
            if (result) {
                results.push(result);
            }
        }

        return results;
    }

    async capturePRScreenshots(prNumber) {
        const screenshots = [
            { name: `pr_${prNumber}_header`, mode: 'window' },
            { name: `pr_${prNumber}_files`, mode: 'window' },
            { name: `pr_${prNumber}_commits`, mode: 'window' }
        ];

        console.log(`PR #${prNumber} 스크린샷 촬영을 시작합니다.`);
        console.log('각 단계에서 해당하는 GitHub 페이지를 활성화하세요.');

        return await this.takeMultipleScreenshots(screenshots);
    }

    async captureCustomScreenshots(screenshots) {
        console.log('커스텀 스크린샷 촬영을 시작합니다.');
        console.log('각 단계에서 원하는 창을 활성화하거나 영역을 선택하세요.');

        return await this.takeMultipleScreenshots(screenshots);
    }

    async captureSimpleScreenshots(names) {
        // 기존 호환성을 위한 메서드
        const screenshots = names.map(name => ({ name, mode: 'window' }));
        return await this.captureCustomScreenshots(screenshots);
    }
}

// CLI 사용 예시
if (require.main === module) {
    const screenshot = new MacScreenshot();

    const args = process.argv.slice(2);
    const command = args[0];

    if (command === 'pr' && args[1]) {
        const prNumber = args[1];
        screenshot.capturePRScreenshots(prNumber)
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

    } else if (command === 'custom') {
        const names = args.slice(1);
        if (names.length > 0) {
            screenshot.captureSimpleScreenshots(names)
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
            console.log('사용법: node mac_screenshot.js custom <name1> <name2> ...');
        }
    } else if (command === 'single') {
        const name = args[1] || 'screenshot';
        const mode = args[2] || 'window';
        screenshot.takeScreenshot(name, mode)
            .then(result => {
                if (result) {
                    console.log(`\n완료! 생성된 파일: ${result}`);
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
        console.log('  node mac_screenshot.js pr <PR번호>');
        console.log('  node mac_screenshot.js custom <name1> <name2> ...');
        console.log('  node mac_screenshot.js single [name] [mode]');
        console.log('');
        console.log('모드 옵션:');
        console.log('  window  - 활성 창 캡처 (기본값)');
        console.log('  area    - 영역 선택 캡처');
        console.log('  full    - 전체 화면 캡처');
        console.log('');
        console.log('예시:');
        console.log('  node mac_screenshot.js pr 57');
        console.log('  node mac_screenshot.js custom main_page about_page');
        console.log('  node mac_screenshot.js single test window');
        console.log('  node mac_screenshot.js single area_test area');
    }
}

module.exports = MacScreenshot;
