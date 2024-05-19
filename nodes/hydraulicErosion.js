function applyHydraulicErosion(heightmap, width, height, params) {
    const iterations = validateNumber(params.iterations, 1000);
    const seed = generateSeed(params.seed);
    const rainAmount = validateNumber(params.rainAmount, 0.01);
    const noise = new SimplexNoise(seed);

    const water = Array.from({ length: height }, () => Array(width).fill(0));
    const sediment = Array.from({ length: height }, () => Array(width).fill(0));

    for (let i = 0; i < iterations; i++) {
        const x = Math.floor((noise.noise2D(i / 100, 0) + 1) / 2 * width);
        const y = Math.floor((noise.noise2D(0, i / 100) + 1) / 2 * height);

        if (x >= 0 && x < width && y >= 0 && y < height) {
            water[y][x] += rainAmount;
            heightmap[y][x] = Math.max(0, heightmap[y][x] - water[y][x] * 0.01);
            sediment[y][x] += water[y][x] * 0.01;
        }

        if (i % 100 === 0) {
            console.log(`Iteration ${i}: water[${y}][${x}] = ${water[y][x]}, sediment[${y}][${x}] = ${sediment[y][x]}`);
        }
    }
    console.log(`Applied Hydraulic Erosion with iterations: ${iterations}, seed: ${seed}, rainAmount: ${rainAmount}`);
}
