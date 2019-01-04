import BaseSingleton from "../../base/BaseSingleton";
import {PBpacket} from "net-socket-packet";
import {op_virtual_world} from "../../../protocol/protocols";
import Globals from "../../Globals";
import IOP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT = op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT;
import {SceneBasic} from "../../modules/Scene/view/SceneBasic";
import {GameConfig} from "../../GameConfig";

export class MouseMod extends BaseSingleton {
    private game: Phaser.Game;
    private l_d = false;
    private m_d = false;
    private r_d = false;

    /**
     * 构造函数
     */
    public constructor() {
        super();
    }

    public init(game: Phaser.Game): void {
        this.game = game;
        let activePointer: Phaser.Pointer = this.game.input.activePointer;
        if (activePointer) {
          activePointer.leftButton.onDown.add(this.keyDownHandle, this);
          activePointer.leftButton.onUp.add(this.keyUpHandle, this);
          activePointer.middleButton.onDown.add(this.keyDownHandle, this);
          activePointer.middleButton.onUp.add(this.keyUpHandle, this);
          activePointer.rightButton.onDown.add(this.keyDownHandle, this);
          activePointer.rightButton.onUp.add(this.keyUpHandle, this);
          this.resume();
        }
    }

    private running = false;
    public pause(): void {
        this.running = false;
    }

    public resume(): void {
        this.running = true;
    }

    private keyDownHandle( key: any ): void {
        this.onUpdate();
    }

    private keyUpHandle( key: any ): void {
        this.onUpdate();
    }

    public onUpdate(): void {
        if (this.running === false) {
            return;
        }

        let activePointer: Phaser.Pointer = this.game.input.activePointer;
        let events: number[] = [];
        if (activePointer.leftButton.isDown) {
            this.l_d = true;
            events.push(op_virtual_world.MouseEvent.LeftMouseDown);
        } else if (activePointer.leftButton.isUp && this.l_d) {
            this.l_d = false;
            events.push(op_virtual_world.MouseEvent.LeftMouseUp);
        }

        if (activePointer.middleButton.isDown) {
            this.m_d = true;
            events.push(op_virtual_world.MouseEvent.WheelDown);
        } else if (activePointer.middleButton.isUp && this.m_d) {
            this.m_d = false;
            events.push(op_virtual_world.MouseEvent.WheelUp);
        }

        if (activePointer.rightButton.isDown) {
            this.r_d = true;
            events.push(op_virtual_world.MouseEvent.RightMouseDown);
        } else if (activePointer.rightButton.isUp && this.r_d) {
            this.r_d = false;
            events.push(op_virtual_world.MouseEvent.RightMouseUp);
        }

        if (events.length === 0) {
            return;
        }

        let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT);
        let content: IOP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT = pkt.content;
        content.mouseEvent = events;
        content.point3f = {x: activePointer.x + this.game.camera.x - GameConfig.GameWidth / 2, y: activePointer.y + this.game.camera.y - GameConfig.GameHeight / 2};
        Globals.SocketManager.send(pkt);
    }

    public dispose(): void {
      let activePointer: Phaser.Pointer = this.game.input.activePointer;
      if (activePointer) {
        activePointer.leftButton.onDown.remove(this.keyDownHandle, this);
        activePointer.leftButton.onUp.remove(this.keyUpHandle, this);
        activePointer.middleButton.onDown.remove(this.keyDownHandle, this);
        activePointer.middleButton.onUp.remove(this.keyUpHandle, this);
        activePointer.rightButton.onDown.remove(this.keyDownHandle, this);
        activePointer.rightButton.onUp.remove(this.keyUpHandle, this);
      }
    }

}
