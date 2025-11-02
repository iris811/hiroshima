/**
 * Google Places API (NEW)를 사용하여 각 장소의 이미지를 가져오는 스크립트
 *
 * 사용법:
 * 1. Node.js 설치 확인: node --version
 * 2. 스크립트 실행: node scripts/fetch-place-photos.js
 */

const fs = require('fs');
const https = require('https');

// API Key - Replace with your actual API key
const API_KEY = 'YOUR_API_KEY_HERE';

// Delay 함수 (API rate limit 방지)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * HTTPS POST 요청 (Places API NEW 방식)
 */
function httpsPost(hostname, path, headers, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: hostname,
            path: path,
            method: 'POST',
            headers: headers
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

/**
 * 장소 이름과 주소로 Place 검색 (Places API NEW)
 */
async function searchPlace(name, address) {
    const query = `${name} ${address} 히로시마`;

    console.log(`🔍 검색 중: ${name}`);

    try {
        const requestBody = JSON.stringify({
            textQuery: query,
            languageCode: "ko"
        });

        const headers = {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': API_KEY,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.photos'
        };

        const data = await httpsPost(
            'places.googleapis.com',
            '/v1/places:searchText',
            headers,
            requestBody
        );

        if (data.places && data.places.length > 0) {
            return data.places[0];
        } else {
            console.log(`   ⚠️  검색 결과 없음`);
            if (data.error) {
                console.log(`   에러: ${data.error.message}`);
            }
            return null;
        }
    } catch (error) {
        console.error(`   ❌ 검색 실패:`, error.message);
        return null;
    }
}

/**
 * Photo 이름으로 이미지 URL 생성 (Places API NEW)
 */
function getPhotoUrl(photoName, maxWidth = 800) {
    // photoName 형식: places/{place_id}/photos/{photo_id}
    return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&key=${API_KEY}`;
}

/**
 * 메인 함수
 */
async function main() {
    console.log('🚀 Google Places API (NEW)를 사용하여 이미지 가져오기 시작...\n');

    // JSON 파일 읽기
    const jsonPath = './data/itinerary.json';
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    let totalPlaces = 0;
    let updatedPlaces = 0;
    let skippedPlaces = 0;

    // 각 날짜의 장소 순회
    for (const day of jsonData.trip.days) {
        console.log(`\n📅 ${day.date} - ${day.title}`);
        console.log('─'.repeat(60));

        for (const place of day.places) {
            totalPlaces++;

            // 이미 이미지가 있으면 스킵
            if (place.photoUrl) {
                console.log(`   ⏭️  스킵: ${place.name} (이미지 이미 존재)`);
                skippedPlaces++;
                continue;
            }

            // Places API로 검색
            const result = await searchPlace(place.name, place.address);
            await delay(300); // API rate limit 방지

            if (result && result.photos && result.photos.length > 0) {
                const photoName = result.photos[0].name;
                place.photoUrl = getPhotoUrl(photoName);
                place.placeId = result.id; // place_id도 저장

                console.log(`   ✅ 이미지 추가됨: ${place.name}`);
                updatedPlaces++;
            } else {
                console.log(`   ⚠️  이미지 없음: ${place.name}`);
            }
        }
    }

    // 업데이트된 JSON 저장
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf8');

    console.log('\n' + '='.repeat(60));
    console.log('✨ 완료!');
    console.log(`📊 통계:`);
    console.log(`   - 전체 장소: ${totalPlaces}개`);
    console.log(`   - 이미지 추가: ${updatedPlaces}개`);
    console.log(`   - 스킵: ${skippedPlaces}개`);
    console.log(`   - 실패: ${totalPlaces - updatedPlaces - skippedPlaces}개`);
    console.log('='.repeat(60));
}

// 스크립트 실행
main().catch(console.error);
