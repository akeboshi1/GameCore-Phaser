import { ElementDisplay } from "../display/element.display";
import { IRoomService, Room } from "../room";
import { GridLayer } from "./grid.layer";
import { Logger } from "../../utils/log";

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
     * 网格层
     * 介于地皮和地表中间
     */
    protected mTileLayer: GridLayer;

    /**
     * 舞台地表层（包括角色，物件 ，特效等）
     */
    protected mSurfaceLayer: Phaser.GameObjects.Container;
    protected mSurfaceInteractived: boolean = true;

    /**
     * 舞台大气层
     */
    protected mAtmosphere: Phaser.GameObjects.Container;

    // ===============UI层
    /**
     * 场景中的ui，可能跟跟随物件或人物
     */
    protected mSceneUILayer: Phaser.GameObjects.Container;

    /**
     * ui层(该层不跟随相机移动)
     */
    protected mUILayer: Phaser.GameObjects.Container;

    protected mMiddleLayer: Phaser.GameObjects.Container;

    private mScene: Phaser.Scene;

    private mDepthSurface: boolean;

    private mDepthGround: boolean;

    private mDelta: number = 0;

    constructor(private room: IRoomService) {
        let zoom = 1;
        if (!room) {
            return;
        }
        if (room.world) {
            zoom = room.world.scaleRatio;
        }

        this.mScene = room.scene;
        // ==========背景层
        this.mGroundClickLayer = this.mScene.add.container(0, 0);
        // this.totalLayerList.push(this.mGroundClickLayer);

        this.mUGroundLayer2 = this.mScene.add.container(0, 0);

        // ==========舞台层
        this.mGroundLayer = this.mScene.add.container(0, 0).setScale(zoom);

        this.mTileLayer = new GridLayer(this.mScene).setScale(zoom);
        this.mScene.sys.displayList.add(this.mTileLayer);

        this.mMiddleLayer = this.mScene.add.container(0, 0).setScale(zoom);

        this.mSurfaceLayer = this.mScene.add.container(0, 0).setScale(zoom);

        this.mAtmosphere = this.mScene.add.container(0, 0);

        // ==========UI层

        this.mSceneUILayer = this.mScene.add.container(0, 0);

        this.mUILayer = this.mScene.add.container(0, 0).setScrollFactor(0);
        // this.mUILayer.setInteractive(new Geom.Rectangle(0, 0, window.innerWidth, window.innerHeight), Phaser.Geom.Rectangle.Contains);
    }

    public addToGround(ele: ElementDisplay | ElementDisplay[], index?: number) {
        if (index !== undefined) {
            this.mGroundLayer.addAt(ele, index);
        } else {
            if (Array.isArray(ele)) {
                this.mGroundLayer.add(ele);
            } else {
                this.mGroundLayer.add([ele]);
            }
        }
        // this.mGroundLayer.add(Array.from(tmp, (display: ElementDisplay) => display.GameObject));
        // Logger.log("terrain num: ", this.mGroundLayer.list.length);
    }

    public addToSurface(ele: ElementDisplay | ElementDisplay[]) {
        if (Array.isArray(ele)) {
            this.mSurfaceLayer.add(ele);
        } else {
            this.mSurfaceLayer.add([ele]);
        }
        // Logger.log("surface num: ", this.mSurfaceLayer.list.length);
        // this.mSurfaceLayer.add(Array.from(tmp, (display: ElementDisplay) => display.GameObject));
    }

    public addToSceneToUI(child: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) {
        this.mSceneUILayer.add(child);
    }

    public addToUI(child: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) {
        this.mUILayer.add(child);
    }

    public addToAtmosphere(child: Phaser.GameObjects.GameObject) {
        this.mAtmosphere.add(child);
    }

    public addToMiddle(child: Phaser.GameObjects.GameObject) {
        this.mMiddleLayer.add(child);
    }

    public resize(width: number, height: number) {
        // todo
    }

    public addMouseListen() {
        // this.mGroundClickLayer.setInteractive(new Geom.Rectangle(0, 0, window.innerWidth, window.innerHeight), Phaser.Geom.Rectangle.Contains);
    }

    public sortSurface() {
        this.mSurfaceLayer.sort("depth");
    }

    public changeScene() {
        this._clearLayer();
    }

    public drawGrid(room: IRoomService) {
        if (this.mTileLayer) {
            this.mTileLayer.draw(room);
        }
    }

    public setGridVisible(visible: boolean) {
        if (this.mTileLayer) {
            this.mTileLayer.setVisible(visible);
        }
    }

    public update(time: number, delta: number) {
        if (time - this.mDelta < 200) {
            return;
        }
        this.mDelta = time;
        if (this.mDepthGround) {
            this.mGroundLayer.sort("depth");
            this.mDepthGround = false;
        }
        if (this.mDepthSurface) {
            this.mDepthSurface = false;
            // this.mSurfaceLayer.sort("depth");
            // for (const display of this.mSurfaceLayer.list) {
            //     if ((<any> display).element.id ===1787929712 || (<any> display).element.id === 902683971) {
            //         Logger.getInstance().log("===>> ", (<any> display).element.id);
            //     }
            // }
            const list = this.mSurfaceLayer.list;
            const len: number = list.length;
            let k = len - 1;
            let pos = 0;// pos变量用来标记循环里最后一次交换的位置
            for (let i = 0; i < len - 1; i++) {
                // 每次遍历标志位都要先置为0，才能判断后面的元素是否发生了交换
                let flag = 0;
                for (let j = 0; j < k; j++) {
                    const displayA: ElementDisplay = list[j] as ElementDisplay;
                    const displayB: ElementDisplay = list[j + 1] as ElementDisplay;
                    const angle: number = Math.atan2(displayA.sortY - displayB.sortY, displayA.sortX - displayB.sortX);
                    if (angle * (180 * Math.PI) >= 70) {
                        const temp = list[j + 1];        // 元素交换
                        list[j + 1] = list[j];
                        list[j] = temp;
                        flag = 1;// 只要有发生了交换，flag就置为1
                        pos = j; // 循环里最后一次交换的位置 j赋给pos
                    }
                }
                k = pos;
                // 判断标志位是否为0，如果为0，说明后面的元素已经有序，就直接return
                if (flag === 0) {
                    return;
                }

            }
            // this.mSurfaceLayer.sort("depth", (displayA: ElementDisplay, displayB: ElementDisplay) => {
            //     // Logger.debug(displayA, displayB);
            //     // const sortA = displayA.sortRectangle;
            //     // const sortB = displayB.sortRectangle;
            //     // Logger.log("sort x: ", displayA, displayA.sortX, displayA.sortY);
            //     // Logger.log("sortB: ", displayB, displayB.sortX, displayB.sortY);
            //     // const depthA: number = displayA.depth ? displayA.depth : 0;
            //     // const depthB: number = displayB.depth ? displayB.depth : 0;
            //     // if (displayA.element.id === 902683971 || displayA.element.id === 1787929712) {
            //     //     Logger.getInstance().log("===》》 element: ", displayA.element, depthA, depthB);
            //     // }
            //     // if (depthA > depthB) {
            //     //     return 1;
            //     // }
            //     // ---------------根据角度判断深度
            //     const angle: number = Math.atan2(displayA.sortY - displayB.sortY, displayA.sortX - displayB.sortX);
            //     // if ((displayA.element.id === 1787929712 && displayB.element.id === 902683971) || (displayB.element.id === 1787929712 && displayA.element.id === 902683971)) {
            //     //     Logger.getInstance().log("===》》angle: ", displayA.element.id, displayB.element.id, displayA.sortX, displayA.sortY, angle, angle * (180 * Math.PI));
            //     // }
            //     if (angle * (180 * Math.PI) >= 70) {
            //         return 1;
            //     }
            //     return -1;
            // });

            // this.mSurfaceLayer.sort("depth", (displayA: ElementDisplay, displayB: ElementDisplay) => {
            //     // Logger.debug(displayA, displayB);
            //     // const sortA = displayA.sortRectangle;
            //     // const sortB = displayB.sortRectangle;

            //     // Logger.log("sort x: ", displayA, displayA.sortX, displayA.sortY);
            //     // Logger.log("sortB: ", displayB, displayB.sortX, displayB.sortY);
            //     const depthA: number = displayA.depth ? displayA.depth : 0;
            //     const depthB: number = displayB.depth ? displayB.depth : 0;
            //     if (depthA > depthB) {
            //         return 1;
            //     }
            //     // ---------------根据角度判断深度
            //     const angle: number = Math.atan2(displayA.sortY - displayB.sortY, displayA.sortX - displayB.sortX);
            //     if (angle * (180 * Math.PI) >= 70) {
            //         return 1;
            //     }
            //     // if (displayA.sortY > displayB.sortY) {
            //     //     return 1;
            //     // }
            //     // if (displayB.y + sortB.top.y > displayA.y + sortA.left.y) {
            //     //     return 1;
            //     // }
            //     return -1;
            // });
        }
    }

    public setSurfaceInteractive(val: boolean) {
        if (this.mSurfaceInteractived === val) {
            return;
        }
        this.mSurfaceInteractived = val;
        const list = this.mSurfaceLayer.list;
        if (val) {
            // this.mSurfaceLayer.setInteractive();
            list.forEach((obj) => {
                obj.setInteractive();
            });
        } else {
            list.forEach((obj) => {
                obj.disableInteractive();
            });
            // this.mSurfaceLayer.disableInteractive();
        }
    }

    public destroy() {
        this.mDelta = 0;
        this._clearLayer();
    }

    private _clearLayer() {
        this.clearLayer(this.mGroundClickLayer);
        this.clearLayer(this.mGroundLayer);
        this.clearLayer(this.mSurfaceLayer);
        this.clearLayer(this.mUGroundLayer2);
        this.clearLayer(this.mUILayer);
        this.clearLayer(this.mAtmosphere);
        this.mTileLayer.destroy(true);
    }

    private clearLayer(container: Phaser.GameObjects.Container, destroy: boolean = false) {
        const list: Phaser.GameObjects.GameObject[] = container.list;
        if (list) {
            const len: number = list.length;
            let child: Phaser.GameObjects.GameObject;
            for (let i: number = 0; i < len; i++) {
                child = list[i];
                if (child) {
                    child.destroy(destroy);
                    child = null;
                }
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

    get layer(): Phaser.GameObjects.Container {
        return this.mGroundLayer;
    }
}
