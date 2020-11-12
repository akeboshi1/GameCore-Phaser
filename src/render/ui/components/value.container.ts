import { Button, ClickEvent } from "apowophaserui";
import { Font, Handler } from "utils";

export class ValueContainer extends Phaser.GameObjects.Container {
    protected mText: Phaser.GameObjects.Text;
    protected mAddBtn: Button;
    protected mLeft: Phaser.GameObjects.Image;
    protected sendHandler: Handler;
    constructor(scene: Phaser.Scene, key: string, leftIcon: string, dpr: number = 1) {
        super(scene);
        this.init(key, leftIcon, dpr);
    }
    public setText(val: string) {
        this.mText.setText(val);
    }

    public setHandler(send: Handler) {
        this.sendHandler = send;
    }
    protected init(key: string, leftIcon: string, dpr: number) {
        const bg = this.scene.make.image({
            key,
            frame: "home_progress_bottom"
        }, false);
        bg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.mLeft = this.scene.make.image({
            key,
            frame: leftIcon,
        }, false);
        this.mLeft.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.mText = this.scene.make.text({
            text: "0",
            width: bg.width,
            height: bg.height,
            style: {
                fontSize: 14 * dpr,
                fontFamily: Font.NUMBER
            }
        }, false).setOrigin(0.5);
        this.mText.setStroke("#000000", 1 * dpr);
        this.mText.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.mAddBtn = new Button(this.scene, key, "add_btn", "add_btn");
        this.setSize(bg.width, bg.height);
        this.mLeft.x = -bg.width * 0.5 + 5 * dpr;
        this.mLeft.y = bg.y + bg.height * 0.5 - this.mLeft.height * 0.5;
        this.mAddBtn.x = this.width * this.originX - this.mAddBtn.width * this.originX - 5 * dpr;
        this.mText.x = 4 * dpr;
        this.add([bg, this.mLeft, this.mText, this.mAddBtn]);
        this.mAddBtn.on(ClickEvent.Tap, this.onAddHandler, this);
    }

    private onAddHandler() {
        if (this.sendHandler) this.sendHandler.run();
    }
}
