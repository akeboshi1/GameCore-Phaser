import {PacketHandler, PBpacket} from "net-socket-packet";
import {op_client, op_virtual_world} from "../../protocol/protocols";
import Globals from "../Globals";

export default class SelectRole extends Phaser.State {
    public create(): void {
        Globals.SocketManager.addHandler(new Handler(this.game));
    }
}

class Handler extends PacketHandler {
    private game: Phaser.Game;
    constructor( game: Phaser.Game ) {
        super();
        this.game = game;
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SELECT_CHARACTER, this.handleSelectCharacter);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_ERROR, this.onErrorHandler);
    }

    private onErrorHandler(packet: PBpacket) {
        let err: op_client.IOP_GATEWAY_RES_CLIENT_ERROR = packet.content;
        console.error(`error[${err.responseStatus}]: ${err.msg}`);
    }

    private handleSelectCharacter(packet: PBpacket): void {
        let character: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SELECT_CHARACTER = packet.content;
        Globals.DataCenter.PlayerData.setMainPlayerInfo(character.character);
        Globals.DataCenter.PlayerData.mainPlayerInfo.changeAvatarModelByModeVO(character.character.avatar);
        Globals.DataCenter.PlayerData.mainPlayerInfo.setWalkableArea(character.character.walkableArea);
        Globals.DataCenter.PlayerData.mainPlayerInfo.setCollisionArea(character.character.collisionArea);

        let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_CHARACTER_CREATED);
        Globals.SocketManager.send(pkt);
        this.game.state.start("game");

    }
}