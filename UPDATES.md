# Portfolio Updates - Black & White Theme with Auto-Scraping

## ✅ Changes Made

### 1. **Black & White Theme**
   - Changed color scheme to monochrome (black, white, grays)
   - Updated all gradients and accent colors
   - Added grayscale filter to images (color on hover)

### 2. **YouTube Video Scraping**
   - Auto-fetches latest videos from @sirius_shutterup channel
   - Displays video thumbnails (clickable to open on YouTube)
   - Grayscale thumbnails with color on hover
   - Play button overlay appears on hover
   - Fallback to manual video IDs if auto-fetch fails

### 3. **Instagram Photo Scraping**
   - Auto-fetches photos from @sirius_shutterup Instagram
   - Displays in responsive grid layout
   - Grayscale images with color on hover
   - Border highlight on hover
   - Clickable to open Instagram profile
   - Fallback to manual image URLs if auto-fetch fails

### 4. **LinkedIn Integration**
   - Added LeetCode profile link in social section
   - LinkedIn already present with proper icon

### 5. **Interactive Enhancements**
   - Video thumbnails: hover to see color + play button
   - Photos: hover to see color + scale effect
   - Smooth transitions on all elements
   - Click videos to open on YouTube
   - Click photos to open Instagram

## 📝 Manual Content Addition (Optional)

If auto-scraping doesn't work due to CORS/API restrictions:

### Add YouTube Videos
Edit `script.js` around line 120:
```javascript
const manualVideoIds = [
    'dQw4w9WgXcQ',  // Example video ID
    'YOUR_VIDEO_ID_2',
];
```

### Add Instagram Photos
Edit `script.js` around line 180:
```javascript
const manualPhotos = [
    'https://i.imgur.com/xxxxx.jpg',
    'https://i.imgur.com/yyyyy.jpg',
];
```

## 🎨 Design Features

- **Monochrome palette**: Pure black (#000), dark gray (#1a1a1a), white (#fff)
- **Grayscale images**: All images start grayscale, color on hover
- **Interactive overlays**: Play buttons, photo icons appear on hover
- **Smooth animations**: 0.3s transitions throughout
- **Responsive grid**: Auto-adjusts for all screen sizes

## 🚀 Testing

```bash
cd /var/home/raul/Documents/portfolio
./preview.sh
# Open http://localhost:8000
```

## 📱 Social Links Included

✅ GitHub: @Raul909  
✅ LinkedIn: rahul-biswas-580083212  
✅ LeetCode: Raul5756  
✅ YouTube: @sirius_shutterup  
✅ Instagram: @sirius_shutterup  

## 🎯 Next Steps

1. Test the portfolio locally
2. Add manual video IDs and photo URLs if needed
3. Push to GitHub
4. Deploy using GitHub Pages (see DEPLOYMENT.md)

Your portfolio is ready to impress clients and hirers! 🚀
