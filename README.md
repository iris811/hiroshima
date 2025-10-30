# 🇯🇵 히로시마 여행 가이드 웹사이트

2025년 11월 7일~11일 히로시마 여행 일정을 한눈에 볼 수 있는 인터랙티브 웹사이트입니다.

## ✨ 주요 기능

- 📅 **날짜별 일정 카드**: 각 날짜의 주요 일정을 이미지와 함께 한눈에 확인
- 🗺️ **인터랙티브 지도**: Leaflet.js를 사용한 동선 시각화
- ⏰ **타임라인 뷰**: 각 장소의 상세 정보를 시간순으로 정리
- 📱 **반응형 디자인**: 모바일, 태블릿, 데스크톱 모두 지원
- 🎨 **현대적인 UI/UX**: 부드러운 애니메이션과 직관적인 인터페이스

## 📁 프로젝트 구조

```
hiroshima-trip/
├── index.html          # 메인 페이지 (날짜별 카드 뷰)
├── day.html            # 상세 페이지 (일별 동선 및 정보)
├── css/
│   └── style.css       # 스타일시트
├── js/
│   ├── script.js       # 메인 페이지 로직
│   └── day.js          # 상세 페이지 로직 (지도 포함)
├── data/
│   └── itinerary.json  # 여행 일정 데이터
└── images/             # 이미지 파일 (선택사항)
```

## 🚀 사용 방법

### 방법 1: 로컬 서버 실행 (권장)

1. **Python을 사용하는 경우**:
   ```bash
   cd hiroshima-trip
   # Python 3
   python -m http.server 8000
   # Python 2
   python -m SimpleHTTPServer 8000
   ```

2. **Node.js를 사용하는 경우**:
   ```bash
   cd hiroshima-trip
   # http-server 설치 (한 번만)
   npm install -g http-server
   # 서버 실행
   http-server -p 8000
   ```

3. **VS Code를 사용하는 경우**:
   - Live Server 확장 프로그램 설치
   - index.html 파일에서 우클릭 → "Open with Live Server"

4. 브라우저에서 `http://localhost:8000` 접속

### 방법 2: 파일 직접 열기

- `index.html` 파일을 브라우저로 직접 드래그하거나 더블클릭
- (일부 브라우저에서 CORS 정책으로 인해 JSON 로드가 안 될 수 있음)

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

## 🔧 기술 스택

- **HTML5**: 시맨틱 마크업
- **CSS3**: Flexbox, Grid, 애니메이션
- **JavaScript (ES6+)**: Async/Await, Fetch API
- **Leaflet.js**: 오픈소스 지도 라이브러리
- **OpenStreetMap**: 무료 지도 타일

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
