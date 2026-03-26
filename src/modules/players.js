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
            currentTarget: null,
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
            }
        }

        function handleHit(coordinates, sunk) {}

        function handleMiss(coordinates) {}
    }

    return base;
}
