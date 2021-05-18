import { Button, ClickEvent } from "apowophaserui";
import { ButtonEventDispatcher, ProgressMaskBar, ToggleColorButton } from "gamecoreRender";
import { UIAtlasName } from "../../../res";
import { Handler, i18n, UIHelper } from "utils";
import { ItemButton, UITools } from "..";
import { ICountablePackageItem, IGalleryCombination, IUpdateGalleryDatas } from "../../../structure";
import { PicaNewIllustratedGalleryPanel } from "./PicaNewIllustratedGalleryPanel";
import { PicaIllustredCollectPanel } from "./PicaNewIllustredCollectPanel";
import { CommonBackground } from "..";
export class PicaNewIllustratedDetailPanel extends Phaser.GameObjects.Container {
    private mBackground: CommonBackground;
    private backButton: ButtonEventDispatcher;
    private badgeButton: ButtonEventDispatcher;
    private collectedButton: Button;
    private badgeTex: Phaser.GameObjects.Text;
    private badgeImg: Phaser.GameObjects.Image;
    private horProgress: ProgressMaskBar;
    private rewardImgs: Phaser.GameObjects.Image[];
    private progressTex: Phaser.GameObjects.Text;
    private curToggle: ToggleColorButton;
    private topCon: Phaser.GameObjects.Container;
    private galleryCon: Phaser.GameObjects.Container;
    private toggleCon: Phaser.GameObjects.Container;
    private selectLine: Phaser.GameObjects.Image;
    private levelButton: Button;
    private galleryPanel: PicaNewIllustratedGalleryPanel;
    private collectPanel: PicaIllustredCollectPanel;
    private dpr: number;
    private zoom: number;
    private send: Handler;
    private optionType: number;
    private galleryData: any;
    private combinations: IGalleryCombination[];
    private minit: boolean = false;
    private redMap: Map<number, Phaser.GameObjects.Image> = new Map();
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.init();
        this.setInteractive();
    }
    resize(width?: number, height?: number) {
        const w = width || this.width;
        const h = height || this.height;
        this.backButton.x = -this.width * 0.5 + this.backButton.width * 0.5 -5 * this.dpr;
        this.backButton.y = -this.height * 0.5 + 45 * this.dpr;
        const topOffset = 20 * this.dpr;
        this.topCon.y = -this.height * 0.5 + this.topCon.height * 0.5 + topOffset;
        this.toggleCon.y = this.topCon.y;
        this.horProgress.refreshMask();
        this.setSize(w, h);
        this.layoutOption(this.optionType);
        this.minit = true;
    }

    setHandler(send: Handler) {
        this.send = send;
    }
    setGallaryData(content: IUpdateGalleryDatas) {
        if (!content) return;
        this.galleryData = content;
        if (this.optionType === 1) {
            if (content) {
                this.setHorRewardsStatus(content.galleryExp, content.nextLevelExp, content.beforeExp);
                this.badgeTex.text = `${content.badgeExp}/${content.badgePresentLevelexp}`;
                const badgeInex = content.badgeLevel < 5 ? content.badgeLevel : 4;
                this.badgeImg.setFrame("illustrate_survey_badge" + badgeInex);
                this.levelButton.setText(content.galleryLevel + "");
                this.galleryPanel.setGallaryData(content);
            }
        }
    }
    setDisplayCollectDatas(combinations: IGalleryCombination[]) {
        this.combinations = combinations;
        if (this.optionType === 2) {
            this.collectPanel.setCombinationData(combinations);
        }
    }
    setHorRewardsStatus(galleryExp, nextLevelExp, beforeExp) {
        const hasExp = galleryExp - beforeExp, maxExp = nextLevelExp - beforeExp;
        this.horProgress.setProgress(hasExp, maxExp);
        this.progressTex.setText(`${galleryExp} / ${nextLevelExp}`);
        const tempcount = Math.floor((hasExp / maxExp) * 3 + 0.01);
        for (let i = 0; i < this.rewardImgs.length; i++) {
            if (i + 1 <= tempcount) {
                this.rewardImgs[i].setFrame("illustrate_survey_lv_reward");
            } else {
                this.rewardImgs[i].setFrame("illustrate_survey_lv_reward_1");
            }
        }
    }

    setRedsState(reds: number[]) {
        this.redMap.forEach((value, key) => {
            value.visible = reds.indexOf(key) !== -1;
        });
    }
    setAutoOption(option: number) {
        for (const obj of this.toggleCon.list) {
            if (obj.getData("item") === option) {
                this.onToggleButtonHandler(undefined, <any>obj);
            }
        }
    }
    init() {
        this.mBackground = new CommonBackground(this.scene, 0, 0, this.width, this.height, UIAtlasName.illustrate_new, "illustrate_survey_bg", 0xc3dff4);
        const bg2 = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_survey_bg_veins" });
        bg2.y = -this.height * 0.5 + bg2.height * 0.5;
        this.mBackground.add(bg2);
        this.add(this.mBackground);
        this.backButton = UITools.createBackButton(this.scene, this.dpr, this.onBackHandler, this);
        this.topCon = this.scene.make.container(undefined, false);
        this.topCon.setSize(this.width, 100 * this.dpr);
        this.galleryCon = this.scene.make.container(undefined, false);
        this.badgeButton = new ButtonEventDispatcher(this.scene, 0, 0, true);
        this.badgeButton.setSize(60 * this.dpr, 60 * this.dpr);
        this.badgeButton.enable = true;
        this.badgeButton.on(ClickEvent.Tap, this.onBadgeRewardsHandler, this);
        this.badgeImg = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_survey_badge1" });
        this.badgeTex = this.scene.make.text({ style: UIHelper.whiteStyle(this.dpr, 10) }).setOrigin(0.5);
        this.badgeTex.setFontStyle("bold");
        this.badgeTex.setStroke("#26365A", 2 * this.dpr);
        this.badgeTex.y = this.badgeImg.y + this.badgeImg.height * 0.5 - 5 * this.dpr;
        this.badgeButton.add([this.badgeImg, this.badgeTex]);
        this.badgeButton.x = this.topCon.width * 0.5 - this.badgeButton.width * 0.5 - 10 * this.dpr;
        this.badgeButton.y = -this.topCon.height * 0.5 + this.badgeButton.height * 0.5 + 5 * this.dpr;
        this.redMap.set(RedType.badgeLevel, this.creatRedImge(this.scene, this.badgeButton, false));
        this.toggleCon = this.scene.make.container(undefined, false);
        this.selectLine = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_nav_select" });
        this.toggleCon.add(this.selectLine);
        this.toggleCon.y = 0;
        this.horProgress = new ProgressMaskBar(this.scene, UIAtlasName.illustrate_new, "illustrate_survey_lv_bottom", "illustrate_survey_lv_top", UIHelper.whiteStyle(this.dpr, 6));
        this.horProgress.y = this.toggleCon.y + this.toggleCon.height * 0.5 + 50 * this.dpr;
        this.horProgress.x = 15 * this.dpr;
        this.createRewardImgs();
        this.levelButton = new Button(this.scene, UIAtlasName.illustrate_new, "illustrate_survey_lv_icon", "illustrate_survey_lv_icon", "1", undefined, this.dpr, this.zoom);
        this.levelButton.setFontStyle("bold");
        this.levelButton.setTextStyle(UIHelper.whiteStyle(this.dpr, 15));
        this.levelButton.x = this.horProgress.x - this.horProgress.width * 0.5 - this.levelButton.width * 0.5 - 8 * this.dpr;
        this.levelButton.y = this.horProgress.y;
        this.redMap.set(RedType.expLevel, this.creatRedImge(this.scene, this.levelButton));
        this.levelButton.on(ClickEvent.Tap, this.onHorRewardsHandler, this);
        this.progressTex = this.scene.make.text({ style: UIHelper.whiteStyle(this.dpr) }).setOrigin(0.5);
        this.progressTex.setFontStyle("bold");
        this.progressTex.x = this.horProgress.x;
        this.progressTex.y = this.horProgress.y + 6 * this.dpr;
        const levelCon = new ButtonEventDispatcher(this.scene, 0, this.levelButton.y);
        levelCon.y = this.levelButton.y;
        levelCon.setSize(260 * this.dpr, 30 * this.dpr);
        levelCon.enable = true;
        levelCon.on(ClickEvent.Tap, this.onHorRewardsHandler, this);
        this.galleryCon.add([this.badgeButton, this.horProgress, levelCon, this.levelButton, this.progressTex]);
        this.collectedButton = new Button(this.scene, UIAtlasName.illustrate_new, "illustrate_collect_badge", "illustrate_collect_badge", undefined, this.dpr, this.zoom);
        this.collectedButton.on(ClickEvent.Tap, this.onCollectedHandler, this);
        this.collectedButton.x = this.badgeButton.x;
        this.collectedButton.y = this.badgeButton.y;
        this.topCon.add([this.galleryCon, this.collectedButton]);
        this.createOptionButtons();
        const tableHeight = this.height * 0.5 - this.topCon.y - this.topCon.height * 0.5;
        this.galleryPanel = new PicaNewIllustratedGalleryPanel(this.scene, this.width - 20 * this.dpr, tableHeight - 23 * this.dpr, this.dpr, this.zoom);
        this.collectPanel = new PicaIllustredCollectPanel(this.scene, this.width, tableHeight - 13 * this.dpr, this.dpr, this.zoom);
        this.galleryPanel.setHandler(new Handler(this, this.onCollectHandler));
        this.collectPanel.setHandler(new Handler(this, this.onCollectHandler));
        this.collectPanel.hide();
        this.galleryPanel.hide();
        this.add([this.backButton, this.topCon, this.toggleCon, this.galleryPanel, this.collectPanel]);
        this.resize();
    }
    protected createOptionButtons() {
        const arr = [{ text: i18n.t("illustrate.title"), type: 1 }, { text: i18n.t("illustrate.collect"), type: 2 }];
        const allLin = 120 * this.dpr;
        const cellwidth = allLin / arr.length;
        const cellHeight = 20 * this.dpr;
        let posx = -allLin / 2;
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < arr.length; i++) {
            const data = arr[i];
            const item = new ToggleColorButton(this.scene, cellwidth, 20 * this.dpr, this.dpr, data.text, UIHelper.colorStyle("#ffffff", 14 * this.dpr));
            item.on(ClickEvent.Tap, this.onToggleButtonHandler, this);
            item.x = posx + cellwidth * 0.5;
            item.setData("item", data.type);
            item.setSize(cellwidth, cellHeight);
            this.toggleCon.add(item);
            item.setChangeColor("#FFF449");
            item.setNormalColor("#ffffff");
            item.setFontStyle("bold");
            posx += cellwidth;
            if (!this.curToggle) {
                this.onToggleButtonHandler(undefined, item);
            }
            const redType = i === 0 ? RedType.galley : RedType.collect;
            this.redMap.set(redType, this.creatRedImge(this.scene, item, false));
        }
        this.selectLine.y = 20 * this.dpr;
    }
    protected createRewardImgs() {
        this.rewardImgs = [];
        const horWidth = this.horProgress.width;
        const posy = this.horProgress.y - 15 * this.dpr;
        const posx = -horWidth * 0.5 + this.horProgress.x;
        const interval = horWidth / 3;
        for (let i = 0; i < 3; i++) {
            const img = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_survey_lv_reward_1" });
            img.y = posy;
            img.x = posx + interval * (i + 1) + (i === 2 ? -10 * this.dpr : 0);
            this.rewardImgs.push(img);
            this.galleryCon.add(img);
        }
    }

    protected creatRedImge(scene: Phaser.Scene, parent: Phaser.GameObjects.Container, left: boolean = true) {
        const red = scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_survey_lv_prompt_s" });
        red.x = left ? -parent.width * 0.5 + red.width * 0.5 : parent.width * 0.5 - red.width * 0.5;
        red.y = -parent.height * 0.5 + red.height * 0.5;
        parent.add(red);
        red.visible = false;
        return red;
    }

    private onToggleButtonHandler(pointer: any, toggle: ToggleColorButton) {
        if (this.curToggle === toggle) return;
        if (this.curToggle) {
            this.curToggle.isOn = false;
        }
        toggle.isOn = true;
        this.curToggle = toggle;
        this.optionType = toggle.getData("item");
        this.selectLine.x = toggle.x;
        if (this.minit) {
            this.layoutOption(this.optionType);
            if (this.optionType === 1) {
                this.setGallaryData(this.galleryData);

            } else if (this.optionType === 2) {
                if (this.send) this.send.runWith("displaycollect");
            }
        }
    }

    private layoutOption(type: number) {
        let tableHeight = this.height * 0.5 - this.topCon.y - this.topCon.height * 0.5;
        if (type === 1) {
            this.galleryCon.visible = true;
            this.collectedButton.visible = false;
            tableHeight -= 23 * this.dpr;
            this.collectPanel.hide();
            this.galleryPanel.show();
            const posy = this.topCon.y + this.topCon.height * 0.5 + tableHeight * 0.5 + 20 * this.dpr;
            this.galleryPanel.y = posy;
            this.galleryPanel.resize(this.width, tableHeight);
        } else if (type === 2) {
            this.galleryCon.visible = false;
            this.collectedButton.visible = true;
            tableHeight += 40 * this.dpr;
            this.galleryPanel.hide();
            this.collectPanel.show();
            const posy = this.topCon.y + this.topCon.height * 0.5 + tableHeight * 0.5 - 10 * this.dpr;
            this.collectPanel.y = posy;
            this.collectPanel.resize(this.width, tableHeight);
        }
    }
    private onHorRewardsHandler() {
        if (this.send) this.send.runWith("showlevelrewards");
    }

    private onBadgeRewardsHandler() {
        if (this.send) this.send.runWith("badgerewards");
    }
    private onSelectItemHandler(cell: any) {
        // if (this.curSelectItem) this.curSelectItem.select = true;
        cell.showTips();
    }

    private onCollectHandler(tag: string, data: any) {
        if (this.send) this.send.runWith([tag, data]);
    }

    private onCollectedHandler() {
        if (this.send) this.send.runWith("showalreadycollected");
    }
    private onBackHandler() {
        if (this.send) this.send.runWith("close");
    }

}

enum RedType {
    expLevel = 9,
    badgeLevel = 11,
    galley = 2,
    collect = 10
}
