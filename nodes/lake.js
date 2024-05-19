function addLake(heightmap, width, height, params) {
    const size = validateNumber(params.size, 20);
    const seed = generateSeed(params.seed);
    const waterLevel = validateNumber(params.waterLevel, 0.5);
    const rng = new SimplexNoise(seed);

    const centerX = Math.floor((rng.noise2D(0, seed) + 1) / 2 * width);
    const centerY = Math.floor((rng.noise2D(seed, 0) + 1) / 2 * height);

    for (let y = centerY - size; y <= centerY + size; y++) {
        for (let x = centerX - size; x <= centerX + size; x++) {
            if (x >= 0 && x < width && y >= 0 && y < height) {
                heightmap[y][x] = Math.min(heightmap[y][x], waterLevel);
            }
        }
    }

    console.log('Lake added:', heightmap);
}
