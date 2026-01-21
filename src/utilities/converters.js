export function coordinatesToKeys(coordinates) {
    return `${coordinates[0]},${coordinates[1]}`;
}

export function convertStringToNumbersArray(string) {
    return string.split(",").map((char) => parseInt(char));
}
