import { Logger } from "utils";
import { Render } from "../render";
import { BaseCamerasManager } from "../../base";
export class CamerasManager extends BaseCamerasManager {
    readonly MINI_VIEW_SIZE = 50;
    readonly VIEW_PORT_SIZE = 50;
    protected viewPort = new Phaser.Geom.Rectangle();
    protected miniViewPort = new Phaser.Geom.Rectangle();

    constructor(protected render: Render) {
        super();
        this.mCameras = [];
        this.zoom = this.render.scaleRatio;
    }

    startRoomPlay(scene: Phaser.Scene) {
        this.mMain = scene.cameras.main;
    }

    public pan(x: number, y: number, duration: number): Promise<any> {
        x *= this.zoom;
        y *= this.zoom;
        for (const cam of this.mCameras) {
            cam.pan(x, y, duration);
        }
        return new Promise<void>((resolve, reject) => {
            this.mMain.once(Phaser.Cameras.Scene2D.Events.PAN_COMPLETE, () => {
                resolve();
            });
        });
    }

    public set camera(camera: Phaser.Cameras.Scene2D.Camera | undefined) {
        this.mMain = camera;
        this.addCamera(camera);
        this.setViewPortSize();
    }

    public resize(width: number, height: number) {
        Logger.getInstance().log("resize");
        this.resetCameraSize(width, height);
        Logger.getInstance().log("camera ===== resize");
        if (this.mTarget) {
            Logger.getInstance().log("target ===== resize");
            this.startFollow(this.mTarget);
        }
    }

    public scrollTargetPoint(x: number, y: number, effect?: string) {
        if (!this.mMain) {
            return;
        }
        this.stopFollow();
        if (effect) {
            this.pan(x, y, 1000).then(() => {
                this.render.syncCameraScroll();
            });
        } else {
            this.setScroll(x, y);
            this.render.syncCameraScroll();
        }
    }

    private resetCameraSize(width: number, height: number) {
        Logger.getInstance().log("resetCamerSize");
        this.render.mainPeer.resetGameraSize(width, height);
    }

    private setViewPortSize() {
        if (!this.mMain) {
            Logger.getInstance().error("camera does not exist");
            return;
        }
        const size = this.render.getCurrentRoomSize();
        if (!size) {
            Logger.getInstance().error("room size does not exist");
            return;
        }
        const viewW = (this.VIEW_PORT_SIZE + this.VIEW_PORT_SIZE) * (size.tileWidth / 2);
        const viewH = (this.VIEW_PORT_SIZE + this.VIEW_PORT_SIZE) * (size.tileHeight / 2);
        // const viewW = this.mMain.width * 2;
        // const viewH = this.mMain.height * 2;
        this.viewPort.setSize(viewW, viewH);

        const miniViewW = (this.MINI_VIEW_SIZE + this.MINI_VIEW_SIZE) * (size.tileWidth / 2);
        const miniviewH = (this.MINI_VIEW_SIZE + this.MINI_VIEW_SIZE) * (size.tileHeight / 2);
        this.miniViewPort.setSize(miniViewW, miniviewH);
    }
}
