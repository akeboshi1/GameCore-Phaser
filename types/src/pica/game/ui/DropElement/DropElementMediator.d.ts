import { BasicMediator, Game } from "gamecore";
export declare class DropElementMediator extends BasicMediator {
    constructor(game: Game);
    setParam(param: any): void;
    drop(): void;
}
