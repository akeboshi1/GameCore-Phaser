import { BBCodeText, Button, CheckBox, ClickEvent } from "apowophaserui";
import { DynamicImage, InputField, InputLabel } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { FriendChannel, FriendRelationEnum } from "structure";
import { Font, Handler, i18n, NumberUtils, UIHelper, Url } from "utils";
import { ImageBBCodeValue } from "..";
import { ImageValue } from "../Components";
export class PicaFriendBaseListItem extends Phaser.GameObjects.Container {
    /**
     * 1 玩家，2 关注通知，3 添加好友， 4 黑名单,5 搜索
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
        const lineWidth = 280 * dpr;
        this.line = this.scene.make.graphics(undefined, false);
        this.line.fillStyle(0xffffff, 0.33);
        this.line.fillRect(-lineWidth * 0.5, 0, lineWidth, 1 * dpr);
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

    public show() {

    }

    public hide() {

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
        const optionType = data.optionType || 0;
        this.followBtn.visible = false;
        this.moreBtn.visible = false;
        if (optionType === FriendChannel.Fans) {
            this.followBtn.visible = true;
        } else if (optionType === FriendChannel.Followes || optionType === FriendChannel.Blacklist) {
            this.moreBtn.visible = true;
        } else if (optionType === FriendChannel.Search) {
            if (data.relation === FriendRelationEnum.Fans || data.relation === FriendRelationEnum.Null) {
                this.followBtn.visible = true;
            } else if (data.relation === FriendRelationEnum.Followed || data.relation === FriendRelationEnum.Friend || data.relation === FriendRelationEnum.Blacklist) {
                this.moreBtn.visible = true;
            }
        }
        const avatar = data.avatar;
        if (avatar && avatar !== "") {
            const url = Url.getOsdRes(avatar);
            this.imagIcon.load(url);
        }
        this.nickImge.setText(data.nickname);
        this.lvImage.setText(`lv ${data.lv}`);
        this.vipImage.setText("???");
        this.layout();
    }
    protected init() {
        this.imagIcon = new DynamicImage(this.scene, 0, 0);
        this.imagIcon.scale = this.dpr * 0.8;
        this.nickImge = new ImageValue(this.scene, 100 * this.dpr, 20 * this.dpr, UIAtlasName.uicommon, "people_woman", this.dpr, UIHelper.whiteStyle(this.dpr, 12));
        this.nickImge.setLayout(1);
        this.lvImage = this.scene.make.text({ style: UIHelper.whiteStyle(this.dpr) }).setOrigin(0, 0.5);
        this.vipImage = new ImageValue(this.scene, 20 * this.dpr, 15 * this.dpr, UIAtlasName.uicommon, "friend_vip_icon", this.dpr, UIHelper.whiteStyle(this.dpr));
        this.vipImage.setLayout(1);
        this.vipImage.setFontStyle("bold");
        this.followBtn = new Button(this.scene, UIAtlasName.friend_new, "friend_list_follow");
        this.followBtn.on(ClickEvent.Tap, this.onFollowHandler, this);
        this.moreBtn = new Button(this.scene, UIAtlasName.friend_new, "friend_list_more");
        this.moreBtn.on(ClickEvent.Tap, this.onMoreHandler, this);
        this.moreBtn.setInteractiveSize(30 * this.dpr, 40 * this.dpr);
        this.add([this.imagIcon, this.nickImge, this.lvImage, this.vipImage, this.followBtn, this.moreBtn]);
        this.followBtn.visible = false;
        this.moreBtn.visible = false;
        this.layout();
    }
    protected layout() {
        this.imagIcon.x = -this.width * 0.5 + 28 * this.dpr;
        this.imagIcon.y = -4 * this.dpr;
        this.nickImge.x = this.imagIcon.x + this.nickImge.width * 0.5 + 25 * this.dpr;
        this.nickImge.y = -this.height * 0.5 + this.nickImge.height * 0.5 + 5 * this.dpr;
        this.lvImage.x = this.imagIcon.x + 25 * this.dpr;
        this.lvImage.y = this.nickImge.y + this.nickImge.height * 0.5 + this.lvImage.height * 0.5 + 5 * this.dpr;
        this.vipImage.x = this.lvImage.x + this.lvImage.width + this.vipImage.width * 0.5 + 5 * this.dpr;
        this.vipImage.y = this.lvImage.y;
        this.followBtn.x = this.width * 0.5 - this.followBtn.width * 0.5 - 20 * this.dpr;
        this.moreBtn.x = this.followBtn.x;
    }
    protected onFollowHandler() {
        if (this.send) this.send.runWith(["follow", this.itemData.id]);
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
            // this.redImg.visible = true;
            // this.countTex.visible = true;
            this.arrow.visible = true;
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
export class PicaFriendSearchItem extends PicaFriendBaseListItem {
    protected bg: Phaser.GameObjects.Image;
    protected checkBox: CheckBox;
    protected contentTex: Phaser.GameObjects.Text;
    protected inputLabel: PicaFriendSearchInput;
    protected searchBtn: Button;
    protected addBtn: Button;
    protected inputVisible: boolean;
    public setItemData(data: any) {
        super.setItemData(data);
        this.checkBox.selected = data.selected || false;
        this.inputLabel.setText(data.input || "");
        this.setInputState(data.inputvisible || false);

    }

    public hide() {
        this.inputLabel.hide();
        this.visible = false;
    }
    public show() {
        this.inputLabel.show();
        this.visible = true;
    }
    public setInputState(visible: boolean) {
        if (this.inputVisible === visible) return;
        if (visible) {
            this.inputLabel.show();
        } else {
            this.inputLabel.hide();
        }
        this.itemData.inputvisible = visible;
        this.inputVisible = visible;
    }

    protected init() {
        this.bg = this.scene.make.image({ key: UIAtlasName.friend_new, frame: "friend_list_online_bg" });
        this.checkBox = new CheckBox(this.scene, UIAtlasName.friend_new, "friend_list_online_unselected", "friend_list_online_selected");
        this.checkBox.setInteractiveSize(20 * this.dpr, 20 * this.dpr);
        this.checkBox.on(ClickEvent.Tap, this.onCheckBoxHandler, this);
        this.contentTex = this.scene.make.text({ text: i18n.t("friendlist.olinetitle"), style: UIHelper.whiteStyle(this.dpr) }).setOrigin(0, 0.5);
        this.inputLabel = new PicaFriendSearchInput(this.scene, 146 * this.dpr, 26 * this.dpr, UIAtlasName.friend_new, "friend_add_search_bg", this.dpr, {
            type: "text",
            placeholder: i18n.t("friendlist.friendplaceholder"),
            color: "#ffffff",
            text: "",
            fontSize: 13 * this.dpr + "px",
            width: 110 * this.dpr,
            height: 26 * this.dpr,
            maxLength: 10
        });
        this.inputLabel.on("textchange", this.onTextChangeHandler, this);
        this.searchBtn = new Button(this.scene, UIAtlasName.friend_new, "friend_list_search");
        this.searchBtn.on(ClickEvent.Tap, this.onSearchHandler, this);
        this.searchBtn.setInteractiveSize(20 * this.dpr, 40 * this.dpr);
        this.addBtn = new Button(this.scene, UIAtlasName.friend_new, "friend_list_add");
        this.addBtn.setInteractiveSize(25 * this.dpr, 40 * this.dpr);
        this.addBtn.on(ClickEvent.Tap, this.onAddHandler, this);
        this.add([this.bg, this.checkBox, this.contentTex, this.inputLabel, this.searchBtn, this.addBtn]);
        this.layout();
        this.inputLabel.hide();
        this.line.visible = false;
    }
    protected layout() {
        this.checkBox.x = -this.width * 0.5 + this.checkBox.width * 0.5 + 18 * this.dpr;
        this.contentTex.x = this.checkBox.x + this.checkBox.width * 0.5 + 4 * this.dpr;
        this.inputLabel.x = 30 * this.dpr;
        this.addBtn.x = this.width * 0.5 - this.addBtn.width * 0.5 - 21 * this.dpr;
        this.searchBtn.x = this.addBtn.x - 33 * this.dpr;
    }

    protected onTextChangeHandler() {
        const text = this.inputLabel.text;
        this.itemData.input = text;
        this.send.runWith(["searchfriend", text]);
    }
    protected onSearchHandler() {
        const visible = this.inputLabel.visible;
        this.setInputState(!visible);
        this.checkBox.selected = false;
    }

    protected onCheckBoxHandler() {
        const select = this.checkBox.selected;
        this.itemData.selected = select;
        if (this.send) this.send.runWith(["online", select]);
        this.setInputState(false);
    }

    protected onAddHandler() {
        if (this.send) this.send.runWith(["addfriendpanel"]);
    }
}

export class PicaFriendSearchInput extends Phaser.GameObjects.Container {
    protected background: Phaser.GameObjects.Image;
    protected inputText: InputLabel;
    protected dpr: number;
    protected blur: boolean = false;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, bg: string, dpr: number, config: any) {
        super(scene);
        this.dpr = dpr;
        this.setSize(width, height);
        this.background = this.scene.make.image({ key, frame: bg });
        this.inputText = new InputLabel(this.scene, config).setOrigin(0, 0.5);
        this.inputText.x = -width * 0.5 + 5 * dpr;
        this.inputText.on("textchange", this.onTextChangeHandler, this);
        this.inputText.on("blur", this.onTextBlurHandler, this);
        this.inputText.on("focus", this.onTextFocusHandler, this);
        this.add([this.background, this.inputText]);
    }
    public hide() {
        this.visible = false;
    }

    public show() {
        this.visible = true;
    }

    public setText(text) {
        this.inputText.setText(text);
    }

    private onTextChangeHandler(input, event) {
        this.emit("textchange");
    }

    private onTextBlurHandler() {
        this.emit("blur");
    }

    private onTextFocusHandler(e) {
        this.emit("focus");
    }

    get text() {
        return this.inputText.text;
    }
}
export class PicaFriendCommonItem extends Phaser.GameObjects.Container {
    public itemData: any;
    public itemType: number;
    protected dpr: number;
    protected zoom: number;
    protected baseItem: PicaFriendBaseListItem;
    protected send: Handler;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(width, height);
    }

    setItemData(data: any) {
        this.itemData = data;
        data.itemType = data.itemType || 1;
        if (!this.itemType || this.itemType !== data.itemType) {
            if (this.baseItem) this.baseItem.destroy();
            this.baseItem = this.getBaseItem(data.itemType);
            this.baseItem.setHandler(this.send);
            this.add(this.baseItem);
            this.setSize(this.baseItem.width, this.baseItem.height);
        }
        this.itemType = data.itemType;
        this.baseItem.setItemData(data);
    }
    setHandler(send: Handler) {
        this.send = send;
    }
    public updateItemState(value?: any) {
        if (this.itemType === 5) {
            (<any>this.baseItem).setInputState(false);
        }
    }
    public hide() {
        if (this.baseItem) this.baseItem.hide();
    }

    public show() {
        if (this.baseItem) this.baseItem.show();
    }
    protected getBaseItem(itemType) {
        let item: PicaFriendBaseListItem;
        if (itemType === 1) {
            item = new PicaFriendListItem(this.scene, this.width, 52 * this.dpr, this.dpr);
        } else if (itemType === 2 || itemType === 3 || itemType === 4) {
            item = new PicaFriendFunctionItem(this.scene, this.width, 42 * this.dpr, this.dpr);
        } else if (itemType === 5) {
            item = new PicaFriendSearchItem(this.scene, this.width, 37 * this.dpr, this.dpr);
        }
        return item;
    }
}

export class PicaFriendFunctionSearchItem extends PicaFriendSearchItem {
    public setItemData(data: any) {
        this.itemType = data.itemType || 1;
        this.itemData = data;
        this.inputLabel.setText(data.input || "");

    }
    protected onTextChangeHandler() {
        const text = this.inputLabel.text;
        this.itemData.input = text;
    }
    protected onSearchHandler() {
        const text = this.inputLabel.text;
        this.send.runWith(["searchfriend", text]);

    }

    protected init() {
        this.bg = this.scene.make.image({ key: UIAtlasName.friend_new, frame: "friend_list_online_bg" });
        this.inputLabel = new PicaFriendSearchInput(this.scene, 146 * this.dpr, 26 * this.dpr, UIAtlasName.friend_new, "friend_add_search_bg", this.dpr, {
            type: "text",
            placeholder: i18n.t("friendlist.friendplaceholder"),
            color: "#ffffff",
            text: "",
            fontSize: 13 * this.dpr + "px",
            width: 110 * this.dpr,
            height: 26 * this.dpr,
            maxLength: 10
        });
        this.inputLabel.on("textchange", this.onTextChangeHandler, this);
        this.searchBtn = new Button(this.scene, UIAtlasName.friend_new, "friend_list_search");
        this.searchBtn.on(ClickEvent.Tap, this.onSearchHandler, this);
        this.searchBtn.setInteractiveSize(20 * this.dpr, 20 * this.dpr);
        this.add([this.bg, this.inputLabel, this.searchBtn]);
        this.layout();
        this.inputLabel.show();
        this.line.visible = false;
    }
    protected layout() {
        this.inputLabel.x = 30 * this.dpr;
        this.searchBtn.x = this.inputLabel.x + this.inputLabel.width * 0.5 - 13 * this.dpr;
    }
}

export class PicaFriendFunctionCommonItem extends PicaFriendCommonItem {
    protected getBaseItem(itemType) {
        let item: PicaFriendBaseListItem;
        if (itemType === 1) {
            item = new PicaFriendListItem(this.scene, this.width, 52 * this.dpr, this.dpr);
        } else if (itemType === 2 || itemType === 3 || itemType === 4) {
            item = new PicaFriendFunctionItem(this.scene, this.width, 42 * this.dpr, this.dpr);
        } else if (itemType === 5) {
            item = new PicaFriendFunctionSearchItem(this.scene, this.width, 37 * this.dpr, this.dpr);
        }
        return item;
    }
}
