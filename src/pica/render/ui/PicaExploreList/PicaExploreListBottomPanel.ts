import { Button, ClickEvent } from "apowophaserui";
import { ButtonEventDispatcher } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { Handler, UIHelper } from "utils";
import { op_client } from "pixelpai_proto";

export class PicaExploreListBottomPanel extends Phaser.GameObjects.Container {
    private bg: Phaser.GameObjects.Image;
    private leftButton: Button;
    private rightButton: Button;
    private zoom: number;
    private dpr: number;
    private chapterItems: ChapterItemProgress[]=[];
    private chapterProDatas: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_EXPLORE_CHAPTER_PROGRESS;
    private curChapterID: number = 0;
    private send: Handler;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene, dpr, zoom);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.init();
    }

    resize(w: number, h: number) {
        this.setSize(w, h);
        this.leftButton.x = -this.width * 0.5 + 48 * this.dpr;
        this.rightButton.x = this.width * 0.5 - 48 * this.dpr;
    }
    refreshMask() {
        for (const item of this.chapterItems) {
            item.refreshMask();
        }
    }

    setChapterDatas(data: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_EXPLORE_CHAPTER_PROGRESS, nextChapterID: number) {
        this.chapterProDatas = data;
        this.curChapterID = nextChapterID;
        this.setChapterProData();

    }

    setHandler(send: Handler) {
        this.send = send;
    }

    public setChapterProData() {
        if (!this.chapterProDatas) return;
        const chapters = this.chapterProDatas.chapters;
        let chapterid = this.curChapterID - 2;
        for (let i = 0; i < 4; i++) {
            chapterid += i;
            const item = this.chapterItems[i];
            if (chapterid < 1) {
                item.setChapterData(chapters[chapterid - 1]);
                if (chapterid >= chapters.length) {
                    item.setChapterData(undefined);
                }
            } else {
                item.setChapterData(undefined);
            }
        }
    }

    protected init() {
        this.bg = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "explore_nav_bg" });
        this.bg.displayWidth = this.width;
        this.leftButton = new Button(this.scene, UIAtlasName.explorelog, "explore_switch_left");
        this.rightButton = new Button(this.scene, UIAtlasName.explorelog, "explore_switch_right");
        this.leftButton.on(ClickEvent.Tap, this.onLeftClickHandler, this);
        this.rightButton.on(ClickEvent.Tap, this.onRightClickHandler, this);
        this.add([this.bg, this.leftButton, this.rightButton]);
        this.createChapterItems();
        this.resize(this.width, this.bg.height);
    }

    protected createChapterItems() {
        const space = 16 * this.dpr;
        let posx = -91 * this.dpr;
        for (let i = 0; i < 5; i++) {
            const zoom = i === 2 ? true : false;
            const item = new ChapterItemProgress(this.scene, this.dpr, this.zoom, zoom);
            item.setHandler(new Handler(this, this.onChapterProHandler));
            item.x = posx;
            posx += item.width * 0.5 + space;
            this.chapterItems.push(item);
        }
        this.add(this.chapterItems);
    }

    private onLeftClickHandler() {
        this.curChapterID--;
        if (this.curChapterID < 1) this.curChapterID = 1;
        this.setChapterProData();
    }

    private onRightClickHandler() {
        this.curChapterID++;
        if (!this.chapterProDatas) this.curChapterID = 1;
        if (this.curChapterID > this.chapterProDatas.chapters.length) {
            this.curChapterID = this.chapterProDatas.chapters.length;
        }
        this.setChapterProData();
    }

    private onChapterProHandler(chapterID: number) {
        if (this.send) this.send.runWith(["chapterdata", chapterID]);
    }

}

class ChapterItemProgress extends ButtonEventDispatcher {
    public dpr: number;
    private zoom: number;
    private bg: Phaser.GameObjects.Image;
    private lightbg: Phaser.GameObjects.Image;
    private topbg: Phaser.GameObjects.Image;
    private levelTex: Phaser.GameObjects.Text;
    private barmask: Phaser.GameObjects.Graphics;
    private finishImg: Phaser.GameObjects.Image;
    private lockImg: Phaser.GameObjects.Image;
    private chapterProData: op_client.IPKT_EXPLORE_CHAPTER_PROGRESS;
    private send: Handler;
    private proValue: number = 0;
    private isZoom: boolean;
    private unlock: boolean = false;
    constructor(scene: Phaser.Scene, dpr: number, zoom: number, isZoom?: boolean) {
        super(scene, 0, 0, false);
        this.dpr = dpr;
        this.zoom = zoom;
        this.isZoom = isZoom;
        this.init();
        this.setZoom(isZoom);
    }

    /**
     *
     * progress [-1,0,100] -1 为未解锁,进度最大值为100
     */
    public setChapterData(data: op_client.IPKT_EXPLORE_CHAPTER_PROGRESS) {
        this.chapterProData = data;
        if (!data) {
            this.lockImg.visible = false;
            this.setProgress(0);
            this.finishImg.visible = false;
            this.unlock = false;
        } else {
            if (this.chapterProData.progress === -1) {
                this.unlock = false;
                this.lockImg.visible = true;
                this.finishImg.visible = false;
                this.setProgress(0);
            } else {
                this.unlock = true;
                if (data.progress === 100) this.finishImg.visible = true;
                else this.finishImg.visible = false;
                this.lockImg.visible = false;
                this.setProgress(data.progress / 100);
            }
            this.levelTex.text = data.chapterId + "";
        }
    }

    public setProgress(value: number) {
        const startAngle = -90;
        const endAngle = 360 * value - 90;
        this.barmask.clear();
        this.barmask.fillStyle(0xffffff);
        this.barmask.slice(0, 0, 43 * this.dpr / this.zoom, Phaser.Math.DegToRad(startAngle), Phaser.Math.DegToRad(endAngle), false);
        this.barmask.fillPath();
        this.proValue = value;
    }

    refreshMask() {
        const world = this.getWorldTransformMatrix();
        this.barmask.setPosition(world.tx, world.ty);
    }

    destroy() {
        super.destroy();
        this.barmask.destroy();
    }

    setZoom(zoom: boolean) {
        if (zoom) {
            this.bg.setFrame("explore_sequence_select_bottom");
            this.lightbg.setFrame("explore_sequence_select_schedule");
            this.topbg.setFrame("explore_sequence_select_top");
            this.finishImg.setFrame("explore_sequence_uncheck_big");
            this.levelTex.setFontSize(24 * this.dpr);
            this.setSize(this.bg.width, this.bg.height);
        } else {
            this.bg.setFrame("explore_sequence_uncheck_bottom");
            this.lightbg.setFrame("explore_sequence_uncheck_schedule");
            this.topbg.setFrame("explore_sequence_uncheck_top");
            this.finishImg.setFrame("explore_sequence_uncheck_small");
            this.levelTex.setFontSize(16 * this.dpr);
            this.setSize(this.bg.width, this.bg.height);
        }
        this.enable = false;
        this.enable = true;
    }

    public setHandler(send: Handler) {
        this.send = send;
    }
    protected init() {
        this.bg = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "explore_sequence_uncheck_bottom" });
        this.lightbg = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "explore_sequence_uncheck_schedule" });
        this.topbg = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "explore_sequence_uncheck_top" });
        this.levelTex = this.scene.make.text({ style: UIHelper.whiteStyle(this.dpr, 16) });
        this.finishImg = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "explore_sequence_uncheck_small" });
        this.lockImg = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "explore_switch_lock" });
        this.finishImg.y = this.height * 0.5;
        this.barmask = this.scene.make.graphics(undefined, false);
        this.lightbg.mask = this.barmask.createGeometryMask();
        this.add([this.bg, this.lightbg, this.topbg, this.levelTex, this.finishImg, this.lockImg]);
        this.setSize(this.bg.width, this.bg.height);
        this.on(ClickEvent.Tap, this.onClickHandler, this);
    }

    private onClickHandler() {
        if (!this.unlock) return;
        if (this.send) this.send.runWith(this.chapterProData.chapterId);
    }
}
