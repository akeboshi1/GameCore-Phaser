import { BasicMediator, Game } from "gamecore";
export declare class PicaHandheldMediator extends BasicMediator {
    private PicaHandheld;
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    destroy(): void;
    isSceneUI(): boolean;
    private onReqHandheldList;
    private onHandheldList;
    private onChangeHandheld;
    private onClearHandheld;
    private openEquipedPanel;
}
