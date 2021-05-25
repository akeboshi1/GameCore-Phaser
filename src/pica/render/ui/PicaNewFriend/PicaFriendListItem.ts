import { BBCodeText, Button, ClickEvent } from "apowophaserui";
import { DynamicImage } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { Handler, i18n, NumberUtils, UIHelper } from "utils";
import { ImageBBCodeValue } from "..";
import { ImageValue } from "../Components";
export class PicaFriendBaseListItem extends Phaser.GameObjects.Container {
    /**
     * 1 玩家，2 关注通知，3 添加好友， 4 黑名单
     */
    public itemType: number;
    public itemData: any;
    protected dpr: number;
    protected line: Phaser.GameObjects.Graphics;
    protected send: Handler;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number) {
        super(scene);
        this.dpr = dpr;
        this.setSize(width, height);
        this.line = this.scene.make.graphics(undefined, false);
        this.line.fillStyle(0xffffff, 0.9);
        this.line.fillRect(-width * 0.5, 0, width, 2 * dpr);
        this.line.y = height * 0.5 - dpr;
        this.add(this.line);
        this.init();
    }
    public setItemData(data: any) {
        this.itemType = data.itemType || 1;
        this.itemData = data;
    }
    public setHandler(send: Handler) {
        this.send = send;
    }
    protected init() {

    }

    protected layout() {

    }
}
export class PicaFriendListItem extends PicaFriendBaseListItem {
    protected imagIcon: DynamicImage;
    protected nickImge: ImageValue;
    protected lvImage: Phaser.GameObjects.Text;
    protected vipImage: ImageValue;
    protected followBtn: Button;
    protected moreBtn: Button;
    protected send: Handler;
    public setItemData(data: any) {
        super.setItemData(data);
        const optionType = data.optionType || 1;
        this.followBtn.visible = false;
        this.moreBtn.visible = false;
        if (optionType === 2) {
            this.followBtn.visible = true;
        } else if (optionType === 3) {
            this.moreBtn.visible = true;
        }
    }
    protected init() {
        this.imagIcon = new DynamicImage(this.scene, 0, 0);
        this.nickImge = new ImageValue(this.scene, 100 * this.dpr, 20 * this.dpr, UIAtlasName.uicommon, "people_woman", this.dpr, UIHelper.whiteStyle(this.dpr, 18));
        this.nickImge.setLayout(1);
        this.lvImage = this.scene.make.text({ style: UIHelper.whiteStyle(this.dpr) }).setOrigin(0, 0.5);
        this.vipImage = new ImageValue(this.scene, 20 * this.dpr, 15 * this.dpr, UIAtlasName.uicommon, "friend_vip_icon", this.dpr, UIHelper.whiteStyle(this.dpr));
        this.vipImage.setLayout(1);
        this.vipImage.setFontStyle("bold");
        this.followBtn = new Button(this.scene, UIAtlasName.friend_new, "friend_list_follow");
        this.followBtn.on(ClickEvent.Tap, this.onFollowHandler, this);
        this.moreBtn = new Button(this.scene, UIAtlasName.friend_new, "friend_list_more");
        this.moreBtn.setInteractiveSize(20 * this.dpr, 20 * this.dpr);
        this.add([this.nickImge, this.lvImage, this.vipImage, this.followBtn, this.moreBtn]);
        this.followBtn.visible = false;
        this.moreBtn.visible = false;
        this.layout();
    }
    protected layout() {
        this.nickImge.x = -this.width * 0.5 + 25 * this.dpr;
        this.nickImge.y = -this.height * 0.5 + this.nickImge.height * 0.5;
        this.lvImage.x = this.nickImge.x;
        this.lvImage.y = this.nickImge.y + this.nickImge.height * 0.5 + this.lvImage.height * 0.5 + 5 * this.dpr;
        this.vipImage.x = this.lvImage.x + this.lvImage.width + 5 * this.dpr;
        this.vipImage.y = this.lvImage.y;
        this.followBtn.x = this.width * 0.5 - this.followBtn.width * 0.5 - 20 * this.dpr;
        this.moreBtn.x = this.followBtn.x;
    }
    protected onFollowHandler() {
        if (this.send) this.send.runWith(["follow", this.itemData]);
    }
    protected onMoreHandler() {
        if (this.send) this.send.runWith(["more", this.itemData]);
    }
}

export class PicaFriendFunctionItem extends PicaFriendBaseListItem {
    protected funImg: Phaser.GameObjects.Image;
    protected contentTex: Phaser.GameObjects.Text;
    protected redImg: Phaser.GameObjects.Image;
    protected countTex: Phaser.GameObjects.Text;
    protected arrow: Phaser.GameObjects.Image;
    public setItemData(data: any) {
        super.setItemData(data);
        if (this.itemType === 2) {
            this.funImg.setFrame("friend_list_notice_icon");
            this.contentTex.text = i18n.t("friendlist.follow_notice");
            this.countTex.text = data.count;
            this.redImg.visible = true;
            this.countTex.visible = true;
        } else if (this.itemType === 3) {
            this.funImg.setFrame("friend_list_add_icon");
            this.contentTex.text = i18n.t("friendlist.addfriend");
            this.arrow.visible = true;
        } else if (this.itemType === 4) {
            this.funImg.setFrame("friend_list_blacklist_icon");
            this.contentTex.text = i18n.t("friendlist.blacklist");
            this.arrow.visible = true;
        }
    }
    protected init() {
        this.funImg = this.scene.make.image({ key: UIAtlasName.friend_new, frame: "friend_list_notice_icon" });
        this.contentTex = this.scene.make.text({ style: UIHelper.whiteStyle(this.dpr) }).setOrigin(0, 0.5);
        this.redImg = this.scene.make.image({ key: UIAtlasName.friend_new, frame: "friend_list_notice_number" });
        this.countTex = this.scene.make.text({ style: UIHelper.whiteStyle(this.dpr) }).setOrigin(0.5);
        this.arrow = this.scene.make.image({ key: UIAtlasName.friend_new, frame: "friend_list_add_arrow" });
        this.redImg.visible = false;
        this.countTex.visible = false;
        this.arrow.visible = false;
        this.add([this.funImg, this.contentTex, this.redImg, this.countTex, this.arrow]);
        this.layout();
    }
    protected layout() {
        this.funImg.x = -this.width * 0.5 + this.funImg.width * 0.5 + 10 * this.dpr;
        this.contentTex.x = this.funImg.x + this.funImg.width * 0.5 + 8 * this.dpr;
        this.redImg.x = this.width * 0.5 - this.redImg.width * 0.5 - 10 * this.dpr;
        this.countTex.x = this.redImg.x;
        this.arrow.x = this.countTex.x;
    }
}
