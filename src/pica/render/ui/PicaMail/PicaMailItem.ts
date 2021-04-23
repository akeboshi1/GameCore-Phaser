import { ClickEvent, GameScroller, NineSlicePatch } from "apowophaserui";
import { DynamicImage, ThreeSliceButton } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { ICountablePackageItem } from "picaStructure";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { Handler, i18n, TimeUtils, UIHelper, Url } from "utils";
import { ImageValue, ItemButton } from "../Components";
export class PicaMailItem extends Phaser.GameObjects.Container {
    public mailButton: ThreeSliceButton;
    public mailData: op_client.PKT_MAIL_DATA;
    private content: Phaser.GameObjects.Container;
    private bg: Phaser.GameObjects.Image;
    private extendBg: NineSlicePatch;
    private headbg: Phaser.GameObjects.Image;
    private headIcon: Phaser.GameObjects.Image;
    private redpoint: Phaser.GameObjects.Image;
    private mailName: Phaser.GameObjects.Text;
    private mailSender: Phaser.GameObjects.Text;
    private expirationTime: ExpirationTime;
    private arrow: Phaser.GameObjects.Image;
    private mExtend: MailItemExtend;
    private dpr: number;
    private send: Handler;
    private mIsExtend: boolean = false;
    private zoom: number = 1;
    constructor(scene: Phaser.Scene, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        const conWidth = 275 * dpr;
        const conHeight = 70 * dpr;
        this.setSize(conWidth, conHeight);
        this.content = scene.make.container(undefined, false);
        this.content.setSize(conWidth, conHeight);
        this.extendBg = new NineSlicePatch(this.scene, 0, 0, conWidth, conHeight, UIAtlasName.mail, "mail_Unfold_bg", {
            left: 30 * dpr,
            top: 60 * dpr,
            bottom: 30 * dpr,
            right: 30 * dpr,
        });
        this.bg = this.scene.make.image({ key: UIAtlasName.mail, frame: "mail_unread_bg" });
        const posx = -conWidth * 0.5, posy = -conHeight * 0.5;
        this.headbg = scene.make.image({ key: UIAtlasName.mail, frame: "mail_unread_mark_bg" });
        this.headbg.x = posx + 25 * dpr;
        this.headIcon = this.scene.make.image({ key: UIAtlasName.mail, frame: "mail_unread_mark" });
        this.headIcon.y = this.headbg.y;
        this.headIcon.x = this.headbg.x;
        this.redpoint = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "home_hint_small" });
        this.redpoint.x = this.headIcon.x + this.headIcon.width * 0.5 - 5 * dpr;
        this.redpoint.y = this.headIcon.y - this.headIcon.height * 0.5 + 0 * dpr;
        this.mailName = scene.make.text({ text: "", style: UIHelper.whiteStyle(dpr, 13) }).setOrigin(0, 0.5);
        this.mailName.setFontStyle("bold");
        this.mailName.x = this.headIcon.x + 28 * dpr;
        this.mailName.y = -conHeight * 0.5 + 20 * dpr;
        this.mailSender = scene.make.text({ text: "", style: UIHelper.colorStyle("#FFF449", 12 * dpr) }).setOrigin(0);
        this.mailSender.x = this.mailName.x;
        this.mailSender.y = this.mailName.y + 15 * dpr;
        this.expirationTime = new ExpirationTime(scene, dpr);
        this.expirationTime.x = conWidth * 0.5 - 10 * dpr;
        this.mailButton = new ThreeSliceButton(this.scene, 62 * dpr, 25 * dpr, UIAtlasName.uicommon, UIHelper.threeGreenSmall, UIHelper.threeGreenSmall, i18n.t("task.receive"));
        this.mailButton.setFontStyle("bold");
        this.mailButton.setTextStyle(UIHelper.blackStyle(dpr));
        this.mailButton.x = conWidth * 0.5 - this.mailButton.width * 0.5 - 10 * dpr;
        this.mailButton.on(ClickEvent.Tap, this.onMailButtonHandler, this);
        this.arrow = this.scene.make.image({ key: UIAtlasName.mail, frame: "mail_read_arrow" });
        this.arrow.y = conHeight * 0.5 - this.arrow.height * 0.5 - 5 * dpr;
        this.content.add([this.bg, this.headbg, this.headIcon, this.redpoint, this.mailName, this.mailSender, this.expirationTime, this.mailButton, this.arrow]);
        this.add([this.extendBg, this.content]);
        this.setSize(conWidth, conHeight);
        this.extendBg.visible = false;
        this.mailButton.visible = false;
    }

    public refreshMask() {
        if (this.extend && this.mExtend) this.mExtend.refreshMask();
    }
    public setMailData(data: op_client.PKT_MAIL_DATA) {
        this.mailData = data;
        this.mailData["localTime"] = (Date.now() / 1000);
        this.mailName.text = data.title;
        this.setTextLimit(this.mailName, data.title);
        this.setTextLimit(this.mailSender, `${i18n.t("mail.sender")}${data.senderName}`);
        this.setMailState(data.hasRead);
        this.expirationTime.setTimeData(data.sentTime, data.expireTime, data.hasRead);
        if (this.mIsExtend) this.setExtendMailData(data);
    }

    public setMailState(read: boolean) {
        this.bg.setFrame(read ? "mail_read_bg" : "mail_unread_bg");
        this.headbg.setFrame(read ? "mail_read_mark_bg" : "mail_unread_mark_bg");
        this.headIcon.setFrame(read ? "mail_read_mark" : "mail_unread_mark");
        this.mailName.setColor(read ? "#196ECE" : "#FFFFFF");
        this.mailSender.setColor(read ? "#000000" : "#0457B5");
        this.redpoint.visible = !read;

    }

    public setMailDetail(data: op_client.PKT_MAIL_DATA) {
        if (this.mExtend) this.mExtend.setItemData(data);
    }

    public setHandler(send: Handler) {
        this.send = send;
    }

    public setExtend(isExtend: boolean, haveCallBack: boolean = true) {
        if (isExtend) {
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
    private onMailButtonHandler() {
        if (this.mailData && !this.mailData.attachTaken) this.send.runWith(["getrewards", this.mailData.id]);
    }
    private openExtend() {
        if (!this.mExtend) {
            this.mExtend = new MailItemExtend(this.scene, this.width - 6 * this.dpr, 0, this.dpr, this.zoom);
            this.mExtend.setHandler(this.send);
            this.add(this.mExtend);
        }
        this.setExtendMailData(this.mailData);
        this.mExtend.visible = true;
        this.height = this.content.height + this.mExtend.height + 3 * this.dpr;
        this.content.y = -this.height * 0.5 + this.content.height * 0.5;
        this.mExtend.y = this.content.y + this.content.height * 0.5 - 5 * this.dpr;
        this.mIsExtend = true;
        this.arrow.visible = false;
        this.extendBg.visible = true;
        this.bg.visible = false;
        this.extendBg.resize(this.extendBg.width, this.height);
        this.expirationTime.visible = false;
        this.setMailState(true);
        this.expirationTime.clearTimer();
    }

    private setExtendMailData(mailData: op_client.PKT_MAIL_DATA) {
        this.mExtend.setItemData(mailData);
        if (!this.mailData.hasRead) this.send.runWith(["readmail", this.mailData.id]);
        this.mailButton.visible = !mailData.attachTaken;
    }

    private closeExtend() {
        if (this.mExtend) this.mExtend.visible = false;
        this.height = this.content.height;
        this.extendBg.visible = false;
        this.bg.visible = true;
        this.content.y = 0;
        this.mIsExtend = false;
        this.arrow.visible = true;
        this.expirationTime.visible = true;
        this.mailButton.visible = false;
        this.mExtend.clearTimer();
        const continueTime = Date.now() / 1000 - this.mailData["localTime"];
        this.expirationTime.setTimeData(this.mailData.sentTime + continueTime, this.mailData.expireTime, true);
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
class MailItemExtend extends Phaser.GameObjects.Container {
    private mailTex: Phaser.GameObjects.Text;
    private sendTex: Phaser.GameObjects.Text;
    private expirationTex: Phaser.GameObjects.Text;
    private gameScroll: GameScroller;
    private rewardArr: ItemButton[] = [];
    private line: Phaser.GameObjects.Image;
    private dpr: number = 0;
    private zoom: number = 1;
    private send: Handler;
    private timerID: any;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.width = width;
        this.dpr = dpr;
        this.zoom = zoom;
        const posx = -width * 0.5 + 10 * dpr;
        const posy = -height * 0.5 + 0 * dpr;
        this.mailTex = scene.make.text({ x: posx, y: posy, text: i18n.t("task.objective"), style: UIHelper.blackStyle(dpr) }).setOrigin(0, 0);
        this.mailTex.setWordWrapWidth(width - 40 * dpr, true);
        this.mailTex.setLineSpacing(5 * dpr);
        this.mailTex.x = -width * 0.5 + 20 * dpr;
        this.sendTex = scene.make.text({ x: posx, y: posy + 18 * dpr, text: i18n.t("task.collect_materials"), style: UIHelper.blackStyle(dpr) }).setOrigin(1, 0);
        this.sendTex.x = width * 0.5 - 20 * dpr;
        this.expirationTex = scene.make.text({ x: posx, y: posy, text: i18n.t("task.objective"), style: UIHelper.blackStyle(dpr) }).setOrigin(1, 0);
        this.expirationTex.x = this.sendTex.x;
        this.line = scene.make.image({ key: UIAtlasName.mail, frame: "mail_reward_line" });
        this.line.setPosition(-10 * dpr, posy + 110 * dpr);
        this.gameScroll = new GameScroller(this.scene, {
            x: 0,
            y: 0 * this.dpr,
            width: this.width - 40 * dpr,
            height: 80 * dpr,
            zoom: this.zoom,
            dpr: this.dpr,
            align: 2,
            orientation: 1,
            space: 10 * this.dpr,
            padding: { top: 2 * this.dpr },
            selfevent: true,
            cellupCallBack: (gameobject) => {
                this.onPointerUpHandler(gameobject);
            }
        });
        this.add([this.mailTex, this.sendTex, this.expirationTex, this.line, this.gameScroll]);
        this.setSize(width, height);
    }
    public refreshMask() {
        this.gameScroll.refreshMask();
    }
    public setItemData(mailData: op_client.IPKT_MAIL_DATA) {
        let taskPosy = 0;
        const cellHeight = 67 * this.dpr;
        this.mailTex.text = mailData.content;
        this.sendTex.text = `${i18n.t("mail.sender")}${mailData.senderName}`;
        this.sendTex.y = this.mailTex.y + this.mailTex.height + 15 * this.dpr;
        this.expirationTex.text = i18n.t("mail.expiration", { time: TimeUtils.getBriefFormat(mailData.expireTime) });
        this.expirationTex.y = this.sendTex.y + this.sendTex.height + 6 * this.dpr;
        taskPosy = this.expirationTex.y + this.expirationTex.height + 10 * this.dpr;
        this.line.y = taskPosy;
        taskPosy += 5 * this.dpr;
        this.createMailCells(this.rewardArr, <any>mailData.attachments, false);
        taskPosy += cellHeight * 0.5;
        this.gameScroll.y = taskPosy;
        this.gameScroll.clearItems(false);
        this.gameScroll.addItems(this.rewardArr);
        this.gameScroll.Sort();
        this.gameScroll.refreshMask();
        this.height = taskPosy + cellHeight * 0.5 + 10 * this.dpr;
        const continueTime = Date.now() / 1000 - mailData["localTime"];
        const time = mailData.expireTime - mailData.sentTime - continueTime;
        this.countDown(time * 1000);
    }

    public setHandler(send: Handler) {
        this.send = send;
    }
    public clearTimer() {
        if (this.timerID) {
            clearTimeout(this.timerID);
            this.timerID = undefined;
        }
    }
    private onPointerUpHandler(gameobject) {
        if (this.send) this.send.runWith(["item", gameobject]);
    }
    private createMailCells(arr: ItemButton[], dataArr: ICountablePackageItem[], isTask: boolean = true) {
        for (const item of arr) {
            item.visible = false;
            item.y = 0;
        }
        for (let i = 0; i < dataArr.length; i++) {
            let item: ItemButton;
            if (i < arr.length) {
                item = arr[i];
            } else {
                if (dataArr[i].texturePath) {
                    item = new ItemButton(this.scene, UIAtlasName.uicommon, "bag_icon_common_bg", this.dpr, this.zoom, false);
                    item.on(ClickEvent.Tap, this.onMailCellHandler, this);
                    arr.push(item);
                }
            }
            if (item) {
                item.visible = true;
                item.setItemData(dataArr[i]);
            }
        }
        return arr;
    }

    private onMailCellHandler(pointer, gameobject) {
        if (this.send) this.send.runWith(["item", gameobject]);
    }
    private countDown(time: number) {
        if (this.timerID) {
            clearTimeout(this.timerID);
            this.timerID = undefined;
        }
        const interval = 1000;
        const timeextu = () => {
            this.expirationTex.text = i18n.t("mail.expiration", { time: TimeUtils.getBriefFormat(time) });
            time -= interval;
            if (time > 0) {
                this.timerID = setTimeout(() => {
                    timeextu();
                }, interval);
                return;
            } else {
                this.expirationTex.text = "";
                this.timerID = undefined;
            }
        };
        timeextu();
    }
}
class ExpirationTime extends Phaser.GameObjects.Container {
    private timeImg: ImageValue;
    private expirationBg: Phaser.GameObjects.Image;
    private expirationTex: Phaser.GameObjects.Text;
    private dpr: number;
    private timerID: any;
    constructor(scene: Phaser.Scene, dpr: number) {
        super(scene);
        this.dpr = dpr;
        this.timeImg = new ImageValue(scene, 10 * dpr, 15 * dpr, UIAtlasName.mail, "mail_read_time", dpr);
        this.timeImg.setLayout(3);
        this.timeImg.y = -15 * dpr;
        this.timeImg.x = -13 * dpr;
        this.expirationBg = this.scene.make.image({ key: UIAtlasName.mail, frame: "mail_read_countdown_bg" });
        this.expirationBg.y = 7 * dpr;
        this.expirationBg.x = -this.expirationBg.width * 0.5;
        this.expirationTex = this.scene.make.text({ style: UIHelper.whiteStyle(dpr, 10) }).setOrigin(0.5);
        this.expirationTex.y = this.expirationBg.y;
        this.expirationTex.x = this.expirationBg.x;
        this.add([this.timeImg, this.expirationBg, this.expirationTex]);
    }

    destroy() {
        super.destroy();
        this.clearTimer();
    }
    public clearTimer() {
        if (this.timerID) {
            clearTimeout(this.timerID);
            this.timerID = undefined;
        }
    }
    public setTimeData(time: number, end: number, read: boolean) {
        const date = new Date(time * 1000);
        this.timeImg.setText(TimeUtils.dateFormat("YYYY.mm.dd", date));
        this.timeImg.setTextStyle({ color: (read ? "#000000" : "#FFFFFF") });
        this.expirationBg.setFrame(read ? "mail_read_countdown_bg" : "mail_unread_countdown_bg");
        this.countDown((end - time) * 1000);
    }
    private countDown(time: number) {
        if (this.timerID) {
            clearTimeout(this.timerID);
            this.timerID = undefined;
        }
        const interval = 1000;
        const timeextu = () => {
            this.expirationTex.text = TimeUtils.getDateFormat(time, true);
            time -= interval;
            if (time > 0) {
                this.timerID = setTimeout(() => {
                    timeextu();
                }, interval);
                return;
            } else {
                this.expirationTex.text = "";
                this.timerID = undefined;
            }
        };
        timeextu();
    }
}
