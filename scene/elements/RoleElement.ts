import {BasicRoleElement} from "./BasicRoleElement";
import BasicDisplay from "../../display/BasicDisplay";
import Globals from "../../Globals";
import * as Assets from "../../Assets";
import {Const} from "../../const/Const";
import {BasicRoleAvatar} from "../../avatar/BasicRoleAvatar";

export class RoleElement extends BasicRoleElement {

    protected onInitialize(): void {
        super.onInitialize();

        // Create dude's animations
        // const backRightFrames =
        //     Phaser.Animation.generateFrameNames('greenhood_walk_back_right_', 1, 8);
        // this.display.animations.add('walkBackRight', backRightFrames, 12, true, false);
        //
        // const backLeftFrames =
        //     Phaser.Animation.generateFrameNames('greenhood_walk_back_left_', 1, 8);
        // this.display.animations.add('walkBackLeft', backLeftFrames, 12, true, false);
        //
        // const frontRightFrames =
        //     Phaser.Animation.generateFrameNames('greenhood_walk_front_right_', 1, 8);
        // this.display.animations.add('walkFrontRight', frontRightFrames, 12, true, false);
        //
        // const frontLeftFrames =
        //     Phaser.Animation.generateFrameNames('greenhood_walk_front_left_', 1, 8);
        // this.display.animations.add('walkFrontLeft', frontLeftFrames, 12, true, false);

    }

    protected createDisplay(): BasicDisplay {
        let avatar = new BasicRoleAvatar(Globals.game);
        avatar.anchor.set(0.5, 1);
        return avatar;
    }

    public onFrame(deltaTime: number): void {
        super.onFrame(deltaTime);
    }

    public stop():void {
        this.display.animations.stop();
    }

    public play(animation:string):void {
        this.display.animations.play(animation);
    }
}