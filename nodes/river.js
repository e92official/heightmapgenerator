function addRiver(heightmap, width, height, params) {
    const riverWidth = validateNumber(params.riverWidth, 2);
    const seed = generateSeed(params.seed);
    const erosionRate = validateNumber(params.erosionRate, 0.01);
    const maxLength = validateNumber(params.maxLength, 1000);
    const numHeadwaters = validateNumber(params.numHeadwaters, 10);
    const noise = new SimplexNoise(seed);

    // Generate headwaters
    const headwaters = [];
    for (let i = 0; i < numHeadwaters; i++) {
        const x = Math.floor(Math.random() * width);
        const y = Math.floor(Math.random() * height);
        headwaters.push({ x, y });
    }

    function getLowestNeighbor(x, y) {
        const neighbors = [
            { x: x - 1, y: y },
            { x: x + 1, y: y },
            { x: x, y: y - 1 },
            { x: x, y: y + 1 }
        ];

        let lowest = { x, y, height: heightmap[y][x] };

        for (const neighbor of neighbors) {
            if (
                neighbor.x >= 0 &&
                neighbor.x < width &&
                neighbor.y >= 0 &&
                neighbor.y < height &&
                heightmap[neighbor.y][neighbor.x] < lowest.height
            ) {
                lowest = { x: neighbor.x, y: neighbor.y, height: heightmap[neighbor.y][neighbor.x] };
            }
        }

        return lowest;
    }

    function erode(x, y, amount) {
        for (let i = -riverWidth; i <= riverWidth; i++) {
            for (let j = -riverWidth; j <= riverWidth; j++) {
                const nx = x + i;
                const ny = y + j;

                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    heightmap[ny][nx] = Math.max(0, heightmap[ny][nx] - amount);
                }
            }
        }
    }

    for (const headwater of headwaters) {
        let { x, y } = headwater;

        for (let i = 0; i < maxLength; i++) {
            erode(x, y, erosionRate);

            const lowestNeighbor = getLowestNeighbor(x, y);

            if (lowestNeighbor.x === x && lowestNeighbor.y === y) {
                break;
            }

            x = lowestNeighbor.x;
            y = lowestNeighbor.y;
        }
    }

    console.log('River added with complex system:', heightmap);
}
