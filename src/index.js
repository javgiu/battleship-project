import "./styles/styles.css";
import { players, placePlayersShips, initPlayerTurn } from "./modules/player";
import { renderPlayerBoard, setBoardsEvents } from "./components/player-board";

placePlayersShips();
initPlayerTurn(1);

renderPlayerBoard(players[0]);
renderPlayerBoard(players[1]);

setBoardsEvents();
