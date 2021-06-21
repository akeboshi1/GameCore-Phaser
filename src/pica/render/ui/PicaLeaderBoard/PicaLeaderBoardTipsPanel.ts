import { NineSlicePatch, GameGridTable, Button, ClickEvent, BBCodeText } from "apowophaserui";
import { AlignmentType, AxisType, ButtonEventDispatcher, ConstraintType, DynamicImage, GridLayoutGroup } from "gamecoreRender";
import { UIAtlasName } from "../../../res";
import { Handler, i18n, UIHelper, Url } from "utils";
import { ICardPool, ICountablePackageItem, IDrawPoolStatus } from "../../../structure";
import { CommonBackground } from "../Components";
import { PicaItemTipsPanel } from "../SinglePanel/PicaItemTipsPanel";
export class PicaLeaderBoardTipsPanel extends Phaser.GameObjects.Container {
    private bg: NineSlicePatch;
    private titlebg: Phaser.GameObjects.Image;
    private titleTex: Phaser.GameObjects.Text;
    private closeBtn: Button;
    private dpr: number;
    private zoom: number;
    private send: Handler;
    private blackBG: Phaser.GameObjects.Graphics;
    private ruleText: Phaser.GameObjects.Text;
    private ruleDescription: Phaser.GameObjects.Text;
    private countDownText: Phaser.GameObjects.Text;
    private rewardShow: Phaser.GameObjects.Text;

    private mGameGrid: GameGridTable;
    private content: Phaser.GameObjects.Container;
    private gridLayout: GridLayoutGroup;

    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.init();
    }
    resize(width?: number, height?: number) {
        const w = width || this.width;
        const h = height || this.height;
        this.setSize(w, h);
        // this.mGameGrid.resetMask();
    }

    setHandler(send: Handler) {
        this.send = send;
    }

    init() {
        // this.add([this.ruleText,this,this.ruleDescription,this,this.countDownText,this.rewardShow]);

        this.blackBG = this.scene.make.graphics(undefined, false);
        this.blackBG.clear();
        this.blackBG.fillStyle(0, 0.5);
        this.blackBG.fillRect(-this.width * 0.5, -this.height * 0.5, this.width, this.height);
        // this.content.x = w * 0.5;
        // this.content.y = h * 0.5;
        this.blackBG.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.width, this.height), Phaser.Geom.Rectangle.Contains);
        this.add(this.blackBG);

        // const conWdith = 289 * this.dpr;
        // const conHeight = 69*4 * this.dpr;
        const conWdith = 334 * this.dpr;
        const conHeight = 452 * this.dpr;
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(conWdith, conHeight);
        this.content.setInteractive();
        this.add(this.content);
        this.bg = new NineSlicePatch(this.scene, 0, 0, conWdith, conHeight, UIAtlasName.uicommon1, "bg", {
            left: 30 * this.dpr,
            top: 30 * this.dpr,
            bottom: 30 * this.dpr,
            right: 30 * this.dpr,
        });
        const posY = -conHeight * 0.5;
        const posX = -conWdith * 0.5;
        this.titlebg = this.scene.make.image({ x: 0, y: 0, key: UIAtlasName.uicommon1, frame: "title" });
        this.titlebg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.titlebg.y = posY + 5 * this.dpr;
        this.titleTex = this.scene.make.text({ x: 0, y: this.titlebg.y + 2 * this.dpr, text: i18n.t("leaderboard.ruledescription"), style: UIHelper.titleYellowStyle_m(this.dpr) }).setOrigin(0.5);
        this.titleTex.setFontStyle("bold");
        this.titleTex.setResolution(this.dpr);
        this.closeBtn = new Button(this.scene, UIAtlasName.uicommon, "close", "close");
        this.closeBtn.setPosition(this.bg.width * 0.5 - this.dpr * 5, -this.bg.height * 0.5 + this.dpr * 5);
        this.closeBtn.on(ClickEvent.Tap, this.onCloseHandler, this);

        this.gridLayout = new GridLayoutGroup(this.scene, 278 * this.dpr, 69 * 4 * this.dpr, {
            cellSize: new Phaser.Math.Vector2(278 * this.dpr, 69 * this.dpr),
            space: new Phaser.Math.Vector2(0, 0),
            startAxis: AxisType.Horizontal,
            constraint: ConstraintType.FixedColumnCount,
            constraintCount: 1,
            alignmentType: AlignmentType.UpperCenter
        });
        this.ruleText = this.scene.make.text({ text: i18n.t("leaderboard.ruledescription"), style: UIHelper.colorStyle("#000000", 12 * this.dpr) }).setOrigin(0.5);
        this.ruleText.setFontStyle("bold");
        this.ruleText.setAlign("left");
        this.ruleText.x = posX + 22 * this.dpr + this.ruleText.width * 0.5;
        this.ruleText.y = posY + 58 * this.dpr + this.ruleText.height * 0.5;
        this.ruleDescription = this.scene.make.text({ text: i18n.t("leaderboard.rule"), style: UIHelper.colorStyle("#000000", 10 * this.dpr) }).setOrigin(0.5);
        this.ruleDescription.setSize(288 * this.dpr, 58 * this.dpr);
        this.ruleDescription.setAlign("left");
        this.ruleDescription.x = posX + 21 * this.dpr + this.ruleDescription.width * 0.5;
        this.ruleDescription.y = posY + 77 * this.dpr + this.ruleDescription.height * 0.5;

        this.countDownText = this.scene.make.text({ text: "赛季倒计时：00天00小时", style: UIHelper.colorStyle("#000000", 10 * this.dpr) }).setOrigin(0.5);
        this.countDownText.setSize(118 * this.dpr, 10 * this.dpr);
        this.countDownText.setAlign("left");
        this.countDownText.x = posX + 192 * this.dpr + this.countDownText.width * 0.5;
        this.countDownText.y = posY + 40 * this.dpr + this.countDownText.height * 0.5;

        this.rewardShow = this.scene.make.text({ text: i18n.t("leaderboard.rewardshow"), style: UIHelper.colorStyle("#000000", 12 * this.dpr) }).setOrigin(0.5);
        this.rewardShow.setAlign("left");
        this.rewardShow.setFontStyle("bold");
        this.rewardShow.x = posX + 22 * this.dpr + this.rewardShow.width * 0.5;
        this.rewardShow.y = posY + 148 * this.dpr + this.rewardShow.height * 0.5;

        this.content.add([this.bg, this.titlebg, this.titleTex, this.closeBtn, this.ruleText, this, this.ruleDescription, this, this.countDownText, this.rewardShow]);
        this.setListData();
        this.add(this.gridLayout);
        this.gridLayout.x = 0;
        this.gridLayout.y = posY + 230 * this.dpr + this.gridLayout.height * 0.5;
        this.resize();
    }
    public setListData() {
        // this.gridLayout.removeAll();
        // for (const data of datas) {
        //     const item = new RewardListItem(this.scene, this.dpr, this.zoom);
        //     item.setReward(data);
        //     this.gridLayout.add(item);
        // }
        // this.gridLayout.Layout();
        // // this.gridLayout.removeAll();
        const item = new RewardListItem(this.scene, this.dpr, this.zoom);
        const item2 = new RewardListItem(this.scene, this.dpr, this.zoom);
        this.gridLayout.add(item);
        this.gridLayout.add(item2);
        this.gridLayout.Layout();
    }
    // public setRoamDataList(datas: ICardPool[]) {
    //     this.poolsStatus.clear();
    //     for (const data of datas) {
    //         if (this.poolsStatus.has(data.cardPoolGroup)) {
    //             const tempArr = this.poolsStatus.get(data.cardPoolGroup);
    //             tempArr.push(data);
    //         } else {
    //             const tempArr = [data];
    //             this.poolsStatus.set(data.cardPoolGroup, tempArr);
    //         }
    //     }
    //     const tempDatas = [];
    //     this.poolsStatus.forEach((value) => {
    //         tempDatas.push(value[0]);
    //     });
    //     this.mGameGrid.setItems(tempDatas);
    //     this.mGameGrid.setT(0);
    // }
    private onCloseHandler() {
        if (this.send) this.send.runWith("close");
    }

}

class RewardListItem extends Phaser.GameObjects.Container {
    private roamData: IDrawPoolStatus;
    private dpr: number;
    private zoom: number;
    private bg: NineSlicePatch;
    private blackBG: Phaser.GameObjects.Graphics;
    private leavelImg: Phaser.GameObjects.Image;
    private leavelText: Phaser.GameObjects.Text;
    private rewardItems: RewardItemCell[] = [];

    constructor(scene: Phaser.Scene, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(289 * dpr, 69 * dpr);
        this.blackBG = this.scene.make.graphics(undefined, false);
        this.blackBG.clear();
        this.blackBG.fillStyle(0, 0.2);
        this.blackBG.fillRect(-this.width * 0.5, -this.height * 0.5, this.width, this.height);
        // this.content.x = w * 0.5;
        // this.content.y = h * 0.5;
        this.blackBG.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.width, this.height), Phaser.Geom.Rectangle.Contains);
        this.add(this.blackBG);
        this.bg = new NineSlicePatch(scene, 0, 0, this.width, this.height, UIAtlasName.leader_board, "leaderboard_rank_bg_bottom", {
            left: 0, top: 1 * this.dpr, right: 0, bottom: 1 * this.dpr
        });
        this.add(this.bg);
        this.leavelImg = this.scene.make.image({ x: 0, y: 0, key: UIAtlasName.leader_board, frame: "leaderboard_rank_1" });
        this.leavelImg.x = -this.width * 0.5 + this.leavelImg.width * 0.5;
        this.leavelImg.y = -this.height * 0.5 + this.leavelImg.height * 0.5 + 20 * this.dpr;
        this.leavelText = this.scene.make.text({ x: this.leavelImg.x, y: this.leavelImg.y, text: i18n.t("leaderboard.ruledescription"), style: UIHelper.titleYellowStyle_m(this.dpr) }).setOrigin(0.5);
        this.leavelText = this.scene.make.text({ style: UIHelper.colorStyle("#000000", 20 * this.dpr) }).setOrigin(0.5);
        this.leavelText.setAlign("center");
        this.leavelText.setText("4");
        this.add(this.leavelImg);
    }
    public setReward(data) {
        let offsetpos = -this.width * 0.5 + 77 * this.dpr;
        if (!data) {
            return;
        }
        for (const itemData of data) {
            let item: RewardItemCell;
            item = new RewardItemCell(this.scene, this.dpr, this.zoom);
            item.on(ClickEvent.Tap, this.rewardItemHandler, this);
            this.add(item);
            this.rewardItems.push(item);
            item.setRewardItemData(itemData);
            item.x = offsetpos + item.width * 0.5;
            offsetpos += item.width + 14 * this.dpr;
            item.y = 0 * this.dpr;
            item.visible = true;
        }
    }
    public clearItems() {
        for (const rewardItem of this.rewardItems) {
            this.remove(rewardItem);
        }
        this.rewardItems.length = 0;
    }
    private rewardItemHandler(pointer, obj: RewardItemCell) {
        PicaItemTipsPanel.Inst.showTips(obj, obj.itemData);
    }
}
class RewardItemCell extends ButtonEventDispatcher {
    public itemData: any;// op_client.ICountablePackageItem
    private icon: DynamicImage;
    private value: BBCodeText;
    constructor(scene: Phaser.Scene, dpr: number, zoom: number) {
        super(scene, 0, 0);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(54 * dpr, 54 * dpr);
        this.icon = new DynamicImage(scene, 0, 0 * dpr);
        this.icon.setSize(39 * dpr, 43 * dpr);
        this.value = new BBCodeText(this.scene, 0, this.height * 0.5 + 0 * dpr, "", UIHelper.blackStyle(dpr, 10)).setOrigin(0.5);
        this.add([this.icon, this.value]);
        this.enable = true;
    }
    public setRewardItemData(data: ICountablePackageItem) {// op_client.ICountablePackageItem
        this.itemData = data;
        const url = Url.getOsdRes(data.texturePath);
        this.icon.load(url, this, () => {
            this.icon.scale = 1;
            this.icon.scaleX = 28 * this.dpr / this.icon.displayWidth;
            this.icon.scaleY = this.icon.scaleX;
        });
        this.value.text = `${data.count}/${data.neededCount}`;
    }
}
