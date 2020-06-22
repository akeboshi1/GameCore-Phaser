import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { UIAtlasKey, UIAtlasName } from "../ui.atals.name";
import { i18n } from "../../i18n";
import { DynamicImage } from "../components/dynamic.image";
import { Button, GameScroller, NineSliceButton, NinePatch } from "tooqingui";
import { Handler } from "../../Handler/Handler";
export class TaskPanel extends BasePanel {
    private key = "task_ui";
    private blackBg: Phaser.GameObjects.Graphics;
    private bg: NinePatch;
    private titlebg: Phaser.GameObjects.Image;
    private tilteName: Phaser.GameObjects.Text;
    private closeBtn: Phaser.GameObjects.Image;
    private optionBtn: Phaser.GameObjects.Text;
    private optionArrow: Phaser.GameObjects.Image;
    private optionCon: Phaser.GameObjects.Container;
    private mGameScroll: GameScroller;
    private taskItems: TaskItem[] = [];
    private content: Phaser.GameObjects.Container;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.scale = 1;
    }
    resize(width?: number, height?: number) {
        const w: number = this.scaleWidth;
        const h: number = this.scaleHeight;
        super.resize(w, h);
        this.setSize(w, h);
        this.blackBg.clear();
        this.blackBg.fillStyle(0, 0.5);
        this.blackBg.fillRoundedRect(-this.x, -this.y, w, h);
        this.content.x = w * 0.5;
        this.content.y = h * 0.5;
        this.mGameScroll.refreshMask();
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
        this.addAtlas(this.key, "task/task.png", "task/task.json");
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.common + ".png", UIAtlasName.common + ".json");
        super.preload();
    }
    init() {
        this.setSize(this.scaleWidth, this.scaleWidth);
        this.blackBg = this.scene.make.graphics(undefined, false);
        this.add(this.blackBg);
        const conWdith = 300 * this.dpr;
        const conHeight = 418 * this.dpr;
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(conWdith, conHeight);
        this.add(this.content);
        this.bg = new NinePatch(this.scene, 0, 0, conWdith, conHeight, UIAtlasKey.commonKey, "bg", undefined, undefined, {
            left: 40,
            top: 40,
            bottom: 40,
            right: 40,
        });
        const bgwidth = this.bg.width;
        const bgHeight = this.bg.height;
        const posY = -this.bg.height * 0.5;
        this.titlebg = this.scene.make.image({ x: 0, y: posY, key: this.key, frame: "title" });
        const mfont = `bold ${15 * this.dpr}px Source Han Sans`;
        this.tilteName = this.scene.make.text({ x: 0, y: posY, text: i18n.t("task.title"), style: { font: mfont, color: "#8F4300", fontSize: 15 * this.dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5, 0);
        this.closeBtn = this.scene.make.image({ x: this.bg.width * 0.5 - this.dpr * 5, y: posY + this.dpr * 5, key: UIAtlasKey.commonKey, frame: "close" });
        this.tilteName.setStroke("#8F4300", 1);
        this.closeBtn.setInteractive();
        const optionWidth = 253 * this.dpr;
        const optionHeight = 26 * this.dpr;
        this.optionBtn = this.scene.make.text({ x: 0, y: posY, text: "全部", style: { color: "#8F4300", fontSize: 15 * this.dpr, fontFamily: Font.DEFULT_FONT } });
        this.optionBtn.setInteractive();
        this.optionBtn.on("pointerup", this.onOpenOptionHandler, this);
        this.optionArrow = this.scene.make.image({ x: 0, y: posY, key: this.key, frame: "drop_down" });
        this.optionCon = this.scene.make.container(undefined, false);
        const optionLine = this.scene.make.graphics(undefined, false);
        optionLine.clear();
        optionLine.fillStyle(0, 1);
        optionLine.fillRect(-optionWidth * 0.5, -1, optionWidth, 2);
        this.optionCon.add(optionLine);
        this.mGameScroll = new GameScroller(this.scene, {
            x: 0,
            y: 0,
            width: bgwidth,
            height: bgHeight - 60 * this.dpr,
            zoom: this.scale,
            align: 2,
            orientation: 0,
            space: 40 * this.dpr
        });
        this.content.add([this.bg, this.closeBtn, this.titlebg, this.tilteName, this.mGameScroll, this.optionCon]);
        this.resize();
        super.init();
        this.setTaskDatas(null);
    }

    setTaskDatas(quests: op_client.PKT_Quest[]) {
        if (!this.mInitialized) return;

        for (let i = 0; i < 10; i++) {
            const item = new TaskItem(this.scene, this.key, this.dpr, this.scale);
            this.mGameScroll.addItem(item);
            item.setHandler(new Handler(this, this.onExtendsHandler), new Handler(this, this.onFinishHandler));
            this.taskItems.push(item);
        }
        this.mGameScroll.Sort();
    }

    setTaskDetail(quest: op_client.PKT_Quest) {

    }

    setTaskOptions() {
        const enumArr: op_pkt_def.PKT_Quest_Type[] = [];
        const PKT_Quest_Type = op_pkt_def.PKT_Quest_Type;
        for (const key in PKT_Quest_Type) {
            if (!isNaN(Number(key))) {
                const quest_Type: any = PKT_Quest_Type[key];
                const questEnum: op_pkt_def.PKT_Quest_Type = quest_Type;
                enumArr.push(questEnum);
            }
        }
        const list = <TaskOption[]>this.optionCon.list;
        for (const option of list) {
            option.visible = false;
        }

        for (let i = 0; i < enumArr.length; i++) {
            let option: TaskOption;
            if (i < enumArr.length) {
                option = list[i];
            } else {
                option = new TaskOption(this.scene, this.key, this.dpr, this.scale);
                option.setOptionData(enumArr[i]);
                option.setHandler(new Handler(this, this.onTaskOptionHandler));
                list.push(option);
            }
        }
        let value = 0;
        const offsety = 10 * this.dpr;
        for (const item of list) {
            item.y = item.height * item.originY + value;
            value += item.height + offsety;
        }
    }

    destroy() {
        super.destroy();
    }

    private OnClosePanel() {
        this.emit("hide");
    }

    private onFinishHandler() {

    }

    private onExtendsHandler() {

    }

    private onOpenOptionHandler() {
        this.optionCon.visible = !this.optionCon.visible;
    }

    private onTaskOptionHandler(taskOption: TaskOption) {
        const list = <TaskOption[]>this.optionCon.list;
        for (const option of list) {
            option.changeNormal();
        }
    }
}

class TaskItem extends Phaser.GameObjects.Container {
    private bg: NinePatch;
    private headIcon: DynamicImage;
    private typeBg: Phaser.GameObjects.Image;
    private typeTex: Phaser.GameObjects.Text;
    private taskName: Phaser.GameObjects.Text;
    private taskDes: Phaser.GameObjects.Text;
    private finish: Phaser.GameObjects.Image;
    private openBtn: Button;
    private closeBtn: Button;
    private extend: TaskItemExtend;
    private key: string;
    private dpr: number;
    private zoom: number;
    private extendHandler: Handler;
    private finishHandler: Handler;
    constructor(scene: Phaser.Scene, key: string, dpr: number, zoom: number) {
        super(scene);
        this.key = key;
        this.dpr = dpr;
        this.zoom = zoom;
        const width = 254 * dpr;
        const height = 45 * dpr;
        this.bg = new NinePatch(this.scene, 0, 0, width, height, key, "main_bg", undefined, undefined, {
            left: 6 * dpr,
            top: 6 * dpr,
            bottom: 6 * dpr,
            right: 6 * dpr,
        });
        const posx = -width * 0.5, posy = -height * 0.5;
        this.headIcon = new DynamicImage(scene, posx + 40 * dpr, 0);
        this.headIcon.setTexture(key, "head_test");
        this.typeBg = scene.make.image({ key, frame: "tag_main" });
        this.typeBg.setPosition(posx + this.typeBg.width * 0.5, posy + this.typeBg.height * 0.5);
        this.typeTex = scene.make.text({ x: 0, y: 0, text: i18n.t("task.m"), style: { color: "#8F4300", fontSize: 15 * this.dpr, fontFamily: Font.DEFULT_FONT } });
        this.typeTex.setOrigin(0.5).setPosition(this.typeBg.x, this.typeBg.y);
        this.taskName = scene.make.text({ x: this.headIcon.x + 10 * dpr, y: -10 * dpr, text: "获得两把钥匙", style: { color: "#8F4300", fontSize: 15 * this.dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0, 0.5);
        this.taskDes = scene.make.text({ x: this.headIcon.x + 10 * dpr, y: 10 * dpr, text: "任务要求获得两把钥匙", style: { color: "#8F4300", fontSize: 15 * this.dpr, fontFamily: Font.DEFULT_FONT } });
        this.finish = scene.make.image({ key, frame: "done" });
        this.finish.setPosition(width * 0.5, 0);
        this.openBtn = new Button(scene, key, "open", "open");
        this.openBtn.setPosition(width * 0.5 - 20 * dpr, 0);
        this.closeBtn = new Button(scene, key, "close");
        this.closeBtn.setPosition(this.openBtn.x, 0).visible = false;
        this.openBtn.on("Tap", this.onOpenHandler, this);
        this.closeBtn.on("Tap", this.onCloseHandler, this);
        this.add([this.bg, this.headIcon, this.typeBg, this.typeTex, this.taskName, this.taskDes, this.finish, this.openBtn, this.closeBtn]);
        this.setSize(width, height);
    }

    public setTaskData(data) {

    }

    public setHandler(extend: Handler, finish: Handler) {
        this.extendHandler = extend;
        this.finishHandler = finish;
    }
    private onOpenHandler() {
        if (!this.extend) {
            this.extend = new TaskItemExtend(this.scene, this.key, this.dpr, this.zoom);
            this.extend.setFinishHandler(new Handler(this, this.onFinishHandler));
            this.add(this.extend);
        }
        this.extend.visible = true;
        this.height += this.extend.height;
        if (this.extendHandler) this.extendHandler.runWith(true);
    }

    private onFinishHandler() {
        if (this.finishHandler) this.finishHandler.run();
    }

    private onCloseHandler() {
        if (this.extend) this.extend.visible = false;
        this.height = this.height - this.extend.height;
        if (this.extendHandler) this.extendHandler.runWith(false);
    }
}
class TaskItemExtend extends Phaser.GameObjects.Container {
    private taskLabel: Phaser.GameObjects.Text;
    private taskTex: Phaser.GameObjects.Text;
    private needArr: TaskCell[] = [];
    private rewardLabel: Phaser.GameObjects.Text;
    private rewardArr: TaskCell[] = [];
    private finishBtn: NineSliceButton;
    private dpr: number = 0;
    private zoom: number = 0;
    private key: string;
    private finishHandler: Handler;
    constructor(scene: Phaser.Scene, key: string, dpr: number, zoom: number) {
        super(scene);
        const width = 240 * dpr;
        const height = 202 * dpr;
        this.dpr = dpr;
        const bg = new NinePatch(this.scene, 0, 0, 286 * dpr * zoom, 331 * dpr * zoom, key, "detail_bg", undefined, undefined, {
            left: 4,
            top: 4,
            right: 4,
            bottom: 4
        });
        const posx = -width * 0.5 + 20 * dpr;
        const posy = -height * 0.5 + 10 * dpr;
        this.taskLabel = scene.make.text({ x: posx, y: posy, text: i18n.t("task.objective"), style: { color: "#8F4300", fontSize: 15 * this.dpr, fontFamily: Font.DEFULT_FONT } });
        this.taskTex = scene.make.text({ x: posx, y: posy + 50 * dpr, text: i18n.t("task.m"), style: { color: "#8F4300", fontSize: 15 * this.dpr, fontFamily: Font.DEFULT_FONT } });
        this.rewardLabel = scene.make.text({ x: posx, y: posy + 80 * dpr, text: i18n.t("task.rewards"), style: { color: "#8F4300", fontSize: 15 * this.dpr, fontFamily: Font.DEFULT_FONT } });
        const line = scene.make.image({ key, frame: "reward_cutline" });
        line.setPosition(0, posy + 120 * dpr);
        this.finishBtn = new NineSliceButton(this.scene, Math.ceil(width * 0.5 - 60 * this.dpr), Math.ceil(height * 0.5 - 40 * this.dpr), 60 * this.dpr, 30 * this.dpr, UIAtlasKey.commonKey, "button_g", i18n.t("task.submit_task"), this.dpr, this.scale, {
            left: 12 * this.dpr,
            top: 12 * this.dpr,
            right: 12 * this.dpr,
            bottom: 12 * this.dpr
        });
        this.finishBtn.on("Tap", this.onFinishHandler, this);
        this.add([bg, this.taskLabel, this.taskTex, this.rewardLabel, line, this.finishBtn]);
        this.setSize(width, height);
        this.key = key;
        this.zoom = zoom;
    }

    public setItemData() {
        const taskArr = 6;
        this.createTaskCells(this.needArr, 6);
        this.createTaskCells(this.rewardArr, 6);

        this.sortItem(this.needArr, -60 * this.dpr);
        this.sortItem(this.rewardArr, 60 * this.dpr);
    }

    public setFinishHandler(comp: Handler) {
        this.finishHandler = comp;
    }

    public sortItem(taskcells: TaskCell[], posY: number = 0) {
        const posx = -this.width * 0.5;
        const list = taskcells;
        let value = 0;
        const offsetx = 10 * this.dpr;
        for (const item of list) {
            item.x = posx + item.width * item.originX + value;
            value += item.width + offsetx;
        }
    }

    private createTaskCells(arr: TaskCell[], len: number) {
        for (const item of arr) {
            item.visible = false;
        }
        for (let i = 0; i < len; i++) {
            let item: TaskCell;
            if (i < arr.length) {
                item = arr[i];
            } else {
                item = new TaskCell(this.scene, this.key, this.dpr, this.zoom);
                arr.push(item);
                this.add(item);
            }

        }
        return arr;
    }

    private onFinishHandler() {
        if (this.finishHandler) this.finishHandler.run();
    }
}
class TaskCell extends Phaser.GameObjects.Container {
    private bg: Phaser.GameObjects.Image;
    private itemIcon: DynamicImage;
    private countTex: Phaser.GameObjects.Text;
    private key: string;
    constructor(scene: Phaser.Scene, key: string, dpr: number, zoom: number) {
        super(scene);
        this.key = key;
        this.bg = scene.make.image({ key, frame: "task_bg" });
        this.setSize(this.bg.width, this.bg.height);
        this.itemIcon = new DynamicImage(scene, 0, 0);
        this.countTex = scene.make.text({ x: 0, y: 0, text: "获得两把钥匙", style: { color: "#8F4300", fontSize: 15 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5);
        this.countTex.setPosition(this.width * 0.5, this.height * 0.5);
        this.add([this.bg, this.itemIcon, this.countTex]);
    }

    public setCellData(isTask: boolean = true) {
        const frame = isTask ? "task_bg" : "reward_bg";
        this.bg.setTexture(this.key, frame);

    }
}

class TaskOption extends Phaser.GameObjects.Container {
    public optionData: op_pkt_def.PKT_Quest_Type;
    private bg: Phaser.GameObjects.Graphics;
    private text: Phaser.GameObjects.Text;
    private clickHandler: Handler;
    constructor(scene: Phaser.Scene, key: string, dpr: number, zoom: number) {
        super(scene);
        const width = 253 * dpr;
        const height = 26 * dpr;
        this.bg = scene.make.graphics(undefined, false);
        this.text = scene.make.text({ x: 0, y: 0, text: "全部", style: { color: "#8F4300", fontSize: 15 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0, 0.5);
        this.bg.clear();
        this.bg.fillStyle(0xffffff, 1);
        const optionLine = this.scene.make.graphics(undefined, false);
        optionLine.clear();
        optionLine.fillStyle(0, 1);
        optionLine.fillRect(-width * 0.5, height * 0.5, width, 2);
        this.add([this.bg, this.text, optionLine]);
        this.setSize(width, height);
        this.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.width, this.height), Phaser.Geom.Rectangle.Contains);
        this.on("pointerup", this.onClickHandler, this);
    }

    public setSize(width: number, height: number) {
        super.setSize(width, height);
        this.text.setPosition(-width * 0.5, 0);
        this.changeNormal();
        return this;
    }
    public setOptionData(data: op_pkt_def.PKT_Quest_Type) {
        this.optionData = data;
    }

    public changeDown() {
        this.bg.clear();
        this.bg.fillStyle(0xffffff, 1);
        this.bg.fillRect(-this.width * 0.5, -this.height, this.width, this.height);
    }

    public changeNormal() {
        this.bg.clear();
        this.bg.fillStyle(0x452342, 1);
        this.bg.fillRect(-this.width * 0.5, -this.height, this.width, this.height);
    }

    public setHandler(handler: Handler) {
        this.clickHandler = handler;
    }

    private onClickHandler() {
        if (this.clickHandler) this.clickHandler.runWith(this);
        this.changeDown();
    }
}
