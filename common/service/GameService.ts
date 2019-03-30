import BaseSingleton from "../../base/BaseSingleton";
import Globals from "../../Globals";
import {PBpacket} from "net-socket-packet";
import {op_client} from "../../../protocol/protocols";
import {BasePacketHandler} from "./BasePacketHandler";

export class GameService extends BaseSingleton {
    private handle: Handler;

    public register(): void {
        this.handle = new Handler();
        Globals.SocketManager.addHandler(this.handle);
    }

    public unRegister(): void {
        Globals.SocketManager.removeHandler(this.handle);
    }
}

class Handler extends BasePacketHandler {
    constructor() {
        super();
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SELECT_CHARACTER, this.handleSelectCharacter);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_GAME_OVER, this.handleGameOver);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI, this.handleShowUI);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_CLOSE_UI, this.handleCloseUI);
    }

    private handleShowUI(packet: PBpacket): void {
        let ui: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = packet.content;
        Globals.ModuleManager.openModule(ui.name, ui);
    }

    private handleCloseUI(packet: PBpacket): void {
        let ui: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_CLOSE_UI = packet.content;
        Globals.ModuleManager.destroyModule(ui.name);
    }

    private handleSelectCharacter(packet: PBpacket): void {
        let character: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SELECT_CHARACTER = packet.content;
        Globals.DataCenter.PlayerData.setCharacterId(character.selectCharacterId);
    }

    private handleGameOver(packet: PBpacket): void {
        let GameOver: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_GAME_OVER = packet.content;
        Globals.PromptManager.showAlert(GameOver.msg);
    }
}
