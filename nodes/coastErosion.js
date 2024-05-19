function applyCoastErosion(heightmap, width, height, params) {
    const iterations = validateNumber(params.iterations, 2000);
    const seed = generateSeed(params.seed);
    const waveStrength = validateNumber(params.waveStrength, 0.1);
    const rng = new SimplexNoise(seed);

    for (let i = 0; i < iterations; i++) {
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                if (heightmap[y][x] === 0) {
                    if (heightmap[y + 1][x] > 0) heightmap[y + 1][x] -= waveStrength;
                    if (heightmap[y - 1][x] > 0) heightmap[y - 1][x] -= waveStrength;
                    if (heightmap[y][x + 1] > 0) heightmap[y][x + 1] -= waveStrength;
                    if (heightmap[y][x - 1] > 0) heightmap[y][x - 1] -= waveStrength;
                }
            }
        }
    }

    console.log('Coast Erosion applied:', heightmap);
}
