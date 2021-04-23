/// <reference types="tooqinggamephaser" />
import { PacketHandler } from "net-socket-packet";
import { Render } from "../render";
export declare class JoystickManager extends PacketHandler {
    private render;
    private scene;
    private mJoystick;
    private mScaleRatio;
    constructor(render: Render);
    setScene(scene: Phaser.Scene): void;
    onListener(): void;
    offListener(): void;
    destroy(): void;
    private onPointerMoveHandler;
    private onDownHandler;
    private onUpHandler;
    private calcAngle;
    private start;
    private stop;
}
