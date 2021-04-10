import { UiManager } from "gamecoreRender";
import { PicaBasePanel } from "../pica.base.panel";
import { IFurnitureGroup } from "picaStructure";
export declare class PicaRepairChoosePanel extends PicaBasePanel {
    private blackGraphic;
    private bg;
    private content;
    private grid;
    private cancelBtn;
    private confirmBtn;
    private curSelectItem;
    constructor(uiManager: UiManager);
    resize(width?: number, height?: number): void;
    onShow(): void;
    addListen(): void;
    removeListen(): void;
    init(): void;
    setChooseData(content: IFurnitureGroup): void;
    private onItemButtonHandler;
    private playMove;
    private onCancelHandler;
    private onConfirmHandler;
}
