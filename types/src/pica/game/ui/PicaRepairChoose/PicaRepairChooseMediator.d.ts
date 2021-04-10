import { BasicMediator, Game } from "gamecore";
import { PicaRepairChoose } from "./PicaRepairChoose";
export declare class PicaRepairChooseMediator extends BasicMediator {
    protected mModel: PicaRepairChoose;
    private mScneType;
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    destroy(): void;
    protected panelInit(): void;
    private onCloseHandler;
    private onQueryChangeHandler;
    private setFurnitureGroup;
    private get configMgr();
    private onHideView;
    private onViewInitComplete;
}
