export function getRandomCoordinates(max) {
    const x = Math.floor(Math.random() * max);
    const y = Math.floor(Math.random() * max);

    return [x, y];
}

export function getRandomOrientation() {
    const orientation =
        Math.floor(Math.random() * 2) === 0 ? "horizontal" : "vertical";
    return orientation;
}

export function getRandomValidCoordinates({
    shipLength,
    gameboardLength,
    orientation,
}) {
    let x, maxX, maxY, y;
    if (orientation === "vertical") {
        maxY = gameboardLength;
        maxX = gameboardLength - shipLength;
    } else if (orientation === "horizontal") {
        maxX = gameboardLength;
        maxY = gameboardLength - shipLength;
    }
    x = getRandomNumber(maxX);
    y = getRandomNumber(maxY);
    return [x, y];
}

function getRandomNumber(max) {
    return Math.floor(Math.random() * max);
}
