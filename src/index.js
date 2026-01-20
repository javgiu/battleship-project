import "./styles/styles.css";
import { createPlayer } from "./modules/player";
import { renderPlayerBoard } from "./components/player-board";

const player1 = createPlayer("human", 1, "Javier");
const player2 = createPlayer("human", 2, "Giulianna");

player1.gameboard.placeShip(0, {
    coordinates: [0, 0],
    disposition: "horizontal",
});

player2.gameboard.placeShip(0, {
    coordinates: [0, 0],
    disposition: "horizontal",
});

player1.gameboard.placeShip(1, {
    coordinates: [3, 3],
    disposition: "vertical",
});

player2.gameboard.placeShip(1, {
    coordinates: [3, 7],
    disposition: "vertical",
});

renderPlayerBoard(player1);
renderPlayerBoard(player2);
