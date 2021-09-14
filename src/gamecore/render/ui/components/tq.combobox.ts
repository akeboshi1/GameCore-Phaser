import { ComboBox } from "apowophaserui"

export class TQComboBox extends ComboBox {
    constructor(scene: Phaser.Scene, config: any) {
        super(scene, config);
    }

    setText(value) {
        super.setText(value);
        for (const item of this.itemList) {
            const text = item.text;
            if (text) {
                text.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            }
        }
    }
}