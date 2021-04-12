import { BasicMediator, Game } from "gamecore";
export declare class PicaMessageBoxMediator extends BasicMediator {
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    private onClickHandler;
}
