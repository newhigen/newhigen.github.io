const SimpleScreenshot = require('./simple_screenshot');
const PRCommenter = require('./comment_with_files');

class ScreenshotAndCommentSimple {
    constructor() {
        this.screenshot = new SimpleScreenshot();
        this.commenter = new PRCommenter();
    }

    async capturePRAndComment(prNumber, message = null) {
        console.log(`PR #${prNumber} 스크린샷 촬영 및 댓글 작성 시작...`);

        try {
            // 1. PR 스크린샷 촬영
            console.log('1단계: PR 스크린샷 촬영 중...');
            const screenshotResults = await this.screenshot.capturePRChanges(prNumber);

            if (!screenshotResults || screenshotResults.length === 0) {
                console.error('스크린샷 생성에 실패했습니다.');
                return false;
            }

            console.log(`스크린샷 생성 완료: ${screenshotResults.length}개 파일`);

            // 2. PR에 댓글 작성
            console.log('2단계: PR 댓글 작성 중...');
            const defaultMessage = `## 📸 PR 변경사항 스크린샷

PR #${prNumber}의 주요 변경사항을 스크린샷으로 캡처했습니다.

### 포함된 내용:
- PR 헤더 정보
- 변경된 파일 목록
- 커밋 히스토리

---
*자동 생성된 스크린샷입니다.*`;

            // 파일명만 추출
            const filenames = screenshotResults.map(path => require('path').basename(path));

            const result = await this.commenter.commentOnPR(
                prNumber,
                message || defaultMessage,
                filenames
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

    async captureCustomAndComment(prNumber, urls, selectors = [], message = null) {
        console.log(`PR #${prNumber} 커스텀 스크린샷 촬영 및 댓글 작성 시작...`);

        try {
            // 1. 커스텀 스크린샷 촬영
            console.log('1단계: 커스텀 스크린샷 촬영 중...');
            const screenshotResults = await this.screenshot.captureCustom(urls, selectors, `custom_pr_${prNumber}`);

            if (!screenshotResults || screenshotResults.length === 0) {
                console.error('스크린샷 생성에 실패했습니다.');
                return false;
            }

            console.log(`스크린샷 생성 완료: ${screenshotResults.length}개 파일`);

            // 2. PR에 댓글 작성
            console.log('2단계: PR 댓글 작성 중...');
            const defaultMessage = `## 📸 커스텀 스크린샷

PR #${prNumber} 관련 커스텀 스크린샷입니다.

### 촬영된 URL들:
${urls.map((url, i) => `${i + 1}. ${url}`).join('\n')}

---
*자동 생성된 스크린샷입니다.*`;

            // 파일명만 추출
            const filenames = screenshotResults.map(path => require('path').basename(path));

            const result = await this.commenter.commentOnPR(
                prNumber,
                message || defaultMessage,
                filenames
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
    const screenshotAndComment = new ScreenshotAndCommentSimple();

    const args = process.argv.slice(2);
    const command = args[0];

    if (command === 'pr' && args[1]) {
        const prNumber = args[1];
        const message = args[2];

        screenshotAndComment.capturePRAndComment(prNumber, message)
            .then(success => {
                if (!success) {
                    process.exit(1);
                }
            });

    } else if (command === 'custom' && args.length >= 3) {
        const prNumber = args[1];
        const urls = args.slice(2, -1); // 마지막 인자는 메시지
        const message = args[args.length - 1];

        screenshotAndComment.captureCustomAndComment(prNumber, urls, [], message)
            .then(success => {
                if (!success) {
                    process.exit(1);
                }
            });

    } else {
        console.log('사용법:');
        console.log('  node screenshot_and_comment_simple.js pr <PR번호> [메시지]');
        console.log('  node screenshot_and_comment_simple.js custom <PR번호> <url1> <url2> ... [메시지]');
        console.log('');
        console.log('예시:');
        console.log('  node screenshot_and_comment_simple.js pr 57');
        console.log('  node screenshot_and_comment_simple.js pr 57 "변경사항 확인 완료"');
        console.log('  node screenshot_and_comment_simple.js custom 57 https://example.com "커스텀 스크린샷"');
    }
}

module.exports = ScreenshotAndCommentSimple;
