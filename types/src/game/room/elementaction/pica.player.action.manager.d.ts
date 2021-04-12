import { Game } from "gamecore";
import { ThrowElementAction } from "./throw.element.action";
export declare class PicaPlayerActionManager {
    protected game: Game;
    constructor(game: Game);
    executeElementActions(tag: string, data: any, userid?: number): void;
    createElementAction(tag: string, data: any, userid?: number): ThrowElementAction;
}
