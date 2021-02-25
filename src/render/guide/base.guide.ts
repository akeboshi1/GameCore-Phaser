import { SceneName } from "structure";
import { Render } from "../render";
import { MainUIScene } from "../scenes/main.ui.scene";
import { UiManager } from "../ui";
import { GuideEffect } from "./guide.effect";
import { IGuide } from "./guide.manager";

export class BaseGuide implements IGuide {
    public id: number;
    public guideEffect: GuideEffect;
    protected scene: Phaser.Scene;
    protected uiManager: UiManager;
    constructor(id: number, protected render: Render) {
        this.id = id;
        this.scene = render.sceneManager.getSceneByName(SceneName.MAINUI_SCENE) as MainUIScene;
        this.uiManager = render.uiManager;
        this.guideEffect = new GuideEffect(this.scene);
    }
    public start(data?: any) {
    }
    public stop() {
    }
    public destroy() {
        this.guideEffect.destroy();
    }
}
