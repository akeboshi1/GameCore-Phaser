import { WorldService } from "../game/world.service";
import { ConnectionService } from "../net/connection.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { IRoomService } from "../rooms/room";
import { ChatPanel } from "./chatPanel";
import { Size } from "../utils/size";
import { IBag } from "./bag/basebag";
import { BagUIPC } from "./bag/bagUI.pc";
import { BagUIMobile } from "./bag/bagUI.mobile";
import { op_client } from "pixelpai_proto";
import { UIModuleType } from "./ui.moduleType";
import { IAbstractPanel } from "./abstractPanel";
import { Logger } from "../utils/log";
import { BagPanel } from "./bag/bagPanel";

export class UiManager extends PacketHandler {
    public bagPanel: BagPanel;
    private mChatPanel: ChatPanel;
    private mBagUI: IBag;

    private mConnect: ConnectionService;
    private mViewMap: Map<UIModuleType, IAbstractPanel>;
    constructor(private worldService: WorldService) {
        super();
        this.mViewMap = new Map();
        this.mConnect = worldService.connection;
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI, this.handleShowUI);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_UPDATE_UI, this.handleUpdateUI);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_CLOSE_UI, this.handleCloseUI);
    }

    public setScene(scene: Phaser.Scene) {
        const size: Size = this.worldService.getSize();
        if (this.worldService.game.device.os.desktop) {
            this.mBagUI = new BagUIPC(scene, this.worldService, (size.width >> 1) - 29, size.height - 50);
        } else {
            this.mBagUI = new BagUIMobile(scene, this.worldService, size.width - 100, size.height - 100);
        }
        this.mBagUI.show(undefined);
        this.bagPanel = new BagPanel(scene, this.worldService);
    }

    public resize(width: number, height: number) {
        if (this.mBagUI) {
            this.mBagUI.resize();
        }
        if (this.bagPanel) {
            this.bagPanel.resize();
        }
    }

    private handleShowUI(packet: PBpacket): void {
        const ui: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = packet.content;
        this.showPanel(ui.name, ui);
    }

    private handleUpdateUI(packet: PBpacket) {
        const ui: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_UPDATE_UI = packet.content;
        this.updatePanel(ui.name, ui);
    }

    private handleCloseUI(packet: PBpacket): void {
        const ui: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_CLOSE_UI = packet.content;
        this.hidePanel(ui.name);
    }

    private showPanel(type: string, ...param: any[]) {
        const showPanel: IAbstractPanel = this.mViewMap.get(type);
        if (!showPanel) {
            const className: string = type + ".panel";
            // const ns: any = require("./src/ui/" + type + "/" + className + ".ts");
            Logger.debug("====show====" + type);
            // showPanel = new ns[className]();
            if (!showPanel) {
                Logger.error("error type no panel can show!!!");
                return;
            }
            this.mViewMap.set(type, showPanel);
        }
        showPanel.show(param);
    }

    private updatePanel(type: string, ...param: any[]) {
        const showPanel: IAbstractPanel = this.mViewMap.get(type);
        if (!showPanel) {
            Logger.error("error type no panel can show!!!");
            return;
        }
        showPanel.update(param);
    }

    private hidePanel(type: string) {
        const showPanel: IAbstractPanel = this.mViewMap.get(type);
        if (!showPanel) {
            Logger.error("error type no panel can show!!!");
            return;
        }
        showPanel.close();
    }
}
