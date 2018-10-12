import {IAnimatedObject} from "./IAnimatedObject";
import {ITickedObject} from "./ITickedObject";
import {BasicViewElement} from "./BasicViewElement";
import {SceneBasic} from "../scene/SceneBasic";
import {SceneCamera} from "../scene/SceneCamera";

export class BasicSceneLayer extends BasicViewElement implements IAnimatedObject, ITickedObject {
    public scene: SceneBasic;
    public camera: SceneCamera;

    public constructor() {
        super();
    }

    //IAnimatedObject Interface
    public onFrame(deltaTime: number): void {
    };

    public onTick(deltaTime: number): void {
    };
}
