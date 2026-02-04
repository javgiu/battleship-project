import { createGameboard } from "./gameboard.js";
import { getRandomCoordinates } from "../utilities/computer-coordinates.js";
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
    };

    if (type === "computer") {
        const attacks = new Set();
        return {
            ...base,
            attack: () => {
                let coordinates;
                do {
                    coordinates = getRandomCoordinates(gameboard.board.length);
                } while (attacks.has(coordinatesToKeys(coordinates)));
                attacks.add(coordinatesToKeys(coordinates));

                return coordinates;
            },
        };
    }

    return base;
}
