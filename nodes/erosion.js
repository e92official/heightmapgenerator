function applyErosion(heightmap, width, height, params) {
    const iterations = validateNumber(params.iterations, 2000);
    const erosionFactor = validateNumber(params.erosionFactor, 0.1);
    const seed = generateSeed(params.seed);
    const noise = new SimplexNoise(seed);

    for (let i = 0; i < iterations; i++) {
        const x = Math.floor(noise.noise2D(seed + i, 0) * width);
        const y = Math.floor(noise.noise2D(seed + i, 1) * height);

        if (x >= 0 && x < width && y >= 0 && y < height) {
            heightmap[y][x] -= erosionFactor;
        }
    }

    console.log('Applied Erosion with iterations:', iterations, 'and seed:', seed);
}
