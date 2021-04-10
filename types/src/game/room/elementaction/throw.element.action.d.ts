import { Game } from "gamecore";
export declare class ThrowElementAction {
    private game;
    private data;
    private userid;
    actionTag: string;
    constructor(game: Game, data: any, userid: number);
    executeAction(): void;
    getActionData(): any;
}
