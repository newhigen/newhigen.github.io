# 블로그 테스트 전략 가이드

이 문서는 언제, 어떤 테스트를 실행해야 하는지에 대한 가이드입니다.

## 🎯 테스트 실행 시점

### 1. **자동 실행 (권장)**

#### Git Pre-commit Hook
- **시점**: `git commit` 실행 시 자동
- **테스트**: 빠른 빌드 + 변경된 파일에 따른 선택적 테스트
- **장점**: 실수 방지, 자동화
- **설정**: 이미 활성화됨

```bash
git add .
git commit -m "Update blog"  # 자동으로 테스트 실행
```

#### VS Code 자동 저장 (선택사항)
- **시점**: 파일 저장 시 자동
- **테스트**: 스마트 테스트 (변경된 파일에 따라)
- **장점**: 즉시 피드백
- **설정**: `.vscode/settings.json`에서 설정

### 2. **수동 실행**

#### 개발 중 (빠른 피드백)
```bash
# 스마트 테스트 (변경된 파일만)
make smart-test

# 빠른 체크
make quick-check
```

#### 주요 변경 후 (포괄적 검증)
```bash
# 전체 테스트
make test

# 상태 모니터링
make monitor
```

#### 배포 전 (최종 검증)
```bash
# 배포 준비 (테스트 + CI + 모니터링)
make deploy

# 전체 점검
make full-check
```

## 📊 테스트 우선순위

### 🔴 **크리티컬 (항상 실행)**
1. **빌드 테스트** - 사이트가 제대로 빌드되는지
2. **설정 파일 문법** - YAML 문법 오류 방지
3. **필수 파일 존재** - index.html, feed.xml, sitemap.xml

### 🟡 **중요 (변경 시 실행)**
1. **포스트 형식** - 파일명, Front matter
2. **링크 검증** - 내부 링크 유효성
3. **에셋 존재** - CSS, JS 파일

### 🟢 **권장 (정기적 실행)**
1. **SEO 요소** - 메타 태그, 제목
2. **성능 분석** - 빌드 시간, 파일 크기
3. **전체 건강도** - 종합적인 블로그 상태

## ⚡ 성능 최적화

### 빠른 테스트 (5초 이내)
```bash
make smart-test      # 변경된 파일만
make pre-commit-check # 커밋 전 최소 체크
```

### 중간 테스트 (30초 이내)
```bash
make quick-check     # 테스트 + 모니터링
make test            # 전체 테스트 스위트
```

### 전체 테스트 (1-2분)
```bash
make full-check      # 모든 도구 실행
make deploy          # 배포 준비
```

## 🛠️ 상황별 권장사항

### 새 포스트 작성 시
```bash
# 1. 포스트 생성
make new-post

# 2. 내용 작성 후
make smart-test      # 빠른 검증

# 3. 커밋 시 (자동)
git add .
git commit -m "Add new post"
```

### 설정 변경 시
```bash
# 1. _config.yml 수정

# 2. 즉시 검증
ruby -e "require 'yaml'; YAML.load_file('_config.yml')"

# 3. 빌드 테스트
make build

# 4. 커밋 (자동 테스트)
git commit -m "Update config"
```

### 스타일/레이아웃 변경 시
```bash
# 1. 파일 수정

# 2. 로컬 확인
make serve

# 3. 빌드 테스트
make build

# 4. 커밋 (자동 테스트)
git commit -m "Update styles"
```

### 정기적인 유지보수
```bash
# 주간
make monitor         # 상태 확인

# 월간
make full-check      # 전체 점검
```

## 🚨 문제 해결

### 테스트 실패 시
```bash
# 1. 오류 확인
make test

# 2. 구체적인 문제 해결
# - 빌드 실패: bundle install, 의존성 확인
# - 포스트 오류: 파일명, Front matter 확인
# - 링크 오류: 내부 링크 경로 확인

# 3. 재테스트
make quick-check
```

### 성능 문제 시
```bash
# 1. 성능 분석
make monitor

# 2. 큰 파일 확인
find _site -size +1M

# 3. 빌드 시간 측정
time make build
```

## 💡 팁

1. **자동화 활용**: Git hooks와 VS Code 설정을 최대한 활용
2. **단계적 테스트**: 개발 중에는 빠른 테스트, 배포 전에는 전체 테스트
3. **정기 점검**: 주간 모니터링, 월간 전체 점검
4. **문제 조기 발견**: 작은 변경에도 테스트 실행하여 문제 조기 발견

## 📈 모니터링 지표

- **빌드 성공률**: 100% 목표
- **테스트 통과율**: 95% 이상 목표
- **빌드 시간**: 30초 이내 목표
- **건강도 점수**: 80점 이상 목표
