
import { op_client } from "pixelpai_proto";
import { ClickEvent, Button } from "apowophaserui";
import { Font, Handler, i18n, ResUtils, UIHelper } from "utils";
import { UIAtlasName } from "picaRes";
import { ItemButton } from "../Components";
import { ButtonEventDispatcher, ProgressMaskBar } from "gamecoreRender";
import { ChineseUnit } from "structure";
import { PicaChapterLevelClue } from "./PicaChapterLevelClue";
export class PicaExploreListDetailPanel extends Phaser.GameObjects.Container {
    protected dpr: number;
    protected zoom: number;
    private content: Phaser.GameObjects.Container;
    private bg: Phaser.GameObjects.Image;
    private blackGraphic: Phaser.GameObjects.Graphics;
    private backButton: Button;
    private lineGraphic: Phaser.GameObjects.Graphics;
    private titleTex: Phaser.GameObjects.Text;
    private captoreTex: Phaser.GameObjects.Text;
    private taskTex: Phaser.GameObjects.Text;
    private captoreDes: Phaser.GameObjects.Text;
    private needCon: Phaser.GameObjects.Container;
    private needItems: PicaChapterLevelClue[] = [];
    private labels: Phaser.GameObjects.Image[] = [];
    private needDatas: op_client.ICountablePackageItem[] = [];
    private indexed: number = 0;
    private send: Handler;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene, 0, 0);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(width, height);
        this.init();
        this.setInteractive();
    }

    public resize(w: number, h: number) {
        this.setSize(w, h);
        this.blackGraphic.clear();
        this.blackGraphic.fillStyle(0x000000, 0.73);
        this.blackGraphic.fillRect(0, 0, w, h);
        this.blackGraphic.x = -w * 0.5;
        this.blackGraphic.y = -h * 0.5;
        this.lineGraphic.clear();
        this.lineGraphic.fillStyle(0x0B0B0B, 1);
        this.lineGraphic.fillRect(-12 * this.dpr, -this.dpr, 24 * this.dpr, 2 * this.dpr);
    }

    public setHandler(send: Handler) {
        this.send = send;
    }

    public setCaptoreResultData(data: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_CHAPTER_RESULT) {
        const numTex = i18n.language !== "zh-CN" ? data.chapter.chapterId + "" : ChineseUnit.numberToChinese(data.chapter.chapterId);
        this.titleTex.text = i18n.t("explore.chaptertitle", { name: numTex });
        this.captoreTex.text = "皮卡熊的任务";
        this.captoreDes.text = "帮助皮大熊在本章节中找到某某某几件道具，和某某某几件道具，以完成什么什么家具和什么什么家具家具的修复。";
        this.taskTex.text = i18n.t("explore.taskneedtips");
        for (const level of data.levels) {
            for (const item of level.clueItems) {
                this.needDatas.push(item);
            }
        }
        const items = this.getNextDatas();
        this.setNeedItems(items);
        this.setNeedBottomImgs(items.length);
    }

    protected setNeedItems(datas: op_client.ICountablePackageItem[]) {
        for (const item of this.needItems) {
            item.visible = false;
        }
        for (let i = 0; i < datas.length; i++) {
            let item: PicaChapterLevelClue;
            if (i < this.needItems.length) {
                item = this.needItems[i];
            } else {
                item = new PicaChapterLevelClue(this.scene, this.dpr, 43 * this.dpr, 43 * this.dpr);
                this.needCon.add(item);
                this.needItems.push(item);
            }
            item.setItemData(datas[i]);
            item.visible = true;
        }

        this.setItemLayout(datas.length);
    }

    protected setNeedBottomImgs(count: number) {
        for (const label of this.labels) {
            label.visible = false;
        }
        for (let i = 0; i < count; i++) {
            let label: Phaser.GameObjects.Image;
            if (i < this.labels.length) {
                label = this.labels[i];
            } else {
                label = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "explore_page_down" });
                this.content.add(label);
                this.labels.push(label);
            }
            label.visible = true;
        }
        this.setLabelLayout(count);
    }

    protected getNextDatas() {
        const datas = [];
        const len = this.indexed + 6 < this.needDatas.length ? this.indexed + 6 : this.needDatas.length;
        for (let i = this.indexed; i < len; i++) {
            datas.push(this.needDatas[i]);
        }

        return datas;
    }

    protected init() {
        this.blackGraphic = this.scene.make.graphics(undefined, false);
        this.add(this.blackGraphic);
        this.bg = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "explore_chapter_total_open" });
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(this.bg.width, this.bg.height);
        this.add(this.content);
        this.backButton = new Button(this.scene, UIAtlasName.uicommon, "close");
        this.backButton.on(ClickEvent.Tap, this.onHideHandler, this);
        this.backButton.x = this.content.width * 0.5 - this.backButton.width * 0.5;
        this.backButton.y = -this.content.height * 0.5 + this.backButton.height * 0.5;
        const leftMidx = -70 * this.dpr, rightMidx = 70 * this.dpr;
        const topy = -this.content.height * 0.5 + 20 * this.dpr;
        this.titleTex = this.scene.make.text({ style: UIHelper.colorStyle("#8743B9", 14 * this.dpr) }).setOrigin(0.5);
        this.titleTex.setFontStyle("bold");
        this.titleTex.x = leftMidx;
        this.titleTex.y = topy;
        this.captoreTex = this.scene.make.text({ style: UIHelper.blackStyle(this.dpr, 14) }).setOrigin(0.5);
        this.captoreTex.setFontStyle("bold");
        this.captoreTex.y = this.titleTex.y + 20 * this.dpr;
        this.captoreTex.x = leftMidx;
        this.lineGraphic = this.scene.make.graphics(undefined, false);
        this.lineGraphic.x = leftMidx;
        this.lineGraphic.y = this.captoreTex.y + 15 * this.dpr;
        this.captoreDes = this.scene.make.text({ style: UIHelper.blackStyle(this.dpr, 11) }).setOrigin(0);
        this.captoreDes.setWordWrapWidth(117 * this.dpr, true);
        this.captoreDes.x = leftMidx - 58 * this.dpr;
        this.captoreDes.y = this.lineGraphic.y + 20 * this.dpr;
        this.taskTex = this.scene.make.text({ style: UIHelper.blackStyle(this.dpr, 14) }).setOrigin(0.5);
        this.taskTex.setFontStyle("bold");
        this.taskTex.x = rightMidx;
        this.taskTex.y = this.captoreTex.y;
        this.needCon = this.scene.make.container(undefined, false);
        this.needCon.setSize(100 * this.dpr, 157 * this.dpr);
        this.needCon.x = rightMidx;
        this.content.add([this.bg, this.backButton, this.titleTex, this.captoreTex, this.lineGraphic, this.captoreDes, this.taskTex, this.needCon]);
        this.resize(this.width, this.height);
    }

    private setLabelLayout(count: number) {
        const cellwidth = 6 * this.dpr, space = 8 * this.dpr, posy = this.content.height * 0.5 - 30 * this.dpr;
        let posx = -(cellwidth * count + space * (count - 1)) / 0.5 + cellwidth * 0.5;
        for (let i = 0; i < count; i++) {
            const label = this.labels[i];
            label.x = posx;
            label.y = posy;
            posx += cellwidth + space;
        }
    }

    private setItemLayout(count: number) {
        const cellwidth = 43 * this.dpr, cellHeight = 43 * this.dpr;
        const spaceW = 14 * this.dpr, spaceH = 14 * this.dpr;
        const hcount = 2;
        const roundlen = Math.floor(count / hcount);
        const remainder = count % hcount;
        const width = hcount * cellwidth + spaceW * (hcount - 1);
        const heightLen = roundlen + (remainder === 0 ? 0 : 1);
        const height = heightLen * cellHeight + spaceH * (heightLen - 1);
        for (let i = 0; i < roundlen; i++) {
            for (let j = 0; j < hcount; j++) {
                const item = <ItemButton>(this.needItems[i * hcount + j]);
                item.x = -width * 0.5 + (cellwidth + spaceW) * j + cellwidth * 0.5;
                item.y = -height * 0.5 + (cellHeight + spaceH) * i + cellHeight * 0.5;
            }
        }
        const remaWdith = remainder * cellwidth + spaceW * (remainder - 1);
        for (let j = 0; j < remainder; j++) {
            const item = <ItemButton>(this.needItems[j + roundlen * hcount]);
            item.x = -remaWdith * 0.5 + cellwidth * 0.5 + (cellwidth + spaceW) * j;
            item.y = height * 0.5 - cellHeight * 0.5;
        }
    }

    private onHideHandler() {
        if (this.send) this.send.runWith("hide");
    }

}
