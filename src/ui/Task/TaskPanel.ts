import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { UIAtlasKey, UIAtlasName } from "../ui.atals.name";
import { i18n } from "../../i18n";
import { DynamicImage } from "../components/dynamic.image";
import { Button } from "../../../lib/rexui/lib/ui/button/Button";
import { GameScroller } from "../../../lib/rexui/lib/ui/scroller/GameScroller";
import { NineSliceButton } from "../../../lib/rexui/lib/ui/button/NineSliceButton";
import { Handler } from "../../Handler/Handler";
import { Url } from "../../utils/resUtil";
import { BBCodeText, NineSlicePatch } from "../../../lib/rexui/lib/ui/ui-components";
export class TaskPanel extends BasePanel {
    private key = "task_ui";
    private blackBg: Phaser.GameObjects.Graphics;
    private bg: NineSlicePatch;
    private titlebg: Phaser.GameObjects.Image;
    private tilteName: Phaser.GameObjects.Text;
    private closeBtn: Phaser.GameObjects.Image;
    private optionBtn: Phaser.GameObjects.Text;
    private optionArrow: Phaser.GameObjects.Image;
    private optionCon: Phaser.GameObjects.Container;
    private mGameScroll: GameScroller;
    private taskItems: TaskItem[] = [];
    private content: Phaser.GameObjects.Container;
    private curTaskItem: TaskItem;
    private curOptionItem: TaskOption;
    private taskDatas: op_client.PKT_Quest[];
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
        this.blackBg.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
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
        this.bg = new NineSlicePatch(this.scene, 0, 0, conWdith, conHeight, UIAtlasKey.commonKey, "bg", {
            left: 40,
            top: 40,
            bottom: 40,
            right: 40,
        });
        const bgwidth = this.bg.width;
        const bgHeight = this.bg.height;
        const posY = -this.bg.height * 0.5;
        this.titlebg = this.scene.make.image({ x: 0, y: posY, key: this.key, frame: "title" });
        this.titlebg.y = posY - this.titlebg.height * 0.5 + 20 * this.dpr;
        const mfont = `bold ${15 * this.dpr}px Source Han Sans`;
        this.tilteName = this.scene.make.text({ x: 0, y: posY - 12 * this.dpr, text: i18n.t("task.title"), style: { font: mfont, color: "#8F4300", fontSize: 15 * this.dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5, 0);
        this.closeBtn = this.scene.make.image({ x: this.bg.width * 0.5 - this.dpr * 5, y: posY + this.dpr * 5, key: UIAtlasKey.commonKey, frame: "close" });
        this.tilteName.setStroke("#8F4300", 1);
        this.closeBtn.setInteractive();
        const optionWidth = 253 * this.dpr;
        const optionHeight = 26 * this.dpr;
        this.optionBtn = this.scene.make.text({ x: 0, y: 0, text: "全部", style: { color: "#8F4300", fontSize: 20 * this.dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5);
        this.optionBtn.setInteractive();
        this.optionBtn.on("pointerup", this.onOpenOptionHandler, this);
        this.optionArrow = this.scene.make.image({ x: 0, y: 0, key: this.key, frame: "drop_down" });
        this.optionBtn.x = -bgwidth * 0.5 + 50 * this.dpr;
        this.optionBtn.y = -bgHeight * 0.5 + 30 * this.dpr;
        this.optionArrow.x = this.optionBtn.x + 30 * this.dpr;
        this.optionArrow.y = -bgHeight * 0.5 + 30 * this.dpr;
        const optionLine = this.scene.make.graphics(undefined, false);
        optionLine.clear();
        optionLine.fillStyle(0xc0c0c0, 1);
        optionLine.fillRect(-optionWidth * 0.5, -1, optionWidth, 2);
        optionLine.y = -bgHeight * 0.5 + 50 * this.dpr;
        this.optionCon = this.scene.make.container(undefined, false);
        this.optionCon.visible = false;
        this.optionCon.y = -bgHeight * 0.5 + 50 * this.dpr;
        this.mGameScroll = new GameScroller(this.scene, {
            x: 0,
            y: 18 * this.dpr,
            width: bgwidth,
            height: bgHeight - 70 * this.dpr,
            zoom: this.scale,
            align: 2,
            orientation: 0,
            space: 20 * this.dpr
        });
        this.content.add([this.bg, this.closeBtn, this.titlebg, this.tilteName, this.mGameScroll, this.optionBtn, this.optionArrow, optionLine, this.optionCon]);
        this.resize();
        super.init();
        this.emit("questlist");
    }

    setTaskDatas(quests: op_client.PKT_Quest[]) {
        if (!this.mInitialized) return;
        if (this.curTaskItem) this.curTaskItem.setExtend(false);
        this.taskDatas = quests;
        this.setTaskOptions();
        this.setTaskItems(quests);
        this.onTaskOptionHandler(this.curOptionItem);
    }

    setTaskOptions() {
        const enumArr: op_pkt_def.PKT_Quest_Type[] = [0];
        const PKT_Quest_Type = op_pkt_def.PKT_Quest_Type;
        for (const key in PKT_Quest_Type) {
            const enumValue = Number(key);
            if (!isNaN(enumValue)) {
                const questEnum: op_pkt_def.PKT_Quest_Type = enumValue;
                enumArr.push(questEnum);
            }
        }
        const list = <TaskOption[]>this.optionCon.list;
        for (const option of list) {
            option.visible = false;
        }

        for (let i = 0; i < enumArr.length; i++) {
            let option: TaskOption;
            if (i < list.length) {
                option = list[i];
            } else {
                option = new TaskOption(this.scene, this.key, this.dpr, this.scale);
                option.setHandler(new Handler(this, this.onTaskOptionHandler));
                this.optionCon.add(option);
            }
            option.visible = true;
            option.setOptionData(enumArr[i]);
        }
        let value = 0;
        const offsety = 2;
        for (const item of list) {
            item.y = item.height * item.originY + value;
            value += item.height + offsety;
        }
        if (!this.curOptionItem) this.curOptionItem = list[0];
    }

    setTaskDetail(quest: op_client.PKT_Quest) {
        if (this.curTaskItem && quest) {
            if (this.curTaskItem.questData.id === quest.id) {
                this.curTaskItem.setTaskDetail(quest);
            }
        }
    }

    setTaskItems(quests: op_client.PKT_Quest[]) {
        for (const item of this.taskItems) {
            const task = <TaskItem>item;
            task.visible = false;
        }
        for (let i = 0; i < quests.length; i++) {
            let item: TaskItem;
            if (i < this.taskItems.length) {
                item = this.taskItems[i];
            } else {
                item = new TaskItem(this.scene, this.key, this.dpr, this.scale);
                this.mGameScroll.addItem(item);
                item.setHandler(new Handler(this, this.onExtendsHandler), new Handler(this, this.onFinishHandler));
                this.taskItems.push(item);
            }
            item.setTaskData(quests[i]);
            item.visible = true;
        }
        this.mGameScroll.Sort();
    }

    destroy() {
        super.destroy();
    }

    private OnClosePanel() {
        this.emit("hide");
    }

    private onFinishHandler(id: string) {
        this.emit("submitquest", id);
    }

    private onExtendsHandler(isExtend: boolean, item: TaskItem) {
        this.curTaskItem = item;
        if (isExtend) {
            this.emit("questdetail", item.questData.id);
        } else this.curTaskItem = null;
        this.mGameScroll.Sort(true);
    }

    private onOpenOptionHandler() {
        const visible = this.optionCon.visible;
        this.optionCon.visible = !visible;
        this.optionArrow.scaleY = (visible ? -1 : 1);
    }

    private onTaskOptionHandler(taskOption: TaskOption) {
        const list = <TaskOption[]>this.optionCon.list;
        for (const option of list) {
            option.changeNormal();
        }
        const optionData = taskOption.optionData;
        let arr: any;
        if (optionData === 0) {
            arr = this.taskDatas;
        } else {
            arr = this.taskDatas.filter((data) => {
                if (data.questType === taskOption.optionData) return true;
                else return false;
            });
        }
        this.setTaskItems(arr);
        this.optionCon.visible = false;
        this.curOptionItem = taskOption;
        taskOption.changeDown();
    }
}

class TaskItem extends Phaser.GameObjects.Container {
    public questData: op_client.PKT_Quest;
    private content: Phaser.GameObjects.Container;
    private bg: NineSlicePatch;
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
        this.content = scene.make.container(undefined, false);
        this.content.setSize(width, height);
        this.bg = new NineSlicePatch(this.scene, 0, 0, width, height, key, "main_bg", {
            left: 6 * dpr,
            top: 6 * dpr,
            bottom: 6 * dpr,
            right: 6 * dpr,
        });
        const posx = -width * 0.5, posy = -height * 0.5;
        const headbg = scene.make.image({ key, frame: "head_border" });
        headbg.x = posx + 25 * dpr;
        this.headIcon = new DynamicImage(scene, headbg.x, 0);
        this.headIcon.setTexture(key, "head_test");
        this.typeBg = scene.make.image({ key, frame: "tag_main" });
        this.typeBg.setPosition(posx + this.typeBg.width * 0.5, posy + this.typeBg.height * 0.5 - 2 * dpr);
        this.typeTex = scene.make.text({ x: 0, y: 0, text: i18n.t("task.m"), style: { color: "#ffffff", fontSize: 10 * this.dpr, fontFamily: Font.DEFULT_FONT } });
        this.typeTex.setOrigin(0.5).setPosition(this.typeBg.x - 1 * dpr, this.typeBg.y);
        this.taskName = scene.make.text({ x: this.headIcon.x + 22 * dpr, y: -9 * dpr, text: "获得两把钥匙", style: { color: "#ffffff", fontSize: 13 * this.dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0, 0.5);
        this.taskDes = scene.make.text({ x: this.headIcon.x + 25 * dpr, y: 10 * dpr, text: "任务要求获得两把钥匙", style: { color: "#ffffff", fontSize: 12 * this.dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0, 0.5);
        this.finish = scene.make.image({ key, frame: "done" });
        this.finish.setPosition(width * 0.5 - 30 * dpr, 4 * dpr);
        this.openBtn = new Button(scene, key, "open", "open");
        this.setExtendBtn(this.openBtn);
        this.openBtn.setPosition(width * 0.5 - 25 * dpr, 4 * dpr);
        this.closeBtn = new Button(scene, key, "close");
        this.setExtendBtn(this.closeBtn);
        this.closeBtn.setPosition(this.openBtn.x, this.openBtn.y).visible = false;
        this.openBtn.on("Tap", this.onOpenHandler, this);
        this.closeBtn.on("Tap", this.onCloseHandler, this);
        this.content.add([this.bg, headbg, this.headIcon, this.typeBg, this.typeTex, this.taskName, this.taskDes, this.finish, this.openBtn, this.closeBtn]);
        this.add(this.content);
        this.setSize(width, height);
    }

    public setTaskData(data: op_client.PKT_Quest) {
        this.questData = data;
        const typeTag = this.getQuestTypeTag(data.questType);
        this.typeBg.setFrame(typeTag[0]);
        this.typeTex.text = typeTag[1];
        this.setTextLimit(this.taskName, typeTag[2] + data.name, 12);
        this.bg.setFrame(typeTag[3]);
        // this.taskDes.text = data.detail;
        this.setTextLimit(this.taskDes, data.detail);
        this.taskDes.setColor(typeTag[4]);
        this.finish.visible = (data.stage === op_pkt_def.PKT_Quest_Stage.PKT_QUEST_STAGE_FINISHED);
    }

    public setTaskDetail(data: op_client.PKT_Quest) {
        const typeTag = this.getQuestTypeTag(data.questType);
        if (this.extend) this.extend.setItemData(data, typeTag[5]);
    }

    public setHandler(extend: Handler, finish: Handler) {
        this.extendHandler = extend;
        this.finishHandler = finish;
    }

    public setExtend(isExtend: boolean) {
        if (isExtend) this.onOpenHandler();
        else this.onCloseHandler();
    }
    private onOpenHandler() {
        if (!this.extend) {
            this.extend = new TaskItemExtend(this.scene, this.key, this.dpr, this.zoom);
            this.extend.setFinishHandler(new Handler(this, this.onFinishHandler));
            this.add(this.extend);
            this.extend.y = this.height * 0.5 + this.extend.height * 0.5;
        }
        this.extend.visible = true;
        this.height = this.content.height + this.extend.height;
        this.content.y = -this.height * 0.5 + this.content.height * 0.5;
        this.extend.y = -this.height * 0.5 + this.content.height + this.extend.height * 0.5;
        this.openBtn.visible = false;
        this.closeBtn.visible = true;
        if (this.extendHandler) this.extendHandler.runWith([true, this]);
    }

    private setExtendBtn(button: Button) {
        const width = 60 * this.dpr;
        const height = 60 * this.dpr;
        const bg = this.scene.make.graphics(undefined, false);
        bg.clear();
        bg.fillStyle(0xF6F6F6, 0);
        bg.fillRect(-width * 0.5, -height * 0.5, width, height);
        button.addAt(bg, 0);
        button.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    }

    private onFinishHandler() {
        if (this.finishHandler) this.finishHandler.runWith(this.questData.id);
    }

    private onCloseHandler() {
        if (this.extend) this.extend.visible = false;
        this.height = this.content.height;
        this.content.y = 0;
        this.openBtn.visible = true;
        this.closeBtn.visible = false;
        if (this.extendHandler) this.extendHandler.runWith([false, this]);
    }

    private getQuestTypeTag(questType: op_pkt_def.PKT_Quest_Type) {
        const typeTag = [];
        if (questType === op_pkt_def.PKT_Quest_Type.QUEST_MAIN_MISSION) {
            typeTag[0] = "tag_main";
            typeTag[1] = i18n.t("task.m");
            typeTag[2] = "【主线】";
            typeTag[3] = "main_bg";
            typeTag[4] = "#4C42C8";
            typeTag[5] = "#8780E0";
            return typeTag;
        } else if (questType === op_pkt_def.PKT_Quest_Type.QUEST_SIDE_MISSION) {
            typeTag[0] = "tag_side";
            typeTag[1] = i18n.t("task.s");
            typeTag[2] = "【支线】";
            typeTag[3] = "side_bg";
            typeTag[4] = "#CB0A1D";
            typeTag[5] = "#F4919B";
            return typeTag;
        } else if (questType === op_pkt_def.PKT_Quest_Type.QUEST_DAILY_GOAL) {
            typeTag[0] = "tag_daly";
            typeTag[1] = i18n.t("task.d");
            typeTag[2] = "【每日】";
            typeTag[3] = "daly_bg";
            typeTag[4] = "#866107";
            typeTag[5] = "#F1D56C";
            return typeTag;
        }
    }

    private setTextLimit(text: Phaser.GameObjects.Text, content?: string, limit: number = 15) {
        if (content.length > limit) {
            const maxWidth = 185 * this.dpr;
            for (let i = 4; i < content.length; i++) {
                let str = content.slice(0, i);
                const width = text.setText(str).width;
                if (width > maxWidth) {
                    str += "...";
                    text.setText(str);
                    break;
                }
            }
        } else {
            text.setText(content);
        }
    }
}
class TaskItemExtend extends Phaser.GameObjects.Container {
    private taskLabel: Phaser.GameObjects.Text;
    private taskTex: Phaser.GameObjects.Text;
    private needArr: TaskCell[] = [];
    private rewardLabel: Phaser.GameObjects.Text;
    private rewardArr: TaskCell[] = [];
    private finishBtn: NineSliceButton;
    private line: Phaser.GameObjects.Image;
    private dpr: number = 0;
    private zoom: number = 0;
    private key: string;
    private finishHandler: Handler;
    constructor(scene: Phaser.Scene, key: string, dpr: number, zoom: number) {
        super(scene);
        const width = 253 * dpr;
        const height = 202 * dpr;
        this.dpr = dpr;
        const bg = new NineSlicePatch(this.scene, 0, 0, width, height, key, "detail_bg", {
            left: 4,
            top: 4,
            right: 4,
            bottom: 4
        });
        const posx = -width * 0.5 + 10 * dpr;
        const posy = -height * 0.5 + 5 * dpr;
        this.taskLabel = scene.make.text({ x: posx, y: posy, text: i18n.t("task.objective"), style: { color: "#8F4300", fontSize: 12 * this.dpr, fontFamily: Font.DEFULT_FONT } });
        this.taskTex = scene.make.text({ x: posx, y: posy + 18 * dpr, text: i18n.t("task.collect_materials"), style: { color: "#8F4300", fontSize: 12 * this.dpr, fontFamily: Font.DEFULT_FONT } });
        this.taskTex.setWordWrapWidth(width - 10 * dpr, true);
        this.rewardLabel = scene.make.text({ x: posx, y: posy + 90 * dpr, text: i18n.t("task.rewards"), style: { color: "#8F4300", fontSize: 12 * this.dpr, fontFamily: Font.DEFULT_FONT } });
        const line = scene.make.image({ key, frame: "reward_cutline" });
        line.setPosition(0, posy + 110 * dpr);
        this.line = line;
        this.finishBtn = new NineSliceButton(this.scene, Math.ceil(width * 0.5 - 40 * this.dpr), Math.ceil(height * 0.5 - 25 * this.dpr), 60 * this.dpr, 30 * this.dpr, UIAtlasKey.commonKey, "button_g", i18n.t("task.submit_task"), this.dpr, this.scale, {
            left: 12 * this.dpr,
            top: 12 * this.dpr,
            right: 12 * this.dpr,
            bottom: 12 * this.dpr
        });
        this.finishBtn.setTextStyle({ fontSize: 12 * dpr, color: "#000000" });
        this.finishBtn.on("Tap", this.onFinishHandler, this);
        this.add([bg, this.taskLabel, this.taskTex, this.rewardLabel, line, this.finishBtn]);
        this.setSize(width, height);
        this.key = key;
        this.zoom = zoom;
        this.finishBtn.visible = false;
    }

    public setItemData(questData: op_client.PKT_Quest, color: string) {
        this.taskLabel.setColor(color);
        this.taskTex.setColor(color);
        this.rewardLabel.setColor(color);
        let taskPosy = 0;
        const cellHeight = 33 * this.dpr;
        this.taskTex.text = this.getTaskTargetText(questData);
        this.createTaskCells(this.needArr, questData.targets, true);
        taskPosy = this.taskTex.y + this.taskTex.height + 5 * this.dpr;
        if (questData.targets.length > 0) {
            taskPosy += cellHeight * 0.5;
            this.sortItem(this.needArr, taskPosy);
            taskPosy += cellHeight * 0.5 + 8 * this.dpr;
        }
        this.rewardLabel.y = taskPosy;
        taskPosy += this.rewardLabel.height + 5 * this.dpr;
        this.line.y = taskPosy;
        taskPosy += 5 * this.dpr;
        this.createTaskCells(this.rewardArr, questData.rewards, false);
        taskPosy += cellHeight * 0.5;
        this.sortItem(this.rewardArr, taskPosy);
        this.finishBtn.visible = (questData.stage === op_pkt_def.PKT_Quest_Stage.PKT_QUEST_STAGE_FINISHED);
    }

    public setFinishHandler(comp: Handler) {
        this.finishHandler = comp;
    }

    public sortItem(taskcells: TaskCell[], posY: number = 0) {
        const posx = -this.width * 0.5 + 10 * this.dpr;
        const list = taskcells;
        let value = 0;
        const offsetx = 10 * this.dpr;
        for (const item of list) {
            item.x = posx + item.width * item.originX + value;
            item.y = posY;
            value += item.width + offsetx;
        }
    }

    private createTaskCells(arr: TaskCell[], dataArr: op_client.ICountablePackageItem[], isTask: boolean = true) {
        for (const item of arr) {
            item.visible = false;
        }
        for (let i = 0; i < dataArr.length; i++) {
            let item: TaskCell;
            if (i < arr.length) {
                item = arr[i];
            } else {
                item = new TaskCell(this.scene, this.key, this.dpr, this.zoom);
                arr.push(item);
                this.add(item);
            }
            item.visible = true;
            item.setCellData(dataArr[i], isTask);
        }
        return arr;
    }

    private onFinishHandler() {
        if (this.finishHandler) this.finishHandler.run();
    }

    private getTaskTargetText(questData: op_client.PKT_Quest) {
        const targets = questData.targets;
        const text: string = questData.detail;
        // if (targets.length === 0) {
        //     text = questData.detail;
        // } else {
        //     text = i18n.t("task.collect_materials");
        //     for (const item of targets) {
        //         text += `${item.name}*${item.neededCount}`;
        //     }
        // }
        return text;
    }
}
class TaskCell extends Phaser.GameObjects.Container {
    private bg: Phaser.GameObjects.Image;
    private itemIcon: DynamicImage;
    private countTex: BBCodeText;
    private key: string;
    constructor(scene: Phaser.Scene, key: string, dpr: number, zoom: number) {
        super(scene);
        this.key = key;
        this.bg = scene.make.image({ key, frame: "task_bg" });
        this.setSize(this.bg.width, this.bg.height);
        this.itemIcon = new DynamicImage(scene, 0, 0);
        this.countTex = new BBCodeText(this.scene, 0, 0, {})
            .setOrigin(0.5).setFontSize(12 * dpr).setFontFamily(Font.DEFULT_FONT);
        this.countTex.setPosition(this.width * 0.5, this.height * 0.5 - 2 * dpr);
        this.add([this.bg, this.itemIcon, this.countTex]);
    }

    public setCellData(itemData: op_client.ICountablePackageItem, isTask: boolean = true) {
        const frame = isTask ? "task_bg" : "reward_bg";
        this.bg.setTexture(this.key, frame);
        const url = Url.getOsdRes(itemData.display.texturePath);
        this.itemIcon.load(url, this, () => {
        });
        if (!isTask) {
            this.countTex.text = `[stroke=#666666][color=#666666]${itemData.count}[/color][/stroke]/`;

        } else {
            this.countTex.text = this.getCountText(itemData.count, itemData.neededCount);
        }
    }
    private getCountText(count: number, needcount: number) {
        const color = (count >= needcount ? "#0054FF" : "#FF2B2B");
        const countText = `[stroke=${color}][color=${color}]${count}[/color][/stroke]/`;
        const needText = `[stroke=#2D2D2D][color=#2D2D2D]${needcount}[/color][/stroke]/`;
        const text = countText + needText;
        return text;
    }
}

class TaskOption extends Phaser.GameObjects.Container {
    public optionData: op_pkt_def.PKT_Quest_Type;
    private bg: Phaser.GameObjects.Graphics;
    private text: Phaser.GameObjects.Text;
    private clickHandler: Handler;
    private dpr: number = 0;
    constructor(scene: Phaser.Scene, key: string, dpr: number, zoom: number) {
        super(scene);
        const width = 256 * dpr;
        const height = 30 * dpr;
        this.dpr = dpr;
        this.bg = scene.make.graphics(undefined, false);
        this.text = scene.make.text({ x: 0, y: 0, text: "全部", style: { color: "#666666", fontSize: 15 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0, 0.5);
        this.bg.clear();
        this.bg.fillStyle(0xF6F6F6, 1);
        this.bg.fillRect(-width * 0.5, -height * 0.5, width, height);
        const optionLine = this.scene.make.graphics(undefined, false);
        optionLine.clear();
        optionLine.fillStyle(0xcccccc, 1);
        optionLine.fillRect(-width * 0.5, height * 0.5, width, 2);
        this.add([this.bg, this.text, optionLine]);
        this.setSize(width, height);
        this.bg.setInteractive(new Phaser.Geom.Rectangle(-width * 0.5, -height * 0.5, width, height), Phaser.Geom.Rectangle.Contains);
        this.bg.on("pointerup", this.onClickHandler, this);
    }

    public setSize(width: number, height: number) {
        super.setSize(width, height);
        this.text.setPosition(-width * 0.5 + 20 * this.dpr, 0);
        this.changeNormal();
        return this;
    }
    public setOptionData(data: op_pkt_def.PKT_Quest_Type) {
        this.optionData = data;
        if (data === op_pkt_def.PKT_Quest_Type.QUEST_MAIN_MISSION) {
            this.text.text = i18n.t("task.main_quest");
        } else if (data === op_pkt_def.PKT_Quest_Type.QUEST_SIDE_MISSION) {
            this.text.text = i18n.t("task.side_quest");
        } else if (data === op_pkt_def.PKT_Quest_Type.QUEST_DAILY_GOAL) {
            this.text.text = i18n.t("task.daily_quest");
        } else {
            this.text.text = i18n.t("task.all_task");
        }
    }

    public changeDown() {
        this.bg.clear();
        this.bg.fillStyle(0xDFE6FF, 1);
        this.bg.fillRect(-this.width * 0.5, -this.height * 0.5, this.width, this.height);
    }

    public changeNormal() {
        this.bg.clear();
        this.bg.fillStyle(0xF6F6F6, 1);
        this.bg.fillRect(-this.width * 0.5, -this.height * 0.5, this.width, this.height);
    }

    public setHandler(handler: Handler) {
        this.clickHandler = handler;
    }

    private onClickHandler() {
        if (this.clickHandler) this.clickHandler.runWith(this);
    }
}
