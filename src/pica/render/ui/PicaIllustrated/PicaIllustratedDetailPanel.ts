import { GameGridTable, Button, ClickEvent } from "apowophaserui";
import { AlignmentType, AxisType, ButtonEventDispatcher, CommonBackground, ConstraintType, GridLayoutGroup, ProgressMaskBar, ToggleColorButton } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { Font, Handler, i18n, Tool, UIHelper, Url } from "utils";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { ItemButton } from "picaRender";
import { ICountablePackageItem, IGalleryCombination } from "picaStructure";
import { PicaIllustratedGalleryPanel } from "./PicaIllustratedGalleryPanel";
import { PicaIllustredCollectPanel } from "./PicaIllustredCollectPanel";
export class PicaIllustratedDetailPanel extends Phaser.GameObjects.Container {
    private bg: CommonBackground;
    private acquire: ButtonEventDispatcher;
    private acquireTex: Phaser.GameObjects.Text;
    private acquireImg: Phaser.GameObjects.Image;
    private horProgress: ProgressMaskBar;
    private horRewards: Button;
    private curToggle: ToggleColorButton;
    private topCon: Phaser.GameObjects.Container;
    private toggleCon: Phaser.GameObjects.Container;
    private selectLine: Phaser.GameObjects.Image;
    private horLevelTex: Phaser.GameObjects.Text;
    private levelBg: Phaser.GameObjects.Image;
    private galleryPanel: PicaIllustratedGalleryPanel;
    private collectPanel: PicaIllustredCollectPanel;
    private dpr: number;
    private zoom: number;
    private send: Handler;
    private optionType: number;
    private galleryData: any;
    private combinations: IGalleryCombination[];
    private minit: boolean = false;
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
                this.horProgress.setProgress(content.reward1Progress, content.reward1Max);
                this.horProgress.setText(`${content.reward1Progress} / ${content.reward1Max}`);
                this.acquireTex.text = `${content.reward2Progress}/${content.reward2Max}`;
                this.horLevelTex.text = content.reward1NextIndex + "";
                this.galleryPanel.setGallaryData(content);
            }
        } else if (this.optionType === 2) {
            this.collectPanel.setCombinationData(combinations);
        }
    }

    init() {
        this.topCon = this.scene.make.container(undefined, false);
        this.topCon.setSize(this.width, 100 * this.dpr);
        this.acquire = new ButtonEventDispatcher(this.scene, 0, 0, true);
        this.acquire.setSize(42 * this.dpr, 38 * this.dpr);
        this.acquire.enable = true;
        this.acquire.on(ClickEvent.Tap, this.onAcquireRewardsHandler, this);
        this.acquireImg = this.scene.make.image({ key: UIAtlasName.illustrate, frame: "illustrate_badge_icon" });
        this.acquireTex = this.scene.make.text({ style: UIHelper.whiteStyle(this.dpr, 10) }).setOrigin(0.5);
        this.acquireTex.setStroke("#26365A", 2 * this.dpr);
        this.acquireTex.y = this.acquireImg.y + this.acquireImg.height * 0.5 + 3 * this.dpr;
        this.acquire.add([this.acquireImg, this.acquireTex]);
        this.acquire.x = this.topCon.width * 0.5 - this.acquire.width * 0.5 - 20 * this.dpr;
        this.acquire.y = -this.topCon.height * 0.5 + this.acquire.height * 0.5 + 15 * this.dpr;
        this.toggleCon = this.scene.make.container(undefined, false);
        this.selectLine = this.scene.make.image({ key: UIAtlasName.illustrate, frame: "illustrate_nav_select" });
        this.toggleCon.add(this.selectLine);
        this.toggleCon.y = 0;
        this.horProgress = new ProgressMaskBar(this.scene, UIAtlasName.illustrate, "illustrate_survey_lv_bottom", "illustrate_survey_lv_top", UIHelper.whiteStyle(this.dpr, 6));
        this.horProgress.y = this.toggleCon.y + this.toggleCon.height * 0.5 + 50 * this.dpr;
        this.horProgress.x = -5 * this.dpr;
        this.levelBg = this.scene.make.image({ key: UIAtlasName.illustrate, frame: "illustrate_survey_lv_icon" });
        this.levelBg.x = this.horProgress.x - this.horProgress.width * 0.5 - this.levelBg.width * 0.5 - 8 * this.dpr;
        this.levelBg.y = this.horProgress.y;
        this.horLevelTex = this.scene.make.text({ style: UIHelper.whiteStyle(this.dpr, 12) }).setOrigin(0.5);
        this.horLevelTex.setFontStyle("bold");
        this.horLevelTex.x = this.levelBg.x;
        this.horLevelTex.y = this.levelBg.y;
        this.horRewards = new Button(this.scene, UIAtlasName.illustrate, "illustrate_survey_icon", "illustrate_survey_icon");
        this.horRewards.x = this.horProgress.x + this.horProgress.width * 0.5 + 5 * this.dpr + this.horRewards.width * 0.5;
        this.horRewards.y = this.horProgress.y;
        this.horRewards.on(ClickEvent.Tap, this.onHorRewardsHandler, this);
        this.topCon.add([this.acquire, this.toggleCon, this.horProgress, this.levelBg, this.horLevelTex, this.horRewards]);
        this.createOptionButtons();
        const tableHeight = this.height * 0.5 - this.topCon.y - this.topCon.height * 0.5;
        this.galleryPanel = new PicaIllustratedGalleryPanel(this.scene, this.width - 20 * this.dpr, tableHeight - 23 * this.dpr, this.dpr, this.zoom);
        this.collectPanel = new PicaIllustredCollectPanel(this.scene, this.width, tableHeight - 13 * this.dpr, this.dpr, this.zoom);
        this.collectPanel.setHandler(new Handler(this, this.onCollectHandler));
        this.collectPanel.visible = false;
        this.galleryPanel.visible = false;
        this.add([this.topCon, this.galleryPanel, this.collectPanel]);
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
            this.acquire.visible = true;
            this.levelBg.visible = true;
            this.horLevelTex.visible = true;
            this.horRewards.visible = true;
            this.horProgress.visible = true;
            tableHeight -= 23 * this.dpr;
            offsetY = 30 * this.dpr;
            this.collectPanel.visible = false;
            this.galleryPanel.visible = true;
            const posy = this.topCon.y + this.topCon.height * 0.5 + tableHeight * 0.5 + offsetY;
            this.galleryPanel.y = posy;
            this.galleryPanel.resize(this.width - 20 * this.dpr, tableHeight);
        } else if (type === 2) {
            this.acquire.visible = false;
            this.levelBg.visible = false;
            this.horLevelTex.visible = false;
            this.horRewards.visible = false;
            this.horProgress.visible = false;
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
    private onSelectItemHandler(cell: IllustratedItem) {
        // if (this.curSelectItem) this.curSelectItem.select = true;
        cell.showTips();
    }

    private onCollectHandler(tag: string, data: any) {
        if (this.send) this.send.runWith([tag, data]);
    }
}

class IllustratedItem extends ItemButton {
    private codeTex: Phaser.GameObjects.Text;
    private star: Phaser.GameObjects.Image;
    private surveyImg: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene, undefined, undefined, dpr, zoom, false);
        this.setSize(width, height);
        this.codeTex = this.scene.make.text({ style: UIHelper.whiteStyle(dpr, 10) }).setOrigin(0, 0.5);
        this.codeTex.x = -this.width * 0.5 + 9 * dpr;
        this.codeTex.y = this.height * 0.5 - 4 * dpr;
        this.star = this.scene.make.image({ key: UIAtlasName.illustrate, frame: "illustrate_survey_star_empty" });
        this.star.x = this.width * 0.5 - this.star.width * 0.5 - 2 * dpr;
        this.star.y = this.codeTex.y;
        this.star.visible = false;
        this.surveyImg = this.scene.make.image({ key: UIAtlasName.illustrate, frame: "illustrate_survey_nohave" });
        this.add([this.codeTex, this.star]);
        for (const item of this.list) {
            const temp = <Phaser.GameObjects.Container>item;
            temp.y -= 10 * dpr;
        }
    }

    setItemData(item: ICountablePackageItem) {
        super.setItemData(item, false);
        if (item) {
            this.codeTex.text = item.code;
            const status = item["status"];
            this.surveyImg.visible = status === 1 ? true : false;
        }
    }
}
