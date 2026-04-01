import { createGameboard } from "./gameboard.js";
import {
    getRandomCoordinates,
    getRandomOrientation,
    getRandomValidCoordinates,
} from "../utilities/auxiliar-functions.js";
import { coordinatesToKeys } from "../utilities/converters.js";

let nextAvailableId = 1;

function getAvailableId() {
    return nextAvailableId++;
}

export function ResetAvailablePlayerIds() {
    nextAvailableId = 1;
}

export function createPlayer(playerType = "computer", playerName = "Player") {
    let turn = false;
    const name = playerName;
    const gameboard = createGameboard(8);
    const type = playerType;
    const id = getAvailableId();
    const startTurn = () => {
        turn = true;
    };
    const stopTurn = () => {
        turn = false;
    };

    const isTurnToAttack = () => turn;

    const receiveAttack = (coordinates) => {
        const result = gameboard.receiveAttack(coordinates);
        if (lost()) {
            return "EndGame";
        }
        return result;
    };

    const placeShip = (shipIndex, position) => {
        gameboard.placeShip(shipIndex, position);
    };

    const getBoard = () => gameboard.board;

    const lost = () => {
        return gameboard.allShipsSunk();
    };

    const getShots = () => gameboard.shots;
    const getShipsCoordinates = () => gameboard.getUsedCoordinates();

    const base = {
        type,
        id,
        name,
        isTurnToAttack,
        receiveAttack,
        placeShip,
        startTurn,
        stopTurn,
        getBoard,
        lost,
        getShots,
        getShipsCoordinates,
    };

    if (type === "computer") {
        const attacks = new Set();

        const aiState = {
            mode: "hunt", // hunt or target
            lastHit: null,
            targetQueue: [],
            // currentTarget: null,
            hits: [],
            orientation: null,
        };
        return {
            ...base,
            attack: () => {
                return intelligentAttack();
            },

            reportHit: (coordinates, sunk) => {
                handleHit(coordinates, sunk);
            },

            reportMiss: (coordinates) => {
                handleMiss(coordinates);
            },

            placeShipsRandomly: () => {
                function isPositionValid(x, y, shipLength, orientation) {
                    if (
                        (orientation === "vertical" &&
                            x + shipLength > gameboard.board.length) ||
                        (orientation === "horizontal" &&
                            y + shipLength > gameboard.board.length)
                    )
                        return false;
                    for (let i = 0; i < shipLength; i++) {
                        const checkX = orientation === "vertical" ? x + i : x;
                        const checkY = orientation === "horizontal" ? y + i : y;

                        if (
                            getShipsCoordinates().has(
                                coordinatesToKeys([checkX, checkY]),
                            )
                        )
                            return false;
                    }
                    return true;
                }
                gameboard.ships.forEach((ship, shipIndex) => {
                    const validPositions = [];
                    ["horizontal", "vertical"].forEach((orientation) => {
                        for (let i = 0; i < gameboard.board.length; i++) {
                            for (let j = 0; j < gameboard.board.length; j++) {
                                if (
                                    isPositionValid(
                                        i,
                                        j,
                                        ship.length,
                                        orientation,
                                    )
                                )
                                    validPositions.push({
                                        coordinates: [i, j],
                                        orientation,
                                    });
                            }
                        }
                    });

                    const validPosition =
                        validPositions[
                            Math.floor(Math.random() * validPositions.length)
                        ];

                    placeShip(shipIndex, validPosition);
                });
            },
        };

        function intelligentAttack() {
            let coordinates;

            if (aiState.mode === "target" && aiState.targetQueue.length > 0) {
                coordinates = aiState.targetQueue.shift();

                while (
                    attacks.has(coordinatesToKeys(coordinates)) &&
                    aiState.targetQueue.length > 0
                ) {
                    coordinates = aiState.targetQueue.shift();
                }

                if (attacks.has(coordinatesToKeys(coordinates))) {
                    aiState.mode = "hunt";
                    return getRandomAttack();
                }
            } else {
                coordinates = getRandomAttack();
            }

            attacks.add(coordinatesToKeys(coordinates));
            return coordinates;
        }

        function handleHit(coordinates, sunk) {
            if (sunk) {
                aiState.mode = "hunt";
                aiState.lastHit = null;
                aiState.targetQueue = [];
                aiState.hits = [];
                aiState.orientation = null;
            } else {
                aiState.mode = "target";
                aiState.lastHit = coordinates;
                aiState.hits.push(coordinates);

                // Determine orientation
                if (aiState.hits >= 2) determineOrientation();

                addAdjacentToQueue(coordinates);
            }
        }

        function handleMiss(coordinates) {
            console.log("AI missed");
        }

        function determineOrientation() {
            if (aiState.hits.length < 2) return;

            const [x1, y1] = aiState.hits[0];
            const [x2, y2] = aiState.hits[1];

            if (x1 === x2) {
                aiState.orientation = "horizontal";
            } else if (y1 === y2) {
                aiState.orientation = "vertical";
            }
        }

        function addAdjacentToQueue(coordinates) {
            const [x, y] = coordinates;

            if (aiState.orientation === null) {
                const adjacent = [
                    [x - 1, y], // down
                    [x + 1, y], // up
                    [x, y + 1], // right
                    [x, y - 1], // left
                ];

                adjacent.forEach((coord) => {
                    if (
                        isValidCoordinate(coord) &&
                        !attacks.has(coordinatesToKeys(coord))
                    ) {
                        aiState.targetQueue.push(coord);
                    }
                });
            } else if (aiState.orientation === "vertical") {
                const targets = [
                    [x + 1, y],
                    [x - 1, y],
                ];

                targets.forEach((coord) => {
                    if (
                        isValidCoordinate(coord) &&
                        !attacks.has(coordinatesToKeys(coord))
                    ) {
                        aiState.targetQueue.push(coord);
                    }
                });
            } else if (aiState.orientation === "horizontal") {
                const targets = [
                    [x, y + 1],
                    [x, y - 1],
                ];

                targets.forEach((coord) => {
                    if (
                        isValidCoordinate(coord) &&
                        !attacks.has(coordinatesToKeys(coord))
                    ) {
                        aiState.targetQueue.push(coord);
                    }
                });
            }
        }

        function isValidCoordinate([x, y]) {
            return (
                x >= 0 &&
                x < gameboard.board.length &&
                y >= 0 &&
                y < gameboard.board.length
            );
        }

        function getRandomAttack() {
            let coordinates;

            do {
                coordinates = getRandomCoordinates(gameboard.board.length);
            } while (attacks.has(coordinatesToKeys(coordinates)));

            return coordinates;
        }
    }

    return base;
}
