export class Label extends Phaser.GameObjects.Text {
    constructor(scene: Phaser.Scene, x: number, y: number, text: string | string[], style: Phaser.Types.GameObjects.Text.TextStyle) {
        super(scene, x, y, text, style);
        this.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    }
}
