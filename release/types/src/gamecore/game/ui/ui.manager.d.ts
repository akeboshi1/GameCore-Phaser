import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { Game } from "../game";
import { BasicMediator } from "./basic/basic.mediator";
import { UIMediatorType } from "./ui.mediator.type";
export declare class UIManager extends PacketHandler {
    protected game: Game;
    protected mMedMap: Map<UIMediatorType, BasicMediator>;
    protected mUIStateData: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_REFRESH_ACTIVE_UI;
    protected isshowMainui: boolean;
    private mNoneUIMap;
    private mSceneUIMap;
    private mNormalUIMap;
    private mPopUIMap;
    private mTipUIMap;
    private mMonopolyUIMap;
    private mActivityUIMap;
    private mUILayoutMap;
    private mShowuiList;
    private mLoadingCache;
    constructor(game: Game);
    getMed(name: string): BasicMediator;
    recover(): void;
    addPackListener(): void;
    removePackListener(): void;
    showMainUI(hideNames?: string[]): void;
    showMed(type: string, param?: any): void;
    updateMed(type: string, param?: any): void;
    hideMed(type: string): void;
    showExistMed(type: string, extendName?: string): void;
    getUIStateData(name: string): any[];
    checkUIState(medName: string, show: boolean): void;
    /**
     * 根据面板Key更新UI状态
     * @param panel Panel key
     */
    refrehActiveUIState(panel: string): void;
    destroy(): void;
    protected onForceOfflineHandler(packet: PBpacket): Promise<void>;
    protected updateUIState(data: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_REFRESH_ACTIVE_UI): void;
    protected updateUI(ui: op_pkt_def.IPKT_UI): void;
    protected getMediatorClass(type: string): any;
    protected handleShowUI(packet: PBpacket): void;
    protected handleUpdateUI(packet: PBpacket): void;
    protected handleCloseUI(packet: PBpacket): void;
    protected getPanelNameByAlias(alias: string): string;
    protected clearMediator(): void;
    protected onOpenUIMediator(): void;
    private checkSceneUImap;
    private checkNormalUITween;
    private checkBaseUImap;
    private checkNormalUImap;
    private chekcTipUImap;
    private initUILayoutType;
}
