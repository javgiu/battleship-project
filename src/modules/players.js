import { createGameboard } from "./gameboard.js";
import { getRandomCoordinates } from "../utilities/computer-coordinates.js";
import { coordinatesToKeys } from "../utilities/converters.js";

function createPlayer(
    playerId,
    playerName = "Player",
    playerType = "human" || "computer",
) {
    let turn = false;
    const name = playerName;
    const gameboard = createGameboard(8);
    const type = playerType;
    const id = playerId;
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
            stopPlayers();
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

const player1 = createPlayer(1, "Javier");
const computer = createPlayer(2, "Giulianna", "computer");

export const placePlayersShips = () => {
    player1.placeShip(0, {
        coordinates: [0, 0],
        disposition: "horizontal",
    });

    computer.placeShip(0, {
        coordinates: [0, 0],
        disposition: "horizontal",
    });

    player1.placeShip(1, {
        coordinates: [3, 3],
        disposition: "vertical",
    });

    computer.placeShip(1, {
        coordinates: [3, 7],
        disposition: "vertical",
    });
    player1.placeShip(2, {
        coordinates: [3, 7],
        disposition: "vertical",
    });

    computer.placeShip(2, {
        coordinates: [3, 2],
        disposition: "vertical",
    });
};
export const players = [player1, computer];

export const initPlayerTurn = (playerId) => {
    players[playerId - 1].startTurn();
};

export const changePlayersTurns = () => {
    players.forEach((player) => {
        player.isTurnToAttack() ? player.stopTurn() : player.startTurn();
    });
};

function stopPlayers() {
    players.forEach((player) => player.stopTurn());
}
