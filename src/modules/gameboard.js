import { createShip } from "./ship";
import { coordinatesToKeys } from "../utilities/converters";

export function createGameboard(size) {
    const board = [];

    // fill board

    for (let i = 0; i < size; i++) {
        board[i] = [];
        for (let j = 0; j < size; j++) {
            board[i][j] = null;
        }
    }

    const ship1 = createShip(3);
    const ship2 = createShip(4);
    const ship3 = createShip(5);

    const ships = [ship1, ship2, ship3];

    const shots = new Set();
    const missedShots = [];

    // or just missed shots?

    // Change this logic to avoid placing ships over each other
    function placeShip(
        shipIndex,
        position = { coordinates: [0, 0], disposition: "horizontal" },
    ) {
        const length = ships[shipIndex].length;
        const x = position.coordinates[0];
        const y = position.coordinates[1];
        if (x > 7 || x < 0 || y < 0 || y > 7)
            throw new Error("Invalid coordinates passed in");
        if (position.disposition === "horizontal" && y + length > 8)
            throw new Error("No enough horizontal room");
        if (position.disposition === "vertical" && x + length > 8)
            throw new Error("No enough vertical room");
        for (let i = 0; i < length; i++) {
            if (position.disposition === "horizontal")
                board[x][y + i] = ships[shipIndex];
            if (position.disposition === "vertical")
                board[x + i][y] = ships[shipIndex];
        }
    }

    function receiveAttack(coordinates) {
        if (shots.has(coordinatesToKeys(coordinates)))
            throw new Error("Shot already executed");
        const x = coordinates[0];
        const y = coordinates[1];
        shots.add(coordinatesToKeys(coordinates));

        if (x > 7 || x < 0 || y < 0 || y > 7)
            throw new Error("Invalid coordinates passed in");

        if (!ships.includes(board[x][y])) {
            missedShots.push(coordinates);
            return null;
        }

        const ship = board[x][y];
        ship.hit();

        return board[x][y];
    }

    function allShipsSunk() {
        let sunkenShips = 0;
        ships.forEach((ship) => {
            if (ship.isSunk()) sunkenShips++;
        });
        if (sunkenShips === ships.length) return true;
        else return false;
    }

    return { board, ships, placeShip, receiveAttack, allShipsSunk, shots };
}
