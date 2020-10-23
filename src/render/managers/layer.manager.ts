// export interface ILayerManager {
//     readonly interactive: Phaser.GameObjects.Container;
//     readonly scene: Phaser.Scene;
//     setScene(scene: Phaser.Scene): void;

import { Logger } from "utils";

//     addToUILayer(obj: Phaser.GameObjects.GameObject, index?: number);
//     addToDialogLayer(obj: Phaser.GameObjects.GameObject);
//     addToToolTipsLayer(obj: Phaser.GameObjects.GameObject);

//     removeToUILayer(obj: Phaser.GameObjects.GameObject);
//     removeToDialogLayer(obj: Phaser.GameObjects.GameObject);
//     removeToToolTipsLayer(obj: Phaser.GameObjects.GameObject);

//     destroy();
// }

export class BasicLayer extends Phaser.GameObjects.Container {
    constructor(scene: Phaser.Scene, public name: string, depth: number) {
        super(scene);
        this.setDepth(depth);
    }

    public sortLayer() {

    }
}

export class LayerManager {
    // private mScene: Phaser.Scene;

    // private mInteractive: Phaser.GameObjects.Container;
    // private mUILayer: Phaser.GameObjects.Container;
    // private mDialogLayer: Phaser.GameObjects.Container;
    // private mToolTipsLyaer: Phaser.GameObjects.Container;

    private layers: Map<string, BasicLayer>;
    private delta: number = 0;

    public constructor() {
        this.layers = new Map();
    }

    public addLayer(scene: Phaser.Scene, layerClass: typeof BasicLayer, name: string, depth: number): BasicLayer {
        if (this.layers.get(name)) {
            Logger.getInstance().warn("repeated layer name: ", name);
            return;
        }

        const layer = new layerClass(scene, name, depth);
        this.layers.set(name, layer);
        scene.sys.displayList.add(layer);
        return layer;
    }

    public addToLayer(layerName: string, obj: Phaser.GameObjects.GameObject, index: number = -1) {
        const layer = this.layers.get(layerName);
        if (!layer) return;

        if (index === -1 || index === undefined) {
            layer.add(obj);
        } else {
            layer.addAt(obj, index);
        }
    }

    public destroy() {
        this.layers.forEach((val) => {
            val.destroy();
        });

        this.layers = null;
    }

    public getLayer(name: string): BasicLayer {
        if (!this.layers.get(name)) {
            return null;
        }

        return this.layers.get(name);
    }

    public update(time: number, delta: number) {
        if (time - this.delta < 200) {
            return;
        }
        this.delta = time;
        this.layers.forEach((val) => {
            val.sortLayer();
        });
        // if (this.mDepthGround) {
        //     this.mGroundLayer.sort("depth");
        //     this.mDepthGround = false;
        // }
        // if (this.mDepthSurface) {
        //     this.mDepthSurface = false;
        //     this.mSurfaceLayer.sort("depth", (displayA: ElementDisplay, displayB: ElementDisplay) => {
        //         // 游戏中所有元素的sortz为1，只在同一高度上，所以下面公式中加入sortz暂时不影响排序，后期sortz会有变化
        //         return displayA.sortY + displayA.sortZ > displayB.sortY + displayB.sortZ;
        //     });
        // }
    }

    // public setScene(scene: Phaser.Scene) {
    //     if (!scene) return;
    //     this.destroy();
    //     this.mScene = scene;

    //     // const view = scene.cameras.main;
    //     // this.mInteractive = scene.add.container(view.width >> 1, view.height >> 1);
    //     // this.mInteractive.setSize(view.width, view.height);
    //     // const rect = scene.add.graphics();
    //     // rect.lineStyle(1, 0, 1);
    //     // rect.fillRect(0, 0, view.width, view.height);
    //     // this.mInteractive.setInteractive();
    //     this.mUILayer = scene.add.container(0, 0);
    //     this.mDialogLayer = scene.add.container(0, 0);
    //     this.mToolTipsLyaer = scene.add.container(0, 0);
    // }

    // public addToUILayer(obj: Phaser.GameObjects.GameObject, index: number = -1) {
    //     if (!this.mUILayer) {
    //         return;
    //     }
    //     if (index === -1 || index === undefined) {
    //         this.mUILayer.add(obj);
    //     } else {
    //         this.mUILayer.addAt(obj, index);
    //     }
    // }

    // public addToDialogLayer(obj: Phaser.GameObjects.GameObject) {
    //     if (!this.mDialogLayer) {
    //         return;
    //     }
    //     this.mDialogLayer.add(obj);
    // }

    // public addToToolTipsLayer(obj: Phaser.GameObjects.GameObject) {
    //     if (!this.mToolTipsLyaer) {
    //         return;
    //     }
    //     this.mToolTipsLyaer.add(obj);
    // }

    // public removeToUILayer(obj: Phaser.GameObjects.GameObject) {
    //     this.mUILayer.remove(obj);
    // }

    // public removeToDialogLayer(obj: Phaser.GameObjects.GameObject) {
    //     this.mDialogLayer.remove(obj);
    // }

    // public removeToToolTipsLayer(obj: Phaser.GameObjects.GameObject) {
    //     this.mToolTipsLyaer.remove(obj);
    // }

    // public destroy() {
    //     if (this.mUILayer) {
    //         this.mUILayer.destroy();
    //         this.mUILayer = null;
    //     }

    //     if (this.mDialogLayer) {
    //         this.mDialogLayer.destroy();
    //         this.mDialogLayer = null;
    //     }

    //     if (this.mToolTipsLyaer) {
    //         this.mToolTipsLyaer.destroy();
    //         this.mToolTipsLyaer = null;
    //     }
    // }

    // get interactive(): Phaser.GameObjects.Container {
    //     return this.mInteractive;
    // }

    // get scene(): Phaser.Scene {
    //     return this.mScene;
    // }
}
