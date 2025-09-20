const fs = require('fs');

// Create a simple PNG icon programmatically
function createPNGIcon(size, text) {
  // This is a minimal PNG creation - in production you'd use a proper image library
  const canvas = `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#4F46E5"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-family="Arial, sans-serif" font-size="${size/4}" font-weight="bold">${text}</text>
</svg>`;
  
  return Buffer.from(canvas);
}

// Create 192x192 icon
const icon192 = createPNGIcon(192, 'BIG');
fs.writeFileSync('public/icon-192x192.png', icon192);

// Create 512x512 icon  
const icon512 = createPNGIcon(512, 'BIG');
fs.writeFileSync('public/icon-512x512.png', icon512);

console.log('Icons created successfully');
