import Globals from "../../Globals";
import {op_gateway} from "../../../protocol/protocols";
import {PBpacket} from "net-socket-packet";
import BaseSingleton from "../../base/BaseSingleton";
import {MessageType} from "../const/MessageType";

export class SceneService extends BaseSingleton {
    public register(): void {
        Globals.SocketCenter.addListener(op_gateway.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE, this.handleEnterScene);
    }

    private handleEnterScene(packet: PBpacket): void {
        let sceneData: op_gateway.OP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE = packet.content;
        Globals.DataCenter.PlayerData.setMainPlayerInfo({uuid: sceneData.uuid});
        Globals.DataCenter.SceneData.setMapInfo(sceneData.scene);
    }


}