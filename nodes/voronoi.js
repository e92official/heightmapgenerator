function applyVoronoi(heightmap, width, height, params) {
    const cells = validateNumber(params.cells, 50);
    const seed = generateSeed(params.seed);
    const points = [];
    const noise = new SimplexNoise(seed);

    for (let i = 0; i < cells; i++) {
        points.push([Math.floor(noise.noise2D(seed + i, 0) * width), Math.floor(noise.noise2D(seed + i, 1) * height)]);
    }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let minDist = Infinity;
            for (const [px, py] of points) {
                const dist = (x - px) ** 2 + (y - py) ** 2;
                if (dist < minDist) {
                    minDist = dist;
                }
            }
            heightmap[y][x] = minDist / (width * height);
        }
    }

    console.log('Voronoi applied:', heightmap);
}
