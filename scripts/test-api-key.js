/**
 * Google Places API (NEW) Key 테스트 스크립트
 */

const https = require('https');

const API_KEY = 'YOUR_API_KEY_HERE';

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

async function testApiKey() {
    console.log('🔑 API Key 테스트 중 (Places API NEW)...\n');
    console.log('API Key:', API_KEY.substring(0, 20) + '...\n');

    const requestBody = JSON.stringify({
        textQuery: 'Hiroshima Peace Memorial Park',
        languageCode: 'ko'
    });

    const headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.photos'
    };

    try {
        const data = await httpsPost(
            'places.googleapis.com',
            '/v1/places:searchText',
            headers,
            requestBody
        );

        if (data.error) {
            console.log('❌ API 요청이 거부되었습니다.\n');
            console.log('오류:', data.error.message);
            console.log('상태:', data.error.status);
            console.log('\n다음 사항을 확인하세요:');
            console.log('1. Google Cloud Console에서 "Places API (NEW)" 활성화');
            console.log('   → https://console.cloud.google.com/apis/library/places-backend.googleapis.com');
            console.log('2. 결제 정보 등록 (필수)');
            console.log('   → https://console.cloud.google.com/billing');
            console.log('3. API Key 설정 (제한 없음으로 설정)');
            console.log('   → https://console.cloud.google.com/apis/credentials');
            console.log('4. 설정 변경 후 5-10분 대기 필요\n');
        } else if (data.places && data.places.length > 0) {
            console.log('✅ API Key가 정상 작동합니다!\n');
            console.log('검색 결과:');
            const place = data.places[0];
            console.log(`   이름: ${place.displayName?.text || 'N/A'}`);
            console.log(`   주소: ${place.formattedAddress || 'N/A'}`);
            console.log(`   Place ID: ${place.id || 'N/A'}`);
            if (place.photos && place.photos.length > 0) {
                console.log(`   사진: ${place.photos.length}개 있음`);
                console.log(`   첫 번째 사진 이름: ${place.photos[0].name}`);
            }
            console.log('\n🎉 Places API (NEW)가 정상적으로 작동합니다!');
        } else {
            console.log('⚠️  검색 결과가 없습니다.');
            console.log('응답:', JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error('❌ 에러 발생:', error.message);
    }
}

testApiKey();
