# 🚀 Deployment Guide - Free Hosting Options

This guide covers multiple **100% free** hosting options for your portfolio website.

---

## 1. GitHub Pages (Recommended - Easiest)

**Cost:** FREE forever  
**Custom Domain:** Yes (free)  
**SSL:** Automatic  
**Build Time:** ~1 minute

### Steps:

1. **Create a GitHub repository**
   ```bash
   cd /var/home/raul/Documents/portfolio
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to GitHub**
   ```bash
   # Create a new repo on GitHub first, then:
   git remote add origin https://github.com/Raul909/portfolio.git
   git branch -M main
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under "Source", select **main** branch
   - Click **Save**
   - Your site will be live at: `https://raul909.github.io/portfolio/`

4. **Custom Domain (Optional)**
   - Buy a domain from Namecheap/GoDaddy (~$10/year)
   - In GitHub Pages settings, add your custom domain
   - Add DNS records as instructed

---

## 2. Netlify

**Cost:** FREE (100GB bandwidth/month)  
**Custom Domain:** Yes  
**SSL:** Automatic  
**Build Time:** ~30 seconds

### Steps:

1. **Sign up at [netlify.com](https://netlify.com)**

2. **Deploy via Drag & Drop**
   - Click "Add new site" → "Deploy manually"
   - Drag your entire portfolio folder
   - Done! Your site is live

3. **Or Deploy via Git**
   - Click "Add new site" → "Import from Git"
   - Connect your GitHub account
   - Select your portfolio repository
   - Click "Deploy site"

4. **Custom Domain**
   - Go to Site settings → Domain management
   - Add custom domain (free SSL included)

**Your site URL:** `https://your-site-name.netlify.app`

---

## 3. Vercel

**Cost:** FREE (100GB bandwidth/month)  
**Custom Domain:** Yes  
**SSL:** Automatic  
**Build Time:** ~20 seconds

### Steps:

1. **Sign up at [vercel.com](https://vercel.com)**

2. **Deploy**
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Click "Deploy"
   - Done!

3. **Custom Domain**
   - Go to Project Settings → Domains
   - Add your custom domain

**Your site URL:** `https://your-project.vercel.app`

---

## 4. Cloudflare Pages

**Cost:** FREE (unlimited bandwidth!)  
**Custom Domain:** Yes  
**SSL:** Automatic  
**Build Time:** ~30 seconds

### Steps:

1. **Sign up at [pages.cloudflare.com](https://pages.cloudflare.com)**

2. **Deploy**
   - Click "Create a project"
   - Connect your GitHub account
   - Select your repository
   - Build settings: Leave empty (static site)
   - Click "Save and Deploy"

3. **Custom Domain**
   - Go to Custom domains
   - Add your domain

**Your site URL:** `https://your-project.pages.dev`

---

## 5. Render

**Cost:** FREE (100GB bandwidth/month)  
**Custom Domain:** Yes  
**SSL:** Automatic

### Steps:

1. **Sign up at [render.com](https://render.com)**

2. **Deploy**
   - Click "New" → "Static Site"
   - Connect your GitHub repository
   - Build command: Leave empty
   - Publish directory: `.` (root)
   - Click "Create Static Site"

**Your site URL:** `https://your-site.onrender.com`

---

## 📊 Comparison Table

| Platform | Speed | Bandwidth | Custom Domain | Best For |
|----------|-------|-----------|---------------|----------|
| **GitHub Pages** | ⭐⭐⭐⭐ | 100GB/month | ✅ | Simple portfolios |
| **Netlify** | ⭐⭐⭐⭐⭐ | 100GB/month | ✅ | Best overall |
| **Vercel** | ⭐⭐⭐⭐⭐ | 100GB/month | ✅ | Fast deployment |
| **Cloudflare** | ⭐⭐⭐⭐⭐ | Unlimited | ✅ | High traffic |
| **Render** | ⭐⭐⭐⭐ | 100GB/month | ✅ | Alternative option |

---

## 🎯 Recommended Workflow

**For Beginners:** GitHub Pages  
**For Best Performance:** Netlify or Vercel  
**For High Traffic:** Cloudflare Pages

---

## 🔧 Quick Deploy Commands

### GitHub Pages
```bash
cd /var/home/raul/Documents/portfolio
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/Raul909/portfolio.git
git push -u origin main
# Then enable Pages in GitHub settings
```

### Netlify CLI (Optional)
```bash
npm install -g netlify-cli
cd /var/home/raul/Documents/portfolio
netlify deploy --prod
```

### Vercel CLI (Optional)
```bash
npm install -g vercel
cd /var/home/raul/Documents/portfolio
vercel --prod
```

---

## 🌐 Custom Domain Setup (All Platforms)

1. **Buy a domain** (Namecheap, GoDaddy, etc.)
2. **Add DNS records:**
   - For GitHub Pages: `A` record to `185.199.108.153`
   - For others: Follow platform-specific instructions
3. **Wait for DNS propagation** (5-48 hours)

---

## 📱 Testing Before Deploy

```bash
# Test locally
cd /var/home/raul/Documents/portfolio
python -m http.server 8000
# Visit: http://localhost:8000
```

---

## 🎨 Adding Content

### YouTube Videos
1. Get video ID from URL: `youtube.com/watch?v=VIDEO_ID`
2. Add to `script.js`:
```javascript
const youtubeVideos = ['VIDEO_ID_1', 'VIDEO_ID_2'];
```

### Photos
1. Upload to [imgur.com](https://imgur.com)
2. Copy direct image links
3. Add to `script.js`:
```javascript
const photos = [
    'https://i.imgur.com/xxxxx.jpg',
    'https://i.imgur.com/yyyyy.jpg'
];
```

---

## 🚨 Troubleshooting

**Site not loading?**
- Wait 5-10 minutes after deployment
- Check if repository is public
- Clear browser cache

**Images not showing?**
- Use direct image URLs (ending in .jpg, .png)
- Check if image URLs are accessible

**GitHub Pages 404?**
- Make sure repository name matches
- Check if Pages is enabled in settings

---

## 💡 Pro Tips

1. **Use Netlify or Vercel** for automatic deployments (every git push updates your site)
2. **Compress images** before uploading (use tinypng.com)
3. **Test on mobile** before deploying
4. **Add Google Analytics** for visitor tracking
5. **Update content regularly** to keep portfolio fresh

---

## 📞 Need Help?

- GitHub Pages: [docs.github.com/pages](https://docs.github.com/pages)
- Netlify: [docs.netlify.com](https://docs.netlify.com)
- Vercel: [vercel.com/docs](https://vercel.com/docs)

---

**Ready to deploy? Pick a platform above and follow the steps!** 🚀
