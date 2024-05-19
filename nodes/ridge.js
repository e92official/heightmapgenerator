function addRidge(heightmap, width, height, params) {
    const heightFactor = validateNumber(params.heightFactor, 50);
    const widthFactor = validateNumber(params.widthFactor, 30);
    const seed = generateSeed(params.seed);
    const noise = new SimplexNoise(seed);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const nx = x / width - 0.5;
            const ny = y / height - 0.5;
            const distance = Math.sqrt(nx * nx + ny * ny);
            heightmap[y][x] += Math.exp(-distance * widthFactor) * heightFactor;
        }
    }

    console.log('Ridge added:', heightmap);
}
