import { Panel } from "../components/panel";
import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";

export class PicaMainUIPanel extends Panel {
    private readonly key = "main_ui";
    private mCoinValue: ValueContainer;
    private mDiamondValue: ValueContainer;
    private mSceneName: IconText;
    private mSceneType: IconText;
    private mCounter: IconText;
    constructor(scene: Phaser.Scene, worldService: WorldService) {
        super(scene, worldService);
        this.setTween(false);
    }

    resize(w: number, h: number) {
        // const width = this.scene.cameras.main.width;
        // const height = this.scene.cameras.main.height;
        const width = this.scene.scale.width / this.scale;
        const height = this.scene.scale.height / this.scale;
        super.resize(width, height);
        this.mCoinValue.x = width - this.mCoinValue.width / 2 - 5 * this.dpr;
        this.mDiamondValue.x = width - this.mDiamondValue.width / 2 - 5 * this.dpr;
    }

    preload() {
        this.addAtlas(this.key, "main_ui/main_ui.png", "main_ui/main_ui.json");
        super.preload();
    }

    init() {
        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;
        this.mCoinValue = new ValueContainer(this.scene, this.key, "coin.png", this.dpr);
        this.mCoinValue.y = 28 * this.dpr;
        this.mCoinValue.setText("34234211231233");
        this.mDiamondValue = new ValueContainer(this.scene, this.key, "diamond.png", this.dpr);
        this.mDiamondValue.y = 68 * this.dpr;
        this.mDiamondValue.setText("2334234");

        this.mSceneName = new IconText(this.scene, this.key, "room_icon.png", this.dpr);
        this.mSceneName.setText("皮卡小镇");
        this.mSceneName.x = 15 * this.dpr;
        this.mSceneName.y = 50 * this.dpr;
        this.mSceneType = new IconText(this.scene, this.key, "setting_icon.png", this.dpr);
        this.mSceneType.setText("公共场景");
        this.mSceneType.x = 15 * this.dpr;
        this.mSceneType.y = 75 * this.dpr;
        this.mSceneType.setColor("#FFFF00");
        this.mCounter = new IconText(this.scene, this.key, "counter_icon.png", this.dpr);
        this.mCounter.setText("54人");
        this.mCounter.x = 15 * this.dpr;
        this.mCounter.y = 100 * this.dpr;
        this.mCounter.setColor("#27f6ff");
        this.add([this.mCoinValue, this.mDiamondValue, this.mSceneName, this.mSceneType, this.mCounter]);

        this.resize(w, h);
    }
}

class ValueContainer extends Phaser.GameObjects.Container {
    private mText: Phaser.GameObjects.Text;
    private mAddBtn: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, key: string, leftIcon: string, dpr: number = 1) {
        super(scene);

        const bg = scene.make.image({
            key,
            frame: "price_bg.png"
        }, false);

        const left = scene.make.image({
            key,
            frame: leftIcon,
        }, false);

        this.mText = this.scene.make.text({
            text: "349343",
            width: bg.width,
            height: bg.height,
            style: {
                fontSize: 14 * dpr,
                fontFamily: Font.DEFULT_FONT
            }
        }, false).setOrigin(1, 0);

        this.mAddBtn = this.scene.make.image({
            key,
            frame: "add_btn.png"
        });
        this.setSize(bg.width, bg.height);
        left.x = -this.width * this.originX + 10 * dpr;
        this.mAddBtn.x = this.width * this.originX - this.mAddBtn.width * this.originX;
        this.mText.x = this.width / 2 - 30 * dpr;
        this.mText.y = -(this.height - 12 * dpr) / 2;
        this.add([bg, left, this.mText, this.mAddBtn]);
    }

    public setText(val: string) {
        this.mText.setText(val);
    }
}

class IconText extends Phaser.GameObjects.Container {
    private mText: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, key: string, frame: string, dpr: number = 1) {
        super(scene);

        const icon = scene.make.image({
            key,
            frame
        }, false);

        this.mText = scene.make.text({
            style: {
                fontSize: 14 * dpr,
                fontFamily: Font.DEFULT_FONT
            }
        }, false);
        this.mText.x = icon.width / 2 + 8 * dpr;
        this.mText.y = -icon.height / 2;
        this.mText.setStroke("#000000", 2 * dpr);
        this.add([icon, this.mText]);
    }

    public setText(val: string) {
        this.mText.setText(val);
    }

    public setStroke(color: string, thickness: number) {
        this.mText.setStroke(color, thickness);
    }

    public setColor(color: string) {
        this.mText.setColor(color);
    }
}

class ProgressBar extends Phaser.GameObjects.Container {
    private mProgress: Phaser.GameObjects.Image;
    private mMask: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, key: string, progress: string) {
        super(scene);

        this.mProgress = scene.make.image({
            key,
            frame: progress
        }, false);

        this.add(this.mProgress);
    }

    public setBackground(key: string, frame: string) {
        const background = this.scene.make.image({ key, frame }, false);
        this.addAt(background, 0);
    }
}
