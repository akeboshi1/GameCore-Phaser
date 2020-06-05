import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { NinePatch } from "../components/nine.patch";
import { op_client } from "pixelpai_proto";
import { UIAtlasKey, UIAtlasName } from "../ui.atals.name";
import { i18n } from "../../i18n";
import { DynamicImage } from "../components/dynamic.image";
import { Button } from "../../../lib/rexui/lib/ui/button/Button";
import { GameScroller } from "../../../lib/rexui/lib/ui/scroller/GameScroller";
import { NineSliceButton } from "../../../lib/rexui/lib/ui/button/NineSliceButton";
import { Handler } from "../../Handler/Handler";
import { TextButton } from "../Market/TextButton";
export class TaskPanel extends BasePanel {
    private key = "task_ui";
    private blackBg: Phaser.GameObjects.Graphics;
    private bg: NinePatch;
    private titlebg: Phaser.GameObjects.Image;
    private tilteName: Phaser.GameObjects.Text;
    private closeBtn: Phaser.GameObjects.Image;
    private optionBtn: Phaser.GameObjects.Text;;
    private optionArrow: Phaser.GameObjects.Image;
    private optionCon: Phaser.GameObjects.Container;
    private mGameScroll: GameScroller;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.scale = 1;
    }
    resize(width: number, height: number) {
        const w: number = this.scene.cameras.main.width / this.scale;
        const h: number = this.scene.cameras.main.height / this.scale;
        super.resize(width, height);
        this.setSize(w, h);
        this.bg.x = w / 2;
        this.bg.y = h / 2;
        this.tilteName.x = this.bg.x;
        this.tilteName.y = this.bg.y - this.bg.height / 2;
        this.titlebg.x = this.bg.x;
        this.titlebg.y = this.bg.y - this.bg.height / 2;
        this.closeBtn.x = this.bg.x + this.bg.width / 2 - 10 * this.dpr * this.scale;
        this.closeBtn.y = this.bg.y - this.bg.height / 2 + 10 * this.dpr * this.scale;
        this.blackBg.clear();
        this.blackBg.fillStyle(0, 0.5);
        this.blackBg.fillRoundedRect(-this.x, -this.y, w, h);
        this.add([this.blackBg, this.bg, this.closeBtn, this.titlebg, this.tilteName]);
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
        this.addAtlas(this.key, "equip_upgrade/mine_eqpm.png", "equip_upgrade/mine_eqpm.json");
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.common + ".png", UIAtlasName.common + ".json");
        super.preload();
    }
    init() {
        const w = this.scaleWidth;
        const h = this.scaleHeight;
        this.setSize(w, h);
        this.blackBg = this.scene.make.graphics(undefined, false);
        this.bg = new NinePatch(this.scene, 0, 0, 300 * this.dpr, 300 * this.dpr, UIAtlasKey.commonKey, "bg", {
            left: 40,
            top: 40,
            bottom: 40,
            right: 40,
        });
        const posY = -this.bg.height * 0.5;
        this.titlebg = this.scene.make.image({ x: 0, y: posY, key: this.key, frame: "title" });
        const mfont = `bold ${15 * this.dpr}px Source Han Sans`;
        this.tilteName = this.scene.make.text({ x: 0, y: posY, text: i18n.t("task.title"), style: { font: mfont, color: "#8F4300", fontSize: 15 * this.dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5, 0);
        this.closeBtn = this.scene.make.image({ x: this.bg.width * 0.5 - this.dpr * 5, y: posY + this.dpr * 5, key: UIAtlasKey.commonKey, frame: "close" });
        this.tilteName.setStroke("#8F4300", 1);
        this.closeBtn.setInteractive();
        // this.optionBtn = new
        //     this.mGameScroll = new GameScroller(this.scene, {
        //         x: width * 0.5,
        //         y: height - 220 * this.dpr,
        //         width,
        //         height: 70 * this.dpr,
        //         zoom: this.scale,
        //         align: 2,
        //         orientation: 1,
        //         valuechangeCallback: undefined,
        //         celldownCallBack: (gameobject) => {
        //             this.materialTipsCon.visible = true;
        //             this.onMaterialItemHandler(gameobject);
        //         },
        //         cellupCallBack: (gameobject) => {
        //             this.materialTipsCon.visible = false;
        //         }
        //     });
        this.add([this.blackBg, this.bg, this.closeBtn, this.titlebg, this.tilteName]);
        this.resize(this.scene.cameras.main.width, this.scene.cameras.main.height);
        super.init();
    }

    setTaskDatas(content: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_MINING_MODE_SHOW_SELECT_EQUIPMENT_PANEL) {
        if (!this.mInitialized) return;
    }

    destroy() {
        super.destroy();
    }

    private OnClosePanel() {
        this.emit("hide");
    }

    private onFinishHandler() {

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
        const height = 40 * dpr;
        this.bg = new NinePatch(this.scene, 0, 0, width, height, UIAtlasKey.commonKey, "main_bg", {
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
        const bg = new NinePatch(this.scene, 0, 0, 286 * dpr * zoom, 331 * dpr * zoom, key, "detail_bg", {
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
