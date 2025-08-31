const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class PRCommenter {
    constructor() {
        this.screenshotsDir = path.join(__dirname, '../assets/screenshots');
    }

    getScreenshotsByDate(dateStr = null) {
        if (!dateStr) {
            const today = new Date();
            dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
        }

        if (!fs.existsSync(this.screenshotsDir)) {
            console.error('스크린샷 디렉토리가 존재하지 않습니다.');
            return [];
        }

        const files = fs.readdirSync(this.screenshotsDir);
        const todayFiles = files.filter(file =>
            file.startsWith(dateStr) && (file.endsWith('.jpg') || file.endsWith('.png'))
        );

        return todayFiles.sort();
    }

    getScreenshotUrl(filename) {
        // GitHub Pages URL 형식으로 변환
        return `https://newhigen.github.io/assets/screenshots/${filename}`;
    }

    async commentOnPR(prNumber, message, screenshotFiles = []) {
        try {
            let comment = message;

            if (screenshotFiles.length > 0) {
                comment += '\n\n## 📸 스크린샷';

                screenshotFiles.forEach((filename, index) => {
                    const url = this.getScreenshotUrl(filename);
                    comment += `\n\n### ${index + 1}. ${filename.replace(/^\d{4}-\d{2}-\d{2}_/, '')}`;
                    comment += `\n![스크린샷 ${index + 1}](${url})`;
                });
            }

            // GitHub CLI를 사용하여 댓글 작성
            const command = `gh pr comment ${prNumber} --body "${comment.replace(/"/g, '\\"')}"`;
            console.log('실행할 명령어:', command);

            const result = execSync(command, { encoding: 'utf8' });
            console.log('댓글 작성 완료!');
            return result;

        } catch (error) {
            console.error('댓글 작성 실패:', error.message);
            return null;
        }
    }

    async commentWithLatestScreenshots(prNumber, message, dateStr = null) {
        const screenshotFiles = this.getScreenshotsByDate(dateStr);

        if (screenshotFiles.length === 0) {
            console.error(`${dateStr || '오늘'} 날짜의 스크린샷이 없습니다.`);
            return null;
        }

        return await this.commentOnPR(prNumber, message, screenshotFiles);
    }

    async commentWithSpecificScreenshots(prNumber, message, filenames) {
        return await this.commentOnPR(prNumber, message, filenames);
    }
}

// CLI 사용 예시
if (require.main === module) {
    const commenter = new PRCommenter();

    const args = process.argv.slice(2);
    const prNumber = args[0];
    const message = args[1] || '스크린샷이 포함된 댓글입니다.';
    const dateStr = args[2]; // 선택적 날짜 (YYYY-MM-DD)

    if (!prNumber) {
        console.log('사용법: node comment_with_files.js <PR번호> [메시지] [날짜]');
        console.log('예시: node comment_with_files.js 57 "변경사항 스크린샷" 2025-08-31');
        process.exit(1);
    }

    commenter.commentWithLatestScreenshots(prNumber, message, dateStr)
        .then(result => {
            if (result) {
                console.log('성공적으로 댓글이 작성되었습니다.');
            } else {
                console.error('댓글 작성에 실패했습니다.');
                process.exit(1);
            }
        });
}

module.exports = PRCommenter;
