import { createGameboard } from "../src/modules/gameboard";

let gameboard;

beforeEach(() => {
    gameboard = createGameboard(8);
});

describe("gameboard object", () => {
    test("gameboard.board should an array of length 8", () => {
        expect(gameboard.board.length).toBe(8);
        for (let i = 0; i < gameboard.board.length; i++) {
            expect(gameboard.board[i].length).toBe(8);
        }
    });

    test("place ship on valid coordinates in horizontal position", () => {
        let x = 2;
        let y = 5;
        let disposition = "horizontal";
        const coordinates = [x, y];

        const position = {
            coordinates,
            disposition,
        };
        gameboard.placeShip(gameboard.ships[0], position);
        for (let i = 0; i < 3; i++) {
            expect(gameboard.board[x][y + i]).toEqual(gameboard.ships[0]);
        }
    });

    test("place ship on valid coordinates in vertical position", () => {
        let x = 2;
        let y = 5;
        let disposition = "vertical";
        const coordinates = [x, y];

        const position = {
            coordinates,
            disposition,
        };
        gameboard.placeShip(gameboard.ships[0], position);
        for (let i = 0; i < 3; i++) {
            expect(gameboard.board[x + i][y]).toEqual(gameboard.ships[0]);
        }
    });

    test("place ship on invalid coordinates", () => {
        let x = -1;
        let y = 5;
        let disposition = "vertical";
        const coordinates = [x, y];

        const position = {
            coordinates,
            disposition,
        };
        expect(() =>
            gameboard.placeShip(gameboard.ships[0], position)
        ).toThrow();
    });

    test("place ship passing the limits", () => {
        let x = 6;
        let y = 5;
        let disposition = "vertical";
        const coordinates = [x, y];

        const position = {
            coordinates,
            disposition,
        };
        expect(() =>
            gameboard.placeShip(gameboard.ships[0], position)
        ).toThrow();
    });

    test("receiveAttack function returns a ship1 in the coordinates", () => {
        gameboard.placeShip(gameboard.ships[0], {
            coordinates: [0, 0],
            disposition: "horizontal",
        });
        expect(gameboard.receiveAttack([0, 0])).toEqual(gameboard.ships[0]);
    });

    test("receiveAttack function returns a ship2 in the coordinates", () => {
        gameboard.placeShip(gameboard.ships[1], {
            coordinates: [2, 0],
            disposition: "horizontal",
        });
        expect(gameboard.receiveAttack([2, 0])).toEqual(gameboard.ships[1]);
    });
    test("receiveAttack function returns an error if receive the same coordinates twice", () => {
        expect(gameboard.receiveAttack([2, 0])).toBe(null);
        expect(() => gameboard.receiveAttack([2, 0])).toThrow();
    });

    test("recieveAttack can hit the ship in all the places and make it sunk", () => {
        gameboard.placeShip(gameboard.ships[0], {
            coordinates: [0, 0],
            disposition: "horizontal",
        });
        const ship = gameboard.receiveAttack([0, 0]);
        expect(() => gameboard.receiveAttack([0, 0])).toThrow();
        expect(ship.getHits()).toBe(1);
        expect(gameboard.ships[0].getHits()).toBe(1);
        gameboard.receiveAttack([0, 1]);
        expect(gameboard.ships[0].getHits()).toBe(2);
        gameboard.receiveAttack([0, 2]);
        expect(gameboard.ships[0].getHits()).toBe(3);
        expect(ship.isSunk()).toBe(true);
    });
});
