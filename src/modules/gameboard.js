import { createShip } from "./ship";

export function createGameboard(size) {
    const board = [];

    // fill board

    for (let i = 0; i < size; i++) {
        board[i] = [];
        for (let j = 0; j < size; j++) {
            board[i][j] = [];
        }
    }

    const ship1 = createShip(3);
    const ship2 = createShip(4);
    const ship3 = createShip(5);

    const ships = [ship1, ship2, ship3];

    function placeShip(
        ship,
        position = { coordinates: [0, 0], disposition: "horizontal" }
    ) {
        const length = ship.length;
        const x = position.coordinates[0];
        const y = position.coordinates[1];
        if (x > 7 || x < 0 || y < 0 || y > 7)
            throw new Error("Invalid coordinates passed in");
        if (position.disposition === "horizontal" && y + length > 8)
            throw new Error("No enough horizontal room");
        if (position.disposition === "vertical" && x + length > 8)
            throw new Error("No enough vertical room");
        for (let i = 0; i < length; i++) {
            if (position.disposition === "horizontal") board[x][y + i] = ship;
            if (position.disposition === "vertical") board[x + i][y] = ship;
        }
    }

    return { board, ships, placeShip };
}
