import Globals from "../../Globals";
import {op_client} from "../../../protocol/protocols";
import {PBpacket} from "net-socket-packet";
import BaseSingleton from "../../base/BaseSingleton";
import {MessageType} from "../const/MessageType";
import {BasePacketHandler} from "./BasePacketHandler";
import {Log} from "../../Log";

export class SceneService extends BaseSingleton {
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
        // Server
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE, this.handleEnterScene);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_CHANGE_SCENE, this.handleChangeScene);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_MOVE_CHARACTER, this.handleMoveCharacter);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_SET_CHARACTER_POSITION, this.handleStopCharacter);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_MOVE_ELEMENT, this.handleMoveElement);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_SET_ELEMENT_POSITION, this.handleStopElement);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_CHANGE_ELEMENT_ANIMATION, this.handleChangeElement);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ADD_ELEMENT, this.handleServerAddElement);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_REMOVE_ELEMENT, this.handleServerRemoveElement);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SYNCHRO_CHARACTER, this.handleUpdateCharacter);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ADD_CHARACTER, this.handleAddCharacter);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_REMOVE_CHARACTER, this.handleRemoveCharacter);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ADD_TERRAIN, this.handleServerAddTerrain);
        // Editor
        this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_SET_EDITOR_MODE, this.handleChangeEditorMode);
        this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ADD_ELEMENT, this.handleAddElement);
        this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ADD_TERRAIN, this.handleAddTerrain);
        this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_ELEMENT, this.handleDeleteElement);
        this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_TERRAIN, this.handleDeleteTerrain);
    }

    // 没想到吧，这是潘老板写的
    private handleServerAddTerrain(packet: PBpacket): void {
        let terrain: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_ADD_TERRAIN = packet.content;
        Globals.MessageCenter.emit(MessageType.SCENE_ADD_TERRAIN, terrain.terrain);
    }

    private handleServerAddElement(packet: PBpacket): void {
        let element: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_ADD_ELEMENT = packet.content;
        Globals.MessageCenter.emit(MessageType.SCENE_ADD_ELEMENT, element.elements);
    }

    private handleServerRemoveElement(packet: PBpacket): void {
        let element: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_REMOVE_ELEMENT = packet.content;
        Globals.MessageCenter.emit(MessageType.SCENE_REMOVE_ELEMENT, element.elementid);
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

    private handleEnterScene(packet: PBpacket): void {
        let sceneData: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE = packet.content;
        if (sceneData.actor) {
            Globals.DataCenter.PlayerData.setMainPlayerInfo(sceneData.actor);
        }
        if (sceneData.scene) {
            Globals.DataCenter.SceneData.setMapInfo(sceneData.scene);
        }
    }

    private handleChangeScene(packet: PBpacket): void {
        let sceneData: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_CHANGE_SCENE = packet.content;
        if (sceneData.actor) {
            Globals.DataCenter.PlayerData.setMainPlayerInfo(sceneData.actor);
        }
        if (sceneData.scene) {
            Globals.DataCenter.SceneData.setMapInfo(sceneData.scene);
        }
        Globals.MessageCenter.emit(MessageType.SCENE_CHANGE_TO);
    }

    private handleChangeEditorMode(packet: PBpacket): void {
        let modeData: op_client.IOP_EDITOR_REQ_CLIENT_SET_EDITOR_MODE = packet.content;
        // Log.trace(modeData.mode, modeData.type);
        Globals.DataCenter.EditorData.changeEditorMode(modeData.mode, modeData.type);
    }

    private handleAddElement(packet: PBpacket): void {
        let elementData: op_client.IOP_EDITOR_REQ_CLIENT_ADD_ELEMENT = packet.content;
        Globals.MessageCenter.emit(MessageType.SCENE_ADD_ELEMENT, [elementData.element]);
    }

    private handleAddTerrain(packet: PBpacket): void {
        let terrainData: op_client.IOP_EDITOR_REQ_CLIENT_ADD_TERRAIN = packet.content;
        if (terrainData.all === true) {
          Globals.MessageCenter.emit(MessageType.SCENE_ADD_ALL_TERRAIN, terrainData.terrain);
        } else {
          Globals.MessageCenter.emit(MessageType.SCENE_ADD_TERRAIN, [terrainData.terrain]);
        }
    }

    private handleDeleteElement(packet: PBpacket): void {
        let elementData: op_client.IOP_EDITOR_REQ_CLIENT_DELETE_ELEMENT = packet.content;
        Globals.MessageCenter.emit(MessageType.SCENE_REMOVE_ELEMENT, elementData.id);
    }

    private handleDeleteTerrain(packet: PBpacket): void {
        let terrainData: op_client.IOP_EDITOR_REQ_CLIENT_DELETE_TERRAIN = packet.content;
        if (terrainData.all === true) {
            Globals.MessageCenter.emit(MessageType.SCENE_REMOVE_ALL_TERRAIN);
        } else {
            Globals.MessageCenter.emit(MessageType.SCENE_REMOVE_TERRAIN, [terrainData.x, terrainData.y]);
        }
    }

    private handleAddCharacter(packet: PBpacket): void {
        let character: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_ADD_CHARACTER = packet.content;
        let len: number = character.actors.length;
        for (let i = 0; i < len; i++) {
            Globals.DataCenter.PlayerData.addPlayer(character.actors[i]);
        }
    }

    private handleRemoveCharacter(packet: PBpacket): void {
        let character: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_REMOVE_CHARACTER = packet.content;
        Globals.DataCenter.PlayerData.removePlayer(character.uuid);
    }

    private handleUpdateCharacter(packet: PBpacket): void {
        let character: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SYNCHRO_CHARACTER = packet.content;
        let len: number = character.actors.length;
        for (let i = 0; i < len; i++) {
            Globals.DataCenter.PlayerData.updatePlayer(character.actors[i]);
        }
    }
}
