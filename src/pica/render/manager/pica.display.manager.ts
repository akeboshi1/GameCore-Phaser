import { BasicScene } from "baseRender";
import { DisplayManager } from "gamecoreRender";
import { Render } from "../pica.render";
import { op_def } from "pixelpai_proto";
import { FallEffect } from "../fall.effect";

export class PicaDisplayManager extends DisplayManager {

    constructor(protected render: Render) {
        super(render);
    }

    public addFillEffect(x: number, y: number, status: op_def.PathReachableStatus) {
        const mainScene: BasicScene = this.render.sceneManager.getMainScene() as BasicScene;
        const fall = new FallEffect(mainScene, this.render.scaleRatio);
        fall.show(status);
        fall.setPosition(x, y);
        mainScene.layerManager.addToLayer("sceneUILayer", fall);
    }
}
