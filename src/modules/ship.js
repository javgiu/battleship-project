export function createShip(length) {
    let sunk = false;
    let hits = 0;
    const hit = () => {
        if (hits === length) throw new Error("Ship already sunk");
        hits++;
    };

    const isSunk = () => {
        if (hits === length) sunk = true;
        return sunk;
    };

    return {
        length,
        hit,
        isSunk,
    };
}
