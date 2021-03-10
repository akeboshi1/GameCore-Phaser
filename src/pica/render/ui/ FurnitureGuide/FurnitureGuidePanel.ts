import { ClickEvent } from "apowophaserui";
import { BasePlaySceneGuide, UiManager } from "gamecoreRender";
import { PicaFurniFunPanel } from "picaRender";
import { ModuleName } from "structure";
export class FurnitureGuidePanel extends BasePlaySceneGuide {
    constructor(uiManager: UiManager) {
        super(1649761875, uiManager);
    }

    protected gameObjectDownHandler(pointer: Phaser.Input.Pointer, gameobject: Phaser.GameObjects.GameObject) {
        const id = gameobject.getData("id");
        // todo 写死护照id
        if (id === this.mElementID) {
            this.mPointer = pointer;
            this.mPlayScene.input.off("gameobjectdown", this.gameObjectDownHandler, this);
            // 异步等待过程
            this.render.emitter.once(PicaFurniFunPanel.PICAFURNIFUN_SHOW, () => {
                const picaFurniFunPanel: PicaFurniFunPanel = this.uiManager.getPanel(ModuleName.PICAFURNIFUN_NAME) as PicaFurniFunPanel;
                const btn = picaFurniFunPanel.confirmBtn;
                const worldMatrix = btn.getWorldTransformMatrix();
                this.guideEffect.createGuideEffect({ x: worldMatrix.tx, y: worldMatrix.ty });
                btn.on(ClickEvent.Tap, () => {
                    this.end();
                }, this);
            }, this);
        }
    }
}
