import BaseSingleton from "../../base/BaseSingleton";
import Globals from "../../Globals";
import {PBpacket} from "net-socket-packet";
import {op_client} from "../../../protocol/protocols";
import {BasePacketHandler} from "./BasePacketHandler";
import {MessageType} from "../const/MessageType";

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
  }

  private handleSelectCharacter(packet: PBpacket): void {
    let character: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SELECT_CHARACTER = packet.content;
    Globals.DataCenter.PlayerData.setCharacterId(character.selectCharacterId);
  }

  private handleGameOver(packet: PBpacket): void {
    let GameOver: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_GAME_OVER = packet.content;
    // console.log(`GameOver ${GameOver.msg}`);
      Globals.MessageCenter.emit(MessageType.PROMPT_ALERT, {info: GameOver.msg});
  }
}
