import { ClickEvent, GameScroller, NineSlicePatch } from "apowophaserui";
import { ButtonEventDispatcher, DynamicImage, ProgressThreeMaskBar } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { Font, Handler, Url } from "utils";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { PicaTaskItem } from "./PicaTaskItem";

export class PicaTaskMainPanel extends Phaser.GameObjects.Container {
    private gameScroller: GameScroller;
    private curTaskItem: PicaTaskItem;
    private taskItems: PicaTaskItem[] = [];
    private mainItem: MainTaskItem;
    private dpr: number;
    private zoom: number;
    private send: Handler;
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
        if (this.curTaskItem) this.curTaskItem.setExtend(false);
        if (!this.mainItem) {
            this.mainItem = new MainTaskItem(this.scene, 272 * this.dpr, 126 * this.dpr, this.dpr, this.zoom);
            this.gameScroller.addItem(this.mainItem);
            this.mainItem.setHandler(new Handler(this, this.onRewardHandler));
        }
        this.mainItem.setMainTaskData(content, questType);
        this.setTaskItems(content.quests);
    }

    setTaskDetail(quest: op_client.PKT_Quest) {
        if (this.curTaskItem && quest) {
            if (this.curTaskItem.questData.id === quest.id) {
                this.curTaskItem.setTaskDetail(quest);
            }
        }
    }

    setTaskItems(quests: op_client.IPKT_Quest[]) {
        const tempArr = [];
        for (const quest of quests) {
            if (quest.stage === op_pkt_def.PKT_Quest_Stage.PKT_QUEST_STAGE_PROCESSING || quest.stage === op_pkt_def.PKT_Quest_Stage.PKT_QUEST_STAGE_FINISHED) {
                tempArr.push(quest);
            }
        }
        for (const item of this.taskItems) {
            const task = <PicaTaskItem>item;
            task.visible = false;
        }
        for (let i = 0; i < tempArr.length; i++) {
            let item: PicaTaskItem;
            if (i < this.taskItems.length) {
                item = this.taskItems[i];
            } else {
                item = new PicaTaskItem(this.scene, this.dpr);
                this.gameScroller.addItem(item);
                item.setHandler(new Handler(this, this.onTaskItemHandler));
                this.taskItems.push(item);
            }
            item.setTaskData(tempArr[i]);
            item.visible = true;
        }
        this.gameScroller.Sort();
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
        this.add(this.gameScroller);
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
        }
    }
    private onRewardHandler(id: string) {
        if (this.send) this.send.runWith(["reward", id]);
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
}

class MainTaskItem extends Phaser.GameObjects.Container {
    private dpr: number;
    private zoom: number;
    private titleCon: Phaser.GameObjects.Container;
    private titleTex: Phaser.GameObjects.Text;
    private taskDes: Phaser.GameObjects.Text;
    private progress: ProgressThreeMaskBar;
    private progressTex: Phaser.GameObjects.Text;
    private rewardsImg: DynamicImage;
    private rewardRotateImg: Phaser.GameObjects.Image;
    private bg: NineSlicePatch;
    private mainData: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_QUEST_GROUP;
    private isFinish: boolean = false;
    private questType: op_pkt_def.PKT_Quest_Type;
    private send: Handler;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(width, height);
        this.init();
    }
    refreshMask() {
        this.progress.refreshMask();
    }
    public setMainTaskData(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_QUEST_GROUP, questType: op_pkt_def.PKT_Quest_Type) {
        this.titleTex.text = content.name;
        this.taskDes.text = content.des;
        const max = content.quests.length;
        if (this.questType !== questType) {
            const fvalue = this.getFinishProgress(content);
            this.progress.setProgress(fvalue, max);
            this.progressTex.text = Math.floor((fvalue * 1000 / max)) / 10 + "%";
        } else {
            const from = this.getFinishProgress(this.mainData);
            const to = this.getFinishProgress(content);
            this.playProgressTween(from, to, max);
        }
        const url = Url.getOsdRes(content.reward.display.texturePath);
        this.rewardsImg.load(url, this, () => {

        });
        this.mainData = content;

    }

    public setHandler(send: Handler) {
        this.send = send;
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
        this.rewardRotateImg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "task_chapter_gift_bg1" });
        this.rewardRotateImg.x = rewardbg.x;
        this.rewardRotateImg.y = rewardbg.y;
        this.rewardsImg = new DynamicImage(this.scene, 0, 0);
        this.rewardsImg.x = rewardbg.x;
        this.rewardsImg.y = rewardbg.y;
        this.rewardsImg.scale = this.dpr / 4;
        const config = { width: 153 * this.dpr, height: 11 * this.dpr, correct: 0 };
        const barbgs = ["task_chapter_progress_bott_left", "task_chapter_progress_bott_middle", "task_chapter_progress_bott_right"];
        const bars = ["task_chapter_progress_top_left", "task_chapter_progress_top_middle", "task_chapter_progress_top_right"];
        this.progress = new ProgressThreeMaskBar(this.scene, UIAtlasName.uicommon, barbgs, bars, undefined, config, config);
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

        this.add([this.bg, this.titleCon, this.taskDes, this.progress, this.progressTex, rewardbg, this.rewardRotateImg, this.rewardsImg]);
    }

    private onReceiveAwardHandler() {
        if (this.isFinish && this.mainData.rewardsReceived) {
            if (this.send) this.send.runWith([this.mainData.id]);
        }
    }
    private getFinishProgress(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_QUEST_GROUP) {
        const quests = content.quests;
        let endNum = 0;
        for (const quest of quests) {
            if (quest.stage === op_pkt_def.PKT_Quest_Stage.PKT_QUEST_STAGE_END) {
                endNum++;
            }
        }
        return endNum;
    }

    private playProgressTween(from: number, to: number, max: number) {
        const tween = this.scene.tweens.addCounter({
            from,
            to,
            ease: "Linear",
            duration: 150,
            onUpdate: (cope: any, param: any) => {
                if (!this.scene) {
                    tween.stop();
                    tween.remove();
                }
                const value = param.value;
                this.progress.setProgress(value, max);
                this.progressTex.text = Math.floor((value * 1000 / max)) / 10 + "%";
            },
            onComplete: () => {
                tween.stop();
            },
        });
    }

}
