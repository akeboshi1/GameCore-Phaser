import { Button, ClickEvent } from "apowophaserui";
import { ButtonEventDispatcher, ProgressMaskBar, ToggleColorButton } from "gamecoreRender";
import { UIAtlasName } from "../../../res";
import { Handler, i18n, UIHelper } from "utils";
import { ItemButton } from "..";
import { ICountablePackageItem, IGalleryCombination } from "../../../structure";
import { PicaNewIllustratedGalleryPanel } from "./PicaNewIllustratedGalleryPanel";
import { PicaIllustredCollectPanel } from "./PicaNewIllustredCollectPanel";
import { CommonBackground } from "..";
export class PicaNewIllustratedDetailPanel extends Phaser.GameObjects.Container {
    private mBackground: CommonBackground;
    private acquire: ButtonEventDispatcher;
    private acquireTex: Phaser.GameObjects.Text;
    private acquireImg: Phaser.GameObjects.Image;
    private horProgress: ProgressMaskBar;
    private rewardImgs: Phaser.GameObjects.Image[];
    private progressTex: Phaser.GameObjects.Text;
    private curToggle: ToggleColorButton;
    private topCon: Phaser.GameObjects.Container;
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

    setGallaryData(content: any, combinations: IGalleryCombination[]) { // op_client.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_UPDATE_GALLERY
        if (!content && !combinations) return;
        this.galleryData = content;
        this.combinations = combinations;
        if (this.optionType === 1) {
            if (content) {
                this.setHorRewardsStatus(content.reward1Progress, content.reward1Max);
                if (content.reward2Max === -1) {
                    content.reward2Max = content.reward2Progress;
                    this.acquire.enable = false;
                } else {
                    if (content.reward2Progress >= content.reward2Max) {
                        this.acquire.enable = true;
                    } else {
                        this.acquire.enable = false;
                    }
                }
                this.acquireTex.text = `${content.reward2Progress}/${content.reward2Max}`;
                this.acquireImg.setFrame("illustrate_survey_badge" + content.reward2NextIndex);
                this.levelButton.setText(content.reward1NextIndex + "");
                this.galleryPanel.setGallaryData(content);
            }
        } else if (this.optionType === 2) {
            this.collectPanel.setCombinationData(combinations);
        }
    }
    setHorRewardsStatus(reward1Progress, reward1Max) {
        if (reward1Max === -1) {
            reward1Max = reward1Progress;
            this.levelButton.disInteractive();
        } else {
            if (reward1Progress >= reward1Max) {
                this.levelButton.setInteractive();
            } else {
                this.levelButton.disInteractive();
            }
        }
        this.horProgress.setProgress(reward1Progress, reward1Max);
        this.progressTex.setText(`${reward1Progress} / ${reward1Max}`);
        const tempcount = Math.floor((reward1Progress / reward1Max) * 3 + 0.01);
        for (let i = 0; i < this.rewardImgs.length; i++) {
            if (i <= tempcount) this.rewardImgs[i].setFrame("illustrate_survey_lv_reward");
            else this.rewardImgs[i].setFrame("illustrate_survey_lv_reward_1");
        }
    }

    setDoneMissionList(list: number[]) {
        if (this.collectPanel) this.collectPanel.setDoneMissionList(list);
    }
    setRedsState(reds: number[]) {
        this.redMap.forEach((value, key) => {
            value.visible = reds.indexOf(key) !== -1;
        });
    }
    init() {
        this.mBackground = new CommonBackground(this.scene, 0, 0, this.width, this.height, UIAtlasName.illustrate_new, "illustrate_survey_bg", 0xc3dff4);
        const bg2 = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_survey_bg_veins" });
        bg2.y = -this.height * 0.5 + bg2.height * 0.5;
        this.mBackground.add(bg2);
        this.add(this.mBackground);
        this.topCon = this.scene.make.container(undefined, false);
        this.topCon.setSize(this.width, 100 * this.dpr);
        this.acquire = new ButtonEventDispatcher(this.scene, 0, 0, true);
        this.acquire.setSize(42 * this.dpr, 38 * this.dpr);
        this.acquire.enable = true;
        this.acquire.on(ClickEvent.Tap, this.onAcquireRewardsHandler, this);
        this.acquireImg = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_survey_badge1" });
        this.acquireTex = this.scene.make.text({ style: UIHelper.whiteStyle(this.dpr, 10) }).setOrigin(0.5);
        this.acquireTex.setStroke("#26365A", 2 * this.dpr);
        this.acquireTex.y = this.acquireImg.y + this.acquireImg.height * 0.5 + 3 * this.dpr;
        this.acquire.add([this.acquireImg, this.acquireTex]);
        this.acquire.x = this.topCon.width * 0.5 - this.acquire.width * 0.5 - 20 * this.dpr;
        this.acquire.y = -this.topCon.height * 0.5 + this.acquire.height * 0.5 + 15 * this.dpr;
        this.toggleCon = this.scene.make.container(undefined, false);
        this.selectLine = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_nav_select" });
        this.toggleCon.add(this.selectLine);
        this.toggleCon.y = 0;
        this.horProgress = new ProgressMaskBar(this.scene, UIAtlasName.illustrate_new, "illustrate_survey_lv_bottom", "illustrate_survey_lv_top", UIHelper.whiteStyle(this.dpr, 6));
        this.horProgress.y = this.toggleCon.y + this.toggleCon.height * 0.5 + 50 * this.dpr;
        this.horProgress.x = -5 * this.dpr;
        this.createRewardImgs();
        this.levelButton = new Button(this.scene, UIAtlasName.illustrate_new, "illustrate_survey_lv_icon", "illustrate_survey_lv_icon", "", undefined, this.dpr, this.zoom);
        this.levelButton.setFontStyle("bold");
        this.levelButton.setTextStyle(UIHelper.whiteStyle(this.dpr, 15));
        this.levelButton.x = this.horProgress.x - this.horProgress.width * 0.5 - this.levelButton.width * 0.5 - 8 * this.dpr;
        this.levelButton.y = this.horProgress.y;
        this.levelButton.on(ClickEvent.Tap, this.onHorRewardsHandler, this);
        this.progressTex = this.scene.make.text(UIHelper.whiteStyle(this.dpr)).setOrigin(0, 0.5);
        this.progressTex.setFontStyle("bold");
        this.progressTex.x = this.horProgress.x + this.horProgress.width * 0.5 + 5 * this.dpr;
        this.progressTex.y = this.horProgress.y;
        this.topCon.add([this.acquire, this.horProgress, this.levelButton, this.progressTex]);
        this.createOptionButtons();
        const tableHeight = this.height * 0.5 - this.topCon.y - this.topCon.height * 0.5;
        this.galleryPanel = new PicaNewIllustratedGalleryPanel(this.scene, this.width - 20 * this.dpr, tableHeight - 23 * this.dpr, this.dpr, this.zoom);
        this.collectPanel = new PicaIllustredCollectPanel(this.scene, this.width, tableHeight - 13 * this.dpr, this.dpr, this.zoom);
        this.galleryPanel.setHandler(new Handler(this, this.onCollectHandler));
        this.collectPanel.setHandler(new Handler(this, this.onCollectHandler));
        this.collectPanel.visible = false;
        this.galleryPanel.visible = false;
        this.add([this.topCon, this.toggleCon, this.galleryPanel, this.collectPanel]);
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
        }
        this.selectLine.y = 20 * this.dpr;
    }
    protected createRewardImgs() {
        const posy = this.horProgress.y - 15 * this.dpr;
        const interval = 84 * this.dpr;
        for (let i = 0; i < 3; i++) {
            const img = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_survey_lv_reward_1" });
            img.y = posy;
            img.x = interval * (i + 1);
            this.rewardImgs.push(img);
            this.topCon.add(img);
        }
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
            this.setGallaryData(this.galleryData, this.combinations);
        }
    }

    private layoutOption(type: number) {
        let tableHeight = this.height * 0.5 - this.topCon.y - this.topCon.height * 0.5;
        let offsetY = 30 * this.dpr;
        if (type === 1) {
            this.topCon.visible = true;
            tableHeight -= 23 * this.dpr;
            offsetY = 30 * this.dpr;
            this.collectPanel.visible = false;
            this.galleryPanel.visible = true;
            const posy = this.topCon.y + this.topCon.height * 0.5 + tableHeight * 0.5 + offsetY;
            this.galleryPanel.y = posy;
            this.galleryPanel.resize(this.width - 20 * this.dpr, tableHeight);
        } else if (type === 2) {
            this.topCon.visible = false;
            tableHeight += 40 * this.dpr;
            offsetY = -10 * this.dpr;
            this.galleryPanel.visible = false;
            this.collectPanel.visible = true;
            const posy = this.topCon.y + this.topCon.height * 0.5 + tableHeight * 0.5 + offsetY;
            this.collectPanel.y = posy;
            this.collectPanel.resize(this.width, tableHeight);
        }
    }
    private onHorRewardsHandler() {
        if (this.send) this.send.runWith(["rewards", 1]);
    }

    private onAcquireRewardsHandler() {
        if (this.send) this.send.runWith(["rewards", 2]);
    }
    private onSelectItemHandler(cell: any) {
        // if (this.curSelectItem) this.curSelectItem.select = true;
        cell.showTips();
    }

    private onCollectHandler(tag: string, data: any) {
        if (this.send) this.send.runWith([tag, data]);
    }

    private onGalleryHandler(tag: string, data: any) {
        if (this.send) this.send.runWith([tag, data]);
    }
}
