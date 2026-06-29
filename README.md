# Rahul Biswas

Personal portfolio — developer, video editor, photographer.

🌐 **Live:** [raul909portfolio.netlify.app](https://rahul-biswas-portfolio.pages.dev/)

---

© 2026 Rahul Biswas

## Tech Stack & Architecture
- **Frontend:** Vanilla HTML5, CSS3, ES6 JavaScript.
- **Media Processing:** Cloudinary (Dynamic formatting/compression) & Thum.io (Live website previews).
- **Forms:** Web3Forms for serverless contact handling.
- **Build System:** Custom Node.js build script (`build.js`) using `clean-css` and `terser` for asset minification.
- **Deployment:** Netlify with custom caching headers and strict Content Security Policies.

## Performance Optimizations (100/100 Lighthouse)
To achieve perfect Lighthouse scores, this portfolio utilizes the following techniques:
1. **Dynamic Media Loading:** YouTube thumbnails and GitHub repo previews are dynamically fetched via REST APIs.
2. **Advanced Image Serving:** Cloudinary auto-formats images to WebP/AVIF and resizes them based on viewport (e.g., `w_600` for grid, `w_1600` for lightbox).
3. **Hardware-Tiered Rendering:** The custom `AsciiRenderer` calculates device performance via `devicePixelRatio` and core count, scaling the canvas resolution and framerate to save CPU on mobile devices.
4. **Deferred Execution:** Heavy JavaScript calculations (like the ASCII video parsing) are wrapped in `setTimeout` to prevent Main-Thread blocking during the initial page paint (LCP).
5. **Critical CSS & Inline SVGs:** Non-critical CSS is deferred using `media="print"`, and icons are inlined directly into the HTML to minimize HTTP requests.

