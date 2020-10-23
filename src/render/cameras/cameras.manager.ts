import { PacketHandler } from "net-socket-packet";
import { Logger } from "../../utils/log";
import { Render } from "../render";

export interface ICameraService {
    camera: Phaser.Cameras.Scene2D.Camera | undefined;
    moving: boolean;
    readonly targetFollow: any;
    startRoomPlay(scene: Phaser.Scene);
    startFollow(target: any): void;
    stopFollow(): void;

    addCamera(camera: Phaser.Cameras.Scene2D.Camera): void;

    removeCamera(camera: Phaser.Cameras.Scene2D.Camera): void;

    resize(width: number, height: number): void;

    setBounds(x: integer, y: integer, width: integer, height: integer, centerOn?: boolean): void;

    setPosition(x: number, y: number): void;

    setScroll(x: number, y: number): void;
    offsetScroll(x: number, y: number): void;
    scrollTargetPoint(x: number, y: number);
    destroy(): void;
}

export class CamerasManager extends PacketHandler implements ICameraService {
    readonly MINI_VIEW_SIZE = 50;
    readonly VIEW_PORT_SIZE = 50;
    protected mMain: Phaser.Cameras.Scene2D.Camera;
    protected viewPort = new Phaser.Geom.Rectangle();
    protected miniViewPort = new Phaser.Geom.Rectangle();
    protected mMoving: boolean;
    protected mTarget: any;
    protected mCameras: Phaser.Cameras.Scene2D.Camera[];
    protected readonly zoom: number = 1;

    constructor(protected render: Render) {
        super();
        this.mCameras = [];
        this.zoom = this.render.scaleRatio;
    }

    startRoomPlay(scene: Phaser.Scene) {
        this.mMain = scene.cameras.main;
    }

    public set camera(camera: Phaser.Cameras.Scene2D.Camera | undefined) {
        this.mMain = camera;
        this.addCamera(camera);
        this.setViewPortSize();
    }

    public get camera(): Phaser.Cameras.Scene2D.Camera | undefined {
        return this.mMain;
    }

    public resize(width: number, height: number) {
        this.resetCameraSize(width, height);
        if (this.mTarget) {
            this.startFollow(this.mTarget);
        }
    }

    public setScroll(x: number, y: number) {
        if (!this.mMain) {
            return;
        }
        for (const camera of this.mCameras) {
            camera.setScroll(x, y);
        }
        // this.mMain.setScroll(x, y);
    }

    public offsetScroll(x: number, y: number) {
        if (!this.mMain) {
            return;
        }
        for (const camera of this.mCameras) {
            camera.scrollX += x / this.camera.zoom;
            camera.scrollY += y / this.camera.zoom;
        }
        this.moving = true;
        // this.mCamera.setScroll(x, y);
    }

    public startFollow(target: any) {
        this.mTarget = target;
        if (this.mMain && target) {
            for (const camera of this.mCameras) {
                camera.startFollow(target);
            }
            // this.mMain.startFollow(target);
        }
    }

    public stopFollow() {
        this.mTarget = null;
        if (this.mMain) {
            for (const camera of this.mCameras) {
                camera.stopFollow();
            }
            // this.mMain.stopFollow();
        }
    }

    public addCamera(camera: Phaser.Cameras.Scene2D.Camera) {
        const index = this.mCameras.indexOf(camera);
        if (index === -1) {
            this.mCameras.push(camera);
        }
        if (this.mTarget) {
            camera.startFollow(this.mTarget);
        }
    }

    public removeCamera(camera: Phaser.Cameras.Scene2D.Camera) {
        const index = this.mCameras.indexOf(camera);
        if (index > -1) {
            this.mCameras.splice(index, 1);
        }
    }

    public setBounds(x: integer, y: integer, width: integer, height: integer, centerOn?: boolean): void {
        if (!this.mMain) {
            Logger.getInstance().error("camera does not exist");
            return;
        }
        for (const camera of this.mCameras) {
            camera.setBounds(x, y, width, height, centerOn);
        }
        // this.mMain.setBounds(x, y, width, height, centerOn);
    }

    public setPosition(x: number, y: number) {
        if (!this.mMain) {
            return;
        }
        for (const camera of this.mCameras) {
            camera.setPosition(x, y);
        }
        // this.mMain.setPosition(x, y);
    }

    public scrollTargetPoint(x: number, y: number) {
        if (!this.mMain) {
            return;
        }
        this.setScroll(x * this.render.scaleRatio - this.mMain.width / 2, y * this.render.scaleRatio - this.mMain.height / 2);
    }

    public destroy() {
        this.mMain = undefined;
        this.mCameras = [];
    }

    private resetCameraSize(width: number, height: number) {
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

    set moving(val: boolean) {
        this.mMoving = val;
    }

    get moving(): boolean {
        return this.mMoving;
    }

    get targetFollow() {
        return this.mTarget;
    }
}