const fs = require('fs');
const https = require('https');
const path = require('path');

// API key has been removed for security
// This script was used to download images from Google Places API
// Images are now stored locally in the images/ directory
const API_KEY = 'YOUR_API_KEY_HERE';

const ITINERARY_PATH = path.join(__dirname, '../data/itinerary.json');
const IMAGES_DIR = path.join(__dirname, '../images');

// Ensure images directory exists
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Fetch place details to get photo name using new Places API
function fetchPlacePhotos(placeId) {
  return new Promise((resolve, reject) => {
    const url = `https://places.googleapis.com/v1/places/${placeId}?fields=photos&key=${API_KEY}`;

    https.get(url, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        if (response.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            resolve(json.photos || []);
          } catch (e) {
            reject(new Error(`Parse error: ${e.message}`));
          }
        } else {
          reject(new Error(`API Error ${response.statusCode}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

// Download image from URL (handles redirects)
function downloadImage(url, filepath, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) {
      reject(new Error('Too many redirects'));
      return;
    }

    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (!redirectUrl) {
          reject(new Error('Redirect without location header'));
          return;
        }
        downloadImage(redirectUrl, filepath, redirectCount + 1).then(resolve).catch(reject);
        return;
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
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

// Create safe filename from place name
function createSafeFilename(placeName, dayId, placeIndex) {
  const safe = placeName
    .replace(/[^a-zA-Z0-9가-힣ぁ-んァ-ヶー一-龯]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 50);
  return `day${dayId}_${placeIndex}_${safe}.jpg`;
}

async function processItinerary() {
  console.log('Reading itinerary.json...');
  const data = JSON.parse(fs.readFileSync(ITINERARY_PATH, 'utf8'));

  let downloadCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const day of data.trip.days) {
    console.log(`\nProcessing Day ${day.id}: ${day.title}`);

    for (let i = 0; i < day.places.length; i++) {
      const place = day.places[i];
      const photoUrl = place.photoUrl;

      // Check if it's a Google Places API URL
      if (!photoUrl || !photoUrl.includes('places.googleapis.com')) {
        console.log(`  ⏭️  Skipping ${place.name} (not Google API URL)`);
        skipCount++;
        continue;
      }

      // Check if placeId exists
      if (!place.placeId) {
        console.log(`  ⚠️  No placeId for ${place.name}, skipping`);
        skipCount++;
        continue;
      }

      // Create filename
      const filename = createSafeFilename(place.name, day.id, i + 1);
      const filepath = path.join(IMAGES_DIR, filename);

      // Check if already downloaded
      if (fs.existsSync(filepath)) {
        console.log(`  ✓ Already exists: ${filename}`);
        place.photoUrl = `images/${filename}`;
        skipCount++;
        continue;
      }

      try {
        console.log(`  🔍 Fetching photo for ${place.name}...`);

        // Get photo name from Places API (New)
        const photos = await fetchPlacePhotos(place.placeId);

        if (!photos || photos.length === 0) {
          console.log(`  ⚠️  No photos found for ${place.name}`);
          skipCount++;
          continue;
        }

        // Use the first photo
        const photoName = photos[0].name;
        const downloadUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&key=${API_KEY}`;

        console.log(`  ⬇️  Downloading ${place.name}...`);
        await downloadImage(downloadUrl, filepath);
        console.log(`  ✅ Saved: ${filename}`);

        // Update photoUrl to local path
        place.photoUrl = `images/${filename}`;
        downloadCount++;

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`  ❌ Failed to download ${place.name}: ${error.message}`);
        errorCount++;
      }
    }
  }

  // Save updated itinerary
  console.log('\nUpdating itinerary.json with local paths...');
  fs.writeFileSync(ITINERARY_PATH, JSON.stringify(data, null, 2), 'utf8');

  console.log('\n=== Summary ===');
  console.log(`✅ Downloaded: ${downloadCount}`);
  console.log(`⏭️  Skipped: ${skipCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`\n✨ All done! Local images are now in the images/ directory.`);
}

processItinerary().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
