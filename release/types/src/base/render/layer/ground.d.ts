/// <reference types="tooqinggamephaser" />
import { BaseLayer } from "./base.layer";
export declare class GroundLayer extends BaseLayer {
    private mSortDirty;
    add(child: Phaser.GameObjects.GameObject): this;
    sortLayer(): void;
}
