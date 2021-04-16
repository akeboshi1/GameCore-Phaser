import { ClickEvent, GameScroller } from "apowophaserui";
import { Render } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { Font, Handler, i18n, Logger, UIHelper, Url } from "utils";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { PicaMailItem } from "./PicaMailItem";
import { PicaItemTipsPanel } from "../SinglePanel/PicaItemTipsPanel";
import { PicaMailPanel } from "./PicaMailPanel";

export class PicaMailMainPanel extends Phaser.GameObjects.Container {
    public mailItems: PicaMailItem[] = [];
    private gameScroller: GameScroller;
    private curMailItem: PicaMailItem;
    private notaskTip: Phaser.GameObjects.Container;
    private dpr: number;
    private zoom: number;
    private send: Handler;
    private mailDatas: any[];
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number, private render: Render) {
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
    }
    setMailDatas(content: any[]) {
        this.gameScroller.clearItems(false);
        if (content.length === 0) {
            this.notaskTip.visible = true;
            this.gameScroller.visible = false;
            return;
        }
        this.notaskTip.visible = false;
        this.gameScroller.visible = true;
        if (this.curMailItem) this.curMailItem.setExtend(false);
        this.setMailItems(content);
        const tempitems = [];
        for (const item of this.mailItems) {
            if (item.visible) tempitems.push(item);
        }
        this.mailDatas = content;
        this.render.emitter.emit(PicaMailPanel.PICAMAIL_DATA);
    }

    setTaskDetail(quest: op_client.PKT_Quest) {
        if (this.curMailItem && quest) {
            if (this.curMailItem.mailData.id === quest.id) {
                this.curMailItem.setMailDetail(quest);
            }
        }
    }

    setMailItems(mailDatas: any[]) {
        for (const item of this.mailItems) {
            const task = <PicaMailItem>item;
            task.visible = false;
        }
        this.framingCreateMail(mailDatas);
        // for (let i = 0; i < mailDatas.length; i++) {
        //     let item: PicaMailItem;
        //     if (i < this.mailItems.length) {
        //         item = this.mailItems[i];
        //     } else {
        //         item = new PicaMailItem(this.scene, this.dpr, this.zoom);
        //         item.setHandler(new Handler(this, this.onMailItemHandler));
        //         this.mailItems.push(item);
        //     }
        //     this.gameScroller.addItem(item);
        //     item.setMailData(mailDatas[i]);
        //     item.visible = true;
        //     item.alpha = 1;
        //     item.x = 0;
        // }
        this.gameScroller.Sort();
    }

    framingCreateMail(mails: any[], length: number = 5) {
        let indexed = 0;
        const createMails = () => {
            for (let i = 0; i < length; i++) {
                let item: PicaMailItem;
                const curIndexed = indexed + i;
                if (curIndexed >= mails.length) break;
                if (curIndexed < this.mailItems.length) {
                    item = this.mailItems[curIndexed];
                } else {
                    item = new PicaMailItem(this.scene, this.dpr, this.zoom);
                    item.setHandler(new Handler(this, this.onMailItemHandler));
                    this.mailItems.push(item);
                }
                this.gameScroller.addItem(item);
                item.setMailData(mails[curIndexed]);
                item.visible = true;
                item.alpha = 1;
                item.x = 0;
            }
            this.gameScroller.Sort();
            indexed += length;
            if (indexed >= mails.length) return;
            setTimeout(() => {
                if (!this.scene) return;
                createMails();
            }, 100);
        };
        createMails();
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
            },
            valuechangeCallback: (value: number) => {
                this.refreshMailIem();
            }
        });
        const tipimg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "task_no" });
        const tiptext = this.scene.make.text({ text: i18n.t("task.notasktip"), style: UIHelper.whiteStyle(this.dpr) }).setOrigin(0.5);
        tiptext.y = tipimg.height * 0.5 + 15 * this.dpr;
        this.notaskTip = this.scene.make.container(undefined);
        this.notaskTip.add([tipimg, tiptext]);
        this.notaskTip.y = -this.height * 0.5 + 100 * this.dpr;
        this.notaskTip.visible = false;
        this.add([this.gameScroller, this.notaskTip]);
    }

    private onPointerUpHandler(gameobject) {
        const extend = gameobject.extend ? false : true;
        gameobject.setExtend(extend, true);
    }

    private onMailItemHandler(tag: string, data: any) {
        if (tag === "extend") {
            const extend = data.extend;
            const item = data.item;
            this.onExtendsHandler(extend, item);
        } else if (tag === "reward") {
            this.send.runWith(["reward", data]);
        } else if (tag === "finish") {
            this.send.runWith(["finish", data]);
        } else if (tag === "item") {
            this.onMaterialItemHandler(data);
        }
    }

    private onExtendsHandler(isExtend: boolean, item: PicaMailItem) {
        if (this.curMailItem) {
            this.curMailItem.setExtend(false, false);
        }
        if (isExtend) {
            this.curMailItem = item;
        } else
            this.curMailItem = null;
        this.gameScroller.Sort(true);
        this.refreshMailIem();
    }
    private onMaterialItemHandler(gameobj: any) {
        PicaItemTipsPanel.Inst.showTips(gameobj, gameobj.itemData);
    }
    private refreshMailIem() {
        if (this.curMailItem) this.curMailItem.refreshMask();
    }

    private checkBoundPoint() {

    }
}
