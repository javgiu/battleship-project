import {
    players,
    placePlayersShips,
    changePlayersTurns,
    initPlayerTurn,
} from "./players";
import { renderBoards, renderPlayersBoards } from "../components/player-board";
import {
    coordinatesToKeys,
    convertStringToNumbersArray,
} from "../utilities/converters";

export function initGame() {
    placePlayersShips();
    renderBoards();
    initPlayerTurn(1);
}
