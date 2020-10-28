import { PacketHandler } from "net-socket-packet";
import { Render } from "../render";

export class JoystickManager extends PacketHandler {
    private scene: Phaser.Scene;
    private mJoystick: any;
    private mScaleRatio: number;
    constructor(private render: Render) {
        super();
        this.mScaleRatio = render.scaleRatio;
        this.mJoystick = this.render.mainPeer["JoystickManager"];
    }

    public setScene(scene: Phaser.Scene) {
        this.scene = scene;
        if (!scene) {
            return;
        }
        this.onListener();
    }

    public onListener() {
        this.scene.input.on("pointerdown", this.onDownHandler, this);
        this.scene.input.on("pointerup", this.onUpHandler, this);
    }

    public offListener() {
        // this.parentCon.visible = false;
        this.scene.input.off("pointermove", this.onPointerMoveHandler, this);
        this.scene.input.off("pointerdown", this.onDownHandler, this);
        this.scene.input.off("pointerup", this.onUpHandler, this);
    }

    private onPointerMoveHandler(pointer: Phaser.Input.Pointer) {
        this.calcAngle(pointer);
    }

    private onDownHandler(pointer: Phaser.Input.Pointer) {
        this.scene.input.on("pointermove", this.onPointerMoveHandler, this);
        this.calcAngle(pointer);
    }

    private onUpHandler(pointer: Phaser.Input.Pointer) {
        this.scene.input.off("pointermove", this.onPointerMoveHandler, this);
    }

    private calcAngle(pointer: Phaser.Input.Pointer) {
        if (!this.mJoystick) {
            return;
        }
        this.mJoystick.calcAngle(pointer.worldX / this.mScaleRatio, pointer.worldY / this.mScaleRatio);
    }
}
