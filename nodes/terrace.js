function applyTerraces(heightmap, width, height, params) {
    const levels = validateNumber(params.levels, 5);
    const seed = generateSeed(params.seed);
    console.log(`Applying Terraces with levels: ${levels}, seed: ${seed}`);

    const rng = new SimplexNoise(seed);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const noiseValue = heightmap[y][x];
            const terracedValue = Math.floor(noiseValue * levels) / levels;
            heightmap[y][x] = terracedValue;
        }
    }
    console.log('Terraces applied:', heightmap);
}
