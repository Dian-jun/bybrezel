# 교민 가계부 — bybrezel.com/money 배포 가이드

## 추가할 파일 목록

아래 파일들을 bybrezel 저장소에 추가하세요:

```
money/
├── index.html          ← 가계부 앱
├── manifest.json       ← PWA 설정
├── service-worker.js   ← 오프라인 캐싱
└── icons/
    ├── icon-192.png
    └── icon-512.png

functions/
└── money/
    └── api/
        └── parse.js    ← Anthropic API 프록시 (Cloudflare Workers 형식)

_redirects              ← SPA 라우팅 (기존 파일이 있으면 아래 한 줄만 추가)
```

---

## 1. 파일을 저장소에 추가

로컬에서 bybrezel 저장소를 clone한 뒤:

```bash
git clone https://github.com/Dian-jun/bybrezel.git
cd bybrezel

# 이 zip에서 압축 푼 파일들을 복사
# money/ 폴더 → bybrezel/money/
# functions/money/ 폴더 → bybrezel/functions/money/
# _redirects → bybrezel/_redirects (기존 파일 있으면 내용만 추가)

git add .
git commit -m "교민 가계부 PWA 추가 (/money)"
git push
```

---

## 2. Cloudflare 환경변수 설정 (중요!)

Cloudflare 대시보드에서:

```
Pages → bybrezel → Settings → Environment variables → Add variable

Variable name:  ANTHROPIC_API_KEY
Value:          sk-ant-여기에_실제_키_입력
```

Production과 Preview 둘 다 설정해주세요.

저장 후 **배포 재시작** (Deployments → 최신 배포 → Retry deployment)

---

## 3. 확인

배포 완료 후 `https://bybrezel.com/money` 접속

---

## 4. 폰에 설치 (홈 화면 추가)

### iPhone (Safari)
1. `bybrezel.com/money` Safari로 열기
2. 하단 공유 버튼 → **홈 화면에 추가**

### Android (Chrome)
1. `bybrezel.com/money` Chrome으로 열기
2. 주소창 메뉴 → **앱 설치**

---

## 기존 _redirects 파일이 있는 경우

파일을 덮어쓰지 말고, 기존 내용 아래에 이 줄만 추가:
```
/money/*  /money/index.html  200
```
