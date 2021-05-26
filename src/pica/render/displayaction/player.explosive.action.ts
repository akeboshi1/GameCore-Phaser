
import { DragonbonesDisplay, PlayScene } from "gamecoreRender";
import { EventType, LayerName, SceneName } from "structure";
import { Handler } from "utils";
import { DisplayActionTag } from ".";
import { DisplayBaseAction } from "./display.base.action";
export class PlayerExplosiveAction extends DisplayBaseAction {
    public actionTag: string = DisplayActionTag.mineexplosive;
    public display: DragonbonesDisplay;
    private timerID: any;
    public executeAction() {
        const playScene: any = this.render.sceneManager.getSceneByName(SceneName.PLAY_SCENE);
        playScene.layerManager.addToLayer(LayerName.DECORATE, this.display);
        if (this.data.isSelf) {
            if (playScene) {
                (<any>playScene).pauseMotion();
                (<any>playScene).disableCameraMove();
            }
            this.render.stopFollow();
        }
        const sprite = this.display.getDisplay();
        sprite.y -= this.display.topPoint.y * 0.5;
        this.playPosition(new Handler(this, () => {
            if (this.data.isSelf) this.render.renderEmitter(EventType.REQUEST_GO_PLAYER_HOME);
            if (this.compl) this.compl.runWith(this);
            this.destroy();
        }));

    }
    destroy() {
        super.destroy();
        if (this.display) this.display.destroy();
        this.display = undefined;
        this.compl = undefined;
    }
    playPosition(compl: Handler) {
        if (this.timerID) clearInterval(this.timerID);
        const cameraview = this.getCameraView();
        if (!cameraview) return undefined;
        const zoom = this.render.scaleRatio;
        const width = cameraview.width / zoom;
        // const height = cameraview.height / zoom;
        const baseX = cameraview.x / zoom;
        const baseY = cameraview.y / zoom;
        const speed = (90 + 50 * Math.random()) * (Math.random() < 0.5 ? 1 : -1);
        const accele = 300;
        const interval = 20;
        const frame = interval / 1000;
        let posX = baseX + width - 100;
        if (speed < 0) posX = baseX + 100;
        let vy = 350 + 150 * Math.random();
        this.timerID = setInterval(() => {
            if (!this.display.getScene()) {
                clearInterval(this.timerID);
                return;
            }
            this.display.x += speed * frame;
            this.display.y -= vy * frame;
            vy -= accele * frame;
            this.display.update();
            this.display.rotation += 0.5;
            if (this.checkBoundOut(this.display, speed < 0, posX, baseY)) {
                clearInterval(this.timerID);
                this.timerID = undefined;
                if (compl) compl.run();
            }
        }, interval);
    }
    private getCameraView() {
        const playScene: Phaser.Scene = this.render.getMainScene();
        if (playScene) {
            const camera = playScene.cameras.main;
            const rect = camera.worldView;
            const blockWidth = 300;
            const blockHeight = 150;
            const { x, y } = rect;
            const obj = {
                x: x - blockWidth * 1.5,
                y: y - blockHeight * 1.5,
                width: camera.width + blockWidth * 3,
                height: camera.height + blockHeight * 3,
                zoom: camera.zoom,
                scrollX: camera.scrollX,
                scrollY: camera.scrollY
            };
            return obj;
        }
        return undefined;
    }
    private checkBoundOut(obj: any, left: boolean, posx: number, posy: number) {
        if ((!left && obj.x >= posx) || (left && obj.x <= posx)) return true;
        if (obj.y <= posy) return true;
        return false;
    }
}
