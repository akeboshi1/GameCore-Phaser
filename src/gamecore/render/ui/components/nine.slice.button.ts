import { NineSliceButton as RexNineSliceButton } from "apowophaserui";
export class NineSliceButton extends RexNineSliceButton {
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, frame: string, text?: string, dpr?: number, scale?: number, config?: any, music?: any, data?: any) {
        super(scene, x, y, width, height, key, frame, text, dpr, scale, config);
        if (this.mText) {
            this.mText.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        }
    }


}