function addValley(heightmap, width, height, params) {
    const valleyDepth = validateNumber(params.depth, 20);
    const valleyWidth = validateNumber(params.width, 50);
    const seed = generateSeed(params.seed);
    console.log(`Adding Valley with depth: ${valleyDepth}, width: ${valleyWidth}, seed: ${seed}`);

    const centerX = Math.floor(width / 2);
    const rng = new SimplexNoise(seed);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dist = Math.abs(x - centerX);
            const heightValue = Math.max(0, valleyDepth * (1 - dist / valleyWidth) * rng.noise2D(x, y));
            heightmap[y][x] -= heightValue;
        }
    }
    console.log('Valley added:', heightmap);
}
