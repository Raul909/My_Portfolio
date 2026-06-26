const { performance } = require('perf_hooks');

const density = "Ñ@#W$9876543210?!abc;:+=-,._ ";
const rows = 1000;
const cols = 1000;
const iterations = 10;
const data = new Uint8ClampedArray(rows * cols * 4);

// Fill with some dummy data
for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 255;
}

function baseline() {
    let charCount = 0;
    const start = performance.now();
    for (let iter = 0; iter < iterations; iter++) {
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const idx = (y * cols + x) * 4;
                const r = data[idx];
                const g = data[idx+1];
                const b = data[idx+2];
                const a = data[idx+3];

                if (a === 0) continue;
                const avg = (r + g + b) / 3;
                if (avg < 25) continue;

                const charIdx = Math.floor(((avg - 25) / 230) * (density.length - 2));
                const mappedCharIdx = (density.length - 2) - Math.min(Math.max(charIdx, 0), density.length - 2);
                const char = density[mappedCharIdx];
                charCount += char.length;
            }
        }
    }
    const end = performance.now();
    return { time: end - start, charCount };
}

function optimized() {
    let charCount = 0;
    const start = performance.now();
    for (let iter = 0; iter < iterations; iter++) {
        const maxDensityIdx = density.length - 2;
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const idx = (y * cols + x) * 4;
                const r = data[idx];
                const g = data[idx+1];
                const b = data[idx+2];
                const a = data[idx+3];

                if (a === 0) continue;
                const avg = (r + g + b) / 3;
                if (avg < 25) continue;

                const charIdx = Math.floor(((avg - 25) / 230) * maxDensityIdx);
                const mappedCharIdx = maxDensityIdx - Math.min(Math.max(charIdx, 0), maxDensityIdx);
                const char = density[mappedCharIdx];
                charCount += char.length;
            }
        }
    }
    const end = performance.now();
    return { time: end - start, charCount };
}

console.log("Warming up...");
baseline();
optimized();

console.log("Running Baseline...");
const baseResult = baseline();
console.log(`Baseline time: ${baseResult.time.toFixed(2)} ms`);

console.log("Running Optimized...");
const optResult = optimized();
console.log(`Optimized time: ${optResult.time.toFixed(2)} ms`);

console.log(`Improvement: ${(baseResult.time - optResult.time).toFixed(2)} ms (${((baseResult.time - optResult.time) / baseResult.time * 100).toFixed(2)}%)`);
const rows = 100;
const cols = 200;
const data = new Uint8ClampedArray(rows * cols * 4);
for (let i=0; i<data.length; i++) {
    data[i] = Math.floor(Math.random() * 256);
}
const charWidth = 6;
const charHeight = 10;
const density = "Ñ@#W$9876543210?!abc;:+=-,._ ";

function original() {
    let dummy = 0;
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const idx = (y * cols + x) * 4;
            const r = data[idx];
            const g = data[idx+1];
            const b = data[idx+2];
            const a = data[idx+3];

            if (a === 0) continue;
            const avg = (r + g + b) / 3;
            if (avg < 25) continue;

            const charIdx = Math.floor(((avg - 25) / 230) * (density.length - 2));
            const mappedCharIdx = (density.length - 2) - Math.min(Math.max(charIdx, 0), density.length - 2);
            const char = density[mappedCharIdx];

            let drawX = x * charWidth;
            let drawY = y * charHeight;
            dummy += drawX + drawY;
        }
    }
    return dummy;
}

function optimized() {
    let dummy = 0;
    let idx = 0;
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const r = data[idx++];
            const g = data[idx++];
            const b = data[idx++];
            const a = data[idx++];

            if (a === 0) continue;
            const avg = (r + g + b) / 3;
            if (avg < 25) continue;

            const charIdx = Math.floor(((avg - 25) / 230) * (density.length - 2));
            const mappedCharIdx = (density.length - 2) - Math.min(Math.max(charIdx, 0), density.length - 2);
            const char = density[mappedCharIdx];

            let drawX = x * charWidth;
            let drawY = y * charHeight;
            dummy += drawX + drawY;
        }
    }
    return dummy;
}

// Warmup
for (let i = 0; i < 100; i++) {
    original();
    optimized();
}

console.time('Original Render Loop (5000 iterations)');
for (let i = 0; i < 5000; i++) {
    original();
}
console.timeEnd('Original Render Loop (5000 iterations)');

console.time('Optimized Render Loop (5000 iterations)');
for (let i = 0; i < 5000; i++) {
    optimized();
}
console.timeEnd('Optimized Render Loop (5000 iterations)');
