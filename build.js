import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function build() {
    console.log('Building with Vite...');
    execSync('vite build', { stdio: 'inherit', cwd: __dirname });
    console.log('✓ Build complete (dist/)');
}

build().catch(err => {
    console.error('✗ Build failed:', err);
    process.exit(1);
});
