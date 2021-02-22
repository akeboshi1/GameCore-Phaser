
import { op_client, op_pkt_def, op_def } from "pixelpai_proto";
import { NineSlicePatch, Button, GameScroller, NineSliceButton, ClickEvent, ProgressBar } from "apowophaserui";
import { BasePanel, ButtonEventDispatcher, DynamicImage, ImageValue, ItemInfoTips, ProgressMaskBar, UiManager } from "gamecoreRender";
import { ModuleName } from "structure";
import { UIAtlasKey, UIAtlasName } from "picaRes";
import { Font, Handler, i18n, UIHelper, Url } from "utils";
import { IJob } from "src/pica/structure/ijob";
import { ICountablePackageItem } from "picaStructure";
export class PicaWorkPanel extends BasePanel {
    private bg: Phaser.GameObjects.Image;
    private titleName: Phaser.GameObjects.Text;
    private closeBtn: Button;
    private headIcon: DynamicImage;
    private content: Phaser.GameObjects.Container;
    private workbutton: ProgressItem;
    private salaryLabel: Phaser.GameObjects.Text;
    private salaryvalue: ImageValue;
    private itemtips: ItemInfoTips;
    private starSprite: Phaser.GameObjects.Sprite;
    private moneySprite: Phaser.GameObjects.Sprite;
    private jobData: IJob;
    private imageValues: PointerImageValue[] = [];
    private curProgress = 0;
    private isWorking: boolean = false;
    private interTimeerID: any;
    private moneyAniKey: string = "workemoeny";
    private starAniKey: string = "workstar";
    constructor(uiManager: UiManager) {
        super(uiManager.scene, uiManager.render);
        this.key = ModuleName.PICAWORK_NAME;
    }
    resize(width?: number, height?: number) {
        const w: number = this.scaleWidth;
        const h: number = this.scaleHeight;
        super.resize(w, h);
        this.setSize(w, h);
        this.content.x = w * 0.5;
        this.content.y = h - this.content.height * 0.5;
        this.content.setInteractive();
    }

    public show(param?: any) {
        this.mShowData = param;
        if (this.mPreLoad) return;
        if (!this.mInitialized) {
            this.preload();
            return;
        }
        if (this.mShow) return;
        if (this.soundGroup && this.soundGroup.open) this.playSound(this.soundGroup.open);
        if (!this.mTweening && this.mTweenBoo) {
            this.showTween(true);
        } else {
            this.mShow = true;
        }
        this.addListen();
        this.render.renderEmitter(this.key + "_initialized");
    }

    public addListen() {
        if (!this.mInitialized) return;
        this.closeBtn.on("pointerup", this.OnClosePanel, this);
    }

    public removeListen() {
        if (!this.mInitialized) return;
        this.closeBtn.off("pointerup", this.OnClosePanel, this);
    }

    destroy() {
        super.destroy();
    }

    preload() {
        this.addAtlas(this.key, "work/work.png", "work/work.json");
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.textureUrl(UIAtlasName.commonUrl), UIAtlasName.jsonUrl(UIAtlasName.commonUrl));
        this.addAtlas(UIAtlasKey.common2Key, UIAtlasName.textureUrl(UIAtlasName.common2Url), UIAtlasName.jsonUrl(UIAtlasName.common2Url));
        super.preload();
    }
    init() {
        const conWdith = this.scaleWidth;
        const conHeight = 153 * this.dpr;
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(conWdith, conHeight);
        this.add(this.content);
        this.bg = this.scene.make.image({ key: this.key, frame: "work_bg" });
        this.bg.y = conHeight * 0.5 - this.bg.height * 0.5;
        this.headIcon = new DynamicImage(this.scene, 0, 0, this.key, "work_npc");
        this.headIcon.x = -conWdith * 0.5 + 65 * this.dpr;
        this.headIcon.y = -5 * this.dpr;
        this.headIcon.scale = this.dpr;
        this.headIcon.visible = false;
        const namebg = new NineSlicePatch(this.scene, 0, 0, 95 * this.dpr, 24 * this.dpr, this.key, "work_name", {
            left: 14 * this.dpr,
            top: 0 * this.dpr,
            bottom: 0 * this.dpr,
            right: 14 * this.dpr,
        });
        namebg.x = -conWdith * 0.5 + namebg.width * 0.5 + 15 * this.dpr;
        namebg.y = 35 * this.dpr;
        this.titleName = this.scene.make.text({ x: namebg.x, y: namebg.y, text: "这是额二比大厨师", style: { color: "#FFE11A", fontSize: 11 * this.dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5);
        this.salaryLabel = this.scene.make.text({ x: -conWdith * 0.5 + 20 * this.dpr, y: this.bg.y + 7 * this.dpr, text: i18n.t("work.salary") + ":", style: UIHelper.whiteStyle(this.dpr, 11) });
        this.salaryLabel.setOrigin(0, 0.5);
        this.salaryvalue = new ImageValue(this.scene, 60 * this.dpr, 20 * this.dpr, UIAtlasKey.commonKey, "iv_coin", this.dpr);
        this.salaryvalue.setOffset(-this.dpr, 0);
        this.salaryvalue.setTextStyle({ color: "#FFEA00" });
        this.salaryvalue.setLayout(1);
        this.salaryvalue.x = this.salaryLabel.x + this.salaryLabel.width + this.salaryvalue.width * 0.5 + 3 * this.dpr;
        this.salaryvalue.y = this.salaryLabel.y;
        this.workbutton = new ProgressItem(this.scene, 132 * this.dpr, 35 * this.dpr, this.key, "progress_top", i18n.t("work.title"), this.dpr);
        this.workbutton.x = 30 * this.dpr;
        this.workbutton.y = 5 * this.dpr;
        this.workbutton.on(ClickEvent.Tap, this.onSendHandler, this);
        this.starSprite = this.createSprite(this.key, this.starAniKey, "star", [1, 30], 24);
        this.moneySprite = this.createSprite(this.key, this.moneyAniKey, "workover", [1, 10], 24);
        this.starSprite.x = this.workbutton.x;
        this.starSprite.y = this.workbutton.y;
        this.moneySprite.x = this.starSprite.x;
        this.moneySprite.y = this.starSprite.y;
        this.closeBtn = new Button(this.scene, this.key, "close", "close");
        this.closeBtn.y = this.bg.y + 2 * this.dpr;
        this.closeBtn.x = this.content.width * 0.5 - this.closeBtn.width * 0.5 - 10 * this.dpr;
        this.itemtips = new ItemInfoTips(this.scene, 150 * this.dpr, 46 * this.dpr, UIAtlasKey.common2Key, "tips_bg", this.dpr);
        this.itemtips.setVisible(false);
        this.content.add([this.headIcon, this.bg, this.closeBtn, namebg, this.titleName, this.salaryLabel, this.salaryvalue, this.workbutton, this.starSprite, this.moneySprite, this.closeBtn, this.itemtips]);
        this.resize();
        super.init();
        this.render.renderEmitter(this.key + "_questlist");
    }

    public setWorkData(jobData: IJob) {
        this.setJobData(jobData);
        this.workbutton.setProgressDatas(0, 100);
    }

    public setWorkChance(count: number) {
        if (count <= 0) this.workbutton.disInteractive();
        else this.workbutton.setInteractive();
    }

    public setJobData(data: IJob) {
        this.jobData = data;
        // const url = Url.getOsdRes(data.display.texturePath);
        // this.headIcon.load(url, this, () => {
        //     this.headIcon.scale = this.dpr;
        // });
        this.headIcon.visible = true;
        this.titleName.text = data.name;
        let rewardTex = "0";
        if (data.rewards) {
            const countRange = data.rewards[0].countRange;
            rewardTex = `${countRange[0]}~${countRange[1]}`;
        }
        this.salaryvalue.setText(rewardTex);
        for (const item of this.imageValues) {
            item.visible = false;
        }

        const matrr = data.requirements;
        let posx = this.salaryvalue.x + this.salaryvalue.width * 0.5 + 20 * this.dpr;
        for (let i = 0; i < matrr.length; i++) {
            let item: PointerImageValue;
            const tempdata = matrr[i];
            if (i < this.imageValues.length) {
                item = this.imageValues[i];
            } else {
                item = new PointerImageValue(this.scene, 35 * this.dpr, 15 * this.dpr, this.key, this.dpr);
                this.content.add(item);
                this.imageValues.push(item);
                item.setHandler(new Handler(this, this.onItemInfoTips));
            }
            const tempurl = Url.getOsdRes((<any>tempdata).texturePath);
            item.setUrlValue(tempurl, tempdata.count);
            item.setTextStyle({ color: (tempdata.count >= tempdata.count ? "#000000" : "#E71313") });
            item.setImageData(tempdata);
            item.visible = true;
            item.x = posx + item.width * 0.5;
            item.y = this.salaryLabel.y;
            item.visible = true;
            posx += item.width + 20 * this.dpr;
        }
    }

    private createSprite(key: string, animkey: string, frame: string, indexs: number[], frameRate: number = 30, repeat = 0, compl?: Handler) {
        const sprite = this.scene.make.sprite({ key, frame: frame + "1" });
        sprite.visible = false;
        const anima: any = this.scene.anims.create({ key: animkey, frames: this.scene.anims.generateFrameNames(key, { prefix: frame + "", start: indexs[0], end: indexs[1] }), frameRate, repeat });
        anima.removeAllListeners();
        anima.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            sprite.visible = false;
            if (compl) compl.run();
        }, this);
        anima.on(Phaser.Animations.Events.ANIMATION_START, () => {
            sprite.visible = true;
        }, this);
        return sprite;
    }
    private calculateTimeout() {
        this.isWorking = true;
        this.interTimeerID = setTimeout(() => {
            this.curProgress += 0.1;
            this.workbutton.setProgressDatas(this.curProgress, 100);
            if (this.curProgress < 100) {
                this.calculateTimeout();
            } else {
                this.isWorking = false;
                this.curProgress = 0;
                this.workbutton.setProgressDatas(this.curProgress, 100);
                this.render.renderEmitter(this.key + "_questwork", this.jobData.id);
                this.interTimeerID = undefined;
                this.moneySprite.play(this.moneyAniKey);
            }
        }, 20);
    }
    private OnClosePanel() {
        if (this.interTimeerID) clearTimeout(this.interTimeerID);
        this.render.renderEmitter(this.key + "_hide");
    }
    private onSendHandler(id: string) {
        this.curProgress += 3;
        if (!this.isWorking) this.calculateTimeout();
        this.starSprite.play(this.starAniKey, true);
    }

    private onItemInfoTips(item: PointerImageValue) {
        const data = item.imageData;
        this.itemtips.visible = true;
        this.itemtips.setTipsPosition(item, this);
        this.itemtips.setText(this.getDesText(data));
    }

    private getDesText(data: ICountablePackageItem) {
        if (!data) data = <any>{ "sellingPrice": true, tradable: false };
        const text: string = i18n.t("work.attri", { "name": `${data.name}`, "value": data.neededCount });
        return text;
    }
}

class PointerImageValue extends ImageValue {
    public imageData: ICountablePackageItem;
    protected icon: DynamicImage;
    private tipsHandler: Handler;
    public constructor(scene: Phaser.Scene, width: number, height: number, key: string, dpr: number) {
        super(scene, width, height, key, undefined, dpr);
        this.addListen();
    }

    public setImageData(data: ICountablePackageItem) {
        this.imageData = data;
    }
    public setUrlValue(url, value) {
        this.value.text = value;
        this.icon.load(url, this, () => {
            this.icon.scale = 1;
            this.icon.scaleY = 14 * this.dpr / this.icon.displayHeight;
            this.icon.scaleX = this.icon.scaleY;
            this.value.x = this.icon.x + this.icon.displayWidth * 0.5 + 10 * this.dpr;
            this.resetSize();
        });
    }
    public addListen() {
        this.setInteractive();
        this.on("pointerdown", this.onClickDownHandler, this);
        this.scene.input.on("pointerup", this.onClickUpHandler, this);
    }

    public removeListen() {
        this.disableInteractive();
        this.off("pointerdown", this.onClickDownHandler, this);
        this.scene.input.off("pointerup", this.onClickUpHandler, this);
    }

    destroy(fromScene?: boolean) {
        this.removeListen();
        super.destroy(fromScene);
    }
    public setHandler(tips: Handler) {
        this.tipsHandler = tips;
    }
    protected create() {
        this.icon = new DynamicImage(this.scene, 0, 0);
        this.value = this.scene.make.text({ x: 0, y: this.offset.y, text: "10", style: { color: "#ffffff", fontSize: 11 * this.dpr, fontFamily: Font.DEFULT_FONT } });
        this.value.setOrigin(0, 0.5);
        this.add([this.icon, this.value]);
    }
    private onClickDownHandler() {
        const pos = new Phaser.Geom.Point();
        if (this.tipsHandler) this.tipsHandler.runWith([this, true]);
    }

    private onClickUpHandler() {
        if (this.tipsHandler) this.tipsHandler.runWith([this, false]);
    }
}

class ProgressItem extends ButtonEventDispatcher {
    private key: string;
    private progress: ProgressMaskBar;
    private title: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, frame: string, title: string, dpr: number) {
        super(scene, 0, 0);
        this.setSize(width, height);
        this.dpr = dpr;
        this.key = key;
        this.progress = new ProgressMaskBar(scene, key, "progress_bottom", "progress_top");
        this.add(this.progress);
        this.title = scene.make.text({ x: 0, y: 0, text: title, style: { color: "#512103", fontSize: 14 * dpr, fontFamily: Font.DEFULT_FONT } });
        this.title.setFontStyle("bold");
        this.title.setOrigin(0.5);
        this.add(this.title);
        this.enable = true;
        this.mDuration = 35;
    }

    public setProgressDatas(value: number, max: number) {
        this.progress.setProgress(value, max);
    }
}
