import IsoSprite = Phaser.Plugin.Isometric.IsoSprite;
import Globals from "../Globals";
import * as Assets from "../Assets";
import {IAnimatedObject} from "../base/IAnimatedObject";
import {IEntityComponent} from "../base/IEntityComponent";
import {BasicSceneEntity} from "../base/BasicSceneEntity";
import {Log} from "../Log";

// export class BasicRoleAvatar extends IsoSprite implements IAnimatedObject, IEntityComponent {
export class BasicRoleAvatar extends Phaser.Sprite implements IAnimatedObject, IEntityComponent {
    public owner: BasicSceneEntity;

    public onFrame(deltaTime: number): void {
        // Log.trace(this.x,this.parent.x,this.parent.parent.x,this.parent.parent.parent.x,this.anchor.toString());
    }

    public onTick(deltaTime: number): void {

    }

    public constructor(game: Phaser.Game) {
        super(game, 0, 0, Assets.Atlases.AtlasesCharSpritesArray.getName(), "greenhood_idle_front_left");
        this.init();
    }

    public init(): void {
        // let graphics = Globals.game.make.graphics();
        // graphics.beginFill(0xeaff00);
        // graphics.drawRect(0, 0, 5, 5);
        // graphics.endFill();
        // this.addChild(graphics);
    }
    
    // public set x(value: number){
    //     this.isoX = value;
    // }
    //
    // public set y(value: number){
    //     this.isoY = value;
    // }
}