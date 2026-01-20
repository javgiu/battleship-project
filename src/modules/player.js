import { createGameboard } from "./gameboard.js";

export function createPlayer(
    playerType = "human" || "computer",
    playerId,
    playerName = "Player",
) {
    const name = playerName;
    const gameboard = createGameboard(8);
    const type = playerType;
    const id = playerId;
    return { type, gameboard, id, name };
}
