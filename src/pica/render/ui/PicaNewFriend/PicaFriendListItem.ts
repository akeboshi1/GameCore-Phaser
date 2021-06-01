import { BBCodeText, Button, CheckBox, ClickEvent } from "apowophaserui";
import { DynamicImage, InputField } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { Handler, i18n, NumberUtils, UIHelper, Url } from "utils";
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
        if (optionType === 1) {
            this.followBtn.visible = true;
        } else if (optionType === 2) {
            this.moreBtn.visible = true;
        }
        const avatar = data.avatar;
        const url = Url.getOsdRes(avatar);
        this.imagIcon.load(url);
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
        this.moreBtn.setInteractiveSize(20 * this.dpr, 20 * this.dpr);
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
    private bg: Phaser.GameObjects.Image;
    private checkBox: CheckBox;
    private contentTex: Phaser.GameObjects.Text;
    private inputLabel: PicaFriendSearchInput;
    private searchBtn: Button;
    private addBtn: Button;
    public setItemData(data: any) {
        super.setItemData(data);

    }
    protected init() {
        this.bg = this.scene.make.image({ key: UIAtlasName.friend_new, frame: "friend_list_online_bg" });
        this.checkBox = new CheckBox(this.scene, UIAtlasName.friend_new, "friend_list_online_unselected", "friend_list_online_selected");
        this.checkBox.setInteractiveSize(20 * this.dpr, 20 * this.dpr);
        this.contentTex = this.scene.make.text({ text: i18n.t("friendlist.olinetitle"), style: UIHelper.whiteStyle(this.dpr) }).setOrigin(0, 0.5);
        this.inputLabel = new PicaFriendSearchInput(this.scene, 146 * this.dpr, 26 * this.dpr, UIAtlasName.friend_new, "friend_add_search_bg", this.dpr, {
            type: "text",
            placeholder: i18n.t("friendlist.friendplaceholder"),
            placeholderSize: 11 * this.dpr + "px",
            placeholderColor: "#ffffff",
            color: "#ffffff",
            text: "",
            fontSize: 13 * this.dpr + "px"
        });
        this.searchBtn = new Button(this.scene, UIAtlasName.friend_new, "friend_list_search");
        this.searchBtn.on(ClickEvent.Tap, this.onSearchHandler, this);
        this.searchBtn.setInteractiveSize(20 * this.dpr, 20 * this.dpr);
        this.addBtn = new Button(this.scene, UIAtlasName.friend_new, "friend_list_add");
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

    private onSearchHandler() {
        const visible = this.inputLabel.visible;
        if (visible) {
            this.inputLabel.hide();
        } else {
            this.inputLabel.show();
        }
        if (visible) {
            const text = this.inputLabel.text;
        }
    }

    private onAddHandler() {

    }
}

export class PicaFriendSearchInput extends Phaser.GameObjects.Container {
    protected background: Phaser.GameObjects.Image;
    protected inputTex: InputField;
    protected dpr: number;
    protected placeholder: string;
    protected contentText: string = "";
    protected blur: boolean = false;
    protected config: any
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, bg: string, dpr: number, config: any) {
        super(scene);
        this.dpr = dpr;
        this.setSize(width, height);
        this.config = config;
        this.background = this.scene.make.image({ key, frame: bg });
        this.placeholder = config.placeholder;
        config.placeholder = "";
        this.inputTex = new InputField(this.scene, -10 * dpr, 0, width - 40 * dpr, height, config);
        this.inputTex.text = this.placeholder;
        this.setInputPlaceholder(true);
        this.inputTex.on("textchange", this.onTextChangeHandler, this);
        this.inputTex.on("blur", this.onTextBlurHandler, this);
        this.inputTex.on("focus", this.onTextFocusHandler, this);
        this.add([this.background, this.inputTex]);
    }
    public hide() {
        this.visible = false;
        this.changeInputState(false);
    }

    public show() {
        this.visible = true;
        this.changeInputState(true);
    }

    private onTextChangeHandler(input, event) {
        this.emit("textchange");
        if (!this.blur) this.contentText = this.inputTex.text;
    }

    private onTextBlurHandler() {
        this.emit("blur");
        this.setInputPlaceholder(true);
    }

    private onTextFocusHandler(e) {
        this.emit("focus");
        this.setInputPlaceholder(false);
    }

    private setInputPlaceholder(blur: boolean) {
        this.blur = blur;
        if (!this.blur || this.contentText !== "") {
            this.inputTex.text = this.contentText;
            this.inputTex.setStyle("font-size", this.config.fontSize);
            this.inputTex.alpha = 1;
        } else {
            this.inputTex.text = this.placeholder;
            this.inputTex.setStyle("font-size", this.config.placeholderSize);
            this.inputTex.alpha = 0.6;
        }
    }
    private changeInputState(visible: boolean) {
        this.inputTex.visible = visible;
        (<HTMLTextAreaElement>(this.inputTex.node)).style.display = visible ? "true" : "none";
        this.inputTex.visible = visible;
        (<HTMLTextAreaElement>(this.inputTex.node)).style.display = visible ? "true" : "none";
    }
    get text() {
        return this.inputTex.text;
    }
}
export class PicaFriendCommonItem extends Phaser.GameObjects.Container {
    public itemData: any;
    protected dpr: number;
    protected zoom: number;
    protected baseItem: PicaFriendBaseListItem;
    protected itemType: number;
    protected send: Handler;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(width, height);
    }

    setItemData(data: any) {
        data.itemType = data.itemType || 1;
        if (!this.itemType || this.itemType !== data.itemType) {
            if (this.baseItem) this.baseItem.destroy();
            this.baseItem = this.getBaseItem(data.itemType);
            this.baseItem.setHandler(this.send);
            this.add(this.baseItem);
            this.setSize(this.baseItem.width, this.baseItem.height);
        }
        this.baseItem.setItemData(data);
    }
    setHandler(send: Handler) {
        this.send = send;
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
