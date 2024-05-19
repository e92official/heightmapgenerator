function addMountain(heightmap, width, height, params) {
    const mountainHeight = validateNumber(params.height, 50);
    const mountainWidth = validateNumber(params.width, 30);
    const seed = generateSeed(params.seed);
    console.log(`Adding Mountain with height: ${mountainHeight}, width: ${mountainWidth}, seed: ${seed}`);

    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    const rng = new SimplexNoise(seed);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            const heightValue = Math.max(0, mountainHeight * (1 - dist / mountainWidth) * rng.noise2D(x, y));
            heightmap[y][x] += heightValue;
        }
    }
    console.log('Mountain added:', heightmap);
}
