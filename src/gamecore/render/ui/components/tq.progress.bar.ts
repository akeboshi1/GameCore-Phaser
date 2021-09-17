import { ProgressBar } from "apowophaserui";

export class TQProgressBar extends ProgressBar {
    constructor(scene: Phaser.Scene, config?: any) {
        super(scene, config);
        if (this.text) {
            this.text.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        }
    }
}
