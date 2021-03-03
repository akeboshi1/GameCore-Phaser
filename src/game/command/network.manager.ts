import { Game } from "../game";

export class NetworkManager {
    protected mGame: Game;
    constructor(game: Game) {
        this.mGame = game;
        this.init();
    }
    init() {
    }

    destory() {

    }
}
