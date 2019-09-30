import { WorldService } from "../game/world.service";
import { ConnectionService } from "../net/connection.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { IBag } from "./bag/basebag";
import { op_client } from "pixelpai_proto";
import { Logger } from "../utils/log";
import { ChatPanel } from "./chat/chat.panel";
import { IMediator } from "./baseMediator";
import { BagMediator } from "./bag/bag/bagMediator";
import { UIMediatorType } from "./ui.mediatorType";
import { BagUIMediator } from "./bag/bagHotkey/bagUIMediator";
import { ChatMediator } from "./chat/chat.mediator";

export class UiManager extends PacketHandler {
    // public mBagMediator: BagMediator;
    // public bagPanel: BagPanel;
    private mBagUI: IBag;
    private mConnect: ConnectionService;
    private mMedMap: Map<UIMediatorType, IMediator>;
    constructor(private worldService: WorldService) {
        super();

        this.mConnect = worldService.connection;
        if (this.mConnect) {
            this.mConnect.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI, this.handleShowUI);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_UPDATE_UI, this.handleUpdateUI);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_CLOSE_UI, this.handleCloseUI);
        }
    }

    public setScene(scene: Phaser.Scene) {
        if (!this.mMedMap) {
            this.mMedMap = new Map();
            // ============场景中固定显示ui
            this.mMedMap.set(UIMediatorType.BagHotKey, new BagUIMediator(this.worldService, scene));
            this.mMedMap.set(UIMediatorType.BagMediator, new BagMediator(this.worldService, scene));
            this.mMedMap.set(UIMediatorType.ChatMediator, new ChatMediator(this.worldService, scene));
        }

        // TOOD 通过统一的方法创建打开
        this.mMedMap.forEach((mediator: IMediator) => {
            if (mediator.isSceneUI()) mediator.show();
        });
        // const chat = new ChatPanel(scene, this.worldService);
        // chat.show();
        // this.mBagMediator = new BagMediator(this.worldService, scene);
        // this.bagPanel = new BagPanel(scene, this.worldService);
    }

    public resize(width: number, height: number) {
        if (this.mBagUI) {
            this.mBagUI.resize();
        }
        if (this.mMedMap) {
            this.mMedMap.forEach((mediator: IMediator) => {
                if (mediator.isShow) mediator.resize();
            });
        }
    }

    public getMediator(type: string): IMediator | undefined {
        const med: IMediator = this.mMedMap.get(type);
        return med;
    }

    private handleShowUI(packet: PBpacket): void {
        const ui: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = packet.content;
        this.showMed(ui.name, ui);
    }

    private handleUpdateUI(packet: PBpacket) {
        const ui: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_UPDATE_UI = packet.content;
        this.updateMed(ui.name, ui);
    }

    private handleCloseUI(packet: PBpacket): void {
        const ui: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_CLOSE_UI = packet.content;
        this.hideMed(ui.name);
    }

    private showMed(type: string, ...param: any[]) {
        const mediator: IMediator = this.mMedMap.get(type);
        if (!mediator) {
            const className: string = type + ".panel";
            // const ns: any = require("./src/ui/" + type + "/" + className + ".ts");
            Logger.debug("====show====" + type);
            // showPanel = new ns[className]();
            if (!mediator) {
                Logger.error("error type no panel can show!!!");
                return;
            }
            this.mMedMap.set(type, mediator);
            mediator.setName(type);
        }
        mediator.show(param);
    }

    private updateMed(type: string, ...param: any[]) {
        const mediator: IMediator = this.mMedMap.get(type);
        if (!mediator) {
            Logger.error("error type no panel can show!!!");
            return;
        }
        mediator.update(param);
    }

    private hideMed(type: string) {
        const mediator: IMediator = this.mMedMap.get(type);
        if (!mediator) {
            Logger.error("error type no panel can show!!!");
            return;
        }
        mediator.hide();
    }
}
