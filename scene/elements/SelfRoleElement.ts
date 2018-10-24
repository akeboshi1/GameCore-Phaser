import {RoleElement} from "./RoleElement";
import Globals from "../../Globals";

export class SelfRoleElement extends RoleElement {
    public constructor() {
        super();
    }

    protected onUpdating(deltaTime: number): void {
        super.onUpdating(deltaTime);
        Globals.Keyboard.CheckKey();
        if (this.isWalking && !Globals.Keyboard.isKeyDown) {
            this.stopWalk();
            return;
        }
        if (Globals.Keyboard.isKeyDown) {
            let angle;
            switch (Globals.Keyboard.keyDownCode) {
                case Phaser.Keyboard.UP.toString():
                case Phaser.Keyboard.W.toString():
                    if (this.angleIndex == 1 || this.angleIndex == 3)
                        angle = 1;
                    else
                        angle = 7
                    this.mWalkAngleIndex = 8;
                    break;
                case Phaser.Keyboard.DOWN.toString():
                case Phaser.Keyboard.S.toString():
                    if (this.angleIndex == 1 || this.angleIndex == 3)
                        angle = 3;
                    else
                        angle = 5
                    this.mWalkAngleIndex = 4;
                    break;
                case Phaser.Keyboard.LEFT.toString():
                case Phaser.Keyboard.A.toString():
                    if (this.angleIndex == 1 || this.angleIndex == 7)
                        angle = 1;
                    else
                        angle = 3
                    this.mWalkAngleIndex = 2;
                    break;
                case Phaser.Keyboard.RIGHT.toString():
                case Phaser.Keyboard.D.toString():
                    if (this.angleIndex == 1 || this.angleIndex == 7)
                        angle = 7;
                    else
                        angle = 5
                    this.mWalkAngleIndex = 6;
                    break;
                case Phaser.Keyboard.UP + "," + Phaser.Keyboard.RIGHT:
                case Phaser.Keyboard.W + "," + Phaser.Keyboard.D:
                    angle = 7;
                    this.mWalkAngleIndex = 7;
                    break;
                case Phaser.Keyboard.UP + "," + Phaser.Keyboard.LEFT:
                case Phaser.Keyboard.W + "," + Phaser.Keyboard.A:
                    angle = 1;
                    this.mWalkAngleIndex = 1;
                    break;
                case Phaser.Keyboard.DOWN + "," + Phaser.Keyboard.RIGHT:
                case Phaser.Keyboard.S + "," + Phaser.Keyboard.D:
                    angle = 5;
                    this.mWalkAngleIndex = 5;
                    break;
                case Phaser.Keyboard.DOWN + "," + Phaser.Keyboard.LEFT:
                case Phaser.Keyboard.S + "," + Phaser.Keyboard.A:
                    angle = 3;
                    this.mWalkAngleIndex = 3;
                    break;
            }
            this.setAngleIndex(angle);

            if (!this.isWalking)
                this.resumeWalk();
        }
    }
}