import { ButtonEventDispatcher, DynamicImage, ImageValue, ProgressMaskBar, ThreeSliceButton } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { Handler, i18n, UIHelper, Url } from "utils";
import { op_client } from "pixelpai_proto";
import { ClickEvent, GameScroller } from "apowophaserui";
import { ChineseUnit } from "structure";
import { ItemButton } from "../Components";
import { PicaChapterLevelClue } from "./PicaChapterLevelClue";
export class PicaExploreListLevelPanel extends Phaser.GameObjects.Container {
    private dpr: number;
    private zoom: number;
    private captorScroll: GameScroller;
    private titlebg: Phaser.GameObjects.Image;
    private titleTex: Phaser.GameObjects.Text;
    private forewordItem: ForewordChapterItem;
    private lockItem: ChapterLevelLockItem;
    private finalItem: ChapterLevelEventuallyItem;
    private levelItems: ChapterLevelItem[] = [];
    private chapterResult: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_CHAPTER_RESULT;
    private send: Handler;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.init();
    }

    resize(w: number, h: number) {
        this.setSize(w, h);
        this.titlebg.x = w * 0.5;
        this.titlebg.y = -this.height * 0.5 + this.titlebg.height * 0.5;
        this.titleTex.x = this.titlebg.x;
        this.titleTex.y = this.titlebg.y;
        const scrollheight = h - this.titlebg.height - 15 * this.dpr;
        this.captorScroll.resetSize(w, scrollheight);
        this.captorScroll.x = w * 0.5;
        this.captorScroll.y = this.height * 0.5 - scrollheight * 0.5;
        this.refreshMask();
    }
    refreshMask() {
        this.captorScroll.refreshMask();

    }

    setHandler(send: Handler) {
        this.send = send;
    }

    setCaptoreResult(result: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_CHAPTER_RESULT, nextLevelID: number) {
        this.chapterResult = result;
        const lock = result["lock"];
        this.captorScroll.clearItems(false);
        this.setForwardDatas(result.chapter, lock);
        if (!lock) this.setLevelDatas(result.levels, nextLevelID);
        this.captorScroll.Sort();
        if (lock) {
            this.captorScroll.setEnable(false);
        } else {
            this.captorScroll.setEnable(true);
        }
    }

    setLevelDatas(levels: op_client.IPKT_EXPLORE_LEVEL_DATA[], nextLevelID: number) {
        for (const item of this.levelItems) {
            item.visible = false;
        }
        for (let i = 0; i < levels.length; i++) {
            let item: ChapterLevelItem | ChapterLevelEventuallyItem;
            if (i < this.levelItems.length) {
                if (i === levels.length - 1) {
                    item = this.finalItem;
                } else {
                    item = this.levelItems[i];
                }
            } else {
                if (i === levels.length - 1) {
                    item = new ChapterLevelEventuallyItem(this.scene, this.dpr);
                    this.finalItem = item;
                } else {
                    item = new ChapterLevelItem(this.scene, this.dpr);
                    this.levelItems.push(item);
                }
                item.setHandler(new Handler(this, this.onChapterLevelHandler));
            }
            this.captorScroll.addItem(item);
            item.visible = true;
            const data = levels[i];
            const lock = data.levelId >= nextLevelID ? true : false;
            item.setLevelData(data, lock);
        }
    }

    setForwardDatas(data: op_client.IPKT_EXPLORE_CHAPTER_DATA, lock: boolean) {
        if (!this.forewordItem) {
            this.forewordItem = new ForewordChapterItem(this.scene, this.dpr);
            this.forewordItem.on(ClickEvent.Tap, this.onForewordClickHandler, this);
            this.captorScroll.addItem(this.forewordItem);
        }
        this.forewordItem.setCaptoreData(data);
        const numTex = i18n.language !== "zh-CN" ? data.chapterId + "" : ChineseUnit.numberToChinese(data.chapterId);
        this.titleTex.text = i18n.t("explore.chaptertitle", { name: numTex });
        if (lock) {
            this.lockItem = new ChapterLevelLockItem(this.scene, this.dpr);
            this.lockItem.setHandler(new Handler(this, this.onChapterLockHandler));
            this.captorScroll.addItem(this.lockItem);
        }
    }

    protected init() {
        this.titlebg = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "explore_title" });
        this.titleTex = this.scene.make.text({ style: UIHelper.whiteStyle(this.dpr, 18) });
        this.titleTex.setFontStyle("bold");
        this.captorScroll = new GameScroller(this.scene, {
            x: 0,
            y: 0,
            width: this.width,
            height: this.height,
            zoom: this.zoom,
            dpr: this.dpr,
            align: 2,
            orientation: 1,
            space: 20 * this.dpr,
            valuechangeCallback: (value) => {
                this.onScrollValueChange(value);
            },
            cellupCallBack: (gameobject) => {
                this.onScrollClickHandler(gameobject);
            }
        });
        this.add([this.titlebg, this.titleTex, this.captorScroll]);
        this.resize(this.width, this.height);
    }
    private onScrollClickHandler(obj) {

    }
    private onScrollValueChange(value: number) {
        if (value < 1) {
            if (this.send) this.send.runWith(["move", false]);
        } else if (this.send) this.send.runWith(["move", true]);
        for (const item of this.levelItems) {
            item.refreshMask();
        }
    }

    private onForewordClickHandler() {
        if (this.send) this.send.runWith(["foreword", this.chapterResult]);
    }

    private onChapterLevelHandler(data: op_client.IPKT_EXPLORE_LEVEL_DATA) {
        if (this.send) this.send.runWith(["level", this.chapterResult.chapter.chapterId, data.levelId]);
    }

    private onChapterLockHandler(tag: string, data: any) {
        if (tag === "lockgo") {

        } else if (tag === "lockfinish") {

        }
    }
}

class ForewordChapterItem extends ButtonEventDispatcher {
    public captoreData: op_client.IPKT_EXPLORE_CHAPTER_DATA;
    private icon: DynamicImage;
    constructor(scene: Phaser.Scene, dpr: number) {
        super(scene, 0, 0, false);
        this.dpr = dpr;
        this.init();
    }

    public setCaptoreData(data: op_client.IPKT_EXPLORE_CHAPTER_DATA) {
        this.captoreData = data;
        const url = Url.getOsdRes(data.imagePath);
        this.icon.load(url);
    }

    protected init() {
        const bg = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "explore_chapter_total" });
        this.setSize(bg.width, bg.height);
        const title = this.scene.make.text({ text: i18n.t("explore.foreword"), style: UIHelper.whiteStyle(this.dpr, 11) });
        title.setFontStyle("bold");
        title.y = -this.height * 0.5 + 20 * this.dpr;
        this.icon = new DynamicImage(this.scene, 0, 0);
        this.add([bg, title, this.icon]);
    }
}

class ChapterLevelBaseItem extends Phaser.GameObjects.Container {
    protected dpr: number;
    protected unlock: boolean = false;
    protected send: Handler;
    protected chapterData: any;
    constructor(scene: Phaser.Scene, dpr: number) {
        super(scene);
        this.dpr = dpr;
        this.init();
    }
    refreshMask() {

    }
    public setLevelData(data: any, lock: boolean) {
        this.chapterData = data;
        this.unlock = lock;
    }

    public setHandler(send: Handler) {
        this.send = send;
    }

    protected init() {

    }
}

class ChapterLevelItem extends ChapterLevelBaseItem {
    protected dpr: number;
    private bg: Phaser.GameObjects.Image;
    private imgMask: Phaser.GameObjects.Image;
    private levelTex: Phaser.GameObjects.Text;
    private nameTex: Phaser.GameObjects.Text;
    private leftLine: Phaser.GameObjects.Image;
    private rightLine: Phaser.GameObjects.Image;
    private starProgress: ProgressMaskBar;
    private icon: DynamicImage;
    private openButton: ThreeSliceButton;
    private unlockTex: Phaser.GameObjects.Text;
    private energyImg: ImageValue;
    private lockimg: Phaser.GameObjects.Image;
    private clueItms: PicaChapterLevelClue[];
    constructor(scene: Phaser.Scene, dpr: number) {
        super(scene, dpr);
    }
    refreshMask() {
        this.starProgress.refreshMask();

    }
    public setLevelData(data: op_client.IPKT_EXPLORE_LEVEL_DATA, lock: boolean) {
        super.setLevelData(data, lock);
        this.levelTex.text = data.levelId + "";
        this.starProgress.setProgress(data.progress, 500);
        const url = Url.getOsdRes(data.imagePath);
        this.icon.load(url);
        this.nameTex.text = data.name;
        this.energyImg.setText("-15");
        this.setClueData(data.clueItems);
        this.lockimg.visible = lock;
        this.icon.visible = !lock;
        if (lock) {
            const frames = ["butt_gray_left_s", "butt_gray_middle_s", "butt_gray_right_s"];
            this.openButton.setFrame(frames);
        } else {
            const frames = ["butt_yellow_left_s", "butt_yellow_middle_s", "butt_yellow_right_s"];
            this.openButton.setFrame(frames);
        }
    }

    public setClueData(datas: op_client.ICountablePackageItem[]) {
        for (const item of this.clueItms) {
            item.visible = false;
        }
        if (!datas) return;
        for (let i = 0; i < datas.length; i++) {
            let item: PicaChapterLevelClue;
            if (i < this.clueItms.length) {
                item = this.clueItms[i];
            } else {
                item = new PicaChapterLevelClue(this.scene, this.dpr, 43 * this.dpr, 43 * this.dpr);
                this.clueItms.push(item);
                this.add(item);
            }
            item.visible = true;
            item.setItemData(datas[i]);
        }
        this.setLayoutItems(datas.length);
    }

    public setLayoutItems(count: number) {
        const rightMidx = this.width * 0.5 - 94 * this.dpr;
        const posy = -10 * this.dpr;
        if (count === 1) {
            this.clueItms[0].x = rightMidx;
            this.clueItms[0].y = posy;
        } else {
            const cellwidth = 42 * this.dpr, space = 16 * this.dpr;
            let posx = rightMidx - (cellwidth + space) * 0.5;
            for (let i = 0; i < 2; i++) {
                const item = this.clueItms[i];
                item.x = posx;
                item.y = posy;
                posx += cellwidth + space;
            }
        }
    }

    public setHandler(send: Handler) {
        this.send = send;
    }

    protected init() {
        this.bg = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "explore_chapter_checkpoint" });
        // this.imgMask = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "explore_chapter_checkpoint" });
        this.setSize(this.bg.width, this.bg.height);
        const leftMidX = -this.width * 0.5 + 94 * this.dpr;
        const rightMidx = this.width * 0.5 - 94 * this.dpr;
        const topy = -this.height * 0.5 + 23 * this.dpr;
        this.leftLine = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "explore_chapter_explore_chapter_left" });
        this.leftLine.x = leftMidX - this.leftLine.width;
        this.leftLine.y = topy;
        this.rightLine = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "explore_chapter_explore_chapter_right" });
        this.rightLine.x = leftMidX + this.rightLine.width;
        this.rightLine.y = this.leftLine.y;
        this.levelTex = this.scene.make.text({ text: "", style: UIHelper.colorStyle("#5885FD", this.dpr * 17) });
        this.levelTex.setFontStyle("bold");
        this.levelTex.y = this.leftLine.y;
        this.levelTex.x = leftMidX;
        this.nameTex = this.scene.make.text({ text: "", style: UIHelper.colorStyle("#8743B9", this.dpr * 14) });
        this.nameTex.setFontStyle("bold");
        this.nameTex.x = rightMidx;
        this.nameTex.y = topy;
        this.starProgress = new ProgressMaskBar(this.scene, UIAtlasName.explorelog, "Settlement_star_default", "Settlement_star_Light");
        this.starProgress.x = leftMidX;
        this.starProgress.y = topy + this.leftLine.height * 0.5 + this.starProgress.height * 0.5 + 5 * this.dpr;
        const iconbg = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "explore_chapter_scene_bg" });
        iconbg.x = leftMidX;
        iconbg.y = this.starProgress.y + this.starProgress.height * 0.5 + iconbg.height * 0.5 + 5 * this.dpr;
        this.icon = new DynamicImage(this.scene, iconbg.x, iconbg.y);
        this.lockimg = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "explore_chapter_scene_lock" });
        this.unlockTex = this.scene.make.text({ style: UIHelper.blackStyle(this.dpr, 11) }).setOrigin(0);
        this.unlockTex.setWordWrapWidth(106 * this.dpr);
        this.unlockTex.x = rightMidx - 53 * this.dpr;
        this.unlockTex.y = topy + 15 * this.dpr;
        const frames = ["butt_yellow_left_s", "butt_yellow_middle_s", "butt_yellow_right_s"];
        this.openButton = new ThreeSliceButton(this.scene, 88 * this.dpr, 30 * this.dpr, UIAtlasName.uicommon, frames, frames, i18n.t("explore.open"));
        this.openButton.setTextStyle(UIHelper.whiteStyle(this.dpr, 13));
        this.openButton.setFontStyle("bold");
        this.openButton.setTextOffset(-15 * this.dpr, 0);
        this.openButton.on(ClickEvent.Tap, this.onClickHandler, this);
        this.energyImg = new ImageValue(this.scene, 43 * this.dpr, 15 * this.dpr, UIAtlasName.uicommon, "explore_physical_icon", this.dpr, UIHelper.blackStyle(this.dpr, 14));
        this.energyImg.x = 2 * this.dpr;
        this.energyImg.setOffset(-4 * this.dpr, 0);
        this.energyImg.setLayout(1);
        this.energyImg.setText("");
        this.openButton.add(this.energyImg);
        this.add([this.bg, this.leftLine, this.rightLine, this.levelTex, this.nameTex, this.starProgress, iconbg, this.icon, this.lockimg, this.unlockTex, this.openButton]);
    }

    private onClickHandler() {
        if (!this.unlock) return;
        if (this.send) this.send.runWith([this.chapterData]);
    }
}

class ChapterLevelLockItem extends ChapterLevelBaseItem {
    private bg: Phaser.GameObjects.Image;
    private nameTex: Phaser.GameObjects.Text;
    private leftLine: Phaser.GameObjects.Image;
    private rightLine: Phaser.GameObjects.Image;
    private goButton: ThreeSliceButton;
    private finishButton: ThreeSliceButton;
    private leftTex: Phaser.GameObjects.Text;
    private rightTex: Phaser.GameObjects.Text;
    private leftbg: Phaser.GameObjects.Image;
    private rightbg: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, dpr: number) {
        super(scene, dpr);
    }

    public setLevelData(data: op_client.IPKT_EXPLORE_CHAPTER_DATA, lock: boolean) {
        super.setLevelData(data, lock);
        this.rightTex.text = i18n.t("explore.unlocktips", { name: data.requiredPlayerLevel });
    }

    protected init() {
        this.bg = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "explore_chapter_checkpoint" });
        this.setSize(this.bg.width, this.bg.height);
        const leftMidX = - 94 * this.dpr;
        const rightMidx = 94 * this.dpr;
        const topy = -this.height * 0.5 + 23 * this.dpr;
        this.leftLine = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "explore_chapter_explore_chapter_left" });
        this.leftLine.x = leftMidX - this.leftLine.width;
        this.leftLine.y = topy;
        this.rightLine = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "explore_chapter_explore_chapter_right" });
        this.rightLine.x = rightMidx + this.rightLine.width;
        this.rightLine.y = this.leftLine.y;

        this.nameTex = this.scene.make.text({ text: i18n.t("explore.nextleveltips"), style: UIHelper.colorStyle("#8743B9", this.dpr * 14) });
        this.nameTex.setFontStyle("bold");
        this.nameTex.x = rightMidx;
        this.nameTex.y = topy;

        this.leftbg = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "explore_chapter_scene_bg" });
        this.leftbg.x = leftMidX;
        this.leftbg.y = topy + this.leftbg.height * 0.5 + 20 * this.dpr;

        this.leftTex = this.scene.make.text({ text: i18n.t("explore.finishchaptertips"), style: UIHelper.colorStyle("#8743B9", this.dpr * 14) });
        this.leftTex.x = this.leftbg.x;
        this.leftTex.y = this.leftbg.y;

        this.rightbg = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "explore_chapter_scene_bg" });
        this.rightbg.x = rightMidx;
        this.rightbg.y = topy + this.leftbg.height * 0.5 + 20 * this.dpr;

        this.rightTex = this.scene.make.text({ text: "", style: UIHelper.colorStyle("#8743B9", this.dpr * 14) });
        this.rightTex.x = this.rightbg.x;
        this.rightTex.y = this.rightbg.y;

        const frames = ["butt_yellow_left_s", "butt_yellow_middle_s", "butt_yellow_right_s"];
        this.goButton = new ThreeSliceButton(this.scene, 88 * this.dpr, 30 * this.dpr, UIAtlasName.uicommon, frames, frames, i18n.t("explore.open"));
        this.goButton.setTextStyle(UIHelper.brownishStyle(this.dpr, 13));
        this.goButton.setFontStyle("bold");
        this.goButton.setTextOffset(-15 * this.dpr, 0);
        this.goButton.on(ClickEvent.Tap, this.onGoClickHandler, this);
        this.goButton.x = -this.goButton.width * 0.5 - 30 * this.dpr;
        this.goButton.y = this.height * 0.5 + 10 * this.dpr;

        this.finishButton = new ThreeSliceButton(this.scene, 88 * this.dpr, 30 * this.dpr, UIAtlasName.uicommon, frames, frames, i18n.t("explore.open"));
        this.finishButton.setTextStyle(UIHelper.brownishStyle(this.dpr, 13));
        this.finishButton.setFontStyle("bold");
        this.finishButton.setTextOffset(-15 * this.dpr, 0);
        this.finishButton.on(ClickEvent.Tap, this.onFinishClickHandler, this);
        this.finishButton.x = this.finishButton.width * 0.5 + 30 * this.dpr;
        this.finishButton.y = this.height * 0.5 + 10 * this.dpr;

        this.add([this.bg, this.leftLine, this.rightLine, this.nameTex, this.leftbg, this.leftTex, this.rightbg, this.rightTex, this.goButton, this.finishButton]);
    }

    private onGoClickHandler() {
        if (this.send) this.send.runWith(["lockgo", this.chapterData]);
    }

    private onFinishClickHandler() {
        if (this.send) this.send.runWith(["lockfinish", this.chapterData]);
    }
}

class ChapterLevelEventuallyItem extends ChapterLevelBaseItem {
    private bg: Phaser.GameObjects.Image;
    private iconbg1: Phaser.GameObjects.Image;
    private iconbg2: Phaser.GameObjects.Image;
    private iconbg3: Phaser.GameObjects.Image;
    private icon: DynamicImage;
    private nameTex: Phaser.GameObjects.Text;
    private leftLine: Phaser.GameObjects.Image;
    private rightLine: Phaser.GameObjects.Image;
    private openButton: ThreeSliceButton;
    constructor(scene: Phaser.Scene, dpr: number) {
        super(scene, dpr);
    }

    public setLevelData(data: op_client.IPKT_EXPLORE_LEVEL_DATA, lock: boolean) {
        super.setLevelData(data, lock);
        const url = Url.getOsdRes(data.imagePath);
        this.icon.load(url);
    }

    protected init() {
        this.bg = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "explore_chapter_end_checkpoint" });
        this.setSize(this.bg.width, this.bg.height);
        const topy = -this.height * 0.5 + 23 * this.dpr;
        this.nameTex = this.scene.make.text({ text: i18n.t("explore.eventuallytips"), style: UIHelper.colorStyle("#8743B9", this.dpr * 14) });
        this.nameTex.setFontStyle("bold");
        this.nameTex.y = topy;
        this.leftLine = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "explore_chapter_end_left" });
        this.leftLine.y = this.nameTex.y;
        this.leftLine.x = this.nameTex.width * 0.5 - this.leftLine.width * 0.5 - 10 * this.dpr;
        this.rightLine = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "explore_chapter_end_right" });
        this.rightLine.y = this.leftLine.y;
        this.rightLine.x = this.nameTex.width * 0.5 + this.rightLine.width * 0.5 + 10 * this.dpr;
        this.iconbg1 = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "explore_chapter_end_close" });
        this.iconbg2 = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "explore_chapter_end_undraw" });
        this.iconbg3 = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "explore_chapter_end_curtain" });
        this.icon = new DynamicImage(this.scene, 0, 0);

        const frames = ["butt_yellow_left_s", "butt_yellow_middle_s", "butt_yellow_right_s"];
        this.openButton = new ThreeSliceButton(this.scene, 88 * this.dpr, 30 * this.dpr, UIAtlasName.uicommon, frames, frames, i18n.t("explore.open"));
        this.openButton.setTextStyle(UIHelper.brownishStyle(this.dpr, 13));
        this.openButton.setFontStyle("bold");
        this.openButton.setTextOffset(-15 * this.dpr, 0);
        this.openButton.on(ClickEvent.Tap, this.onGoClickHandler, this);
        this.openButton.x = 0;
        this.openButton.y = this.height * 0.5 + 10 * this.dpr;

        this.add([this.bg, this.iconbg1, this.icon, this.iconbg2, this.iconbg3, this.leftLine, this.rightLine, this.nameTex, this.openButton]);
    }

    private onGoClickHandler() {
        if (this.send) this.send.runWith(["eventuallygo", this.chapterData]);
    }

}
