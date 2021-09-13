import { Button as  RexButton } from "apowophaserui";
export class Button extends RexButton {
    constructor(scene: Phaser.Scene, key: string, frame?: string, downFrame?: string, text?: string, music?: any, dpr?: number, scale?: number, nineConfig?: any, tweenBoo?: boolean) {
        super(scene, key, frame, downFrame, text, music, dpr, scale, nineConfig, tweenBoo);
        if (this.mText) {
            this.mText.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        }
    }
}