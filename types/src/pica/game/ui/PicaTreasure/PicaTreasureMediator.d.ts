import { BasicMediator, Game } from "gamecore";
export declare class PicaTreasureMediator extends BasicMediator {
    private complEvent;
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    private onHidePanel;
    private onUpdateItemBase;
}
