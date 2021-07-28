import { BaseLayer } from "./base.layer";
import { Logger } from "structure";

export class LayerManager {
    private mDepthSurface: boolean;
    private layers: Map<string, BaseLayer>;
    private delta: number = 0;

    public constructor() {
        this.layers = new Map();
    }

    public setScale(zoom: number) {
        this.layers.forEach((val) => {
            val.setScale(zoom);
        });
    }

    public addLayer(scene: Phaser.Scene, layerClass: typeof BaseLayer, name: string, depth: number): BaseLayer {
        if (this.layers.get(name)) {
            Logger.getInstance().warn("repeated layer name: ", name);
            return;
        }

        const layer = new layerClass(scene, name, depth);
        this.layers.set(name, layer);
        scene.sys.displayList.add(layer);
        return layer;
    }

    public addToLayer(layerName: string, obj: any, index: number = -1) {
        const layer = this.layers.get(layerName);
        if (!layer) return;

        if (index === -1 || index === undefined) {
            layer.add(obj);
        } else {
            layer.addAt(obj, index);
        }
    }

    public destroy() {
        this.layers.forEach((layer) => {
            layer.destroy();
        });

        this.layers = null;
    }

    public getLayer(name: string): BaseLayer {
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
    }

    set depthSurfaceDirty(val: boolean) {
        this.mDepthSurface = val;
    }
}
