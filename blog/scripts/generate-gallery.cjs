
require('dotenv').config({ path: '../.env' }); // Try root first
if (!process.env.CLOUDINARY_CLOUD_NAME) {
    require('dotenv').config(); // Try cwd
}

const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Validation Check
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('\n\x1b[31m%s\x1b[0m', 'ERROR: Cloudinary credentials are missing.');
    console.error('Please ensure you have a .env file in the "blog/" directory or the root directory with the following keys:');
    console.error(' - CLOUDINARY_CLOUD_NAME');
    console.error(' - CLOUDINARY_API_KEY');
    console.error(' - CLOUDINARY_API_SECRET');
    console.error('\nSee blog/.env.example for a template.\n');
    process.exit(1);
}

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const TARGET_FILE = path.join(__dirname, '../../Portfolio/Sketches.html');

async function generateGallery() {
    console.log('Generating Static Gallery for Sketches...');

    try {
        const folder = 'sketches';

        // 1. Fetch images from Cloudinary
        // Using resources_by_asset_folder for "Fixed Folders" support
        const result = await cloudinary.api.resources_by_asset_folder(folder, {
            max_results: 100, // Fetch up to 100 images
            tags: true,
            context: true
        });

        console.log(`Found ${result.resources.length} images.`);

        if (result.resources.length === 0) {
            console.warn('No images found in sketches folder.');
            return;
        }

        // 2. Generate HTML
        const htmlItems = result.resources.map((img, index) => {
            // Generate Signed URL with Watermark
            const watermarkedUrl = cloudinary.url(img.public_id, {
                 type: img.type,
                 sign_url: true,
                 version: img.version,
                 transformation: [
                     { width: 1000, crop: "limit" },
                     { overlay: { font_family: "Arial", font_size: 60, text: "© Anmol Creations" }, color: "white", opacity: 50, gravity: "center" }
                 ]
            });

            // Calculate animation delay
            const delay = (index * 0.1).toFixed(1);

            return `
            <div class="gallery-item" style="animation-delay: ${delay}s" onclick="openLightbox('${watermarkedUrl}')">
                <img src="${watermarkedUrl}" alt="Sketch" loading="lazy">
                <div class="gallery-caption">
                    <span>View Artwork</span>
                </div>
            </div>`;
        }).join('\n');

        // 3. Inject into HTML
        let htmlContent = fs.readFileSync(TARGET_FILE, 'utf-8');

        const startMarker = '<!-- GALLERY_START -->';
        const endMarker = '<!-- GALLERY_END -->';

        const regex = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`);

        if (!regex.test(htmlContent)) {
            console.error('Error: Gallery markers not found in Sketches.html');
            // If markers missing, try to find the grid div and replace content
            if (htmlContent.includes('id="gallery-grid" class="gallery-grid">')) {
                console.log('Markers missing, attempting to inject into gallery-grid div...');
                const replacement = `id="gallery-grid" class="gallery-grid">\n${startMarker}\n${htmlItems}\n${endMarker}`;
                htmlContent = htmlContent.replace(/id="gallery-grid" class="gallery-grid">[\s\S]*?<\/div>/, replacement + '\n</div>');
            } else {
                 console.error('Could not find gallery-grid div either.');
                 return;
            }
        } else {
            const replacement = `${startMarker}\n${htmlItems}\n${endMarker}`;
            htmlContent = htmlContent.replace(regex, replacement);
        }

        fs.writeFileSync(TARGET_FILE, htmlContent);
        console.log('Successfully updated Sketches.html with static gallery.');

    } catch (error) {
        console.error('Error generating gallery:', error);
        process.exit(1);
    }
}

generateGallery();
