import DisplayObjectContainer = PIXI.DisplayObjectContainer;
import {ITickedObject} from "../../../base/ITickedObject";
import {IAnimatedObject} from "../../../base/IAnimatedObject";

export class SceneCamera extends Phaser.Camera implements ITickedObject, IAnimatedObject {
    public scrollX: number = 0;
    public scrollY: number = 0;

    public scrollWidth: number = 0;
    public scrollHeight: number = 0;

    public width: number = 0;
    public height: number = 0;

    public setCameraSize(width: number, height: number): void {

    }

    public resetPosition(): void {

    }

    public onTick(deltaTime: number): void {

    }

    public onFrame(deltaTime: number): void {

    }
}


class Camera extends DisplayObjectContainer {
    public constructor() {
        super();
    }
}