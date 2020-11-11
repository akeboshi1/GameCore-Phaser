import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { ModuleName } from "structure";
import { Game } from "../game";
import { BasicMediator } from "./basic/basic.mediator";
import { UIMediatorType } from "./ui.mediator.type";

export class UIManager extends PacketHandler {
    protected mMedMap: Map<UIMediatorType, BasicMediator>;
    protected mAtiveUIData: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_REFRESH_ACTIVE_UI;
    constructor(protected game: Game) {
        super();
        if (!this.mMedMap) {
            this.mMedMap = new Map();
        }
    }

    public getMed(name: string): BasicMediator {
        return this.mMedMap.get(name);
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
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_REFRESH_ACTIVE_UI, this.onUIStateHandler);
    }

    public removePackListener() {
        const connection = this.game.connection;
        if (!connection) {
            return;
        }
        connection.removePacketListener(this);
    }

    public showMainUI() {
        if (this.mAtiveUIData) {
            this.updateUIState(this.mAtiveUIData);
        }
        this.mMedMap.forEach((mediator: any) => {
            if (mediator.isSceneUI() && !mediator.isShow()) {
                mediator.show();
            }
        });
    }

    public showMed(type: string, param?: any) {
        if (!this.mMedMap) {
            this.mMedMap = new Map();
        }
        type = this.getPanelNameByAlias(type);
        const className: string = type + "Mediator";
        let mediator: BasicMediator = this.mMedMap.get(className);
        if (!mediator) {
            // const path: string = `./${type}/${type}Mediator`;
            const ns: any = require(`./${type}/${className}`);
            mediator = new ns[className](this.game);
            if (!mediator) {
                // Logger.getInstance().error(`error ${type} no panel can show!!!`);
                return;
            }
            this.mMedMap.set(className, mediator);
            // mediator.setName(type);
        }
        // if (mediator.showing) return;
        if (param) mediator.setParam(param);
        mediator.show(param);
    }

    public updateMed(type: string, param?: any) {
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

    public getActiveUIData(name: string): any[] {
        if (!this.mAtiveUIData) return null;
        const arr: op_pkt_def.IPKT_UI[] = [];
        for (const data of this.mAtiveUIData.ui) {
            const tagName = data.name.split(".")[0];
            const paneName = this.getPanelNameByStateTag(tagName);
            if (paneName === name) {
                arr.push(data);
            }
        }
        return arr;
    }

    public destroy() {
        this.removePackListener();
        if (this.mMedMap) {
            this.mMedMap.forEach((basicMed: BasicMediator) => {
                if (basicMed) basicMed.destroy();
            });
        }
        if (this.mAtiveUIData) this.mAtiveUIData = undefined;
    }

    protected updateUIState(data: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_REFRESH_ACTIVE_UI) {
        for (const ui of data.ui) {
            const tag = ui.name;
            const paneltags = tag.split(".");
            const panelName = this.getPanelNameByStateTag(paneltags[0]);
            if (panelName) {
                const mediator: BasicMediator = this.mMedMap.get(panelName + "Mediator");
                if (mediator) {
                    if (paneltags.length === 1) {
                        if (ui.visible || ui.visible === undefined) {
                            this.showMed(panelName);
                        } else {
                            this.hideMed(panelName);
                        }
                    } else {
                        this.game.peer.render.updateUIState(panelName, ui);
                    }
                }
            }
        }
    }

    protected getMediatorClass(type: string): any {
        const className = type + "Mediator";
        return require(`./${type}/${className}`);
    }

    protected onUIStateHandler(packge: PBpacket) {
        this.mAtiveUIData = packge.content;
        if (this.mAtiveUIData && this.mMedMap) {
            this.updateUIState(this.mAtiveUIData);
        }
    }

    protected getPanelNameByStateTag(tag: string) {
        switch (tag) {
            case "mainui":
                return "PicaMainUI";
            case "activity":
                return "Activity";
            case "picachat":
                return "PicaChat";
            case "picanavigate":
                return "PicaNavigate";
            case "PicHandheld":
                return "PicHandheld";
        }
        return tag;
    }

    protected handleShowUI(packet: PBpacket): void {
        const ui: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = packet.content;
        this.showMed(ui.name, ui);
    }

    protected handleUpdateUI(packet: PBpacket) {
        const ui: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_UPDATE_UI = packet.content;
        this.updateMed(ui.name, ui);
    }

    protected handleCloseUI(packet: PBpacket): void {
        const ui: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_CLOSE_UI = packet.content;
        this.hideMed(ui.name);
    }

    protected onHandleShowCreateRoleUI(packet: PBpacket) {
        this.showMed(ModuleName.CREATEROLE_NAME, packet.content);
    }

    protected onHandleCloseCreateRoleUI() {
        this.hideMed(ModuleName.CREATEROLE_NAME);
        // this.game.peer.render.hideCreateRole();
    }

    protected getPanelNameByAlias(alias: string) {
        switch (alias) {
            case "MessageBox":
                return "PicaMessageBox";
        }
        return alias;
    }
}
