import { ClickEvent, GameScroller } from "apowophaserui";
import { Render } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { Font, Handler, i18n, Logger, UIHelper, Url } from "utils";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { PicaMailItem } from "./PicaMailItem";
import { PicaItemTipsPanel } from "../SinglePanel/PicaItemTipsPanel";
import { PicaMailPanel } from "./PicaMailPanel";

export class PicaMailMainPanel extends Phaser.GameObjects.Container {
    private gameScroller: GameScroller;
    private curMailItem: PicaMailItem;
    private noMailTip: Phaser.GameObjects.Container;
    private dpr: number;
    private zoom: number;
    private send: Handler;
    private mailDatas: Map<string, op_client.PKT_MAIL_DATA> = new Map();
    private mailItemMap: Map<string, PicaMailItem> = new Map();
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

    setMailDatas(content: any) {
        this.syncMailDatas(content);
        if (content.isAll) {
            const mails = Array.from(this.mailDatas.values());
            this.setAllMailDatas(mails);
        } else {
            this.setUpdateMailDatas(content.list);
        }
    }

    setAllMailDatas(mails: any[]) {
        if (mails.length === 0) {
            this.noMailTip.visible = true;
            this.gameScroller.visible = false;
            return;
        }
        this.noMailTip.visible = false;
        this.gameScroller.visible = true;
        if (this.curMailItem) this.curMailItem.setExtend(false);
        this.setMailItems(mails);
        this.render.emitter.emit(PicaMailPanel.PICAMAIL_DATA);
    }

    setUpdateMailDatas(mails: op_client.PKT_MAIL_DATA[]) {
        for (const mail of mails) {
            if (this.mailItemMap.has(mail.id)) {
                const item = this.mailItemMap.get(mail.id);
                item.setMailData(mail);
            } else {
                const item = new PicaMailItem(this.scene, this.dpr, this.zoom);
                item.setHandler(new Handler(this, this.onMailItemHandler));
                this.gameScroller.addItemAt(item, 0);
                this.mailItemMap.set(mail.id, item);
                item.setMailData(mail);
                item.visible = true;
                item.alpha = 1;
                item.x = 0;
            }
        }
        this.gameScroller.Sort(true);
    }
    syncMailDatas(content: any) {
        if (content.isAll) {
            this.mailDatas.clear();
        }
        for (const mail of content.list) {
            this.mailDatas.set(mail.id, mail);
        }
    }
    setMailItems(mailDatas: op_client.PKT_MAIL_DATA[]) {
        this.mailItemMap.forEach((value, key) => {
            value.visible = false;
        });
        this.framingCreateMail(mailDatas);
        this.gameScroller.Sort();
    }

    framingCreateMail(mails: op_client.PKT_MAIL_DATA[], length: number = 5) {
        let indexed = 0;
        const mailitems = <PicaMailItem[]>this.gameScroller.getItemList();
        const createMails = () => {
            for (let i = 0; i < length; i++) {
                let item: PicaMailItem;
                const curIndexed = indexed + i;
                const data = mails[curIndexed];
                if (curIndexed >= mails.length) break;
                if (curIndexed < mailitems.length) {
                    item = mailitems[curIndexed];
                } else {
                    item = new PicaMailItem(this.scene, this.dpr, this.zoom);
                    item.setHandler(new Handler(this, this.onMailItemHandler));
                    this.gameScroller.addItem(item);
                }
                this.mailItemMap.set(data.id, item);
                item.setMailData(data);
                item.visible = true;
                item.alpha = 1;
                item.x = 0;
            }
            this.gameScroller.Sort(true);
            indexed += length;
            if (indexed >= mails.length) return;
            setTimeout(() => {
                if (!this.scene) return;
                createMails();
            }, 100);
        };
        createMails();
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
        const tiptext = this.scene.make.text({ text: i18n.t("mail.nomailtip"), style: UIHelper.whiteStyle(this.dpr) }).setOrigin(0.5);
        tiptext.y = tipimg.height * 0.5 + 15 * this.dpr;
        this.noMailTip = this.scene.make.container(undefined);
        this.noMailTip.add([tipimg, tiptext]);
        this.noMailTip.y = -this.height * 0.5 + 100 * this.dpr;
        this.noMailTip.visible = false;
        this.add([this.gameScroller, this.noMailTip]);
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
        } else if (tag === "getrewards") {
            this.send.runWith(["getrewards", data]);
        } else if (tag === "readmail") {
            this.send.runWith(["readmail", data]);
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
}
