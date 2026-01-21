import "./styles/styles.css";
import { players, placePlayersShips, initPlayerTurn } from "./modules/players";
import { renderBoards } from "./components/player-board";

placePlayersShips();
initPlayerTurn(1);

renderBoards();
