import { BaseGuide, Render } from "gamecoreRender";
import { SceneName } from "structure";
import { IPos } from "utils";

export class DialogGuide extends BaseGuide {
    constructor(id: number, render: Render) {
        super(id, render);
    }

    public start(pos: IPos) {
        this.step1(pos);
    }

    private step1(pos: IPos) {
        const playScene = this.render.game.scene.getScene(SceneName.PLAY_SCENE);
        this.guideEffect.createGuideEffect(pos);
        playScene.input.on("pointerdown", (pointer) => {
            this.step2();
        }, this);
    }

    private step2() {

    }

}
