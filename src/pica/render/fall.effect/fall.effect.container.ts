import { BasicScene, Render } from "gamecoreRender";
import { Pos } from "utils";
import { FallEffect } from "./fall.effect";

export class FallEffectContainer {
    private mFalls: FallEffect[];
    constructor(private render: Render) {
        this.mFalls = [];
    }

    public addFall(pos: Pos, enable: boolean) {
        if (!pos) {
            return;
        }
        const mainScene: BasicScene = this.render.sceneManager.getMainScene() as BasicScene;
        const fall = new FallEffect(mainScene, this.render.scaleRatio);
        fall.once("remove", this.onRemoveHandler, this);
        fall.setPosition(pos.x, pos.y);
        mainScene.layerManager.addToLayer("sceneUILayer", fall);
    }

    private onRemoveHandler(fall: FallEffect) {
        if (!fall) {
            return;
        }
    }
}
