import Globals from "../../Globals";
import {op_client, op_gateway} from "../../../protocol/protocols";
import {PacketHandler, PBpacket} from "net-socket-packet";
import BaseSingleton from "../../base/BaseSingleton";

export class SceneService extends BaseSingleton {
    public register(): void {
        Globals.SocketManager.addHandler(new Handler());
    }
}

class Handler extends PacketHandler {
    constructor() {
        super();
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE, this.handleEnterScene);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_ERROR, this.onErrorHandler);
    }

    private onErrorHandler(packet: PBpacket) {
        let err: op_client.IOP_GATEWAY_RES_CLIENT_ERROR = packet.content;
        console.error(`error[${err.responseStatus}]: ${err.msg}`);
    }

    private handleEnterScene(packet: PBpacket): void {
        let sceneData: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE = packet.content;
        Globals.DataCenter.PlayerData.setMainPlayerInfo({actorId: sceneData.actorId});
        Globals.DataCenter.SceneData.setMapInfo(sceneData.scene);
    }
}