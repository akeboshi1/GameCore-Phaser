import {IAnimatedObject} from "./IAnimatedObject";
import {ITickedObject} from "./ITickedObject";
import {SceneBasic} from "../modules/Scene/view/SceneBasic";

export class BasicSceneLayer extends Phaser.Group implements IAnimatedObject, ITickedObject {
    public scene: SceneBasic;

    public constructor(game: Phaser.Game, x: number = 0, y: number = 0) {
        super(game);
    }

    public get camera(): Phaser.Camera {
        return this.game.camera;
    }

    // IAnimatedObject Interface
    public onFrame(deltaTime: number): void {
    }

    public onTick(deltaTime: number): void {
    }
}
