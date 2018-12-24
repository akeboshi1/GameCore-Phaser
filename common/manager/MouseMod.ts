import BaseSingleton from "../../base/BaseSingleton";
import {PBpacket} from "net-socket-packet";
import {op_virtual_world} from "../../../protocol/protocols";
import Globals from "../../Globals";
import IOP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT = op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT;

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
        activePointer.leftButton.onDown.add(this.keyDownHandle, this);
        activePointer.leftButton.onUp.add(this.keyUpHandle, this);
        activePointer.middleButton.onDown.add(this.keyDownHandle, this);
        activePointer.middleButton.onUp.add(this.keyUpHandle, this);
        activePointer.rightButton.onDown.add(this.keyDownHandle, this);
        activePointer.rightButton.onUp.add(this.keyUpHandle, this);
    }

    private keyDownHandle( key: any ): void {
        this.onUpdate();
    }

    private keyUpHandle( key: any ): void {
        this.onUpdate();
    }

    public onUpdate(): void {
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
        content.point3f = {x: activePointer.x, y: activePointer.y};
        Globals.SocketManager.send(pkt);
    }

}
