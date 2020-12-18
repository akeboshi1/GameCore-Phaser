import { BBCodeText, ClickEvent, NineSlicePatch } from "apowophaserui";
import { DynamicImage, ThreeSliceButton } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { Handler, i18n, UIHelper, Url } from "utils";
export class PicaTaskItem extends Phaser.GameObjects.Container {
    public questData: op_client.PKT_Quest;
    private content: Phaser.GameObjects.Container;
    private bg: NineSlicePatch;
    private headIcon: DynamicImage;
    private taskName: Phaser.GameObjects.Text;
    private taskDes: Phaser.GameObjects.Text;
    private taskButton: ThreeSliceButton;
    private extend: TaskItemExtend;
    private dpr: number;
    private extendHandler: Handler;
    private finishHandler: Handler;
    constructor(scene: Phaser.Scene, dpr: number) {
        super(scene);
        this.dpr = dpr;
        const width = 272 * dpr;
        const height = 70 * dpr;
        this.content = scene.make.container(undefined, false);
        this.content.setSize(width, height);
        this.bg = new NineSlicePatch(this.scene, 0, 0, width, height, UIAtlasName.uicommon, "task_list_bg", {
            left: 6 * dpr,
            top: 6 * dpr,
            bottom: 6 * dpr,
            right: 6 * dpr,
        });
        const posx = -width * 0.5, posy = -height * 0.5;
        const headbg = scene.make.image({ key: UIAtlasName.uicommon, frame: "task_head_frame" });
        headbg.x = posx + 25 * dpr;
        this.headIcon = new DynamicImage(scene, headbg.x, 0);
        this.headIcon.setTexture(UIAtlasName.uicommon, "head_test");
        this.taskName = scene.make.text({ x: this.headIcon.x + 20 * dpr, y: -9 * dpr, text: "", style: UIHelper.whiteStyle(dpr) }).setOrigin(0, 0.5);
        this.taskDes = scene.make.text({ x: this.headIcon.x + 25 * dpr, y: 10 * dpr, text: "", style: UIHelper.colorStyle("#FFF449", 12 * dpr) }).setOrigin(0, 0.5);
        this.taskButton = new ThreeSliceButton(this.scene, 62 * dpr, 25 * dpr, UIAtlasName.uicommon, UIHelper.threeYellowSmall, UIHelper.threeYellowSmall, "");
        this.taskButton.setPosition(width * 0.5 - 25 * dpr, 4 * dpr);
        this.taskButton.on(ClickEvent.Tap, this.onTaskButtonHandler, this);
        this.content.add([this.bg, headbg, this.headIcon, this.taskName, this.taskDes, this.taskButton]);
        this.add(this.content);
        this.setSize(width, height);
    }

    public setTaskData(data: op_client.PKT_Quest) {
        this.questData = data;
        this.taskName.text = data.name;
        this.setTextLimit(this.taskName, data.name);
        this.setTextLimit(this.taskDes, data.detail);
        const url = Url.getOsdRes(data.display.texturePath);
        this.headIcon.load(url, this, () => {

        });
        if (data.stage === op_pkt_def.PKT_Quest_Stage.PKT_QUEST_STAGE_PROCESSING) {
            this.taskButton.setFrameNormal(UIHelper.threeGreenSmall);
        } else if (data.stage === op_pkt_def.PKT_Quest_Stage.PKT_QUEST_STAGE_FINISHED) {
            this.taskButton.setFrameNormal(UIHelper.threeYellowSmall);
        }
    }

    public setTaskDetail(data: op_client.PKT_Quest) {
        if (this.extend) this.extend.setItemData(data);
    }

    public setHandler(extend: Handler, finish: Handler) {
        this.extendHandler = extend;
        this.finishHandler = finish;
    }

    public setExtend(isExtend: boolean, haveCallBack: boolean = true) {
        if (isExtend) {
            if (haveCallBack)
                this.onTaskButtonHandler();
            else this.openExtend();
        } else {
            if (haveCallBack)
                this.onCloseHandler();
            else this.closeExtend();
        }

    }
    private onTaskButtonHandler() {
        if (this.extendHandler) this.extendHandler.runWith([true, this]);
    }
    private openExtend() {
        if (!this.extend) {
            this.extend = new TaskItemExtend(this.scene, this.dpr);
            this.extend.setFinishHandler(new Handler(this, this.onFinishHandler));
            this.add(this.extend);
            this.extend.y = this.height * 0.5 + this.extend.height * 0.5;
        }
        this.extend.visible = true;
        this.height = this.content.height + this.extend.height;
        this.content.y = -this.height * 0.5 + this.content.height * 0.5;
        this.extend.y = -this.height * 0.5 + this.content.height + this.extend.height * 0.5;
    }
    private onFinishHandler() {
        if (this.finishHandler) this.finishHandler.runWith(this.questData.id);
    }

    private onCloseHandler() {
        this.closeExtend();
        if (this.extendHandler) this.extendHandler.runWith([false, this]);
    }

    private closeExtend() {
        if (this.extend) this.extend.visible = false;
        this.height = this.content.height;
        this.content.y = 0;
    }

    private setTextLimit(text: Phaser.GameObjects.Text, content?: string, limit: number = 15) {
        if (content.length > limit) {
            const maxWidth = 155 * this.dpr;
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
    private line: Phaser.GameObjects.Image;
    private dpr: number = 0;
    private finishHandler: Handler;
    constructor(scene: Phaser.Scene, dpr: number) {
        super(scene);
        const width = 253 * dpr;
        const height = 202 * dpr;
        this.dpr = dpr;
        const bg = new NineSlicePatch(this.scene, 0, 0, width, height, UIAtlasName.uicommon, "task_list_unfold_bg", {
            left: 4,
            top: 4,
            right: 4,
            bottom: 4
        });
        const posx = -width * 0.5 + 10 * dpr;
        const posy = -height * 0.5 + 5 * dpr;
        this.taskLabel = scene.make.text({ x: posx, y: posy, text: i18n.t("task.objective"), style: UIHelper.colorStyle("#625AC6", 12 * dpr) });
        this.taskTex = scene.make.text({ x: posx, y: posy + 18 * dpr, text: i18n.t("task.collect_materials"), style: UIHelper.colorStyle("#625AC6", 12 * dpr) });
        this.taskTex.setWordWrapWidth(width - 10 * dpr, true);
        this.rewardLabel = scene.make.text({ x: posx, y: posy + 90 * dpr, text: i18n.t("task.rewards"), style: UIHelper.colorStyle("#625AC6", 12 * dpr) });
        const line = scene.make.image({ key: UIAtlasName.uicommon, frame: "task_reward_divider" });
        line.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        line.setPosition(0, posy + 110 * dpr);
        this.line = line;
        this.add([bg, this.taskLabel, this.taskTex, this.rewardLabel, line]);
        this.setSize(width, height);
    }

    public setItemData(questData: op_client.PKT_Quest) {
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
                item = new TaskCell(this.scene, this.dpr);
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
    private dpr;
    constructor(scene: Phaser.Scene, dpr: number) {
        super(scene);
        this.dpr = dpr;
        this.bg = scene.make.image({ key: UIAtlasName.uicommon, frame: "task_bg" });
        this.bg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.setSize(this.bg.width, this.bg.height);
        this.itemIcon = new DynamicImage(scene, 0, 0);
        this.countTex = new BBCodeText(this.scene, 0, 0, "", UIHelper.whiteStyle(dpr))
            .setOrigin(0.5);
        (<any>this.countTex).setPosition(this.width * 0.5, this.height * 0.5 - 2 * dpr);
        this.add([this.bg, this.itemIcon, this.countTex]);
    }

    public setCellData(itemData: op_client.ICountablePackageItem, isTask: boolean = true) {
        const frame = isTask ? "task_icon_bg" : "task_reward_bg";
        this.bg.setTexture(UIAtlasName.uicommon, frame);
        const url = Url.getOsdRes(itemData.display.texturePath);
        this.itemIcon.load(url, this, () => {
            this.itemIcon.scale = this.dpr * 0.6;
        });
        if (!isTask) {
            this.countTex.text = `[stroke=#2D2D2D][color=#ffffff]${itemData.count}[/color][/stroke]`;

        } else {
            this.countTex.text = this.getCountText(itemData.count, itemData.neededCount);
        }
    }
    private getCountText(count: number, needcount: number) {
        const color = (count >= needcount ? "#0054FF" : "#FF0000");
        const countText = `[stroke=${color}][color=${color}]${count}[/color][/stroke]`;
        const needText = `[stroke=#2D2D2D][color=#2D2D2D]${needcount}[/color][/stroke]`;
        const text = `${countText}/${needText}`;
        return text;
    }
}
