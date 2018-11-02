import {RoleElement} from "./RoleElement";
import Globals from "../../Globals";
import {Log} from "../../Log";

export class SelfRoleElement extends RoleElement {
    public constructor() {
        super();
    }

    protected onUpdating(deltaTime: number): void {
        Globals.Keyboard.CheckKey();
        // Log.trace(this.isWalking, Globals.Keyboard.isKeyDown)
        let isKeyDown: boolean = Globals.Keyboard.isKeyDown;
        // Log.trace("按键-->"+isKeyDown);
        if (this.isWalking && !isKeyDown) {
            this.stopWalk();
            super.onUpdating(deltaTime);
            return;
        }

        if (isKeyDown) {
            let angle;
            switch (Globals.Keyboard.keyDownCode) {
                case Phaser.Keyboard.UP.toString():
                case Phaser.Keyboard.W.toString():
                    if (this.angleIndex === 1 || this.angleIndex === 3)
                        angle = 1;
                    else
                        angle = 7;
                    this.walkAngleIndex = 8;
                    break;
                case Phaser.Keyboard.DOWN.toString():
                case Phaser.Keyboard.S.toString():
                    if (this.angleIndex === 1 || this.angleIndex === 3)
                        angle = 3;
                    else
                        angle = 5;
                    this.walkAngleIndex = 4;
                    break;
                case Phaser.Keyboard.LEFT.toString():
                case Phaser.Keyboard.A.toString():
                    if (this.angleIndex === 1 || this.angleIndex === 7)
                        angle = 1;
                    else
                        angle = 3;
                    this.walkAngleIndex = 2;
                    break;
                case Phaser.Keyboard.RIGHT.toString():
                case Phaser.Keyboard.D.toString():
                    if (this.angleIndex === 1 || this.angleIndex === 7)
                        angle = 7;
                    else
                        angle = 5;
                    this.walkAngleIndex = 6;
                    break;
                case Phaser.Keyboard.UP + "," + Phaser.Keyboard.RIGHT:
                case Phaser.Keyboard.W + "," + Phaser.Keyboard.D:
                    angle = 7;
                    this.walkAngleIndex = 7;
                    break;
                case Phaser.Keyboard.UP + "," + Phaser.Keyboard.LEFT:
                case Phaser.Keyboard.W + "," + Phaser.Keyboard.A:
                    angle = 1;
                    this.walkAngleIndex = 1;
                    break;
                case Phaser.Keyboard.DOWN + "," + Phaser.Keyboard.RIGHT:
                case Phaser.Keyboard.S + "," + Phaser.Keyboard.D:
                    angle = 5;
                    this.walkAngleIndex = 5;
                    break;
                case Phaser.Keyboard.DOWN + "," + Phaser.Keyboard.LEFT:
                case Phaser.Keyboard.S + "," + Phaser.Keyboard.A:
                    angle = 3;
                    this.walkAngleIndex = 3;
                    break;
            }

            this.setAngleIndex(angle);

            if (!this.isWalking)
                this.resumeWalk();
        }
        super.onUpdating(deltaTime);
    }
}