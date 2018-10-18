import {BasicRoleElement} from "./BasicRoleElement";
import BasicDisplay from "../../display/BasicDisplay";
import Globals from "../../Globals";
import {BasicRoleAvatar} from "../../avatar/BasicRoleAvatar";
import {Atlases} from "../../Assets";
import * as Assets from "../../Assets";

export class RoleElement extends BasicRoleElement {

    protected onInitialize(): void {
        super.onInitialize();

        // Create dude's animations
        // const backRightFrames =
        //     Phaser.Animation.generateFrameNames('greenhood_walk_back_right_', 1, 8);
        // this.display.animations.add('walkBackRight', backRightFrames, 12, true);
        //
        // const backLeftFrames =
        //     Phaser.Animation.generateFrameNames('greenhood_walk_back_left_', 1, 8);
        // this.display.animations.add('walkBackLeft', backLeftFrames, 12, true);
        //
        // const frontRightFrames =
        //     Phaser.Animation.generateFrameNames('greenhood_walk_front_right_', 1, 8);
        // this.display.animations.add('walkFrontRight', frontRightFrames, 12, true);
        //
        // const frontLeftFrames =
        //     Phaser.Animation.generateFrameNames('greenhood_walk_front_left_', 1, 8);
        // this.display.animations.add('walkFrontLeft', frontLeftFrames, 12, true);

        // this.play("walkFrontRight");
        // this.stop();
    }

    protected createDisplay(): BasicDisplay {
        // let avatar = new BasicRoleAvatar(Globals.game);
        let avatar = Globals.game.add.isoSprite(0,0,0,Assets.Atlases.AtlasesCharSpritesArray.getName(), "greenhood_idle_front_left")
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