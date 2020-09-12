import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { op_client, op_pkt_def, op_def } from "pixelpai_proto";
import { UIAtlasKey, UIAtlasName } from "../ui.atals.name";
import { i18n } from "../../i18n";
import { DynamicImage } from "../components/dynamic.image";
import { Button } from "../../../lib/rexui/lib/ui/button/Button";
import { GameScroller } from "../../../lib/rexui/lib/ui/scroller/GameScroller";
import { NineSliceButton } from "../../../lib/rexui/lib/ui/button/NineSliceButton";
import { Handler } from "../../Handler/Handler";
import { Url, Coin } from "../../utils/resUtil";
import { BBCodeText, NineSlicePatch } from "../../../lib/rexui/lib/ui/ui-components";
import { ProgressBar } from "../../../lib/rexui/lib/ui/progressbar/ProgressBar";
import { CoreUI } from "../../../lib/rexui/lib/ui/interface/event/MouseEvent";
import { GameGridTable } from "../../../lib/rexui/lib/ui/gridtable/GameGridTable";
import { GridTableConfig } from "../../../lib/rexui/lib/ui/gridtable/GridTableConfig";
import { ItemInfoTips } from "../tips/ItemInfoTips";
import { Logger } from "../../utils/log";
export class PicWorkPanel extends BasePanel {
    private key = "work_ui";
    private mBackground: Phaser.GameObjects.Graphics;
    private bg: NineSlicePatch;
    private titlebg: Phaser.GameObjects.Image;
    private tilteName: Phaser.GameObjects.Text;
    private closeBtn: Phaser.GameObjects.Image;
    private mGameScroll: GameScroller;
    private content: Phaser.GameObjects.Container;
    private itemtips: ItemInfoTips;
    private timesPorgress: ProgressItem;
    private powerProgress: ProgressItem;
    private helpBtn: Button;
    private workItems: WorkItem[];
    private selectItem: WorkItem;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.workItems = [];
    }
    resize(width?: number, height?: number) {
        const w: number = this.scaleWidth;
        const h: number = this.scaleHeight;
        super.resize(w, h);
        this.setSize(w, h);
        this.mBackground.clear();
        this.mBackground.fillStyle(0, 0.5);
        this.mBackground.fillRoundedRect(-this.x, -this.y, w, h);
        this.content.x = w * 0.5;
        this.content.y = h * 0.5;
        this.mGameScroll.refreshMask();
        this.mBackground.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
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
        this.setInteractive();
        this.addListen();
    }

    public addListen() {
        if (!this.mInitialized) return;
        this.closeBtn.on("pointerup", this.OnClosePanel, this);
    }

    public removeListen() {
        if (!this.mInitialized) return;
        this.closeBtn.off("pointerup", this.OnClosePanel, this);
    }

    preload() {
        this.addAtlas(this.key, "work/work.png", "work/work.json");
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.commonUrl + ".png", UIAtlasName.commonUrl + ".json");
        this.addAtlas(UIAtlasKey.common2Key, UIAtlasName.common2Url + ".png", UIAtlasName.common2Url + ".json");
        super.preload();
    }
    init() {
        this.mBackground = this.scene.make.graphics(undefined, false);
        this.add(this.mBackground);
        const conWdith = 295 * this.dpr;
        const conHeight = 454 * this.dpr;
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(conWdith, conHeight);
        this.add(this.content);
        this.bg = new NineSlicePatch(this.scene, 0, 0, conWdith, conHeight, UIAtlasKey.commonKey, "bg", {
            left: 30 * this.dpr,
            top: 30 * this.dpr,
            bottom: 30 * this.dpr,
            right: 30 * this.dpr,
        });
        const posY = -conHeight * 0.5;
        this.titlebg = this.scene.make.image({ x: 0, y: 0, key: UIAtlasKey.common2Key, frame: "title" });
        this.titlebg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.titlebg.y = posY + 3 * this.dpr;
        this.tilteName = this.scene.make.text({ x: 0, y: this.titlebg.y + 2 * this.dpr, text: i18n.t("work.title"), style: { color: "#905C06", fontSize: 15 * this.dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5);
        this.closeBtn = this.scene.make.image({ x: conWdith * 0.5 - this.dpr * 5, y: posY + this.dpr * 5, key: UIAtlasKey.commonKey, frame: "close" });
        this.tilteName.setStroke("#905C06", 2);
        this.tilteName.setResolution(this.dpr);
        this.closeBtn.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.closeBtn.setInteractive();
        this.timesPorgress = new ProgressItem(this.scene, 76 * this.dpr, 14 * this.dpr, this.key, "slider_orange", i18n.t("work.worktimes"), this.dpr);
        this.timesPorgress.setImageValue(this.key, "icon_work");
        this.timesPorgress.y = -conHeight * 0.5 + 40 * this.dpr;
        this.timesPorgress.x = - 43 * this.dpr;
        this.powerProgress = new ProgressItem(this.scene, 76 * this.dpr, 14 * this.dpr, this.key, "slider_blue", i18n.t("work.vim"), this.dpr);
        this.powerProgress.setImageValue(this.key, "icon_strength");
        this.powerProgress.y = this.timesPorgress.y;
        this.powerProgress.x = 70 * this.dpr;
        this.helpBtn = new Button(this.scene, this.key, "icon_tips", "icon_tips");
        this.helpBtn.y = this.powerProgress.y;
        this.helpBtn.x = this.powerProgress.x + this.powerProgress.width * 0.5 + 5 * this.dpr + this.helpBtn.width * 0.5;
        this.mGameScroll = new GameScroller(this.scene, {
            x: 0,
            y: 18 * this.dpr,
            width: conWdith,
            height: conHeight - 70 * this.dpr,
            zoom: this.scale,
            dpr: this.dpr,
            align: 2,
            orientation: 0,
            space: 20 * this.dpr,
            selfevent: true,
            cellupCallBack: (gameobject) => {
                this.onPointerUpHandler(gameobject);
            }
        });

        this.itemtips = new ItemInfoTips(this.scene, 121 * this.dpr, 46 * this.dpr, UIAtlasKey.commonKey, "tips_bg", this.dpr);
        this.itemtips.visible = false;
        this.content.add([this.bg, this.closeBtn, this.titlebg, this.tilteName, this.timesPorgress, this.powerProgress, this.helpBtn, this.mGameScroll, this.itemtips]);
        this.resize();
        super.init();
        this.emit("questlist");
    }

    public setWorkDataList(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_JOB_LIST) {
        const datas = content.jobs;
        this.mGameScroll.getItemList().length = 0;
        for (const item of this.workItems) {
            (<WorkItem>item).visible = false;
        }
        for (let i = 0; i < datas.length; i++) {
            let item: WorkItem;
            if (i < this.workItems.length) {
                item = <WorkItem>this.workItems[i];
            } else {
                item = new WorkItem(this.scene, this.key, this.dpr);
                this.workItems.push(item);
                item.setHandler(new Handler(this, this.onSendHandler), new Handler(this, this.onItemInfoTips));
            }
            item.visible = true;
            item.setJobData(datas[i]);
            this.mGameScroll.addItem(item);
        }
        this.mGameScroll.Sort();
    }

    public setProgressData(enery: op_def.IValueBar, work: op_def.IValueBar) {
        this.timesPorgress.setProgressDatas(work);
        this.powerProgress.setProgressDatas(enery);
    }

    destroy() {
        super.destroy();
    }

    private OnClosePanel() {
        this.emit("hide");
    }

    private onPointerUpHandler(gameobject: WorkItem) {
        if (this.selectItem) this.selectItem.setExtend(false);
        gameobject.setExtend(true);
        this.selectItem = gameobject;
    }
    private onSendHandler(index: number, orderOperator: op_pkt_def.PKT_Order_Operator) {
        this.emit("changeorder", index, orderOperator);
    }

    private onItemInfoTips(data: op_client.ICountablePackageItem, isdown: boolean, pos: Phaser.Geom.Point) {
        this.itemtips.visible = isdown;
        this.itemtips.x = pos.x;
        this.itemtips.y = pos.y;
        this.itemtips.setText(this.getDesText(data));
    }
    private getDesText(data: op_client.ICountablePackageItem) {
        if (!data) data = <any>{ "sellingPrice": true, tradable: false };
        let text: string = data.name + "\n";
        let source = i18n.t("common.source") + ":";
        source += data.source;
        source = `[stroke=#333333][color=#333333]${source}[/color][/stroke]`;
        text += source + "\n";
        if (data.sellingPrice) {
            let price = i18n.t("common.sold");
            price += `${Coin.getName(data.sellingPrice.coinType)} x ${data.sellingPrice.price}`;
            price = `[stroke=#333333][color=#333333]${price}[/color][/stroke]`;
            text += price + "\n";
        }
        if (!data.tradable) {
            let trade = i18n.t("furni_unlock.notrading");
            trade = `[stroke=#333333][color=#ff0000]*${trade}[/color][/stroke]`;
            text += trade;
        }
        return text;
    }
}

class WorkItem extends Phaser.GameObjects.Container {
    private jobData: op_client.IPKT_Quest;
    private key: string;
    private dpr: number;
    private bg: NineSlicePatch;
    private headIcon: DynamicImage;
    private title: Phaser.GameObjects.Text;
    private salaryLabel: Phaser.GameObjects.Text;
    private salaryvalue: ImageValue;
    private worklabel: Phaser.GameObjects.Text;
    private workbg: NineSlicePatch;
    private workBtn: Button;
    private topCon: Phaser.GameObjects.Container;
    private bottomCon: Phaser.GameObjects.Container;
    private imageValues: PointerImageValue[] = [];
    private sendHandler: Handler;
    private tipsHandler: Handler;
    private isExtend: boolean = false;
    constructor(scene: Phaser.Scene, key: string, dpr: number) {
        super(scene);
        this.key = key;
        this.dpr = dpr;
        const width = 256 * dpr, height = 68 * dpr;
        this.setSize(width, height);
        this.topCon = scene.make.container(undefined, false);
        this.add(this.topCon);
        this.topCon.setSize(width, height);
        this.bg = new NineSlicePatch(this.scene, 0, 0, width, height, UIAtlasKey.commonKey, "bg_default", {
            left: 6 * this.dpr,
            top: 0 * this.dpr,
            bottom: 0 * this.dpr,
            right: 6 * dpr
        });
        this.headIcon = new DynamicImage(scene, 0, 0);
        this.title = scene.make.text({ x: -this.width * 0.5 + 40 * dpr, y: -height * 0.5 - 20 * dpr, text: "", style: { color: "#ffffff", fontSize: 13 * dpr, fontFamily: Font.DEFULT_FONT } });
        this.salaryvalue = new ImageValue(scene, 60 * dpr, 20 * dpr, this.key, this.dpr);
        this.salaryvalue.x = this.width * 0.5 - 30 * dpr;
        this.salaryLabel.y = -this.height * 0.5 + 10 * dpr;
        this.salaryLabel = scene.make.text({ x: this.salaryvalue.x - this.salaryvalue.width * 0.5 - 5 * dpr, y: this.salaryLabel.y, text: i18n.t("work.salary") + ":", style: { color: "#ffffff", fontSize: 11 * dpr, fontFamily: Font.DEFULT_FONT } });
        this.worklabel = scene.make.text({ x: -this.width * 0.5 + 40 * dpr, y: this.height * 0.5 - 10 * dpr, text: "", style: { color: "#ffffff", fontSize: 11 * dpr, fontFamily: Font.DEFULT_FONT } });
        this.worklabel.setOrigin(0, 0.5);
        this.topCon.add([this.bg, this.headIcon, this.title, this.salaryvalue, this.salaryLabel, this.worklabel]);

        const bottomHeight = 46 * dpr;
        this.bottomCon = scene.make.container(undefined, false);
        this.bottomCon.setSize(width, bottomHeight);
        this.workbg = new NineSlicePatch(this.scene, 0, 0, this.width, bottomHeight, UIAtlasKey.commonKey, "bg_a_unfold", {
            left: 6 * this.dpr,
            top: 0 * this.dpr,
            bottom: 0 * this.dpr,
            right: 6 * dpr
        });
        this.workBtn = new NineSliceButton(scene, 0, 0, 90 * dpr, 36 * dpr, UIAtlasKey.commonKey, "yellow_btn_normal", i18n.t("work.title"), dpr, undefined, {
            left: 14 * this.dpr,
            top: 14 * this.dpr,
            bottom: 14 * this.dpr,
            right: 14 * dpr
        });
        this.workBtn.x = this.width * 0.5 - this.workBtn.width * 0.5 - 5 * dpr;
        this.workBtn.setTextStyle({ fontSize: 10 * dpr });
        this.bottomCon.add([this.workbg, this.workBtn]);
        this.workBtn.on(CoreUI.MouseEvent.Tap, this.onWorkHandler, this);
    }

    public setHandler(send: Handler, tips: Handler) {
        this.sendHandler = send;
        this.tipsHandler = tips;
    }
    public setJobData(data: op_client.IPKT_Quest) {
        this.jobData = data;
        const matrr = data.targets;
        for (const item of this.imageValues) {
            item.visible = false;
        }
        let posx = -this.width * 0.5 + 60 * this.dpr;
        for (let i = 0; i < matrr.length; i++) {
            let item: PointerImageValue;
            if (i < this.imageValues.length) {
                item = this.imageValues[i];
            } else {
                item = new PointerImageValue(this.scene, 80 * this.dpr, 15 * this.dpr, this.key, this.dpr);
                this.add(item);
                this.imageValues.push(item);
                item.setHandler(new Handler(this, this.onTipsandler));
            }
            const url = Url.getOsdRes(matrr[i].display.texturePath);
            item.setUrlValue(url, matrr[i].count);
            item.visible = true;
            item.x = posx + item.width * 0.5;
            item.y = 0;
            posx += item.width + 20 * this.dpr;
        }
    }

    public setExtend(extend: boolean) {
        if (this.isExtend === extend) return;
        this.isExtend = extend;
        this.bottomCon.visible = extend;
        if (extend) {
            this.add(this.bottomCon);
            const height = this.topCon.height + this.bottomCon.height;
            this.setSize(this.width, height);
            this.topCon.y = -height * 0.5 + this.topCon.height * 0.5;
            this.bottomCon.y = this.topCon.y + this.topCon.height * 0.5 + this.bottomCon.height * 0.5;
        } else {
            this.remove(this.bottomCon);
            const height = this.topCon.height;
            this.setSize(this.width, height);
            this.topCon.y = 0;
        }
    }
    destroy(fromScene?: boolean) {
        super.destroy(fromScene);
    }

    private onWorkHandler() {
        if (this.sendHandler) this.sendHandler.runWith(this.jobData);
    }
    private onTipsandler(item: PointerImageValue) {
        if (this.tipsHandler) this.tipsHandler.runWith(item.imageData);
    }
}
class ImageValue extends Phaser.GameObjects.Container {
    protected dpr: number;
    protected key: string;
    protected icon: Phaser.GameObjects.Image;
    protected value: Phaser.GameObjects.Text;
    protected offsetx: number;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, dpr: number, offsetx: number = 0) {
        super(scene);
        this.dpr = dpr;
        this.key = key;
        this.offsetx = offsetx;
        this.setSize(width, height);
        this.create();
    }
    public setFrameValue(text: string, key: string, frame: string) {
        this.icon.setTexture(key, frame);
        this.value.text = text;
        this.resetPosition();
    }
    public setText(tex: string) {
        this.value.text = tex;
    }
    public setTextStyle(style: object) {
        this.value.setStyle(style);
    }
    public setShadow(x?: number, y?: number, color?: string, blur?: number, shadowStroke?: boolean, shadowFill?: boolean) {
        this.value.setShadow(x, y, color, blur, shadowStroke, shadowFill);
    }
    public setStroke(color: string, thickness: number) {
        this.value.setStroke(color, thickness);
    }
    public resetSize() {
        const width = this.icon.displayWidth + this.value.width;
        this.setSize(width, this.height);
        this.resetPosition();
    }

    protected create() {
        this.icon = this.scene.make.image({ key: this.key, frame: "iv_coin_s" });
        this.value = this.scene.make.text({ x: 0, y: this.offsetx, text: "10", style: { color: "#ffffff", fontSize: 11 * this.dpr, fontFamily: Font.DEFULT_FONT } });
        this.value.setOrigin(0, 0.5);
        this.add([this.icon, this.value]);
    }
    protected resetPosition() {
        this.icon.x = -this.width * 0.5 + this.icon.displayWidth * 0.5;
        this.value.x = this.icon.x + this.icon.displayWidth * 0.5 + 4 * this.dpr;
    }
}

class PointerImageValue extends ImageValue {
    public imageData: op_client.ICountablePackageItem;
    protected icon: DynamicImage;
    private tipsHandler: Handler;
    public constructor(scene: Phaser.Scene, width: number, height: number, key: string, dpr: number, offsetx: number = 0) {
        super(scene, width, height, key, dpr, offsetx);
    }

    public setImageData(data: op_client.ICountablePackageItem) {
        this.imageData = data;
    }
    public setUrlValue(url, value) {
        this.value.text = value;
        this.icon.load(url, this, () => {
            this.icon.scale = 1;
            this.icon.scaleY = this.icon.displayHeight / 14 * this.dpr;
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
        this.value = this.scene.make.text({ x: 0, y: this.offsetx, text: "10", style: { color: "#ffffff", fontSize: 11 * this.dpr, fontFamily: Font.DEFULT_FONT } });
        this.value.setOrigin(0, 0.5);
        this.add([this.icon, this.value]);
    }
    private onClickDownHandler() {
        if (this.tipsHandler) this.tipsHandler.runWith([this, true]);
    }

    private onClickUpHandler() {
        if (this.tipsHandler) this.tipsHandler.runWith([this, false]);
    }
}

class ProgressItem extends Phaser.GameObjects.Container {
    private key: string;
    private dpr: number;
    private progress: ProgressBar;
    private imgvalue: ImageValue;
    private title: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, frame: string, title: string, dpr: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.key = key;
        const barConfig = {
            x: 0,
            y: 0,
            width,
            height,
            background: {
                x: 0,
                y: 0,
                width,
                height,
                config: {
                    top: 0 * dpr,
                    left: 7 * dpr,
                    right: 7 * dpr,
                    bottom: 0 * dpr,
                },
                key,
                frame: "slider_bottom"
            },
            bar: {
                x: 0,
                y: 0,
                width: width - 4 * dpr,
                height: height - 4 * dpr,
                config: {
                    top: 0 * dpr,
                    left:7 * dpr,
                    right: 7 * dpr,
                    bottom: 0 * dpr,
                },
                key,
                frame
            },
            dpr,
            textConfig: undefined
        };
        this.progress = new ProgressBar(scene, barConfig);
        this.add(this.progress);
        this.imgvalue = new ImageValue(scene, this.width - 20 * dpr, this.height, key, dpr);
        this.imgvalue.y = dpr;
        this.add(this.imgvalue);
        this.imgvalue.setTextStyle({ fontFamily: Font.BOLD_FONT });
        this.title = scene.make.text({ x: -this.progress.width * 0.5 - 3 * dpr, y: 0, text: title, style: { color: "#6A7AFF", fontSize: 9 * dpr, fontFamily: Font.DEFULT_FONT } });
        this.title.setOrigin(1, 0.5);
        this.add(this.title);
    }

    public setImageValue(key: string, frame: string) {
        this.imgvalue.setFrameValue("", key, frame);
    }
    public setProgressDatas(value: op_def.IValueBar) {
        this.progress.setProgress(value.currentValue, value.max);
        this.imgvalue.setText(`${value.currentValue}/${value.max}`);
    }
}
