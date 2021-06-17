import { DragonbonesDisplay, DynamicImage, FramesDisplay } from "gamecoreRender";
import { Render, MainUIScene } from "gamecoreRender";
import { Logger, LogicPos, Tool, Url } from "utils";
import { DisplayBaseAction } from "./display.base.action";

export class ItemIntoPanel extends DisplayBaseAction {
    constructor(render: Render, display: FramesDisplay | DragonbonesDisplay, data: any) {
        super(render, display, data);
    }

    executeAction() {
        if (!this.display || !this.data) {
            return;
        }
        const { texturePath, panelName, ui } = this.data;
        const uiManager = this.render.uiManager;
        const panel = <any>uiManager.getPanel(panelName);
        if (!panel) {
            return Logger.getInstance().error(`${panelName} does not exise.`);
        }
        let target = null;
        if (panel.getComponent) {
            target = panel.getComponent(ui);
        }
        if (!target) {
            return;
        }

        const targetPoint = target.getWorldTransformMatrix();
        const scale = this.render.scaleRatio;
        const dp = this.display.getPosition();
        const tmpPos = new LogicPos(dp.x, dp.y, dp.z);
        tmpPos.x *= scale;
        tmpPos.y *= scale;
        const p = Tool.getPosByScenes(this.display.getScene(), tmpPos);

        const uiScene = this.render.uiManager.scene;
        const img = new DynamicImage(uiScene, p.x, p.y);
        img.load(Url.getOsdRes(texturePath));
        (<MainUIScene>uiScene).layerManager.addToLayer(MainUIScene.LAYER_UI, img);
        img.scale = 1;

        uiScene.tweens.timeline({
            tweens: [{
                targets: img,
                duration: 100,
                props: { y: img.y - 60 * scale, scale }
            }, {
                targets: img,
                duration: 600,
                delay: 100,
                props: { x: targetPoint.tx, y: targetPoint.ty, scale: scale * 0.75 }
            }, {
               targets: target,
               props: { scale: 1.5 },
               duration: 100,
               onComplete: () => {
                img.destroy();
               }
            }, {
                targets: target,
                duration: 100,
                props: { scale: 1 },
                onComplete: () => {
                    this.destroy();
                }
            }]
        });
    }
}
