import { BasicMediator, Game } from "gamecore";
export declare class ActivityMediator extends BasicMediator {
    constructor(game: Game);
    show(params?: any): void;
    isSceneUI(): boolean;
}
