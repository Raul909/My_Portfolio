# Portfolio Website - Rahul Biswas

A modern, interactive portfolio showcasing coding projects, video editing work, and photography.

## 🎨 Features

- **Responsive Design** - Works perfectly on all devices
- **Dynamic GitHub Integration** - Automatically fetches latest repositories
- **Smooth Animations** - Polished UI with modern effects
- **Three Portfolios in One** - Developer, Video Editor, Photographer
- **Interactive Elements** - Hover effects, typing animation, smooth scrolling

## 🚀 Quick Start

1. **The portfolio auto-fetches content from:**
   - GitHub repositories (automatic)
   - YouTube channel (attempts auto-fetch, fallback to manual)
   - Instagram photos (attempts auto-fetch, fallback to manual)

2. **For guaranteed display, add manual content:**
   
   Open `script.js` and add:
   
   ```javascript
   // Line 120 - Add YouTube video IDs
   const manualVideoIds = [
       'YOUR_VIDEO_ID_1',  // From youtube.com/watch?v=THIS_PART
       'YOUR_VIDEO_ID_2',
   ];
   
   // Line 180 - Add photo URLs
   const manualPhotos = [
       'https://i.imgur.com/xxxxx.jpg',
       'https://i.imgur.com/yyyyy.jpg',
   ];
   ```

3. **Test Locally**
   
   ```bash
   ./preview.sh
   # Open http://localhost:8000
   ```

## 📁 Project Structure

```
portfolio/
├── index.html      # Main HTML structure
├── style.css       # Styling and animations
├── script.js       # Interactive functionality
├── README.md       # This file
└── DEPLOYMENT.md   # Deployment guide
```

## 🎥 Adding YouTube Videos

1. Go to your YouTube video
2. Copy the video ID from the URL (e.g., `https://youtube.com/watch?v=VIDEO_ID`)
3. Add to the `youtubeVideos` array in `script.js`

## 📸 Adding Photos

**Option 1: Use Imgur (Recommended)**
1. Upload photos to [imgur.com](https://imgur.com)
2. Copy direct image links
3. Add to `photos` array in `script.js`

**Option 2: Use Cloudinary**
1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier)
2. Upload images
3. Copy URLs and add to `photos` array

**Option 3: GitHub Repository**
1. Create an `images` folder in your repo
2. Upload photos
3. Use relative paths: `./images/photo1.jpg`

## 🛠️ Customization

### Colors
Edit CSS variables in `style.css`:
```css
:root {
    --primary: #00f5ff;      /* Main accent color */
    --secondary: #ff006e;    /* Secondary accent */
    --dark: #0a0e27;         /* Background */
}
```

### Content
- Edit text directly in `index.html`
- GitHub repos load automatically from your profile
- Social links are already configured

## 📱 Social Links

All social links are pre-configured:
- GitHub: [@Raul909](https://github.com/Raul909)
- YouTube: [@sirius_shutterup](https://www.youtube.com/@sirius_shutterup)
- Instagram: [@sirius_shutterup](https://www.instagram.com/sirius_shutterup/)
- LinkedIn: [Rahul Biswas](https://www.linkedin.com/in/rahul-biswas-580083212/)

## 🌐 Deployment Options

See `DEPLOYMENT.md` for detailed guides on:
- GitHub Pages (Free)
- Netlify (Free)
- Vercel (Free)
- Cloudflare Pages (Free)

## 📄 License

Feel free to use this template for your own portfolio!

---

Built with ❤️ by Rahul Biswas
# My_Portfolio
