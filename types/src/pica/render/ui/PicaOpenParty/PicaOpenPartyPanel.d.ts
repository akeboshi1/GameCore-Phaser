import { op_client } from "pixelpai_proto";
import { BasePanel, UiManager } from "gamecoreRender";
export declare class PicaOpenPartyPanel extends BasePanel {
    private uiManager;
    private content;
    private mBackground;
    private bg;
    private closeBtn;
    private partyBtn;
    private settingBtn;
    private topCheckBox;
    private partyCreatePanel;
    constructor(uiManager: UiManager);
    resize(w: number, h: number): void;
    show(param?: any): void;
    addListen(): void;
    removeListen(): void;
    destroy(): void;
    setPartyData(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CREATE_PARTY_REQUIREMENTS, isSelf?: boolean): Promise<void>;
    protected preload(): void;
    protected init(): void;
    private onTabBtnHandler;
    private createTabButton;
    private onCloseHandler;
    private onOpenPartyHandler;
    private showPanelHandler;
    private onQueryThemeHandler;
}
