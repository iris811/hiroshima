# 🇯🇵 히로시마 여행 가이드 웹사이트

2025년 11월 7일~11일 히로시마 여행 일정을 한눈에 볼 수 있는 인터랙티브 웹사이트입니다.

## ✨ 주요 기능

- 📅 **날짜별 일정 카드**: 각 날짜의 주요 일정을 이미지와 함께 한눈에 확인
- 🗺️ **인터랙티브 지도**: Leaflet.js를 사용한 동선 시각화
- ⏰ **타임라인 뷰**: 각 장소의 상세 정보를 시간순으로 정리
- 🏨 **호텔 주변 안내**: KIRO THE SHARE HOTELS 주변 정보를 펼침 메뉴(FAQ)로 제공
- 🤖 **AI 여행 도우미**: Claude API를 활용한 대화형 챗봇으로 여행 관련 질문 응답
- 📱 **반응형 디자인**: 모바일, 태블릿, 데스크톱 모두 지원
- 🎨 **현대적인 UI/UX**: 부드러운 애니메이션과 직관적인 인터페이스

## 📁 프로젝트 구조

```
hiroshima-trip/
├── index.html              # 메인 페이지 (날짜별 카드 뷰)
├── day.html                # 상세 페이지 (일별 동선 및 정보)
├── server.js               # Express 서버 (Claude API 프록시)
├── package.json            # Node.js 의존성
├── .env                    # 환경 변수 (git에 커밋되지 않음)
├── .gitignore              # Git 무시 파일 목록
├── css/
│   └── style.css           # 스타일시트
├── js/
│   ├── script.js           # 메인 페이지 로직
│   ├── day.js              # 상세 페이지 로직 (지도 포함)
│   ├── hotel-guide.js      # FAQ 아코디언 기능
│   └── chatbot.js          # 챗봇 인터페이스
├── data/
│   ├── itinerary.json      # 여행 일정 데이터
│   └── hotel-guide.json    # 호텔 주변 안내 데이터
├── images/                 # 로컬 이미지 저장소
└── scripts/                # 유틸리티 스크립트
```

## 🚀 사용 방법

### 1. 필수 요구사항

- Node.js 16.x 이상
- npm 또는 yarn

### 2. 설치

```bash
# 프로젝트 디렉토리로 이동
cd hiroshima-trip

# 의존성 설치
npm install
```

### 3. 환경 변수 설정

`.env` 파일을 열고 다음 값들을 설정하세요:

```env
# Google Places API Key (이미지 검색용 - 선택사항)
GOOGLE_PLACES_API_KEY=your_google_api_key_here

# Claude API Key (챗봇 기능 - 필수)
CLAUDE_API_KEY=your_claude_api_key_here

# 서버 포트 (기본값: 3000)
PORT=3000
```

#### Claude API 키 발급 방법

1. [Anthropic Console](https://console.anthropic.com/)에 접속
2. 로그인 또는 회원가입
3. API Keys 섹션으로 이동
4. "Create Key" 버튼 클릭
5. 생성된 API 키를 `.env` 파일의 `CLAUDE_API_KEY`에 입력

### 4. 서버 실행

```bash
# 서버 시작
npm start
```

또는

```bash
node server.js
```

서버가 실행되면 브라우저에서 `http://localhost:3000`으로 접속하세요.

## 🌐 웹에 배포하기 (Vercel)

챗봇 기능을 포함하여 웹에 배포하려면 Vercel을 사용하세요:

### 1. Vercel 계정 만들기

1. [Vercel](https://vercel.com)에 접속
2. GitHub 계정으로 회원가입/로그인

### 2. GitHub 저장소 연결

1. Vercel 대시보드에서 "New Project" 클릭
2. GitHub 저장소 `iris811/hiroshima` 선택
3. Import 클릭

### 3. 환경 변수 설정

프로젝트 설정에서 Environment Variables 추가:

- `CLAUDE_API_KEY`: Claude API 키 입력

### 4. 배포

1. "Deploy" 버튼 클릭
2. 몇 분 후 자동으로 배포 완료
3. 제공된 URL(예: `https://hiroshima-trip.vercel.app`)로 접속

### 5. 자동 배포

이후 GitHub에 push할 때마다 자동으로 재배포됩니다.

### 📝 챗봇 없이 사용하기

챗봇 기능 없이 정적 사이트로만 사용하려면:

1. **Python을 사용하는 경우**:
   ```bash
   python -m http.server 8000
   ```

2. **VS Code Live Server를 사용하는 경우**:
   - Live Server 확장 프로그램 설치
   - index.html 파일에서 우클릭 → "Open with Live Server"

3. 브라우저에서 `http://localhost:8000` 접속
   (챗봇 기능은 작동하지 않지만, 나머지 기능은 모두 사용 가능)

## 🎯 기능 설명

### 메인 페이지 (index.html)

- 5일간의 여행 일정을 카드 형식으로 표시
- 각 카드에는 날짜, 제목, 요약, 방문 장소 수 표시
- 카드 클릭 시 해당 날짜의 상세 페이지로 이동

### 상세 페이지 (day.html)

- **지도**: OpenStreetMap 기반 인터랙티브 지도
  - 각 장소를 번호가 매겨진 마커로 표시
  - 마커 클릭 시 장소 정보 팝업 표시
  - 자동으로 모든 장소가 보이도록 줌 조정

- **타임라인**: 시간순으로 정렬된 장소 정보
  - 장소 이름, 시간, 유형, 설명
  - 태그로 구분된 카테고리
  - 구글 지도 링크
  - 클릭 시 지도에서 해당 위치로 이동

### 호텔 주변 안내

- 메인 페이지 하단에 "KIRO THE SHARE HOTELS 주변 안내" 섹션
- 펼침 메뉴(FAQ Accordion) 형식으로 정보 제공
- 질문 클릭 시 답변이 부드럽게 펼쳐짐
- 쇼핑, 편의시설, 주변 분위기 등 실용적인 정보 포함

### AI 여행 도우미 챗봇

- "💬 여행 도우미에게 질문하기" 버튼으로 챗봇 활성화
- Claude AI를 활용한 자연스러운 대화
- 여행 일정 전체를 컨텍스트로 활용하여 정확한 답변 제공
- 호텔 주변 정보, 일정 문의, 추천 등 다양한 질문 가능
- 실시간 로딩 인디케이터로 사용자 경험 향상

## 🛠️ 커스터마이징

### 일정 수정

`data/itinerary.json` 파일을 편집하여 일정을 수정할 수 있습니다:

```json
{
  "name": "장소 이름",
  "type": "식당|카페|관광|쇼핑|숙소",
  "time": "시간 (선택사항)",
  "address": "주소",
  "description": "설명",
  "mapUrl": "구글 지도 링크",
  "tags": ["태그1", "태그2"]
}
```

### 스타일 수정

`css/style.css` 파일에서 색상, 폰트, 레이아웃을 변경할 수 있습니다:

```css
:root {
    --primary-color: #FF6B6B;    /* 기본 색상 */
    --secondary-color: #4ECDC4;  /* 보조 색상 */
    --accent-color: #FFE66D;     /* 강조 색상 */
}
```

## 📝 주의사항

- 현재 지도의 좌표는 대략적인 위치입니다
- 실제 프로젝트에서는 Google Geocoding API 사용을 권장
- 각 장소의 실제 좌표를 사용하면 더 정확한 지도 표시 가능

## 🔒 보안 주의사항

⚠️ **중요**: `.env` 파일은 절대 Git에 커밋하지 마세요!

- `.env` 파일에는 민감한 API 키가 포함되어 있습니다
- `.gitignore`에 이미 추가되어 있어 자동으로 무시됩니다
- API 키가 노출된 경우, 즉시 해당 키를 삭제하고 새로 발급받으세요
- 프로덕션 환경에서는 서버 측에서 API 호출을 처리하여 키를 안전하게 보관하세요

## 🔧 기술 스택

### Frontend
- **HTML5**: 시맨틱 마크업
- **CSS3**: Flexbox, Grid, 애니메이션
- **JavaScript (ES6+)**: Async/Await, Fetch API
- **Leaflet.js**: 오픈소스 지도 라이브러리
- **OpenStreetMap**: 무료 지도 타일

### Backend
- **Node.js**: JavaScript 런타임
- **Express**: 웹 서버 프레임워크
- **Anthropic SDK**: Claude AI API 클라이언트
- **dotenv**: 환경 변수 관리

## 📱 브라우저 지원

- Chrome (최신 버전)
- Firefox (최신 버전)
- Safari (최신 버전)
- Edge (최신 버전)

## 💡 개선 아이디어

- [ ] Google Geocoding API를 사용한 정확한 좌표
- [ ] 날씨 정보 통합
- [ ] 예산 계산 기능
- [ ] 여행 체크리스트
- [ ] 사진 갤러리
- [ ] PWA(Progressive Web App) 변환
- [ ] 다국어 지원

## 📄 라이선스

개인 사용을 위한 프로젝트입니다.

---

즐거운 히로시마 여행 되세요! 🎌✈️
