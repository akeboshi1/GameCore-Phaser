/// <reference types="phaser" />
import { BaseLayer } from "./base.layer";
export declare class LayerManager {
    private mDepthSurface;
    private layers;
    private delta;
    constructor();
    setScale(zoom: number): void;
    addLayer(scene: Phaser.Scene, layerClass: typeof BaseLayer, name: string, depth: number): BaseLayer;
    addToLayer(layerName: string, obj: any, index?: number): void;
    destroy(): void;
    getLayer(name: string): BaseLayer;
    update(time: number, delta: number): void;
    set depthSurfaceDirty(val: boolean);
}
