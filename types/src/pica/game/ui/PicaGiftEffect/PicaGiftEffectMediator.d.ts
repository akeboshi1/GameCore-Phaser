import { BasicMediator, Game } from "gamecore";
export declare class PicaGiftEffectMediator extends BasicMediator {
    private picagift;
    private tempDataQueue;
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    destroy(): void;
    private updateGiftData;
    private onCloseHandler;
    private onItemDataHandler;
}
