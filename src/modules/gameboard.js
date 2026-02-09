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

    const usedSlots = new Set();
    const shots = new Set();
    const missedShots = new Set();

    function placeShip(
        shipIndex,
        position = { coordinates: [0, 0], orientation: "horizontal" },
    ) {
        const length = ships[shipIndex].length;
        const [x, y] = position.coordinates;
        const { orientation } = position;
        if (x > 7 || x < 0 || y < 0 || y > 7)
            throw new Error("Invalid coordinates passed in");
        if (orientation === "horizontal" && y + length > 8)
            throw new Error("No enough horizontal room");
        if (orientation === "vertical" && x + length > 8)
            throw new Error("No enough vertical room");

        const positionsToPlace = [];
        for (let i = 0; i < length; i++) {
            const newPosition =
                orientation === "horizontal" ? [x, y + i] : [x + i, y];
            positionsToPlace.push(newPosition);
        }
        // check all positions are free
        const allPositionsFree = positionsToPlace.every(
            ([row, col]) => board[row][col] === null,
        );

        if (!allPositionsFree) {
            throw new Error("Slots in use");
        }

        positionsToPlace.forEach(([row, col]) => {
            board[row][col] = ships[shipIndex];
            usedSlots.add(coordinatesToKeys([row, col]));
        });
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
            missedShots.add(coordinatesToKeys(coordinates));
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

    function getUsedCoordinates() {
        return usedSlots;
    }

    function getMissedShots() {
        return missedShots;
    }

    return {
        board,
        ships,
        placeShip,
        receiveAttack,
        allShipsSunk,
        shots,
        getUsedCoordinates,
        getMissedShots,
    };
}
