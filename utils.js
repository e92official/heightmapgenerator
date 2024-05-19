function validateNumber(value, defaultValue) {
    const number = parseFloat(value);
    return isNaN(number) ? defaultValue : number;
}

function generateSeed(seed) {
    return seed ? seed : Math.floor(Math.random() * 65536);
}