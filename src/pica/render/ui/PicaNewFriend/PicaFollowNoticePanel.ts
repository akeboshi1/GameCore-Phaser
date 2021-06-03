import { GameGridTable } from "apowophaserui";
import { Handler, i18n, UIHelper } from "utils";
import { op_client } from "pixelpai_proto";
import { UITools } from "picaRender";
import { ButtonEventDispatcher } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { PicaFriendBasePanel } from "./PicaFriendBasePanel";
import { FriendChannel, FriendData } from "structure";
export class PicaFollowNoticePanel extends PicaFriendBasePanel {
    protected create() {
        super.create(i18n.t("friendlist.follow_notice"));
    }
    protected createCellItem(cell, cellContainer) {
        const scene = cell.scene, index = cell.index,
            item = cell.item;
        if (cellContainer === null) {
            cellContainer = new PicaFollowNoticeItem(this.scene, 280 * this.dpr, 48 * this.dpr, this.dpr);
        }
        cellContainer.setNoticeData(item, index);
        return cellContainer;
    }
    protected getItemDatas(type: FriendChannel, content: any[]) {
        return content;
    }
}
export class PicaFollowNoticeItem extends Phaser.GameObjects.Container {
    protected bg: Phaser.GameObjects.Image;
    protected noticeImg: Phaser.GameObjects.Image;
    protected contentTex: Phaser.GameObjects.Text;
    protected dpr: number;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number) {
        super(scene);
        this.dpr = dpr;
        this.setSize(width, height);
        this.init();

    }
    public setNoticeData(data: FriendData) {
        this.contentTex.text = i18n.t("friendlist.followed_you", { name: data.nickname });
    }
    protected init() {
        this.bg = this.scene.make.image({ key: UIAtlasName.friend_new, frame: "friend_notice_list_bg" });
        this.noticeImg = this.scene.make.image({ key: UIAtlasName.friend_new, frame: "friend_notice_icon" });
        this.contentTex = this.scene.make.text({ style: UIHelper.whiteStyle(this.dpr) }).setOrigin(0, 0.5);
        this.add([this.bg, this.noticeImg, this.contentTex]);
        this.layout();
    }
    protected layout() {
        this.noticeImg.x = -this.width * 0.5 + this.noticeImg.width * 0.5 + 10 * this.dpr;
        this.contentTex.x = this.noticeImg.x + this.noticeImg.width * 0.5 + 8 * this.dpr;
    }
}
