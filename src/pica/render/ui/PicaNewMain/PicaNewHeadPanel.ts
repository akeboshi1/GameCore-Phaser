export class PicaNewHeadPanel extends Phaser.GameObjects.Container {
    private dpr: number;
    private key: string;
    private headCon: Phaser.GameObjects.Container;
    private moneyCon: Phaser.GameObjects.Container;
    private sceneCon: Phaser.GameObjects.Container;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, dpr: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.key = key;
        this.init();
    }

    init() {
        this.headCon = this.scene.make.container(undefined, false);
        this.moneyCon = this.scene.make.container(undefined, false);
        this.sceneCon = this.scene.make.container(undefined, false);
        this.add([this.headCon, this.moneyCon, this.sceneCon]);
    }
}
