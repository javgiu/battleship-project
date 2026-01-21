export function getRandomCoordinates(max) {
    const x = Math.floor(Math.random() * max);
    const y = Math.floor(Math.random() * max);

    return [x, y];
}
