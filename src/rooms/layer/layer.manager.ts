import { IRoomManager } from "../room.manager";
import { Geom } from "phaser";
import { ElementDisplay } from "../display/element.display";
import { Room } from "../room";

export class LayerManager {

    // ================ 背景层
    /**
     * 背景层1(用于鼠标点击移动)
     */
    protected mGroundClickLayer: Phaser.GameObjects.Container;

    /**
     * 背景层2
     */
    protected mUGroundLayer2: Phaser.GameObjects.Container;

    // ================舞台层

    /**
     * 舞台地皮层（地块）
     */
    protected mGroundLayer: Phaser.GameObjects.Container;

    /**
     * 舞台地表层（包括角色，物件 ，特效等）
     */
    protected mSurfaceLayer: Phaser.GameObjects.Container;

    /**
     * 舞台大气层
     */
    protected mAtmosphere: Phaser.GameObjects.Container;

    // ===============UI层

    /**
     * ui层(该层不跟随相机移动)
     */
    protected mUILayer: Phaser.GameObjects.Container;

    private mScene: Phaser.Scene;

    private mDepthSurface: boolean;

    private mDepthGround: boolean;

    constructor(private room: Room) {

        this.mScene = room.scene;
        // ==========背景层
        this.mGroundClickLayer = this.mScene.add.container(0, 0);
        // this.totalLayerList.push(this.mGroundClickLayer);

        this.mUGroundLayer2 = this.mScene.add.container(0, 0);

        // ==========舞台层
        this.mGroundLayer = this.mScene.add.container(0, 0);

        this.mSurfaceLayer = this.mScene.add.container(0, 0);

        this.mAtmosphere = this.mScene.add.container(0, 0);

        // ==========UI层
        this.mUILayer = this.mScene.add.container(0, 0).setScrollFactor(0);
        this.mUILayer.setInteractive(new Geom.Rectangle(0, 0, window.innerWidth, window.innerHeight), Phaser.Geom.Rectangle.Contains);
    }

    public addToGround(ele: ElementDisplay | ElementDisplay[]) {
        const tmp = [].concat(ele);
        this.mGroundLayer.add(Array.from(tmp, (display: ElementDisplay) => display.GameObject));
    }

    public addToSurface(ele: ElementDisplay | ElementDisplay[]) {
        const tmp = [].concat(ele);
        this.mSurfaceLayer.add(Array.from(tmp, (display: ElementDisplay) => display.GameObject));
    }

    public addToUI(child: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) {
        this.mUILayer.add(child);
    }

    public addToAtmosphere(child: Phaser.GameObjects.GameObject) {
        this.mAtmosphere.add(child);
    }

    public resize(width: number, height: number) {
        // todo
    }

    public addMouseListen() {
        this.mGroundClickLayer.setInteractive(new Geom.Rectangle(0, 0, window.innerWidth, window.innerHeight), Phaser.Geom.Rectangle.Contains);
    }

    public sortSurface() {
        this.mSurfaceLayer.sort("depth");
    }

    public changeScene() {
        this._clearLayer();
    }

    public update(time: number, delta: number) {
        if (this.mDepthGround) {
            this.mGroundLayer.sort("depth");
            this.mDepthGround = false;
        }
        if (this.mDepthSurface) {
            this.mDepthSurface = false;
            this.mSurfaceLayer.sort("depth");
        }
    }

    public destory() {
        this._clearLayer();
    }

    private _clearLayer() {
        this.clearLayer(this.mGroundClickLayer);
        this.clearLayer(this.mGroundLayer);
        this.clearLayer(this.mSurfaceLayer);
        this.clearLayer(this.mUGroundLayer2);
        this.clearLayer(this.mUILayer);
        this.clearLayer(this.mAtmosphere);
    }

    private clearLayer(container: Phaser.GameObjects.Container, destroy: boolean = false) {
        const list: Phaser.GameObjects.GameObject[] = container.list;
        if (list) {
            const len: number = list.length;
            let child: Phaser.GameObjects.GameObject;
            for (let i: number = 0; i < len; i++) {
                child = list[i];
                child.destroy(destroy);
            }
        }
        container.destroy(destroy);
    }

    set depthSurfaceDirty(val: boolean) {
        this.mDepthSurface = val;
    }

    set depthGroundDirty(val: boolean) {
        this.mDepthGround = val;
    }
}
