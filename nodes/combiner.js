function applyCombiner(heightmap, additionalHeightmap, width, height, params) {
    const type = params.type || 'add';
    console.log(`Applying Combiner with type: ${type}`);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            switch (type) {
                case 'add':
                    heightmap[y][x] += additionalHeightmap[y][x];
                    break;
                case 'multiply':
                    heightmap[y][x] *= additionalHeightmap[y][x];
                    break;
                case 'max':
                    heightmap[y][x] = Math.max(heightmap[y][x], additionalHeightmap[y][x]);
                    break;
                case 'min':
                    heightmap[y][x] = Math.min(heightmap[y][x], additionalHeightmap[y][x]);
                    break;
                default:
                    console.error(`Unknown combiner type: ${type}`);
            }
        }
    }

    console.log('Combiner applied:', heightmap);
}