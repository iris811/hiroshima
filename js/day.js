let map;
let markers = [];

// URL에서 day ID 가져오기
function getDayIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('day')) || 1;
}

// 일정 데이터 로드
async function loadItinerary() {
    try {
        const response = await fetch('data/itinerary.json');
        const data = await response.json();
        return data.trip;
    } catch (error) {
        console.error('일정 데이터를 불러오는데 실패했습니다:', error);
        return null;
    }
}

// 지도 초기화
function initMap(places) {
    // 히로시마 중심 좌표
    const hiroshimaCenter = [34.3853, 132.4553];

    map = L.map('map').setView(hiroshimaCenter, 13);

    // OpenStreetMap 타일 레이어 추가
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // 장소가 있을 경우 마커 추가
    if (places && places.length > 0) {
        addMarkersToMap(places);
    }
}

// 지도에 마커 추가
function addMarkersToMap(places) {
    const bounds = [];
    let markerIndex = 1; // 마커 번호를 위한 별도 카운터

    places.forEach((place, index) => {
        // coordinates가 없으면 마커 추가하지 않음
        if (!place.coordinates) {
            markers.push(null); // 인덱스 맞추기 위해 null 추가
            return;
        }

        const coords = place.coordinates;
        const latLng = [coords.lat, coords.lng];

        // 숙소인 경우 다른 색상 사용
        const isHotel = place.type === '숙소' || place.name.includes('KIRO') || place.name.includes('HOTEL');
        const markerColor = isHotel ? '#FF6B6B' : '#4ECDC4';
        const markerIcon = markerIndex; // 마커 번호 사용

        // 커스텀 아이콘 생성
        const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${markerColor}; color: white; border-radius: 50%; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${markerIcon}</div>`,
            iconSize: [35, 35],
            iconAnchor: [17, 17]
        });

        // 마커 생성
        const marker = L.marker(latLng, { icon: icon }).addTo(map);

        // 팝업 내용
        const popupContent = `
            <div class="popup-content">
                <div class="popup-title">${place.name}</div>
                <span class="popup-type type-${place.type}">${place.type}</span>
                <div class="popup-description">${place.description}</div>
                <a href="${place.mapUrl}" target="_blank" style="color: #4ECDC4; text-decoration: none; font-weight: 600; margin-top: 8px; display: inline-block;">📍 지도에서 보기</a>
            </div>
        `;

        marker.bindPopup(popupContent);
        markers.push(marker);
        bounds.push(latLng);
        markerIndex++; // 다음 마커를 위해 증가
    });

    // 모든 마커가 보이도록 지도 범위 조정
    if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
    }
}

// 타임라인 아이템 생성
function createTimelineItem(place, index) {
    const item = document.createElement('div');
    item.className = 'timeline-item';

    const tags = place.tags ? place.tags.map(tag =>
        `<span class="tag">${tag}</span>`
    ).join('') : '';

    const timeHtml = place.time ?
        `<span class="timeline-time">${place.time}</span>` : '';

    const referenceHtml = place.referenceUrl ?
        `<a href="${place.referenceUrl}" target="_blank" class="timeline-map-link" style="margin-right: 10px;">
            📝 블로그/리뷰 보기
        </a>` : '';

    item.innerHTML = `
        <div class="timeline-header">
            <h3 class="timeline-title">${index + 1}. ${place.name}</h3>
            ${timeHtml}
        </div>
        <span class="timeline-type type-${place.type}">${place.type}</span>
        <p class="timeline-description">${place.description}</p>
        <div class="timeline-tags">
            ${tags}
        </div>
        <div style="display: flex; gap: 10px; margin-top: 10px;">
            ${referenceHtml}
            <a href="${place.mapUrl}" target="_blank" class="timeline-map-link">
                📍 구글 지도에서 보기
            </a>
        </div>
    `;

    // 클릭 시 해당 마커 표시
    item.addEventListener('click', (e) => {
        if (e.target.tagName !== 'A') {
            if (markers[index]) {
                map.setView(markers[index].getLatLng(), 16);
                markers[index].openPopup();
            }
        }
    });

    return item;
}

// 페이지 초기화
async function initializePage() {
    const dayId = getDayIdFromUrl();
    const trip = await loadItinerary();

    if (!trip) {
        console.error('여행 데이터를 불러올 수 없습니다.');
        return;
    }

    const day = trip.days.find(d => d.id === dayId);

    if (!day) {
        console.error('해당 날짜의 일정을 찾을 수 없습니다.');
        return;
    }

    // 헤더 업데이트
    document.getElementById('dayTitle').textContent = day.title;
    document.getElementById('dayDate').textContent = day.date;

    // 지도 초기화
    initMap(day.places);

    // 타임라인 생성
    const timeline = document.getElementById('timeline');

    if (day.places && day.places.length > 0) {
        day.places.forEach((place, index) => {
            const item = createTimelineItem(place, index);
            timeline.appendChild(item);
        });
    } else {
        timeline.innerHTML = '<p style="text-align: center; padding: 40px; color: #7f8c8d;">이 날은 자유 일정입니다.</p>';
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', initializePage);
