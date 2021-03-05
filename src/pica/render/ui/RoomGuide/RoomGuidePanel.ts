import { BaseGuide, Render, UiManager } from "gamecoreRender";
import { SceneName } from "structure";
import { IPos } from "utils";
import { GuideID } from "../../guide";

export class RoomGuidePanel extends BaseGuide {
    // 宝箱
    private elementID: number = 1589349967;
    private mPointer: Phaser.Input.Pointer;
    private playScene: Phaser.Scene;
    constructor(uiManager: UiManager) {
        super(GuideID.Room, uiManager.render);
        this.playScene = this.render.game.scene.getScene(SceneName.PLAY_SCENE);
    }

    public show(param?: any) {
        super.show(param);
        const element = this.render.displayManager.getDisplay(this.elementID);
        if (!element) this.end();
        this.step1({ x: element.x, y: element.y });
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
