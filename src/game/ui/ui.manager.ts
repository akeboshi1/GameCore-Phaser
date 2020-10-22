import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client } from "pixelpai_proto";
import { Game } from "../game";
import { BasicMediator } from "./basic/basic.mediator";
import { UIMediatorType } from "./ui.mediator.type";

export class UIManager extends PacketHandler {
    private mMedMap: Map<UIMediatorType, BasicMediator>;
    constructor(private game: Game) {
        super();
    }

    public addPackListener() {
        const connection = this.game.connection;
        if (!connection) {
            return;
        }
        connection.addPacketListener(this);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI, this.handleShowUI);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_UPDATE_UI, this.handleUpdateUI);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_CLOSE_UI, this.handleCloseUI);
        // TODO 这2条协议合并到SHOW_UI和CLOS_UI
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_CREATE_ROLE_UI, this.onHandleShowCreateRoleUI);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_CLOSE_CREATE_ROLE_UI, this.onHandleCloseCreateRoleUI);
    }

    public removePackListener() {
        const connection = this.game.connection;
        if (!connection) {
            return;
        }
        connection.removePacketListener(this);
    }

    public showMainUI() {
    }

    public showMed(type: string, ...param: any[]) {
        if (!this.mMedMap) {
            this.mMedMap = new Map();
        }
        type = this.getPanelNameByAlias(type);
        const className: string = type + "Mediator";
        let mediator: BasicMediator = this.mMedMap.get(className);
        if (!mediator) {
            const path: string = `./${type}/${type}Mediator`;
            const ns: any = require(`./${type}/${className}`);
            mediator = new ns[className](this.game);
            if (!mediator) {
                // Logger.getInstance().error(`error ${type} no panel can show!!!`);
                return;
            }
            this.mMedMap.set(type + "Mediator", mediator);
            // mediator.setName(type);
        }
        // if (mediator.showing) return;
        if (param) mediator.setParam(param);
        mediator.show(param);
    }

    public updateMed(type: string, ...param: any[]) {
        if (!this.mMedMap) {
            return;
        }
        const name: string = `${type}Mediator`;
        const mediator: BasicMediator = this.mMedMap.get(name);
        if (!mediator) {
            // Logger.getInstance().error(`error ${type} no panel can show!!!`);
            return;
        }
        if (param) mediator.setParam(param);
        mediator.update(param);
    }

    public hideMed(type: string) {
        if (!this.mMedMap) {
            return;
        }
        type = this.getPanelNameByAlias(type);
        const medName: string = `${type}Mediator`;
        const mediator: BasicMediator = this.mMedMap.get(medName);
        if (!mediator) {
            // Logger.getInstance().error(`error ${type} no panel can show!!!`);
            return;
        }
        mediator.hide();
    }

    public showExistMed(type: string, extendName = "Mediator") {
        if (!this.mMedMap) {
            return;
        }
        type = this.getPanelNameByAlias(type);
        const className: string = type + extendName;
        const mediator: BasicMediator = this.mMedMap.get(className);
        if (mediator) mediator.show();
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

    private onHandleShowCreateRoleUI(packet: PBpacket) {
        this.showMed("CreateRole", packet.content);
    }

    private onHandleCloseCreateRoleUI() {
        this.hideMed("CreateRole");
    }

    private getPanelNameByAlias(alias: string) {
        switch (alias) {
            case "MessageBox":
                return "PicaMessageBox";
        }
        return alias;
    }
}
