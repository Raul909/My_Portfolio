const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');
const { minify } = require('terser');

async function build() {
    const key = process.env.WEB3FORMS_KEY;
    const indexPath = path.join(__dirname, 'index.html');
    const stylePath = path.join(__dirname, 'style.css');
    const scriptPath = path.join(__dirname, 'script.js');

    // 1. Inject Web3Forms key
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    if (key) {
        indexContent = indexContent.replace(/\{\{WEB3FORMS_KEY\}\}/g, key.trim());
        console.log('✓ Web3Forms key securely injected.');
    } else {
        console.log('⚠ Warning: WEB3FORMS_KEY environment variable is not set.');
    }

    // 2. Minify CSS
    console.log('Compressing style.css...');
    const cssContent = fs.readFileSync(stylePath, 'utf8');
    const minifiedCss = new CleanCSS({ level: 2 }).minify(cssContent).styles;
    fs.writeFileSync(path.join(__dirname, 'style.min.css'), minifiedCss);
    console.log('✓ CSS minified successfully (style.min.css).');

    // 3. Minify JS
    console.log('Compressing script.js...');
    const jsContent = fs.readFileSync(scriptPath, 'utf8');
    const minifiedJs = await minify(jsContent, {
        compress: {
            passes: 2,
            drop_console: false
        },
        mangle: true
    });
    fs.writeFileSync(path.join(__dirname, 'script.min.js'), minifiedJs.code);
    console.log('✓ JS minified successfully (script.min.js).');

    // 4. Update index.html references to production minified files
    indexContent = indexContent
        .replace(/style\.css/g, 'style.min.css')
        .replace(/script\.js/g, 'script.min.js');

    fs.writeFileSync(indexPath, indexContent);
    console.log('✓ HTML updated to reference production minified assets.');
}

build().catch(err => {
    console.error('✗ Build failed:', err);
    process.exit(1);
});