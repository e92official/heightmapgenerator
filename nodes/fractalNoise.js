function applyFractalNoise(heightmap, width, height, params) {
    const scale = validateNumber(params.scale, 100);
    const octaves = validateNumber(params.octaves, 4);
    const persistence = validateNumber(params.persistence, 0.5);
    const lacunarity = validateNumber(params.lacunarity, 2.0);
    const seed = generateSeed(params.seed);
    const noise = new SimplexNoise(seed);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let amplitude = 1;
            let frequency = 1;
            let noiseValue = 0;

            for (let o = 0; o < octaves; o++) {
                noiseValue += amplitude * noise.noise2D(x / (scale * frequency), y / (scale * frequency));
                amplitude *= persistence;
                frequency *= lacunarity;
            }

            heightmap[y][x] += (noiseValue + 1) / 2; // Normalize to range [0, 1]
        }
    }
    console.log('Fractal Noise applied:', heightmap);
}
