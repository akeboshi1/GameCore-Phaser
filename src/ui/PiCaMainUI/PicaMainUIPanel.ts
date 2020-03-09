import { Panel } from "../components/panel";
import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { NinePatch } from "../components/nine.patch";

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

        let frame = this.scene.textures.getFrame(this.key, "strength_progress.png");
        const strengthValue = new ProgressValue(this.scene, this.key, "strength_icon.png", this.dpr);
        const ninePatch = new NinePatch(this.scene, 62 * this.dpr / 2, strengthValue.height / 2 - frame.height, 62 * this.dpr, frame.height, this.key, "strength_progress.png", {
            left: 8 * this.dpr,
            top: 3 * this.dpr,
            right: frame.width - 2 - 8 * this.dpr,
            bottom: frame.height - 1 - 3 * this.dpr

        });
        strengthValue.setProgress(ninePatch);
        strengthValue.x = 50 * this.dpr;
        strengthValue.y = 27 * this.dpr;
        this.add(strengthValue);
        strengthValue.setValue(1000, 1000);

        frame = this.scene.textures.getFrame(this.key, "health_progress.png");
        const healthValue = new ProgressValue(this.scene, this.key, "health_con.png", this.dpr);
        const healthNinePatch =  new NinePatch(this.scene, 62 * this.dpr / 2, healthValue.height / 2 - frame.height, 62 * this.dpr, frame.height, this.key, "health_progress.png", {
            left: 8 * this.dpr,
            top: 3 * this.dpr,
            right: frame.width - 2 - 8 * this.dpr,
            bottom: frame.height - 1 - 3 * this.dpr

        });
        healthValue.setProgress(healthNinePatch);
        healthValue.x = 150 * this.dpr;
        healthValue.y = 27 * this.dpr;
        this.add(healthValue);
        healthValue.setValue(1200, 1000);

        const expProgress = new ExpProgress(this.scene, this.key, this.dpr, this.scale);
        this.add(expProgress);

        this.resize(w, h);
    }
}

class ValueContainer extends Phaser.GameObjects.Container {
    protected mText: Phaser.GameObjects.Text;
    protected mAddBtn: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, key: string, leftIcon: string, dpr: number = 1) {
        super(scene);
        this.init(key, leftIcon, dpr);
    }

    public setText(val: string) {
        this.mText.setText(val);
    }

    protected init(key: string, leftIcon: string, dpr: number) {
        const bg = this.scene.make.image({
            key,
            frame: "price_bg.png"
        }, false);

        const left = this.scene.make.image({
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
        this.mText.setStroke("#000000", 1 * dpr);

        this.mAddBtn = this.scene.make.image({
            key,
            frame: "add_btn.png"
        });
        this.setSize(bg.width, bg.height);
        left.x = -this.width * this.originX + 10 * dpr;
        this.mAddBtn.x = this.width * this.originX - this.mAddBtn.width * this.originX;
        this.mAddBtn.y = (this.height - this.mAddBtn.height) / 2;
        this.mText.x = this.width / 2 - 30 * dpr;
        this.mText.y = -(this.height - 12 * dpr) / 2;
        this.add([bg, left, this.mText, this.mAddBtn]);
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
        this.mText.setStroke("#000000", 1 * dpr);
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

class ExpProgress extends Phaser.GameObjects.Container {
    private mCurrentLv: Phaser.GameObjects.Text;
    private mNextLv: Phaser.GameObjects.Text;
    private mProgressBar: ProgressBar;
    constructor(scene: Phaser.Scene, key: string, dpr: number, scale: number) {
        super(scene);

        let frame = this.scene.textures.getFrame(key, "exp_bg.png");
        this.setSize(360 * dpr, frame.height);
        const progressW = this.width;
        const progressH = this.height;
        this.mProgressBar = new ProgressBar(scene, dpr);
        this.mProgressBar.setSize(this.width, this.height);
        const bg = new NinePatch(this.scene, progressW / 2, progressH / 2, progressW, progressH, key, "exp_bg.png", {
            left: 8 * dpr,
            top: 3 * dpr,
            right: frame.width - 2 - 8 * dpr,
            bottom: frame.height - 1 - 3 * dpr
        });
        this.mProgressBar.setBackground(bg);

        frame = this.scene.textures.getFrame(key, "exp_progress.png");
        const progres = new NinePatch(this.scene, progressW / 2, progressH / 2, 360 * dpr, frame.height, key, "exp_progress.png", {
            left: 8 * dpr,
            top: 3 * dpr,
            right: frame.width - 2 - 10 * dpr,
            bottom: frame.height - 1 - 5 * dpr
        });
        this.mProgressBar.setProgress(progres);
        this.mProgressBar.setRatio(0.9);

        this.mCurrentLv = scene.make.text({
            text: "Lv. 57",
            style: {
                fontSize: 10 * dpr,
                fontFamily: Font.DEFULT_FONT
            }
        }, false);
        this.mCurrentLv.setStroke("#000000", 1 * dpr);

        this.mNextLv = scene.make.text({
            text: "Lv. 58",
            x: this.width,
            style: {
                fontSize: 10 * dpr,
                fontFamily: Font.DEFULT_FONT
            }
        }, false).setOrigin(1, 0);
        this.mNextLv.setStroke("#000000", 1 * dpr);

        this.add([this.mProgressBar, this.mCurrentLv, this.mNextLv]);
    }
}

class ProgressValue extends ValueContainer {
    private mProgress: ProgressBar;
    constructor(scene: Phaser.Scene, key: string, leftIcon: string, dpr: number) {
        super(scene, key, leftIcon, dpr);
    }

    setProgress(progres: NinePatch) {
        this.mProgress.setProgress(progres);
    }

    setValue(val: number, maxValue: number) {
        if (this.mText) {
            this.mText.text = val.toString();
            this.mProgress.setRatio(val / maxValue);
        }
    }

    protected init(key: string, leftIcon: string, dpr: number) {
        const bg = this.scene.make.image({
            key,
            frame: "strength_bg.png"
        }, false);
        this.setSize(bg.width, bg.height);

        const left = this.scene.make.image({
            key,
            frame: leftIcon,
        }, false);

        this.mProgress = new ProgressBar(this.scene, dpr);
        this.mProgress.x = -this.width / 2 + 6 * dpr;
        this.mProgress.y = 2 * dpr;

        this.mText = this.scene.make.text({
            text: "349343",
            width: bg.width,
            height: bg.height,
            style: {
                fontSize: 10 * dpr,
                fontFamily: Font.DEFULT_FONT
            }
        }, false).setOrigin(0.5);
        this.mText.setStroke("#000000", 1 * dpr);

        this.mAddBtn = this.scene.make.image({
            key,
            frame: "add_btn.png"
        });
        this.setSize(bg.width, bg.height);
        left.x = -this.width * this.originX + 10 * dpr;
        this.mAddBtn.x = this.width * this.originX - 10 * dpr;
        this.mAddBtn.y = 6 * dpr;
        // this.mText.x = this.width / 2
        this.mText.y = (this.height - this.mText.height) / 2;
        this.add([bg, this.mProgress, left, this.mText, this.mAddBtn]);
    }
}

class ProgressBar extends Phaser.GameObjects.Container {
    private mProgress: NinePatch;
    private readonly dpr: number;
    private mMaskGraphics: Phaser.GameObjects.Graphics;
    constructor(scene: Phaser.Scene, dpr: number) {
        super(scene);
        this.dpr = dpr;
    }

    public setBackground(bg: NinePatch) {
        // const background = this.scene.make.image({ key, frame }, false);
        this.addAt(bg, 0);
    }

    public setProgress(progress: NinePatch) {
        this.mProgress = progress;
        this.setSize(progress.width, progress.height);

        this.mMaskGraphics = this.scene.make.graphics(undefined, false);
        this.mMaskGraphics.fillStyle(0xFF9900);
        // this.mMaskGraphics.fillRoundedRect(0, 0, 300 * this.dpr, 100, 10);
        this.mMaskGraphics.fillRoundedRect(0, progress.y - progress.height / 2 + 1 * this.dpr, this.width, progress.height, 8);
        this.add(this.mProgress);
        // this.add(this.mMaskGraphics);
        // this.mProgress.setMask(this.mMaskGraphics.createGeometryMask());
        // this.mMaskGraphics.mask = new Phaser.Display.Masks.BitmapMask(this.scene, this.mProgress);
        this.mProgress.mask = new Phaser.Display.Masks.BitmapMask(this.scene, this.mMaskGraphics);
    }

    public setRatio(ratio: number) {
        this.mMaskGraphics.x = -this.width;
        // this.mMaskGraphics.x = (this.width * ratio) - this.width;
        // this.mMaskGraphics.x = (this.width * ratio) - this.width;
        // setInteractive(() => {
        //     this.mMaskGraphics.x ++;
        // }, 100);
        setInterval(() => {
            this.mMaskGraphics.x += 1 * this.dpr;
        }, 100);

    }
}
