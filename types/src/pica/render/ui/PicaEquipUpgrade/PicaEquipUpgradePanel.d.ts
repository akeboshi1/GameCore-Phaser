import { op_client } from "pixelpai_proto";
import { BasePanel, UiManager } from "gamecoreRender";
export declare class PicaEquipUpgradePanel extends BasePanel {
    private commonkey;
    private blackBg;
    private equipItems;
    private bg;
    private titlebg;
    private tilteName;
    private closeBtn;
    private content;
    constructor(uiManager: UiManager);
    resize(width: number, height: number): void;
    show(param?: any): void;
    addListen(): void;
    removeListen(): void;
    preload(): void;
    init(): void;
    setEquipDatas(content: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_MINING_MODE_SHOW_SELECT_EQUIPMENT_PANEL): void;
    setActiveEquipment(equip: op_client.IMiningEquipment): void;
    destroy(): void;
    getEuipDatas(): any[];
    private refreshData;
    private resetPosition;
    private OnClosePanel;
    private onReqActiveEquipment;
    private onReqEquipedEquipment;
}
