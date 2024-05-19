function applyThermalWeathering(heightmap, width, height, params) {
    const iterations = validateNumber(params.iterations, 2000);
    const seed = generateSeed(params.seed);
    const noise = new SimplexNoise(seed);

    for (let i = 0; i < iterations; i++) {
        const x = Math.floor(noise.noise2D(seed + i, 0) * width);
        const y = Math.floor(noise.noise2D(seed + i, 1) * height);

        if (x >= 0 && x < width && y >= 0 && y < height) {
            const neighbors = [
                [x + 1, y],
                [x - 1, y],
                [x, y + 1],
                [x, y - 1]
            ];

            neighbors.forEach(([nx, ny]) => {
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    const diff = heightmap[y][x] - heightmap[ny][nx];
                    if (diff > 0) {
                        const transfer = diff / 2;
                        heightmap[y][x] -= transfer;
                        heightmap[ny][nx] += transfer;
                    }
                }
            });
        }
    }

    console.log('Applied Thermal Weathering with iterations:', iterations, 'and seed:', seed);
}
