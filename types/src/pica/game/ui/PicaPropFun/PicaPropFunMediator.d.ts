import { BasicMediator, Game } from "gamecore";
export declare class PicaPropFunMediator extends BasicMediator {
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    private onCloseHandler;
}
