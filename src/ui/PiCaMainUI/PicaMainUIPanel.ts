import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { NinePatch } from "../components/nine.patch";
import { Logger } from "../../utils/log";
import { op_client } from "pixelpai_proto";

export class PicaMainUIPanel extends BasePanel {
    private readonly key = "main_ui";
    private mCoinValue: ValueContainer;
    private mDiamondValue: ValueContainer;
    private mSceneName: IconText;
    private mSceneType: IconText;
    private mCounter: IconText;
    private mStrengthValue: ProgressValue;
    private mExpProgress: ExpProgress;
    constructor(scene: Phaser.Scene, worldService: WorldService) {
        super(scene, worldService);
    }

    show(param?: any) {
        super.show(param);
        if (this.mInitialized) {
            this.update(param);
        }
    }

    resize(w: number, h: number) {
        const width = this.scene.cameras.main.width / this.scale;
        const height = this.scene.cameras.main.height / this.scale;
        super.resize(width, height);
        this.mCoinValue.x = width * this.scale - this.mCoinValue.width / 2 - 5 * this.dpr;
        this.mDiamondValue.x = width * this.scale - this.mDiamondValue.width / 2 - 5 * this.dpr;
    }

    preload() {
        this.addAtlas(this.key, "main_ui/main_ui.png", "main_ui/main_ui.json");
        super.preload();
    }

    addListen() {
        if (!this.mInitialized) return;
        if (!this.mSceneName) {
            Logger.getInstance().fatal(`${PicaMainUIPanel.name}: sceneName does not exist!`);
            return;
        }
        this.mSceneName.on("pointerup", this.onEnterEditScene, this);
    }

    removeListen() {
        if (!this.mInitialized) return;
        if (!this.mSceneName) {
            Logger.getInstance().fatal(`${PicaMainUIPanel.name}: sceneName does not exist!`);
            return;
        }
        this.mSceneName.off("pointerup", this.onEnterEditScene, this);
    }

    update(param: any) {
        if (!param) {
            return;
        }
        if (param.hasOwnProperty("level")) this.mExpProgress.setLv(param.level);
        if (param.hasOwnProperty("coin")) this.mCoinValue.setText(param.coin.toString());
        if (param.hasOwnProperty("diamond")) this.mDiamondValue.setText(param.diamond.toString());
        if (param.hasOwnProperty("energy")) {
            const energy = param.energy;
            if (energy) {
                this.mStrengthValue.setValue(energy.currentValue, energy.max);
            } else {
                this.mStrengthValue.setValue(0, 100);
            }
        }
        if (param.hasOwnProperty("name")) {
            this.mSceneName.setText(param.name);
        }
        if (param.hasOwnProperty("ownerName")) {
            this.mSceneType.setText(param.ownerName);
        }
        if (param.hasOwnProperty("playerCount")) {
            // TODO 多语言适配
            this.mCounter.setText(`${param.playerCount}人`);
        }
    }

    init() {
        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;
        this.mCoinValue = new ValueContainer(this.scene, this.key, "coin.png", this.dpr);
        this.mCoinValue.y = 28 * this.dpr;
        this.mDiamondValue = new ValueContainer(this.scene, this.key, "diamond.png", this.dpr);
        this.mDiamondValue.y = 68 * this.dpr;

        this.mSceneName = new SceneName(this.scene, this.key, "room_icon.png", "setting_icon.png", this.dpr);
        this.mSceneName.setText("皮卡小镇");
        this.mSceneName.x = 15 * this.dpr;
        this.mSceneName.y = 55 * this.dpr;
        const bound = this.mSceneName.getBounds();
        this.mSceneName.setSize(bound.width, bound.height);
        this.mSceneName.setInteractive(new Phaser.Geom.Rectangle(-this.mSceneName.width / 2, -this.mSceneName.height / 2, this.mSceneName.width * 2, this.mSceneName.height * 2), Phaser.Geom.Rectangle.Contains);
        this.mSceneType = new IconText(this.scene, this.key, "star_icon.png", this.dpr);
        this.mSceneType.setText("公共场景");
        this.mSceneType.x = 15 * this.dpr;
        this.mSceneType.y = 80 * this.dpr;
        this.mSceneType.setColor("#FFFF00");
        this.mCounter = new IconText(this.scene, this.key, "counter_icon.png", this.dpr);
        this.mCounter.setText("1人");
        this.mCounter.x = 15 * this.dpr;
        this.mCounter.y = 105 * this.dpr;
        this.mCounter.setColor("#27f6ff");
        this.add([this.mCoinValue, this.mDiamondValue, this.mSceneName, this.mSceneType, this.mCounter]);

        const frame = this.scene.textures.getFrame(this.key, "strength_progress.png");
        this.mStrengthValue = new ProgressValue(this.scene, this.key, "strength_icon.png", this.dpr);
        this.mStrengthValue.x = 50 * this.dpr;
        this.mStrengthValue.y = 27 * this.dpr;
        const ninePatch = new NinePatch(this.scene, 60 * this.dpr / 2, this.mStrengthValue.height / 2 - frame.height - 1 * this.dpr, 62 * this.dpr, frame.height, this.key, "strength_progress.png", {
            left: 8 * this.dpr,
            top: 3 * this.dpr,
            right: frame.width - 2 - 8 * this.dpr,
            bottom: frame.height - 1 - 3 * this.dpr

        });
        this.mStrengthValue.setProgress(ninePatch, this.scale);
        this.add(this.mStrengthValue);
        this.mStrengthValue.setValue(1000, 1000);

        // frame = this.scene.textures.getFrame(this.key, "health_progress.png");
        // const healthValue = new ProgressValue(this.scene, this.key, "health_con.png", this.dpr);
        // healthValue.x = 150 * this.dpr;
        // healthValue.y = 27 * this.dpr;
        // const healthNinePatch = new NinePatch(this.scene, 60 * this.dpr / 2, healthValue.height / 2 - frame.height - 1 * this.dpr, 62 * this.dpr, frame.height, this.key, "health_progress.png", {
        //     left: 8 * this.dpr,
        //     top: 3 * this.dpr,
        //     right: frame.width - 2 - 8 * this.dpr,
        //     bottom: frame.height - 1 - 3 * this.dpr
        // });
        // healthValue.setProgress(healthNinePatch, this.scale);
        // this.add(healthValue);
        // healthValue.setValue(200, 1000);

        this.mExpProgress = new ExpProgress(this.scene, this.key, this.dpr, this.scale, this.mWorld);
        this.add(this.mExpProgress);
        this.resize(w, h);
        super.init();
    }

    private onEnterEditScene() {
        this.emit("enterEdit");
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
            text: "0",
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
        this.mAddBtn.y = (this.height - this.mAddBtn.height) / 2 + 2 * dpr;
        this.mText.x = this.width / 2 - 30 * dpr;
        this.mText.y = -(this.height - 12 * dpr) / 2;
        this.add([bg, left, this.mText, this.mAddBtn]);
    }

}

class IconText extends Phaser.GameObjects.Container {
    protected mText: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, key: string, frame: string, dpr: number = 1) {
        super(scene);

        const icon = scene.make.image({
            key,
            frame
        }, false);

        this.mText = scene.make.text({
            style: {
                fontSize: 16 * dpr,
                fontFamily: Font.DEFULT_FONT
            }
        }, false).setOrigin(0, 0.5);
        this.mText.x = icon.width / 2 + 8 * dpr;
        // this.mText.y = -icon.height / 2;
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

class SceneName extends IconText {
    private mRightIcon: Phaser.GameObjects.Image;
    private mDpr: number;
    constructor(scene: Phaser.Scene, key: string, leftFrame: string, rightFrame: string, dpr: number = 1) {
        super(scene, key, leftFrame, dpr);
        this.mDpr = dpr;
        this.mRightIcon = scene.make.image({
            y: 2 * dpr,
            key,
            frame: rightFrame
        }, false);
        this.add(this.mRightIcon);
    }

    public setText(val: string) {
        super.setText(val);
        this.mRightIcon.x = this.mText.x + this.mText.width + this.mRightIcon.width / 2 + 2 * this.mDpr;
    }
}

class ExpProgress extends Phaser.GameObjects.Container {
    private mCurrentLv: Phaser.GameObjects.Text;
    private mNextLv: Phaser.GameObjects.Text;
    private mProgressBar: ProgressBar;
    constructor(scene: Phaser.Scene, key: string, dpr: number, scale: number, world: WorldService) {
        super(scene);

        const width = world.getSize().width;
        let frame = this.scene.textures.getFrame(key, "exp_bg.png");
        this.setSize(width, frame.height);
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
        const progres = new NinePatch(this.scene, progressW / 2, progressH / 2, width, frame.height, key, "exp_progress.png", {
            left: 8 * dpr,
            top: 3 * dpr,
            right: frame.width - 2 - 10 * dpr,
            bottom: frame.height - 1 - 5 * dpr
        });
        this.mProgressBar.setProgress(progres, this.x, this.y, scale);
        this.mProgressBar.setRatio(0.5);
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
            style: {
                fontSize: 10 * dpr,
                fontFamily: Font.DEFULT_FONT
            }
        }, false).setOrigin(0, 0);
        this.mNextLv.setStroke("#000000", 1 * dpr);
        this.mNextLv.x = this.width - this.mNextLv.width;
        this.add([this.mProgressBar, this.mCurrentLv, this.mNextLv]);
    }

    public setLv(val: number) {
        this.mCurrentLv.setText(val.toString());
        this.mNextLv.setText((val + 1).toString());
        this.mNextLv.x = this.width - this.mNextLv.width;
    }
}

class ProgressValue extends ValueContainer {
    private mProgress: ProgressBar;
    constructor(scene: Phaser.Scene, key: string, leftIcon: string, dpr: number) {
        super(scene, key, leftIcon, dpr);
    }

    setProgress(progres: NinePatch, scale: number) {
        this.mProgress.setProgress(progres, this.x + this.mProgress.x, this.y + this.mProgress.y, scale);
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
        this.mProgress.x = -this.width / 2 + 10 * dpr;
        this.mProgress.y = 4 * dpr;

        this.mText = this.scene.make.text({
            text: "0",
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
    private offsetX: number = 0;
    private offsetY: number = 0;
    private mScale: number;
    constructor(scene: Phaser.Scene, dpr: number) {
        super(scene);
        this.dpr = dpr;
    }

    public setBackground(bg: NinePatch) {
        this.addAt(bg, 0);
    }

    public setProgress(progress: NinePatch, offsetX: number, offsetY: number, scale: number) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.mScale = scale;
        this.mProgress = progress;
        this.setSize(progress.width * this.mScale, progress.height * this.mScale);

        this.mMaskGraphics = this.scene.make.graphics(undefined, false);
        this.mMaskGraphics.fillStyle(0xFF9900);
        this.mMaskGraphics.fillRoundedRect(0, progress.y * this.mScale - progress.height * this.mScale / 2, this.width, progress.height, 10);
        this.add(this.mProgress);
        this.mProgress.mask = new Phaser.Display.Masks.GeometryMask(this.scene, this.mMaskGraphics);
        this.mMaskGraphics.x = offsetX * scale;
        this.mMaskGraphics.y = offsetY * scale;
    }

    public setRatio(ratio: number) {
        if (!this.mMaskGraphics) {
            return;
        }
        this.mMaskGraphics.x = ((this.width * ratio) - this.width + this.offsetX);
        // setInterval(() => {
        //     this.mMaskGraphics.x += 1 * this.dpr;
        // }, 100);
    }
}
