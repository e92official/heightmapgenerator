function applyCurves(heightmap, width, height, params) {
    const amount = validateNumber(params.amount, 0.1);
    const seed = generateSeed(params.seed);
    const rng = new SimplexNoise(seed);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            heightmap[y][x] = Math.pow(heightmap[y][x], amount);
        }
    }

    console.log('Curves applied:', heightmap);
}
