import { ClickEvent, GameScroller, NineSlicePatch } from "apowophaserui";
import { ButtonEventDispatcher, DynamicImage, ItemInfoTips, ProgressThreeBar } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { Font, Handler, Url } from "utils";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { PicaTaskItem } from "./PicaTaskItem";
import { PicaItemTipsPanel } from "../SinglePanel/PicaItemTipsPanel";
import { ICountablePackageItem } from "picaStructure";

export class PicaTaskMainPanel extends Phaser.GameObjects.Container {
    private gameScroller: GameScroller;
    private curTaskItem: PicaTaskItem;
    private taskItems: PicaTaskItem[] = [];
    private mainItem: MainTaskItem;
    private mainTaskAnimation: MainTaskAnimation;
    private itemTips: ItemInfoTips;
    private dpr: number;
    private zoom: number;
    private send: Handler;
    private isMoveFinish = false;
    private questType: op_pkt_def.PKT_Quest_Type;
    private isFinishGroup: boolean = false;
    private taskGroupData: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_QUEST_GROUP;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.init();
    }

    public setHandler(send: Handler) {
        this.send = send;
    }
    refreshMask() {
        this.gameScroller.refreshMask();
        if (this.mainItem) this.mainItem.refreshMask();
    }
    setTaskDatas(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_QUEST_GROUP, questType: op_pkt_def.PKT_Quest_Type) {
        if (!content.id) {
            // console.log("没有新任务了");
            return;
        }
        if (this.curTaskItem) this.curTaskItem.setExtend(false);
        if (!this.mainItem) {
            this.mainItem = new MainTaskItem(this.scene, 272 * this.dpr, 126 * this.dpr, this.dpr, this.zoom);
            this.gameScroller.addItem(this.mainItem);
            this.mainItem.setHandler(new Handler(this, this.onRewardHandler));
        }
        this.mainItem.setMainTaskData(content, questType);
        if (this.questType !== questType) {
            const tempArr = this.getTaskQuests(content.quests, undefined);
            this.setTaskItems(tempArr);
            const tempitems = [];
            for (const item of this.taskItems) {
                if (item.visible) tempitems.push(item);
            }

        } else {
            const tempArr = this.getTaskQuests(content.quests, this.taskGroupData.quests);
            this.setTaskItems(tempArr);
            const tempitems = [];
            for (const item of this.taskItems) {
                if (item.visible) tempitems.push(item);
            }
            if (this.isFinishGroup) {
                this.mainTaskAnimation = new MainTaskAnimation(this.scene, this.mainItem, tempitems, this.width, this.dpr);
                if (this.isMoveFinish) this.mainTaskAnimation.playIntoAnimation();
                this.isFinishGroup = false;
            } else {
                const animation = new MainTaskGooutAnimation(this.scene, tempitems, this.width, this.dpr);
                animation.playGoOutAnimation();
            }
        }
        this.taskGroupData = content;
        this.questType = questType;
    }

    setTaskDetail(quest: op_client.PKT_Quest) {
        if (this.curTaskItem && quest) {
            if (this.curTaskItem.questData.id === quest.id) {
                this.curTaskItem.setTaskDetail(quest);
            }
        }
    }

    setTaskItems(quests: op_client.IPKT_Quest[]) {
        for (const item of this.taskItems) {
            const task = <PicaTaskItem>item;
            task.visible = false;
        }
        for (let i = 0; i < quests.length; i++) {
            let item: PicaTaskItem;
            if (i < this.taskItems.length) {
                item = this.taskItems[i];
            } else {
                item = new PicaTaskItem(this.scene, this.dpr, this.zoom);
                this.gameScroller.addItem(item);
                item.setHandler(new Handler(this, this.onTaskItemHandler));
                this.taskItems.push(item);
            }
            item.setTaskData(quests[i]);
            item.visible = true;
            item.x = 0;
        }
        this.gameScroller.Sort();
    }

    getTaskQuests(quests: op_client.IPKT_Quest[], before: op_client.IPKT_Quest[]) {
        const tempArr = [];
        for (const quest of quests) {
            if (quest.stage === op_pkt_def.PKT_Quest_Stage.PKT_QUEST_STAGE_PROCESSING || quest.stage === op_pkt_def.PKT_Quest_Stage.PKT_QUEST_STAGE_FINISHED) {
                tempArr.push(quest);
            } else if (quest.stage === op_pkt_def.PKT_Quest_Stage.PKT_QUEST_STAGE_END) {
                if (before) {
                    for (const item of before) {
                        if (item.id === quest.id && item.stage === op_pkt_def.PKT_Quest_Stage.PKT_QUEST_STAGE_FINISHED) {
                            tempArr.push(quest);
                        }
                    }
                }
            }
        }
        return tempArr;
    }

    playIntoAnimation() {
        if (this.mainTaskAnimation) this.mainTaskAnimation.playIntoAnimation();
    }

    playGoOutAnimation() {

    }

    moveFinish() {
        this.isMoveFinish = true;
        if (this.mainTaskAnimation) this.mainTaskAnimation.playIntoAnimation();
    }

    protected init() {
        this.gameScroller = new GameScroller(this.scene, {
            x: 0,
            y: 0 * this.dpr,
            width: this.width,
            height: this.height,
            zoom: this.zoom,
            dpr: this.dpr,
            align: 2,
            orientation: 0,
            space: 10 * this.dpr,
            padding: { top: 2 * this.dpr },
            selfevent: true,
            cellupCallBack: (gameobject) => {
                this.onPointerUpHandler(gameobject);
            }
        });
        this.itemTips = new ItemInfoTips(this.scene, 121 * this.dpr, 46 * this.dpr, UIAtlasName.uicommon, "tips_bg", this.dpr);
        this.itemTips.setVisible(false);
        this.add([this.gameScroller, this.itemTips]);
    }

    private onPointerUpHandler(gameobject) {
        if (!(gameobject instanceof MainTaskItem)) {
            const extend = gameobject.extend ? false : true;
            gameobject.setExtend(extend, true);
        }
    }

    private onTaskItemHandler(tag: string, data: any) {
        if (tag === "extend") {
            const extend = data.extend;
            const item = data.item;
            this.onExtendsHandler(extend, item);
        } else if (tag === "go") {

        } else if (tag === "finish") {
            this.send.runWith(["finish", data]);
        } else if (tag === "item") {
            this.onMaterialItemHandler(data);
        }
    }
    private onRewardHandler(id: string) {
        if (this.send) this.send.runWith(["reward", id]);
        this.isFinishGroup = true;
    }

    private onExtendsHandler(isExtend: boolean, item: PicaTaskItem) {
        if (this.curTaskItem) {
            this.curTaskItem.setExtend(false, false);
        }
        if (isExtend) {
            this.curTaskItem = item;
        } else
            this.curTaskItem = null;
        this.gameScroller.Sort(true);
    }
    private onMaterialItemHandler(gameobj: any) {
        // this.itemTips.setVisible(true);
        // const data = gameobj.itemData;
        // this.itemTips.setItemData(data);
        // this.itemTips.setTipsPosition(gameobj, this, 10 * this.dpr);
        PicaItemTipsPanel.Inst.showTips(gameobj, gameobj.itemData);
    }
}

class MainTaskItem extends Phaser.GameObjects.Container {
    private dpr: number;
    private zoom: number;
    private titleCon: Phaser.GameObjects.Container;
    private titleTex: Phaser.GameObjects.Text;
    private taskDes: Phaser.GameObjects.Text;
    private progress: ProgressThreeBar;
    private progressTex: Phaser.GameObjects.Text;
    private rewardsImg: DynamicImage;
    private rewardRotateImg: Phaser.GameObjects.Image;
    private bg: NineSlicePatch;
    private mainData: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_QUEST_GROUP;
    private isFinish: boolean = false;
    private questType: op_pkt_def.PKT_Quest_Type;
    private send: Handler;
    private intervalTimer: any;
    private previousProgress: number;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(width, height);
        this.init();
    }
    refreshMask() {
        // this.progress.refreshMask();
    }
    public setMainTaskData(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_QUEST_GROUP, questType: op_pkt_def.PKT_Quest_Type) {
        this.titleTex.text = content.name;
        this.taskDes.text = content.des;
        const max = 100;
        const fvalue = this.getFinishProgress(content);
        if (this.questType !== questType) {
            this.progress.setProgress(fvalue, max);
        } else {
            const from = this.previousProgress;
            const allTime = 2000;
            const duration = allTime * fvalue / max;
            this.playProgressTween(from, fvalue, max, duration);
        }

        this.progressTex.text = fvalue + "%";
        this.isFinish = fvalue === max;
        this.previousProgress = fvalue;

        this.mainData = content;

        const url = Url.getOsdRes((<any>content.reward).texturePath);
        this.rewardsImg.load(url, this, () => {

        });

    }

    public setHandler(send: Handler) {
        this.send = send;
    }

    destroy() {
        super.destroy();
        if (this.intervalTimer) clearInterval(this.intervalTimer);
    }
    protected init() {
        this.bg = new NineSlicePatch(this.scene, 0, 0, this.width, this.height, UIAtlasName.uicommon, "task_chapter_bg", {
            left: 8 * this.dpr, top: 8 * this.dpr, right: 8 * this.dpr, bottom: 8 * this.dpr
        });
        this.titleCon = this.scene.make.container(undefined, false);
        this.titleCon.y = -this.height * 0.5 + 21 * this.dpr;
        const leftTitleBg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "task_chapter_title_left" });
        const rightTitleBg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "task_chapter_title_right" });
        const middleTitleBg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "task_chapter_title_middle" });
        middleTitleBg.y = -5 * this.dpr;
        leftTitleBg.x = -middleTitleBg.width * 0.5 - leftTitleBg.width * 0.5 + 7 * this.dpr;
        rightTitleBg.x = middleTitleBg.width * 0.5 + rightTitleBg.width * 0.5 - 7 * this.dpr;
        this.titleTex = this.scene.make.text({
            text: "", style: {
                fontSize: 12 * this.dpr,
                fontFamily: Font.DEFULT_FONT,
                color: "#FFF6CA"
            }
        }).setOrigin(0.5);
        this.titleTex.setFontStyle("bold");
        this.titleTex.y = middleTitleBg.y;
        this.titleCon.add([leftTitleBg, middleTitleBg, rightTitleBg, this.titleTex]);
        this.taskDes = this.scene.make.text({
            x: -this.width * 0.5 + 12 * this.dpr,
            y: -2 * this.dpr,
            text: "", style: {
                fontSize: 12 * this.dpr,
                fontFamily: Font.DEFULT_FONT,
                color: "#8C6003"
            }
        }).setOrigin(0, 0.5);
        this.taskDes.setWordWrapWidth(160 * this.dpr, true);
        const rewardbg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "task_chapter_gift_bg" });
        rewardbg.x = this.width * 0.5 - 10 * this.dpr - rewardbg.width * 0.5;
        rewardbg.y = 10 * this.dpr;
        const rewardButton = new ButtonEventDispatcher(this.scene, 0, 0);
        rewardButton.setSize(rewardbg.width, rewardbg.height);
        rewardButton.enable = true;
        rewardButton.on(ClickEvent.Tap, this.onReceiveAwardHandler, this);
        rewardButton.x = rewardbg.x;
        rewardButton.y = rewardbg.y;
        this.rewardRotateImg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "task_chapter_gift_bg1" });
        this.rewardRotateImg.x = rewardbg.x;
        this.rewardRotateImg.y = rewardbg.y;
        this.rewardsImg = new DynamicImage(this.scene, 0, 0);
        this.rewardsImg.x = rewardbg.x;
        this.rewardsImg.y = rewardbg.y;
        this.rewardsImg.scale = this.dpr / this.zoom;
        const config = { width: 153 * this.dpr, height: 11 * this.dpr, correct: 0 };
        const barbgs = ["task_chapter_progress_bott_left", "task_chapter_progress_bott_middle", "task_chapter_progress_bott_right"];
        const bars = ["task_chapter_progress_top_left", "task_chapter_progress_top_middle", "task_chapter_progress_top_right"];
        this.progress = new ProgressThreeBar(this.scene, UIAtlasName.uicommon, barbgs, bars, undefined, config, config);
        this.progress.x = -this.width * 0.5 + this.progress.width * 0.5 + 15 * this.dpr;
        this.progress.y = 34 * this.dpr;
        this.progressTex = this.scene.make.text({
            x: this.progress.x,
            y: this.progress.y + 15 * this.dpr,
            text: "", style: {
                fontSize: 12 * this.dpr,
                fontFamily: Font.DEFULT_FONT,
                color: "#794400"
            }
        }).setOrigin(0.5);

        this.add([this.bg, this.titleCon, this.taskDes, this.progress, this.progressTex, rewardbg, this.rewardRotateImg, this.rewardsImg, rewardButton]);
    }

    private onReceiveAwardHandler() {
        if (this.isFinish && !this.mainData.rewardsReceived) {
            if (this.send) this.send.runWith([this.mainData.id]);
        }
    }
    private getFinishProgress(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_QUEST_GROUP) {
        return content.progress;
    }

    private playProgressTween(from: number, to: number, max: number, duration: number) {
        if (!this.scene) return;
        const tween = this.scene.tweens.addCounter({
            from,
            to,
            ease: "Linear",
            duration,
            onUpdate: (cope: any, param: any) => {
                if (!this.scene) {
                    tween.stop();
                    tween.remove();
                    return;
                }
                const value = param.value;
                this.progress.setProgress(value, max);
                this.progressTex.text = Math.floor((value * 1000 / max)) / 10 + "%";
            },
            onComplete: () => {
                tween.stop();
                if (to === max) {
                    this.playRotateTween();
                }
            },
        });
    }
    private playRotateTween() {
        if (!this.scene) return;
        if (this.intervalTimer) clearInterval(this.intervalTimer);
        this.intervalTimer = setInterval(() => {
            if (!this.scene) {
                if (this.intervalTimer) clearInterval(this.intervalTimer);
                return;
            }
            this.rewardRotateImg.rotation += 0.1;
        }, 30);
    }

}

class MainTaskAnimation {
    private mainItem: MainTaskItem;
    private taskItems: PicaTaskItem[];
    private listPosY = [];
    private tempItems = [];
    private width: number;
    private dpr: number;
    private isDispose: boolean = false;
    private scene: Phaser.Scene;
    private indexed: number = -1;
    constructor(scene: Phaser.Scene, mainItem: MainTaskItem, taskItems: PicaTaskItem[], width: number, dpr: number) {
        this.scene = scene;
        this.mainItem = mainItem;
        this.taskItems = taskItems;
        this.width = width;
        this.dpr = dpr;
        this.setItemLayout();
    }
    public playIntoAnimation() {
        this.mainItem.refreshMask();
        this.playMoveX(this.mainItem, this.mainItem.x, 0, false);
        setTimeout(() => {
            this.mainItem.refreshMask();
            this.playNextAnimation();
        }, 300);
    }

    public dispose() {
        this.tempItems.length = 0;
        this.taskItems.length = 0;
        this.mainItem = undefined;
        this.taskItems = undefined;
        this.tempItems = undefined;
        this.isDispose = true;
    }
    private setItemLayout() {
        this.mainItem.x = -this.width - 10 * this.dpr;
        for (const item of this.taskItems) {
            item.x = -this.width - 10 * this.dpr;
            this.listPosY.push(item.y);
        }
    }

    private playNextAnimation() {
        if (this.isDispose) return;
        if (this.taskItems.length === 0) return;
        if (this.indexed === -1) {
            this.indexed = this.taskItems.length - 1;
        } else {
            this.indexed--;
        }
        const nextItem = this.taskItems[this.indexed];
        nextItem.y = this.listPosY[0];
        nextItem.alpha = 0;
        this.tempItems.push(nextItem);
        this.playMoveX(nextItem, nextItem.x, 0, true);
        this.playAlpha(nextItem, 0, 1, "Cubic.easeIn");
    }

    private playMoveX(target, from, to, moveY) {
        if (this.isDispose) return;
        const tween = this.scene.tweens.add({
            targets: target,
            x: {
                from,
                to
            },
            ease: "Linear",
            duration: 300,
            onComplete: () => {
                tween.stop();
                tween.remove();
                if (moveY) {
                    if (this.indexed > 0)
                        this.playMoveY();
                    else this.dispose();
                }
            },
        });
    }

    private playAlpha(target, from, to, ease: string) {
        if (this.isDispose) return;
        const tween = this.scene.tweens.add({
            targets: target,
            alpha: {
                from,
                to
            },
            ease,
            duration: 250,
            onComplete: () => {
                tween.stop();
                tween.remove();
            },
        });
    }

    private playMoveY() {
        if (this.isDispose) return;
        const from = 0;
        const to = this.listPosY[this.indexed] - this.listPosY[this.indexed - 1];
        let tempvalue = 0;
        const tween = this.scene.tweens.addCounter({
            from,
            to,
            ease: "Linear",
            duration: 200,
            onUpdate: (cope: any, param: any) => {
                const interval = param.value - tempvalue;
                for (const item of this.tempItems) {
                    item.y += interval;
                }
                tempvalue = param.value;
            },
            onComplete: () => {
                tween.stop();
                tween.remove();
                this.playNextAnimation();
            },
        });
    }
}

class MainTaskGooutAnimation {
    private taskItems: PicaTaskItem[];
    private listPosY = [];
    private tempItems = [];
    private width: number;
    private dpr: number;
    private isDispose: boolean = false;
    private scene: Phaser.Scene;
    constructor(scene: Phaser.Scene, taskItems: PicaTaskItem[], width: number, dpr: number) {
        this.scene = scene;
        this.taskItems = taskItems;
        this.width = width;
        this.dpr = dpr;
        this.setItemLayout();
    }
    public playGoOutAnimation() {
        const tempArr = [];
        const tempYArr = [];
        const tempYIndexeds = [];
        const lenght = this.taskItems.length - 1;
        for (let i = lenght; i >= 0; i--) {
            const item = this.taskItems[i];
            if (item.questData.stage === op_pkt_def.PKT_Quest_Stage.PKT_QUEST_STAGE_END) {
                tempArr.push(item);
                this.taskItems.splice(i, 1);
                if (i < this.taskItems.length) {
                    const arr = this.taskItems.slice(i, this.taskItems.length);
                    tempYArr.push(arr);
                    tempYIndexeds.push(i);
                }
            }
        }

        const from = 0;
        const to = this.width + 10 * this.dpr;
        if (tempArr.length > 0) {
            this.playMoveX(tempArr, from, to);
            this.playAlpha(tempArr, 0, 1, "Cubic.easeOut");
            setTimeout(() => {
                for (let i = 0; i < tempYArr.length; i++) {
                    const arr = tempYArr[i];
                    const indexed = tempYIndexeds[i];
                    this.playMoveGooutY(arr, indexed);
                }
            }, 300);
        }
    }

    public dispose() {
        this.tempItems.length = 0;
        this.taskItems.length = 0;
        this.taskItems = undefined;
        this.tempItems = undefined;
        this.isDispose = true;
    }
    private setItemLayout() {
        for (const item of this.taskItems) {
            this.listPosY.push(item.y);
        }
    }

    private playMoveX(target, from, to) {
        if (this.isDispose) return;
        const tween = this.scene.tweens.add({
            targets: target,
            x: {
                from,
                to
            },
            ease: "Linear",
            duration: 300,
            onComplete: () => {
                tween.stop();
                tween.remove();
                if (!this.scene) return;
                for (const item of target) {
                    item.visible = false;
                }
            },
        });
    }

    private playAlpha(target, from, to, ease: string) {
        if (this.isDispose) return;
        const tween = this.scene.tweens.add({
            targets: target,
            alpha: {
                from,
                to
            },
            ease,
            duration: 250,
            onComplete: () => {
                tween.stop();
                tween.remove();
            },
        });
    }

    private playMoveGooutY(tempArr: PicaTaskItem[], indexed: number) {
        if (this.isDispose) return;
        const from = 0;
        const to = this.listPosY[indexed + 1] - this.listPosY[indexed];
        let tempvalue = 0;
        const tween = this.scene.tweens.addCounter({
            from,
            to,
            ease: "Linear",
            duration: 200,
            onUpdate: (cope: any, param: any) => {
                const interval = param.value - tempvalue;
                for (const item of tempArr) {
                    item.y -= interval;
                }
                tempvalue = param.value;
            },
            onComplete: () => {
                tween.stop();
                tween.remove();
                if (!this.isDispose) {
                    this.dispose();
                }
            },
        });
    }
}
