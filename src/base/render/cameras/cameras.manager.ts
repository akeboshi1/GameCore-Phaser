import { IPos, Logger } from "utils";

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

export class BaseCamerasManager implements ICameraService {
    protected mMain: Phaser.Cameras.Scene2D.Camera;
    protected mMoving: boolean;
    protected mTarget: any;
    protected mCameras: Phaser.Cameras.Scene2D.Camera[];
    protected zoom: number = 1;

    constructor() {
        this.mCameras = [];
    }

    /**
     * 检测是否在游戏主摄像头内部
     * @param pos
     */
    checkContains(pos: IPos): boolean {
        const rectange = this.mMain.worldView;
        if (rectange) return false;
        return rectange.contains(pos.x, pos.y);
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

    public resize(width: number, height: number) {
    }

    public setScroll(x: number, y: number) {
        if (!this.mMain) {
            return;
        }
        x -= this.mMain.width * 0.5;
        y -= this.mMain.height * 0.5;
        for (const camera of this.mCameras) {
            camera.setScroll(x, y);
        }
    }

    public offsetScroll(x: number, y: number) {
        if (!this.mMain) {
            return;
        }
        for (const camera of this.mCameras) {
            camera.scrollX += x;
            camera.scrollY += y;
        }
        this.moving = true;
    }

    public startFollow(target: any) {
        this.mTarget = target;
        if (this.mMain && target) {
            for (const camera of this.mCameras) {
                camera.startFollow(target);
            }
        }
    }

    public stopFollow() {
        this.mTarget = null;
        if (this.mMain) {
            for (const camera of this.mCameras) {
                camera.stopFollow();
            }
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

    public scrollTargetPoint(x: number, y: number, effect?: string) {
        if (!this.mMain) {
            return;
        }
        this.stopFollow();
        if (effect) {
            this.pan(x, y, 1000);
        } else {
            this.setScroll(x, y);
        }
    }

    public destroy() {
        Logger.getInstance().log("camerasmanager destroy");
        this.mMain = undefined;
        this.mTarget = undefined;
        this.mCameras = [];
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

    set camera(camera: Phaser.Cameras.Scene2D.Camera | undefined) {
        this.mMain = camera;
        this.addCamera(camera);
    }

    get camera(): Phaser.Cameras.Scene2D.Camera | undefined {
        return this.mMain;
    }
}
