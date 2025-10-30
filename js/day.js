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

// 구글 맵 URL에서 좌표 추출 (간단한 방법)
// 실제로는 Geocoding API를 사용하는 것이 좋지만, 여기서는 기본 위치 사용
function getCoordinatesForPlace(place, index, totalPlaces) {
    // 히로시마 주변 좌표 (실제 프로젝트에서는 Geocoding API 사용 권장)
    const baseCoords = {
        lat: 34.3853,
        lng: 132.4553
    };

    // 미야지마 섬 관련 장소인 경우
    if (place.name.includes('이쓰쿠시마') || place.name.includes('미야지마') ||
        place.address.includes('미야지마')) {
        return {
            lat: 34.2958 + (index * 0.005),
            lng: 132.3197 + (index * 0.005)
        };
    }

    // 그 외 히로시마 시내 장소는 중심 주변에 분산 배치
    const offset = 0.01;
    const angle = (index / totalPlaces) * 2 * Math.PI;
    return {
        lat: baseCoords.lat + Math.cos(angle) * offset,
        lng: baseCoords.lng + Math.sin(angle) * offset
    };
}

// 지도에 마커 추가
function addMarkersToMap(places) {
    const bounds = [];

    places.forEach((place, index) => {
        const coords = getCoordinatesForPlace(place, index, places.length);
        const latLng = [coords.lat, coords.lng];

        // 커스텀 아이콘 생성
        const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: #4ECDC4; color: white; border-radius: 50%; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${index + 1}</div>`,
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
        <a href="${place.mapUrl}" target="_blank" class="timeline-map-link">
            📍 구글 지도에서 보기
        </a>
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
