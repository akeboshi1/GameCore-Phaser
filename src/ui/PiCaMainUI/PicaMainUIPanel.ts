import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { NinePatch } from "../components/nine.patch";
import { Logger } from "../../utils/log";
import { Handler } from "../../Handler/Handler";
import { TextToolTips } from "../tips/TextToolTip";
import { op_client, op_pkt_def } from "pixelpai_proto";

export class PicaMainUIPanel extends BasePanel {
    private readonly key = "main_ui";
    private mCoinValue: ValueContainer;
    private mDiamondValue: ValueContainer;
    private mSceneName: IconText;
    private mSceneType: IconText;
    private mCounter: IconText;
    private mStrengthValue: ProgressValue;
    private mExpProgress: ExpProgress;
    private playerIcon: Phaser.GameObjects.Image;
    private playerCon: Phaser.GameObjects.Container;
    private roomCon: Phaser.GameObjects.Container;
    private textToolTip: TextToolTips;
    private isSceneNameActive: boolean = false;
    constructor(scene: Phaser.Scene, worldService: WorldService) {
        super(scene, worldService);
    }

    show(param?: any) {
        super.show(param);
        if (this.mInitialized) {
            this.setInteractive();
            this.update(param);
            this.checkUpdateActive();
        }
    }

    resize(w: number, h: number) {
        const width = this.scene.cameras.main.width / this.scale;
        const height = this.scene.cameras.main.height / this.scale;
        super.resize(width, height);
        this.mCoinValue.x = width - this.mCoinValue.width / 2 - 5 * this.dpr;
        this.mDiamondValue.x = width - this.mDiamondValue.width / 2 - 5 * this.dpr;
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
        Object.assign(this.mShowData, param);
        super.update(this.mShowData);
        if (!param) {
            return;
        }
        if (!this.mInitialized) {
            return;
        }

        if (param.hasOwnProperty("level")) {
            const level: op_pkt_def.PKT_Level = param.level;
            const curExp = (level.currentLevelExp === undefined ? 0 : level.currentLevelExp);
            this.mExpProgress.setLv(level.level, curExp / level.nextLevelExp);
        }
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
            const bound = this.mSceneName.getBounds();
            this.mSceneName.setSize(bound.width, bound.height);
            this.mSceneName.setInteractive(new Phaser.Geom.Rectangle(this.mSceneName.width / 2, 0, this.mSceneName.width, this.mSceneName.height), Phaser.Geom.Rectangle.Contains);
            this.isSceneNameActive = true;
        }
        if (param.hasOwnProperty("ownerName")) {
            this.mSceneType.setText(param.ownerName);
        }
        if (param.hasOwnProperty("playerCount")) {
            // TODO 多语言适配
            this.mCounter.setText(`${param.playerCount}人`);
        }
    }

    updateUIState(active?: op_pkt_def.IPKT_UI) {
        if (!this.mInitialized) {
            return;
        }
        if (active.name === "mainui.playerinfo") {
            this.playerCon.visible = active.visible;
        }
        if (active.name === "mainui.roominfo") {
            this.roomCon.visible = active.visible;
        }
        if (active.name === "mainui.headbtn") {
            // this.playerIcon.visible = active.visible;
            if (!active.disabled) {
                this.playerIcon.setInteractive();
            } else {
                this.playerIcon.removeInteractive();
            }
        }
        if (active.name === "mainui.entereditorbtn") {
            this.mSceneName.visible = active.visible;
            if (this.isSceneNameActive) {
                if (!active.disabled) {
                    this.mSceneName.setInteractive(new Phaser.Geom.Rectangle(this.mSceneName.width / 2, 0, this.mSceneName.width, this.mSceneName.height), Phaser.Geom.Rectangle.Contains);
                } else {
                    this.mSceneName.removeInteractive();
                }
            }
        }
    }
    init() {
        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;
        this.playerCon = this.scene.make.container(undefined, false);
        this.add(this.playerCon);
        this.mCoinValue = new ValueContainer(this.scene, this.key, "coin", this.dpr);
        this.mCoinValue.y = 28 * this.dpr;
        this.mDiamondValue = new ValueContainer(this.scene, this.key, "diamond", this.dpr);
        this.mDiamondValue.y = 68 * this.dpr;

        const frame = this.scene.textures.getFrame(this.key, "strength_progress");
        this.mStrengthValue = new ProgressValue(this.scene, this.key, "strength_icon", this.dpr);
        this.mStrengthValue.x = 78 * this.dpr;
        this.mStrengthValue.y = 27 * this.dpr;
        const ninePatch = new NinePatch(this.scene, 60 * this.dpr / 2, this.mStrengthValue.height / 2 - frame.height - 1 * this.dpr, 62 * this.dpr, frame.height, this.key, "strength_progress", {
            left: 8 * this.dpr,
            top: 3 * this.dpr,
            right: frame.width - 2 - 8 * this.dpr,
            bottom: frame.height - 1 - 3 * this.dpr

        });
        this.mStrengthValue.setProgress(ninePatch, this.scale);
        this.playerIcon = this.scene.make.image({ key: this.key, frame: "head" });
        this.playerIcon.x = -this.mStrengthValue.width * 0.5 - 18 * this.dpr;
        this.mStrengthValue.add(this.playerIcon);
        this.playerIcon.on("pointerup", this.onHeadHandler, this);
        this.playerIcon.setInteractive();
        this.mStrengthValue.setValue(1000, 1000);
        this.mStrengthValue.setInteractive();
        this.mStrengthValue.on("pointerup", this.onStrengthHandler, this);
        this.mExpProgress = new ExpProgress(this.scene, this.key, this.dpr, this.scale, this.mWorld);

        this.playerCon.add([this.mExpProgress, this.mStrengthValue, this.mCoinValue, this.mDiamondValue]);

        this.roomCon = this.scene.make.container(undefined, false);
        this.add(this.roomCon);
        this.mSceneName = new SceneName(this.scene, this.key, "room_icon", "setting_icon", this.dpr);
        this.mSceneName.setText("");
        this.mSceneName.x = 15 * this.dpr;
        this.mSceneName.y = 55 * this.dpr;
        this.mSceneType = new IconText(this.scene, this.key, "star_icon", this.dpr);
        this.mSceneType.setText("");
        this.mSceneType.x = 15 * this.dpr;
        this.mSceneType.y = 80 * this.dpr;
        this.mSceneType.setColor("#FFFF00");
        this.mCounter = new IconText(this.scene, this.key, "counter_icon", this.dpr);
        this.mCounter.setText("1人");
        this.mCounter.x = 15 * this.dpr;
        this.mCounter.y = 105 * this.dpr;
        this.mCounter.setColor("#27f6ff");
        this.textToolTip = new TextToolTips(this.scene, this.key, "tips_bg", this.dpr, this.scale);
        this.textToolTip.setSize(160 * this.dpr, 45).visible = false;
        this.roomCon.add([this.mSceneName, this.mSceneType, this.mCounter, this.textToolTip]);

        // frame = this.scene.textures.getFrame(this.key, "health_progress");
        // const healthValue = new ProgressValue(this.scene, this.key, "health_con", this.dpr);
        // healthValue.x = 150 * this.dpr;
        // healthValue.y = 27 * this.dpr;
        // const healthNinePatch = new NinePatch(this.scene, 60 * this.dpr / 2, healthValue.height / 2 - frame.height - 1 * this.dpr, 62 * this.dpr, frame.height, this.key, "health_progress", {
        //     left: 8 * this.dpr,
        //     top: 3 * this.dpr,
        //     right: frame.width - 2 - 8 * this.dpr,
        //     bottom: frame.height - 1 - 3 * this.dpr
        // });
        // healthValue.setProgress(healthNinePatch, this.scale);
        // this.add(healthValue);
        // healthValue.setValue(200, 1000);

        this.resize(w, h);
        super.init();
    }

    private onEnterEditScene() {
        this.emit("enterEdit");
    }
    private onHeadHandler() {
        this.emit("showPanel", "CharacterInfo");
    }

    private onStrengthHandler() {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        const energy = this.showData.energy;
        const text = "当前精力值" + `${energy.currentValue}/${energy.max}\n` + "精力不满时，每10分钟恢复1点";
        this.textToolTip.setTextData(text, 3000);
        this.textToolTip.setPosition(120 * this.dpr, 80 * this.dpr);
    }
    private checkUpdateActive() {
        const arr = this.mWorld.uiManager.getActiveUIData("PicaMainUI");
        if (arr) {
            for (const data of arr) {
                this.updateUIState(data);
            }
        }

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
            frame: "price_bg"
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
            frame: "add_btn"
        });
        this.setSize(bg.width, bg.height);
        left.x = -this.width * this.originX + 10 * dpr;
        this.mAddBtn.x = this.width * this.originX - this.mAddBtn.width * this.originX;
        this.mAddBtn.y = (this.height - this.mAddBtn.height) / 2 + 2 * dpr;
        this.mText.x = this.width / 2 - 30 * dpr;
        this.mText.y = -(this.height - 12 * dpr) / 2;
        this.add([bg, left, this.mText, this.mAddBtn]);
        this.mAddBtn.visible = false;
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
                fontSize: 14 * dpr,
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
    private settingHandler: Handler;
    constructor(scene: Phaser.Scene, key: string, leftFrame: string, rightFrame: string, dpr: number = 1) {
        super(scene, key, leftFrame, dpr);
        this.mDpr = dpr;
        this.mRightIcon = scene.make.image({
            y: 2 * dpr,
            key,
            frame: rightFrame
        }, false);
        this.add(this.mRightIcon);
        this.mRightIcon.y = -1 * dpr;
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

        const width = world.getSize().width / scale;
        let frame = this.scene.textures.getFrame(key, "exp_bg");
        this.setSize(width, frame.height);
        const progressW = this.width;
        const progressH = this.height;
        this.mProgressBar = new ProgressBar(scene, dpr);
        this.mProgressBar.setSize(this.width, this.height);
        const bg = new NinePatch(this.scene, progressW / 2, progressH / 2, progressW, progressH, key, "exp_bg", {
            left: 8 * dpr,
            top: 3 * dpr,
            right: frame.width - 2 - 8 * dpr,
            bottom: frame.height - 1 - 3 * dpr
        });
        this.mProgressBar.setBackground(bg);

        frame = this.scene.textures.getFrame(key, "exp_progress");
        const progres = new NinePatch(this.scene, progressW / 2, progressH / 2, width, frame.height, key, "exp_progress", {
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

    public setLv(val: number, ratio: number) {
        this.mCurrentLv.setText(val.toString());
        this.mNextLv.setText((val + 1).toString());
        this.mNextLv.x = this.width - this.mNextLv.width;
        this.mProgressBar.setRatio(ratio);
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

    setInteractive(shape?: Phaser.Types.Input.InputConfiguration | any) {
        shape = shape || new Phaser.Geom.Rectangle(0, 0, this.width, this.height);
        super.setInteractive(shape, Phaser.Geom.Rectangle.Contains);
        return this;
    }
    protected init(key: string, leftIcon: string, dpr: number) {
        const bg = this.scene.make.image({
            key,
            frame: "strength_bg"
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
            frame: "add_btn"
        });
        this.setSize(bg.width, bg.height);
        left.x = -this.width * this.originX + 10 * dpr;
        this.mAddBtn.x = this.width * this.originX - 10 * dpr;
        this.mAddBtn.y = 6 * dpr;
        // this.mText.x = this.width / 2
        this.mText.y = (this.height - this.mText.height) / 2;
        this.add([bg, this.mProgress, left, this.mText, this.mAddBtn]);
        this.mAddBtn.visible = false;
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
