import Globals from "../../Globals";
import {op_client} from "../../../protocol/protocols";
import {PacketHandler, PBpacket} from "net-socket-packet";
import BaseSingleton from "../../base/BaseSingleton";
import {MessageType} from "../const/MessageType";

export class SceneService extends BaseSingleton {
    public register(): void {
        Globals.SocketManager.addHandler(new Handler());
    }
}

class Handler extends PacketHandler {
    constructor() {
        super();
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE, this.handleEnterScene);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_MOVE_CHARACTER, this.handleMoveCharacter);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_SET_CHARACTER_POSITION, this.handleStopCharacter);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_MOVE_ELEMENT, this.handleMoveElement);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_SET_ELEMENT_POSITION, this.handleStopElement);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_CHANGE_ELEMENT_ANIMATION, this.handleChangeElement);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_ERROR, this.onErrorHandler);
    }

    private handleMoveCharacter(packet: PBpacket): void {
        let moveData: op_client.OP_GATEWAY_REQ_CLIENT_MOVE_CHARACTER = packet.content;
        Globals.MessageCenter.emit(MessageType.SCENE_MOVE_TO, moveData.moveData);
    }

    private handleStopCharacter(packet: PBpacket): void {
        let moveData: op_client.OP_GATEWAY_REQ_CLIENT_SET_CHARACTER_POSITION = packet.content;
        Globals.MessageCenter.emit(MessageType.SCENE_MOVE_STOP, moveData.movePostion);
    }

    private handleMoveElement(packet: PBpacket): void {
        let moveData: op_client.OP_GATEWAY_REQ_CLIENT_MOVE_ELEMENT = packet.content;
        Globals.MessageCenter.emit(MessageType.SCENE_MOVE_TO, moveData.moveData);
    }

    private handleStopElement(packet: PBpacket): void {
        let moveData: op_client.OP_GATEWAY_REQ_CLIENT_SET_ELEMENT_POSITION = packet.content;
        Globals.MessageCenter.emit(MessageType.SCENE_MOVE_STOP, moveData.movePostion);
    }

    private handleChangeElement(packet: PBpacket): void {
        let changeData: op_client.OP_GATEWAY_REQ_CLIENT_CHANGE_ELEMENT_ANIMATION = packet.content;
        Globals.MessageCenter.emit(MessageType.CHANGE_ELEMENT_ANIMATION, changeData.changeAnimation);
    }

    private onErrorHandler(packet: PBpacket): void {
        let err: op_client.IOP_GATEWAY_RES_CLIENT_ERROR = packet.content;
        console.error(`error[${err.responseStatus}]: ${err.msg}`);
    }

    private handleEnterScene(packet: PBpacket): void {
        let sceneData: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE = packet.content;
        Globals.DataCenter.PlayerData.setMainPlayerInfo({actorId: sceneData.actorId});
        Globals.DataCenter.SceneData.setMapInfo(sceneData.scene);
    }
}