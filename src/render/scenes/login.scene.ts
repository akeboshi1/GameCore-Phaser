import { ModuleName, SceneName } from "structure";
import { UiManager } from "../ui";
import { BaseLayer, BasicScene } from "baseRender";
import { MainUIScene } from "./main.ui.scene";

// 编辑器用 Phaser.Scene
export class LoginScene extends BasicScene {
    constructor() {
        super({ key: SceneName.LOGIN_SCENE });
    }

    preload() {
    }

    public create() {
        super.create();
        if (this.render) {
            const uimanager: UiManager = this.render.uiManager;
            uimanager.setScene(this);
            this.render.showMediator(ModuleName.PICA_BOOT_NAME, true);
            this.render.gameLoadedCallBack();
            this.render.hideLoading();

            this.layerManager.addLayer(this, BaseLayer, MainUIScene.LAYER_UI, 1);
            this.layerManager.addLayer(this, BaseLayer, MainUIScene.LAYER_DIALOG, 2);
            // uimanager.showPanel(ModuleName.LOGIN_NAME);
        }
    }

    public init(data?: any) {
        super.init(data);
        if (data) {
            this.render = data;
        }
    }

    public stop() {
        if (this.render) {
            this.render.showMediator("Login", false);
        }
        super.stop();
    }

    public sleep() {
        if (this.render) {
            this.render.showMediator("Login", false);
        }
    }
}
