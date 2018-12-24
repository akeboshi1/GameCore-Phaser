import BaseSingleton from "../../base/BaseSingleton";
import {PBpacket} from "net-socket-packet";
import {op_virtual_world} from "../../../protocol/protocols";
import {Log} from "../../Log";
import Globals from "../../Globals";
import IOP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT = op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT;

export class MouseMod extends BaseSingleton {
  private game: Phaser.Game;

  /**
   * 构造函数
   */
  public constructor() {
    super();
  }

  public init(game: Phaser.Game): void {
    this.game = game;
  }

  public onUpdate(): void {
    let activePointer: Phaser.Pointer = this.game.input.activePointer;
    let events: number[] = [];
    if (activePointer.leftButton.isDown) {
      events.push(op_virtual_world.MouseEvent.LeftMouseDown);
    } else if (activePointer.leftButton.isUp) {
      events.push(op_virtual_world.MouseEvent.LeftMouseUp);
    }

    if (activePointer.middleButton.isDown) {
      events.push(op_virtual_world.MouseEvent.WheelDown);
    } else if (activePointer.middleButton.isUp) {
      events.push(op_virtual_world.MouseEvent.WheelUp);
    }

    if (activePointer.rightButton.isDown) {
      events.push(op_virtual_world.MouseEvent.RightMouseDown);
    } else if (activePointer.rightButton.isUp) {
      events.push(op_virtual_world.MouseEvent.RightMouseUp);
    }

    let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT);
    let content: IOP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT = pkt.content;
    content.mouseEvent = events;
    content.point3f.x = activePointer.x;
    content.point3f.y = activePointer.y;
    Globals.SocketManager.send(pkt);
  }

}
