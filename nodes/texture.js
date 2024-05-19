function applyTexture(heightmap, width, height, params) {
    const type = params.type || 'sand';
    const intensity = validateNumber(params.intensity, 0.5);
    console.log(`Applying Texture with type: ${type}, intensity: ${intensity}`);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (type === 'sand') {
                heightmap[y][x] += intensity * 0.01;
            } else if (type === 'rock') {
                heightmap[y][x] += intensity * 0.02;
            } else if (type === 'snow') {
                heightmap[y][x] += intensity * 0.03;
            }
        }
    }

    console.log('Texture applied:', heightmap);
}
