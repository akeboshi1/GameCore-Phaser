import Globals from "../../Globals";
import {op_client} from "../../../protocol/protocols";
import {PacketHandler, PBpacket} from "net-socket-packet";
import BaseSingleton from "../../base/BaseSingleton";
import {MessageType} from "../const/MessageType";
import {BasePacketHandler} from "./BasePacketHandler";

export class SceneService extends BaseSingleton {
  public register(): void {
    Globals.SocketManager.addHandler(new Handler());
  }
}

class Handler extends BasePacketHandler {
  constructor() {
    super();
    // Server
    this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE, this.handleEnterScene);
    this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_MOVE_CHARACTER, this.handleMoveCharacter);
    this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_SET_CHARACTER_POSITION, this.handleStopCharacter);
    this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_MOVE_ELEMENT, this.handleMoveElement);
    this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_SET_ELEMENT_POSITION, this.handleStopElement);
    this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_CHANGE_ELEMENT_ANIMATION, this.handleChangeElement);
    // Editor
    this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_SET_EDITOR_MODE, this.handleChangeEditorMode);
    this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ADD_ELEMENT, this.handleAddElement);
    this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ADD_TERRAIN, this.handleAddTerrain);
    this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_ELEMENT, this.handleDeleteElement);
    this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_TERRAIN, this.handleDeleteTerrain);
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
    Globals.DataCenter.PlayerData.mainPlayerInfo.actorId = sceneData.actorId;
    Globals.DataCenter.SceneData.setMapInfo(sceneData.scene);
  }

  private handleChangeEditorMode(packet: PBpacket): void {
    let modeData: op_client.IOP_EDITOR_REQ_CLIENT_SET_EDITOR_MODE = packet.content;
    Globals.DataCenter.EditorData.changeEditorMode(modeData.mode, modeData.type);
  }

  private handleAddElement(packet: PBpacket): void {
    let elementData: op_client.IOP_EDITOR_REQ_CLIENT_ADD_ELEMENT = packet.content;
    Globals.MessageCenter.emit(MessageType.SCENE_ADD_ELEMENT, elementData.element);
  }

  private handleAddTerrain(packet: PBpacket): void {
    let terrainData: op_client.IOP_EDITOR_REQ_CLIENT_ADD_TERRAIN = packet.content;
    Globals.MessageCenter.emit(MessageType.SCENE_ADD_TERRAIN, terrainData.terrains);
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
}
