import { createGameboard } from "../src/modules/gameboard";

let gameboard;

beforeAll(() => {
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
});
