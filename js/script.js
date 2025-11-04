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

// 날짜 카드 생성
function createDayCard(day) {
    const card = document.createElement('a');
    card.href = `day.html?day=${day.id}`;
    card.className = 'day-card';

    const placesCount = day.places ? day.places.length : 0;
    const placesText = placesCount > 0 ? `${placesCount}개 장소 방문 예정` : '자유 일정';

    card.innerHTML = `
        <img src="${day.image}" alt="${day.title}" class="day-card-image" onerror="this.src='https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800'">
        <div class="day-card-content">
            <span class="day-card-date">${day.date}</span>
            <h3 class="day-card-title">${day.title}</h3>
            <p class="day-card-summary">${day.summary}</p>
        </div>
    `;

    return card;
}

// 페이지 초기화
async function initializePage() {
    const trip = await loadItinerary();

    if (!trip) {
        console.error('여행 데이터를 불러올 수 없습니다.');
        return;
    }

    const daysGrid = document.getElementById('daysGrid');

    trip.days.forEach(day => {
        const card = createDayCard(day);
        daysGrid.appendChild(card);
    });
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', initializePage);
