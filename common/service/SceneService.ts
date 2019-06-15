import Globals from "../../Globals";
import {op_client} from "pixelpai_proto";
import {PBpacket} from "net-socket-packet";
import BaseSingleton from "../../base/BaseSingleton";
import {MessageType} from "../const/MessageType";
import {BasePacketHandler} from "./BasePacketHandler";
import {Log} from "../../Log";
import {GameConfig} from "../../GameConfig";

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
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SYNCHRO_PACKAGE, this.handleUpdatePackage);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_CHANGE_CHARACTER_ANIMATION, this.handleChangeCharacterAnimation);

        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ADD_CHARACTER, this.handleAddCharacter);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_REMOVE_CHARACTER, this.handleRemoveCharacter);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ADD_TERRAIN, this.handleServerAddTerrain);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ADD_TERRAIN_END, this.handleServerAddTerrainEnd);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_CHAT, this.handleCharacterChat);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ONLY_BUBBLE, this.handlerAddBubble);
        // Editor
        this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_SET_EDITOR_MODE, this.handleChangeEditorMode);
        this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ADD_ELEMENT, this.handleAddElement);
        this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ADD_TERRAIN, this.handleAddTerrain);
        this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_ELEMENT, this.handleDeleteElement);
        this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_TERRAIN, this.handleDeleteTerrain);
        this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_MOUSE_FOLLOW, this.handleMouseFollow);
        this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_SELECT_ELEMENT, this.handleSelectElement);
        this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_FIXED_TO_ELEMENT, this.handleFixedToElement);
        this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_SYNC_ELEMENT, this.handleUpdateElement);
        this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ALIGN_GRID, this.handleAlignGrid);
        this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_VISIBLE_GRID, this.handleVisibleGrid);
    }

    private handleMouseFollow(packet: PBpacket): void {
        let follow: op_client.OP_EDITOR_REQ_CLIENT_MOUSE_FOLLOW = packet.content;
        Globals.MessageCenter.emit(MessageType.SCENE_MOUSE_FOLLOW, follow);
    }

    // 没想到吧，这是潘老板写的
    private handleServerAddTerrain(packet: PBpacket): void {
        let terrain: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_ADD_TERRAIN = packet.content;
        Globals.DataCenter.SceneData.mapInfo.addTerrainInfo(terrain.terrain);
        Globals.MessageCenter.emit(MessageType.SCENE_ADD_TERRAIN, terrain.terrain);
    }

    private handleServerAddTerrainEnd(packet: PBpacket): void {
        Globals.MessageCenter.emit(MessageType.SCENE_ADD_TERRAIN_END);
    }

    private handleCharacterChat(packet: PBpacket) {
        const chat: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_CHAT = packet.content;
        if (chat.chatBubble) {
            const bubble = op_client.OP_VIRTUAL_WORLD_RES_CLIENT_ONLY_BUBBLE.create();
            bubble.receiverid = chat.chatSenderid;
            bubble.context = chat.chatContext;
            bubble.chatsetting = chat.chatBubble.chatsetting;
            Globals.MessageCenter.emit(MessageType.SHOW_CHAT_BUBBLE, bubble);
        }
    }

    private handlerAddBubble(packet: PBpacket) {
        const bubble: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ONLY_BUBBLE = packet.content;
        Globals.MessageCenter.emit(MessageType.SHOW_CHAT_BUBBLE, bubble);
    }

    private handleServerAddElement(packet: PBpacket): void {
        let element: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_ADD_ELEMENT = packet.content;
        Globals.DataCenter.SceneData.mapInfo.addElementInfo(element.elements);
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

    private handleChangeCharacterAnimation(packet: PBpacket) {
        let changeData: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_CHANGE_CHARACTER_ANIMATION = packet.content;
        Globals.MessageCenter.emit(MessageType.CHANGE_ELEMENT_ANIMATION, changeData.changeCharacterAnimation);
    }

    private handleEnterScene(packet: PBpacket): void {
        let sceneData: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE = packet.content;
        if (sceneData.actor) {
            Globals.DataCenter.PlayerData.setMainPlayerInfo(sceneData.actor);
        }
        if (sceneData.scene) {
            Globals.DataCenter.SceneData.setMapInfo(sceneData.scene);
            Log.trace(sceneData.scene);
        }
        Globals.MessageCenter.emit(MessageType.ENTER_SCENE);
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
        Globals.DataCenter.EditorData.changeEditorMode(modeData.mode, modeData.type);
    }

    private handleAddElement(packet: PBpacket): void {
        let elementData: op_client.IOP_EDITOR_REQ_CLIENT_ADD_ELEMENT = packet.content;
        Globals.DataCenter.SceneData.mapInfo.addElementInfo([elementData.element]);
        Globals.MessageCenter.emit(MessageType.SCENE_ADD_ELEMENT, [elementData.element]);
    }

    private handleSelectElement(packet: PBpacket): void {
      let elementData: op_client.IOP_EDITOR_REQ_CLIENT_SELECT_ELEMENT = packet.content;
      Globals.MessageCenter.emit(MessageType.SCENE_SELECT_ELEMENT, elementData.id);
    }

    private handleFixedToElement(packet: PBpacket): void {
      let elementData: op_client.IOP_EDITOR_REQ_CLIENT_FIXED_TO_ELEMENT = packet.content;
      Globals.MessageCenter.emit(MessageType.SCENE_FIXED_TO_ELEMENT, elementData.id);
    }

    private handleUpdateElement(packet: PBpacket): void {
        let elementData: op_client.IOP_EDITOR_REQ_CLIENT_SYNC_ELEMENT = packet.content;
        const element = Globals.DataCenter.SceneData.mapInfo.getElementInfo(elementData.element[0].id);
        if (element) {
            element.setInfo(elementData.element[0]);
            Globals.MessageCenter.emit(MessageType.SCENE_UPDATE_ELEMENT, element.id);
        }
    }

    private handleAlignGrid(packet: PBpacket): void {
        let data: op_client.IOP_EDITOR_REQ_CLIENT_ALIGN_GRID = packet.content;
        GameConfig.AlignGrid = data.align;
    }

    private handleVisibleGrid(packet: PBpacket): void {
        let data: op_client.IOP_EDITOR_REQ_CLIENT_VISIBLE_GRID = packet.content;
        GameConfig.VisibleGrid = data.visible;
        Globals.MessageCenter.emit(MessageType.SCENE_VISIBLE_GRID);
    }

    private handleAddTerrain(packet: PBpacket): void {
        let terrainData: op_client.IOP_EDITOR_REQ_CLIENT_ADD_TERRAIN = packet.content;
        if (terrainData.all) {
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

    private handleUpdatePackage(packet: PBpacket): void {
        let pg: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SYNCHRO_PACKAGE = packet.content;
        if (Globals.DataCenter.PlayerData.mainPlayerInfo.package) {
            Globals.DataCenter.PlayerData.mainPlayerInfo.package.splice(0);
            Globals.DataCenter.PlayerData.mainPlayerInfo.package.push(pg.package);
        } else {
            Globals.DataCenter.PlayerData.mainPlayerInfo.package = [pg.package];
        }
        Globals.MessageCenter.emit(MessageType.SCENE_SYNCHRO_PACKAGE);
    }
}
