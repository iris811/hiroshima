/**
 * 오코노미무라의 placeId와 이미지를 가져오는 스크립트
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

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                const redirectUrl = response.headers.location;
                return downloadImage(redirectUrl, filepath).then(resolve).catch(reject);
            }

            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
            }

            const file = fs.createWriteStream(filepath);
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
            file.on('error', (err) => {
                fs.unlink(filepath, () => {});
                reject(err);
            });
        }).on('error', reject);
    });
}

async function searchPlace(name, address) {
    const query = `${name} ${address}`;

    console.log(`🔍 검색 중: ${query}\n`);

    try {
        const requestBody = JSON.stringify({
            textQuery: query,
            languageCode: "ja"
        });

        const headers = {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': API_KEY,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.photos,places.location'
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
    console.log('🚀 오코노미무라 정보 가져오기\n');

    const name = 'お好み村';
    const address = '広島市 中区 新天地';

    const result = await searchPlace(name, address);

    if (result) {
        console.log('✅ 검색 성공!\n');
        console.log(`Place ID: ${result.id}`);
        console.log(`이름: ${result.displayName?.text || 'N/A'}`);
        console.log(`주소: ${result.formattedAddress || 'N/A'}`);

        if (result.location) {
            console.log(`좌표: ${result.location.latitude}, ${result.location.longitude}`);
        }

        if (result.photos && result.photos.length > 0) {
            console.log(`\n사진 개수: ${result.photos.length}개\n`);

            // Download first photo
            const photoUrl = getPhotoUrl(result.photos[0].name);
            const filename = 'day4_7_오코노미무라_お好み村.jpg';
            const filepath = path.join(__dirname, '..', 'images', filename);

            console.log(`⬇️  이미지 다운로드 중...`);
            console.log(`URL: ${photoUrl}`);

            try {
                await downloadImage(photoUrl, filepath);
                console.log(`✅ 저장 완료: ${filename}\n`);
            } catch (error) {
                console.error(`❌ 다운로드 실패:`, error.message);
            }
        } else {
            console.log('\n⚠️  사진이 없습니다.');
        }

        console.log('\n=== itinerary.json에 추가할 정보 ===');
        console.log(`"placeId": "${result.id}"`);
        console.log(`"photoUrl": "images/${filename}"`);
        if (result.location) {
            console.log(`"coordinates": {`);
            console.log(`  "lat": ${result.location.latitude},`);
            console.log(`  "lng": ${result.location.longitude}`);
            console.log(`}`);
        }
    } else {
        console.log('❌ 장소를 찾을 수 없습니다.');
    }
}

main().catch(console.error);
