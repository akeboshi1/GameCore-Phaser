export class PicaNewChatPanel extends Phaser.GameObjects.Container {
    private dpr: number;
    private key: string;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, dpr: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.key = key;
    }
}
