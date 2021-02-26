import { BaseGuide, Render } from "gamecoreRender";
import { SceneName } from "structure";
import { IPos } from "utils";

export class DialogGuide extends BaseGuide {
    private elementID: number = 674096428;
    private playScene: Phaser.Scene;
    constructor(id: number, render: Render) {
        super(id, render);
    }

    public start(pos: IPos) {
        this.step1(pos);
    }

    public stop() {
        this.playScene.input.off("gameobjectdown", this.gameObjectDownHandler, this);
        super.stop();
    }

    public checkInteractive(data?: any): boolean {
        if (data === this.elementID) return false;
        return true;
    }

    private step1(pos: IPos) {
        this.playScene = this.render.game.scene.getScene(SceneName.PLAY_SCENE);
        this.guideEffect.createGuideEffect(pos);
        this.playScene.input.on("gameobjectdown", this.gameObjectDownHandler, this);
    }

    private step2() {
        this.stop();
    }

    private gameObjectDownHandler(pointer: Phaser.Input.Pointer, gameobject: Phaser.GameObjects.GameObject) {
        const id = gameobject.getData("id");
        // todo 写死护照id
        if (id === this.elementID) {
            this.playScene.input.off("gameobjectdown", this.gameObjectDownHandler, this);
            this.step2();
        }
    }

}
