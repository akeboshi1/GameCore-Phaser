import { BaseGuide, Render } from "gamecoreRender";
import { SceneName } from "structure";
import { IPos } from "utils";

export class DialogGuide extends BaseGuide {
    private elementID: number = 674096428;
    private playScene: Phaser.Scene;
    private mPointer: Phaser.Input.Pointer;
    constructor(id: number, render: Render) {
        super(id, render);
        this.playScene = this.render.game.scene.getScene(SceneName.PLAY_SCENE);
    }

    public start(pos: IPos) {
        this.step1(pos);
    }

    public stop() {
        this.playScene.input.off("gameobjectdown", this.gameObjectDownHandler, this);
        super.stop();
        if (this.mPointer) (<any>this.playScene).motionMgr.onPointerDownHandler(this.mPointer);
    }

    public checkInteractive(data?: any): boolean {
        if (data === this.elementID) return false;
        return true;
    }

    private step1(pos: IPos) {
        const tmpPos = { x: pos.x + 370, y: pos.y + 235 };
        this.guideEffect.createGuideEffect(tmpPos);
        this.playScene.input.on("gameobjectdown", this.gameObjectDownHandler, this);
    }

    private gameObjectDownHandler(pointer: Phaser.Input.Pointer, gameobject: Phaser.GameObjects.GameObject) {
        const id = gameobject.getData("id");
        // todo 写死护照id
        if (id === this.elementID) {
            this.mPointer = pointer;
            this.playScene.input.off("gameobjectdown", this.gameObjectDownHandler, this);
            this.end();
        }
    }

}
