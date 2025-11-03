/**
 * くら寿司 이미지 가져오기
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
function loadEnv() {
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...valueParts] = trimmed.split('=');
                if (key && valueParts.length > 0) {
                    process.env[key.trim()] = valueParts.join('=').trim();
                }
            }
        });
    }
}

loadEnv();

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
    console.error('❌ Error: GOOGLE_PLACES_API_KEY not found in .env file');
    console.error('Please create a .env file with your Google Places API key');
    process.exit(1);
}

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

async function searchPlace(name, address) {
    const query = `${name} ${address} 히로시마`;

    console.log(`🔍 검색 중: ${name}`);
    console.log(`   쿼리: ${query}\n`);

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
            console.log('⚠️  검색 결과 없음');
            if (data.error) {
                console.log(`에러: ${data.error.message}`);
            }
            return null;
        }
    } catch (error) {
        console.error(`❌ 검색 실패:`, error.message);
        return null;
    }
}

function getPhotoUrl(photoName, maxWidth = 800) {
    return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&key=${API_KEY}`;
}

async function main() {
    console.log('🚀 くら寿司 広島紙屋町店 이미지 가져오기\n');

    const name = 'くら寿司 広島紙屋町店';
    const address = '広島市中区紙屋町';

    const result = await searchPlace(name, address);

    if (result && result.photos && result.photos.length > 0) {
        console.log('✅ 검색 성공!\n');
        console.log(`Place ID: ${result.id}`);
        console.log(`이름: ${result.displayName?.text || 'N/A'}`);
        console.log(`주소: ${result.formattedAddress || 'N/A'}`);
        console.log(`사진 개수: ${result.photos.length}개\n`);

        console.log('📸 첫 번째 이미지:\n');
        const photoUrl = getPhotoUrl(result.photos[0].name);
        console.log(photoUrl);
        console.log(`\nPlace ID: ${result.id}`);
    } else {
        console.log('❌ 이미지를 찾을 수 없습니다.');
    }
}

main().catch(console.error);
