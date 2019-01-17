import {IAnimatedObject} from "./IAnimatedObject";
import {ITickedObject} from "./ITickedObject";
import {SceneBasic} from "../modules/Scene/view/SceneBasic";

export class BasicSceneLayer extends Phaser.Group implements IAnimatedObject, ITickedObject {
    public scene: SceneBasic;

    public constructor(game: Phaser.Game) {
        super(game);
    }

    public get camera(): Phaser.Camera {
        return this.game.camera;
    }

    // IAnimatedObject Interface
    public onFrame(): void {
    }

    public onTick(deltaTime: number): void {
    }
}
