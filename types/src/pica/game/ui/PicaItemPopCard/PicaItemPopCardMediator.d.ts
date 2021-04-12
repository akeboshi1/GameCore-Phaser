import { BasicMediator, Game } from "gamecore";
export declare class PicaItemPopCardMediator extends BasicMediator {
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    private onCloseHandler;
}
