import { ClickEvent, NineSlicePatch } from "apowophaserui";
import { DynamicImage, ThreeSliceButton } from "gamecoreRender";
import { UIAtlasName } from "../../../res";
import { ICountablePackageItem } from "../../../structure";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { Handler, i18n, UIHelper, Url } from "utils";
import { DynamicImageValue, ImageValue, ItemButton } from "../Components";
import { PKT_Quest } from "custom_proto";
import { TimerCountDown } from "structure";
export class PicaTaskItem extends Phaser.GameObjects.Container {
    public taskButton: ThreeSliceButton;
    public questData: PKT_Quest;
    private content: Phaser.GameObjects.Container;
    private norCon: Phaser.GameObjects.Container;
    private acceleCon: TaskAcceleratedItem;
    private bg: NineSlicePatch;
    private headIcon: DynamicImage;
    private taskName: Phaser.GameObjects.Text;
    private taskDes: Phaser.GameObjects.Text;
    private arrow: Phaser.GameObjects.Image;
    private mExtend: TaskItemExtend;
    private dpr: number;
    private send: Handler;
    private mIsExtend: boolean = false;
    private zoom: number = 1;
    private canExtend: boolean = true;
    constructor(scene: Phaser.Scene, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        const conWidth = 272 * dpr;
        const conHeight = 70 * dpr;
        this.setSize(conWidth, conHeight);
        this.content = scene.make.container(undefined, false);
        this.content.setSize(conWidth, conHeight);
        this.norCon = this.scene.make.container(undefined, false);
        this.bg = new NineSlicePatch(this.scene, 0, 0, conWidth, conHeight, UIAtlasName.uicommon, "task_list_bg", {
            left: 6 * dpr,
            top: 6 * dpr,
            bottom: 6 * dpr,
            right: 6 * dpr,
        });
        const posx = -conWidth * 0.5, posy = -conHeight * 0.5;
        const headbg = scene.make.image({ key: UIAtlasName.uicommon, frame: "task_head_frame" });
        headbg.x = posx + 25 * dpr;
        this.headIcon = new DynamicImage(scene, headbg.x, 0);
        // this.headIcon.scale = dpr / this.zoom;
        this.headIcon.y = -10 * dpr;
        this.taskName = scene.make.text({ text: "", style: UIHelper.whiteStyle(dpr) }).setOrigin(0, 0.5);
        this.taskName.x = this.headIcon.x + 28 * dpr;
        this.taskName.y = -conHeight * 0.5 + 15 * dpr;
        this.taskDes = scene.make.text({ text: "", style: UIHelper.colorStyle("#FFF449", 12 * dpr) }).setOrigin(0);
        this.taskDes.x = this.taskName.x;
        this.taskDes.y = this.taskName.y + 15 * dpr;
        this.taskButton = new ThreeSliceButton(this.scene, 62 * dpr, 25 * dpr, UIAtlasName.uicommon, UIHelper.threeYellowSmall, UIHelper.threeYellowSmall, i18n.t("task.receive"));
        this.taskButton.setFontStyle("bold");
        this.taskButton.x = conWidth * 0.5 - this.taskButton.width * 0.5 - 10 * dpr;
        this.taskButton.on(ClickEvent.Tap, this.onTaskButtonHandler, this);
        this.arrow = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "task_list_arrow" });
        this.arrow.y = conHeight * 0.5 - this.arrow.height * 0.5;
        this.norCon.add([headbg, this.headIcon, this.taskName, this.taskDes, this.taskButton, this.arrow]);
        this.acceleCon = new TaskAcceleratedItem(scene, dpr, zoom);
        this.acceleCon.visible = false;
        this.content.add([this.norCon, this.acceleCon]);
        this.add([this.bg, this.content]);
        this.setSize(conWidth, conHeight);
    }

    public setTaskData(data: PKT_Quest) {
        this.questData = data;
        if (data.freshTime > 0) {
            this.acceleCon.setTaskData(data);
            this.acceleCon.visible = true;
            this.norCon.visible = false;
            this.canExtend = false;
        } else {
            this.setNorTaskData(data);
            this.acceleCon.visible = false;
            this.norCon.visible = true;
            this.canExtend = true;
        }
    }

    public setNorTaskData(data: PKT_Quest) {
        this.questData = data;
        this.taskName.text = data.name + this.getProgressStr(data);
        this.setTextLimit(this.taskName, this.taskName.text, 16);
        this.setTextLimit(this.taskDes, data["des"]);
        const texturePath = data.display.texturePath + `_${this.dpr}x.png`;
        const url = Url.getOsdRes(texturePath);
        this.headIcon.load(url);
        if (data.stage === op_pkt_def.PKT_Quest_Stage.PKT_QUEST_STAGE_PROCESSING) {
            this.taskButton.setFrameNormal(UIHelper.threeGreenSmall);
            this.taskButton.setText(i18n.t("task.go"));
            this.taskButton.setTextStyle(UIHelper.colorStyle("#022B55", 12 * this.dpr));
        } else if (data.stage === op_pkt_def.PKT_Quest_Stage.PKT_QUEST_STAGE_FINISHED || this.questData.stage === op_pkt_def.PKT_Quest_Stage.PKT_QUEST_STAGE_END) {
            this.taskButton.setFrameNormal(UIHelper.threeYellowSmall);
            this.taskButton.setText(i18n.t("task.receive"));
            this.taskButton.setTextStyle(UIHelper.brownishStyle(this.dpr));
        }
    }

    public setTaskDetail(data: PKT_Quest) {
        if (this.mExtend) this.mExtend.setItemData(data);
    }

    public setHandler(send: Handler) {
        this.send = send;
        this.acceleCon.setHandler(send);
    }

    public setExtend(isExtend: boolean, haveCallBack: boolean = true) {
        if (isExtend && this.canExtend) {
            this.openExtend();
            if (haveCallBack)
                if (this.send) this.send.runWith(["extend", { extend: true, item: this }]);
        } else {
            this.closeExtend();
            if (haveCallBack) {
                if (this.send)
                    this.send.runWith(["extend", { extend: false, item: this }]);
            }
        }
    }

    get extend() {
        return this.mIsExtend;
    }

    private getProgressStr(data: PKT_Quest) {
        if (data.targets) {
            for (const target of data.targets) {
                if (target.neededCount) {
                    return " (" + target.count + "/" + target.neededCount + ")";
                }
            }
        }
        return "";
    }

    private onTaskButtonHandler() {
        if (this.questData.stage === op_pkt_def.PKT_Quest_Stage.PKT_QUEST_STAGE_PROCESSING) {
            if (this.send) this.send.runWith(["go", this.questData]);
        } else if (this.questData.stage === op_pkt_def.PKT_Quest_Stage.PKT_QUEST_STAGE_FINISHED) {
            if (this.send) this.send.runWith(["finish", this.questData.id]);
        }
    }
    private openExtend() {
        if (!this.mExtend) {
            this.mExtend = new TaskItemExtend(this.scene, this.width - 6 * this.dpr, 0, this.dpr, this.zoom);
            this.mExtend.setHandler(this.send);
            this.add(this.mExtend);
        }
        this.mExtend.setItemData(this.questData);
        this.mExtend.visible = true;
        this.height = this.content.height + this.mExtend.height + 3 * this.dpr;
        this.content.y = -this.height * 0.5 + this.content.height * 0.5;
        this.mExtend.y = this.content.y + this.content.height * 0.5;
        this.mIsExtend = true;
        this.arrow.visible = false;
        this.bg.resize(this.bg.width, this.height);
    }

    private closeExtend() {
        if (this.mExtend) this.mExtend.visible = false;
        this.height = this.content.height;
        this.bg.resize(this.bg.width, this.content.height);
        this.content.y = 0;
        this.mIsExtend = false;
        this.arrow.visible = true;
    }

    private setTextLimit(text: Phaser.GameObjects.Text, content?: string, limit: number = 11) {
        if (content.length > limit) {
            const maxWidth = 130 * this.dpr;
            for (let i = 9; i < content.length; i++) {
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
    private bg: NineSlicePatch;
    private taskLabel: Phaser.GameObjects.Text;
    private taskTex: Phaser.GameObjects.Text;
    private needArr: ItemButton[] = [];
    private rewardLabel: Phaser.GameObjects.Text;
    private rewardArr: ItemButton[] = [];
    private line: Phaser.GameObjects.Image;
    private dpr: number = 0;
    private zoom: number = 1;
    private send: Handler;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.width = width;
        this.dpr = dpr;
        this.zoom = zoom;
        this.bg = new NineSlicePatch(this.scene, 0, 0, width, height, UIAtlasName.uicommon, "task_list_unfold_bg", {
            left: 4,
            top: 4,
            right: 4,
            bottom: 4
        });
        const posx = -width * 0.5 + 10 * dpr;
        const posy = -height * 0.5 + 8 * dpr;
        this.taskLabel = scene.make.text({ x: posx, y: posy, text: i18n.t("task.objective"), style: UIHelper.colorStyle("#625AC6", 12 * dpr) });
        this.taskLabel.setFontStyle("bold");
        this.taskTex = scene.make.text({ x: posx, y: posy + 18 * dpr, text: i18n.t("task.collect_materials"), style: UIHelper.colorStyle("#625AC6", 12 * dpr) });
        this.taskTex.setWordWrapWidth(width - 10 * dpr, true);
        this.rewardLabel = scene.make.text({ x: posx, y: posy + 90 * dpr, text: i18n.t("task.rewards"), style: UIHelper.colorStyle("#625AC6", 12 * dpr) });
        this.rewardLabel.setFontStyle("bold");
        const line = scene.make.image({ key: UIAtlasName.uicommon, frame: "task_reward_divider" });
        line.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        line.setPosition(-10 * dpr, posy + 110 * dpr);
        this.line = line;
        this.add([this.bg, this.taskLabel, this.taskTex, this.rewardLabel, line]);
        this.setSize(width, height);
    }

    public setItemData(questData: PKT_Quest) {
        let taskPosy = 0;
        const cellHeight = 67 * this.dpr;
        this.taskTex.text = this.getTaskTargetText(questData);
        this.createTaskCells(this.needArr, <any>questData.targets, true);
        taskPosy = this.taskTex.y + this.taskTex.height + 8 * this.dpr;
        if (questData.targets.length > 0) {
            if (this.hasTargetWithDisplay(questData)) {
                taskPosy += cellHeight * 0.5;
                this.sortItem(this.needArr, taskPosy);
                taskPosy += cellHeight * 0.5 + 15 * this.dpr;
            }
        }
        this.rewardLabel.y = taskPosy;
        taskPosy += this.rewardLabel.height + 5 * this.dpr;
        this.line.y = taskPosy;
        taskPosy += 5 * this.dpr;
        this.createTaskCells(this.rewardArr, <any>questData.rewards, false);
        taskPosy += cellHeight * 0.5;
        this.sortItem(this.rewardArr, taskPosy);
        this.height = taskPosy + cellHeight * 0.5 + 10 * this.dpr;
        this.bg.resize(this.width, this.height);
        this.bg.y = this.height * 0.5;
    }

    public sortItem(taskcells: ItemButton[], posY: number = 0) {
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

    public setHandler(send: Handler) {
        this.send = send;
    }

    private createTaskCells(arr: ItemButton[], dataArr: ICountablePackageItem[], isTask: boolean = true) {
        for (const item of arr) {
            item.visible = false;
        }
        for (let i = 0; i < dataArr.length; i++) {
            let item: ItemButton;
            if (i < arr.length) {
                item = arr[i];
            } else {
                if (dataArr[i].texturePath) {
                    item = new ItemButton(this.scene, UIAtlasName.uicommon, "bag_icon_common_bg", this.dpr, this.zoom, true);
                    item.on(ClickEvent.Tap, this.onTaskCellHandler, this);
                    arr.push(item);
                    this.add(item);
                }
            }
            if (item) {
                item.visible = true;
                item.setItemData(dataArr[i]);
            }
        }
        return arr;
    }

    private hasTargetWithDisplay(questData: PKT_Quest) {
        for (const target of questData.targets) {
            if ((<any>target).texturePath) return true;
        }
    }

    private getTaskTargetText(questData: PKT_Quest) {
        const targets = questData.targets;
        const text: string = (questData["des"]) + this.getProgressStr(questData);
        return text;
    }

    private getProgressStr(data: PKT_Quest) {
        if (data.targets) {
            for (const target of data.targets) {
                if (target.neededCount) {
                    return " (" + target.count + "/" + target.neededCount + ")";
                }
            }
        }
        return "";
    }

    private onTaskCellHandler(pointer, gameobject) {
        if (this.send) this.send.runWith(["item", gameobject]);
    }
}

class TaskAcceleratedItem extends Phaser.GameObjects.Container {
    protected dpr: number;
    protected zoom: number;
    private bg: Phaser.GameObjects.Image;
    private titleTex: Phaser.GameObjects.Text;
    private countDownTex: Phaser.GameObjects.Text;
    private countDown: TimerCountDown;
    private spendImg: DynamicImageValue;
    private accButton: ThreeSliceButton;
    private send: Handler;
    private taskData: PKT_Quest;
    private spendValue: number = 0;
    constructor(scene: Phaser.Scene, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        const conWidth = 272 * dpr;
        const conHeight = 70 * dpr;
        this.setSize(conWidth, conHeight);
        this.bg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "task_list_bg" });
        this.titleTex = this.scene.make.text({ style: UIHelper.whiteStyle(dpr, 12) }).setOrigin(0.5);
        this.titleTex.y = -conHeight * 0.5 + 13 * dpr;
        this.countDownTex = this.scene.make.text({ style: UIHelper.colorStyle("#FFF449", 11 * dpr) }).setOrigin(1, 0.5);
        this.countDownTex.x = conWidth * 0.5 - 10 * dpr;
        this.countDownTex.y = -conHeight * 0.5 + 13 * dpr;
        this.spendImg = new DynamicImageValue(scene, 50 * dpr, 15 * dpr, UIAtlasName.uicommon, "daily_task_refresh_diamond_s", dpr);
        this.spendImg.setLayout(2);
        this.spendImg.y = -5 * dpr;
        this.spendImg.x = -dpr;
        this.accButton = new ThreeSliceButton(this.scene, 75 * dpr, 28 * dpr, UIAtlasName.uicommon, UIHelper.threeYellowSmall, UIHelper.threeYellowSmall, i18n.t("order.accele"));
        this.accButton.setTextStyle(UIHelper.brownishStyle(dpr));
        this.accButton.setFontStyle("bold");
        this.accButton.y = conHeight * 0.5 - this.accButton.height * 0.5 - 3 * dpr;
        this.accButton.on(ClickEvent.Tap, this.onAccButtonHandler, this);
        this.add([this.bg, this.titleTex, this.countDownTex, this.spendImg, this.accButton]);
    }

    destroy() {
        super.destroy();
        if (this.countDown) this.countDown.clear();
    }
    public setHandler(send: Handler) {
        this.send = send;
    }
    public setTaskData(data: PKT_Quest) {
        this.taskData = data;
        this.titleTex.text = data["acceletips"];
        this.spendImg.setText(data.itemToCost.count);
        const url = Url.getOsdRes(data.itemToCost.texturePath);
        this.spendImg.load(url);
        if (data.freshTime > 0) {
            const serverTime = data["servertime"] / 1000;
            const time = data.freshTime - serverTime;
            if (!this.countDown) {
                this.countDown = new TimerCountDown(new Handler(this, (value: number, text: string) => {
                    this.countDownTex.text = text;
                    this.spendValue = Math.floor(value / 600);
                    this.spendImg.setText(this.spendValue + "");
                    if (value <= 0) if (this.send) this.send.runWith("accele");
                }));
            }
            this.countDown.executeText(time);
        }
    }
    private onAccButtonHandler() {
        this.taskData["spendValue"] = this.spendValue;
        if (this.send) this.send.runWith(["queryaccele", this.taskData]);
    }
}
