export class CheckButton extends Phaser.GameObjects.Image {
    private mSelected = false;
    private mNormalFrame: string;
    private mSelectFrame: string;
    constructor(scene: Phaser.Scene, x: number, y: number, key: string, normalFrames: string, selectFrame: string) {
        super(scene, x, y, key, normalFrames);
        this.mNormalFrame = normalFrames;
        this.mSelectFrame = selectFrame;
        this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
        this.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.width, this.height), Phaser.Geom.Rectangle.Contains);
        this.on("pointerup", this.onSelected, this);
    }

    private onSelected() {
        this.selected = !this.mSelected;
        this.emit("selected", this.mSelected);
    }

    set selected(val: boolean) {
        if (this.mSelected !== val) {
            this.mSelected = val;
            const frame = val ? this.mSelectFrame : this.mNormalFrame;
            this.setFrame(frame);
        }
    }

    get selected(): boolean {
        return this.mSelected;
    }
}
