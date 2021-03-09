import { SceneName } from "structure";
import { IPos } from "utils";
import { UiManager } from "../ui";
import { BaseGuide } from "./base.guide";

/**
 * 场景点击引导基类
 */
export class BasePlaySceneGuide extends BaseGuide {
    protected mElementID: number;
    protected mElement: any;
    protected mPlayScene: Phaser.Scene;
    protected mPointer: Phaser.Input.Pointer;
    constructor(id: number, uiManager: UiManager) {
        super(uiManager.render);
        this.mElementID = id;
        this.mPlayScene = this.render.game.scene.getScene(SceneName.PLAY_SCENE);
    }

    public show(param?: any) {
        super.show(param);
        this.mElement = this.render.displayManager.getDisplay(this.mElementID);
        if (!this.mElement) this.end();
        this.step1({ x: this.mElement.x, y: this.mElement.y });
    }

    public hide() {
        this.mPlayScene.input.off("gameobjectdown", this.gameObjectDownHandler, this);
        super.hide();
        if (this.mPointer) (<any>this.mPlayScene).motionMgr.onPointerDownHandler(this.mPointer);
    }

    public checkInteractive(data?: any): boolean {
        if (data === this.mElementID) return false;
        return true;
    }

    protected step1(pos: IPos) {
        const tmpPos = { x: pos.x, y: pos.y };
        this.guideEffect.createGuideEffect(tmpPos);
        this.mPlayScene.input.on("gameobjectdown", this.gameObjectDownHandler, this);
    }

    protected gameObjectDownHandler(pointer: Phaser.Input.Pointer, gameobject: Phaser.GameObjects.GameObject) {
        const id = gameobject.getData("id");
        // todo 写死护照id
        if (id === this.mElementID) {
            this.mPointer = pointer;
            this.mPlayScene.input.off("gameobjectdown", this.gameObjectDownHandler, this);
            this.end();
        }
    }
}
