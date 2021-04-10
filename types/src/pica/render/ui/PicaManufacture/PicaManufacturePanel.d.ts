import { UiManager } from "gamecoreRender";
import { op_client } from "pixelpai_proto";
import { PicaBasePanel } from "../pica.base.panel";
export declare class PicaManufacturePanel extends PicaBasePanel {
    private mCloseBtn;
    private toggleCon;
    private selectLine;
    private curToggleItem;
    private starCountCon;
    private starvalue;
    private composePanel;
    private recastPanel;
    private starCount;
    private optionType;
    constructor(uiManager: UiManager);
    resize(w: number, h: number): void;
    onShow(): void;
    onHide(): void;
    setCategories(categorys?: any[]): void;
    setRecasteResult(data: any): void;
    setGridProp(props: any[]): void;
    updateGridProp(props: any[]): void;
    setStarData(value: number): void;
    setComposeResult(reward: op_client.ICountablePackageItem): void;
    queryRefreshPackage(update: any): void;
    protected onInitialized(): void;
    protected init(): void;
    protected createOptionButtons(): void;
    private onToggleButtonHandler;
    private onCloseHandler;
}
