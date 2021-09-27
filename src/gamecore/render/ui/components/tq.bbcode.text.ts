import { BBCodeText } from "apowophaserui";

export class TQBBCodeText extends BBCodeText {
    constructor(scene: Phaser.Scene, x?: number, y?: number, text?: string, style?: any) {
        super(scene, x, y, text, style);
        (<any>this).texture.setFilter(Phaser.Textures.FilterMode.LINEAR);

    }
}