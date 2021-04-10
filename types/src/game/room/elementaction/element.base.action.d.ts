import { Game } from "gamecore";
import { ISprite } from "structure";
export declare class ElementBaseAction {
    data: ISprite;
    game: Game;
    actionTag: string;
    userid: number;
    constructor(game: Game, data: ISprite, userid?: number);
    executeAction(): void;
    destroy(): void;
    getActionData(actionName?: string): string;
}
