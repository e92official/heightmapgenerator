function addVegetation(heightmap, width, height, params) {
    const density = validateNumber(params.density, 0.1);
    const seed = generateSeed(params.seed);
    const rng = new SimplexNoise(seed);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (rng.noise2D(x / density, y / density) > 0.5) {
                heightmap[y][x] += 0.02; // Adjust height to simulate vegetation
            }
        }
    }

    console.log('Vegetation added:', heightmap);
}
