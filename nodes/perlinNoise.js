function applyPerlinNoise(heightmap, width, height, params) {
    const scale = validateNumber(params.scale, 50);
    const octaves = validateNumber(params.octaves, 4);
    const persistence = validateNumber(params.persistence, 0.5);
    const lacunarity = validateNumber(params.lacunarity, 2.0);
    const seed = generateSeed(params.seed);
    const offsetX = validateNumber(params.offsetX, 0);
    const offsetY = validateNumber(params.offsetY, 0);
    const exponent = validateNumber(params.exponent, 1);
    const clampMin = validateNumber(params.clampMin, 0);
    const clampMax = validateNumber(params.clampMax, 1);
    const noise = new SimplexNoise(seed);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let amplitude = 1;
            let frequency = 1;
            let noiseValue = 0;

            for (let o = 0; o < octaves; o++) {
                noiseValue += amplitude * noise.noise2D((x + offsetX) / (scale * frequency), (y + offsetY) / (scale * frequency));
                amplitude *= persistence;
                frequency *= lacunarity;
            }

            noiseValue = (noiseValue + 1) / 2; // Normalize to range [0, 1]
            noiseValue = Math.pow(noiseValue, exponent); // Apply exponent
            noiseValue = Math.min(Math.max(noiseValue, clampMin), clampMax); // Apply clamp

            heightmap[y][x] += noiseValue;
        }
    }
    console.log('Perlin Noise applied with extended parameters:', heightmap);
}
