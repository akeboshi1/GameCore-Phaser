import BaseSingleton from "../../base/BaseSingleton";
import {PBpacket} from "net-socket-packet";
import {op_virtual_world, op_client, op_def} from "pixelpai_proto";
import Globals from "../../Globals";
import IOP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT = op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT;
import { Tick } from "../tick/Tick";
import { LayerManager } from "./LayerManager";
import { MessageType } from "../const/MessageType";

export class MouseMod extends BaseSingleton {
    private game: Phaser.Game;
    private l_d = false;
    private m_d = false;
    private r_d = false;
    private l_h = false;
    private m_h = false;
    private r_h = false;

    private activePointer: Phaser.Pointer;
    private input: Phaser.Input;
    private mTick: Tick;

    private mInterval = 500;
    private mAccumulative = 0;
    private mLastX = 0;
    private mLastY = 0;
    private minimumDistance = 4;

    /**
     * 构造函数
     */
    public constructor() {
        super();
    }

    public init(game: Phaser.Game): void {
        this.game = game;
        this.activePointer = this.game.input.activePointer;
        // this.input = this.game.input;
        // if (this.activePointer) {
        //   this.activePointer.leftButton.onDown.add(this.keyDownHandle, this);
        //   this.activePointer.leftButton.onUp.add(this.keyUpHandle, this);
        //   this.activePointer.middleButton.onDown.add(this.keyDownHandle, this);
        //   this.activePointer.middleButton.onUp.add(this.keyUpHandle, this);
        //   this.activePointer.rightButton.onDown.add(this.keyDownHandle, this);
        //   this.activePointer.rightButton.onUp.add(this.keyUpHandle, this);
        //   this.resume();
        // }
        const scene = Globals.LayerManager.sceneLayer;
        if (scene) {
            this.resume();
            scene.inputEnableChildren = true;
            scene.onChildInputDown.add(this.onDownScene, this);
            scene.onChildInputUp.add(this.onUpScene, this);
        }

        if (this.input) {
            this.input.onHold.add(this.keyHoldHandle, this);
        }


        this.mTick = new Tick();
        this.mTick.setCallBack(this.onTick, this);
        this.mTick.start();
    }

    private onDownScene(target, point) {
        this.activePointer = point;
        this.onUpdate();
    }

    private onUpScene(target, point) {
        this.activePointer = point;
        this.onUpdate();
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

    private keyHoldHandle( key: any ): void {
        this.mLastX = 0;
        this.mLastY = 0;
        if (this.l_d) {
            this.l_h = true;
        }
        if (this.r_d) {
            this.r_h = true;
        }
    }

    private onTick(deltaTime: number): void {
        this.mAccumulative += deltaTime;
        if (this.mAccumulative > this.mInterval) {
            this.onHoldUpdate();
            this.mAccumulative = 0;
        }
    }

    public onHoldUpdate(): void {
        if (this.running === false || this.activePointer === undefined) {
            return;
        }
        if (!this.r_h && !this.l_h) return;
        const currentX = this.activePointer.x + this.game.camera.x;
        const currentY = this.activePointer.y + this.game.camera.y;
        let events: number[] = [];
        if (this.game.input.mousePointer.isDown &&
            ((this.mLastX - currentX) ** 2 + (this.mLastY - currentY) ** 2) > this.minimumDistance) {
                if (this.game.input.activePointer.leftButton.isDown && this.l_h) {
                    events.push(op_def.MouseEvent.LeftMouseHolding);
                }
                if (this.game.input.activePointer.rightButton.isDown && this.r_h) {
                    events.push(op_def.MouseEvent.LeftMouseHolding);
                }
                this.mLastX = currentX;
                this.mLastY = currentY;
        }

        if (events.length === 0) {
            return;
        }

        let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT);
        let content: IOP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT = pkt.content;
        content.mouseEvent = events;
        content.point3f = {x: currentX, y: currentY};
        Globals.SocketManager.send(pkt);
        console.log("click background");
        Globals.MessageCenter.emit(MessageType.SCENE_BACKGROUND_CLICK);
    }

    public onUpdate(): void {
        if (this.running === false || this.activePointer === undefined) {
            return;
        }

        let events: number[] = [];
        if (this.activePointer.leftButton.isDown) {
            this.l_d = true;
            events.push(op_def.MouseEvent.LeftMouseDown);
        } else if (this.activePointer.leftButton.isUp && this.l_d) {
            this.l_d = false;
            this.l_h = false;
            events.push(op_def.MouseEvent.LeftMouseUp);
        }

        if (this.activePointer.middleButton.isDown) {
            this.m_d = true;
            events.push(op_def.MouseEvent.WheelDown);
        } else if (this.activePointer.middleButton.isUp && this.m_d) {
            this.m_d = false;
            this.m_h = false;
            events.push(op_def.MouseEvent.WheelUp);
        }

        if (this.activePointer.rightButton.isDown) {
            this.r_d = true;
            events.push(op_def.MouseEvent.RightMouseDown);
        } else if (this.activePointer.rightButton.isUp && this.r_d) {
            this.r_d = false;
            this.r_h = false;
            events.push(op_def.MouseEvent.RightMouseUp);
        }

        if (events.length === 0) {
            return;
        }


        let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT);
        let content: IOP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT = pkt.content;
        content.mouseEvent = events;
        content.point3f = {x: this.activePointer.x + this.game.camera.x, y: this.activePointer.y + this.game.camera.y};
        Globals.SocketManager.send(pkt);
        Globals.MessageCenter.emit(MessageType.SCENE_BACKGROUND_CLICK);
    }

    public dispose(): void {
      if (this.activePointer) {
        this.activePointer.leftButton.onDown.remove(this.keyDownHandle, this);
        this.activePointer.leftButton.onUp.remove(this.keyUpHandle, this);
        this.activePointer.middleButton.onDown.remove(this.keyDownHandle, this);
        this.activePointer.middleButton.onUp.remove(this.keyUpHandle, this);
        this.activePointer.rightButton.onDown.remove(this.keyDownHandle, this);
        this.activePointer.rightButton.onUp.remove(this.keyUpHandle, this);
      }
      this.game = null;
      super.dispose();
    }

}
