import { Game } from "../game";
export declare class NetworkManager {
    protected mGame: Game;
    constructor(game: Game);
    init(): void;
    destory(): void;
}
