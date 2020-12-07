import { Button, ClickEvent } from "apowophaserui";
import { UIAtlasName } from "picaRes";
import { Handler, i18n } from "utils";

export class PicaNewNavigatePanel extends Phaser.GameObjects.Container {
    private dpr: number;
    private key: string;
    private bg: Phaser.GameObjects.Image;
    private bagButton: Button;
    private friendButton: Button;
    private avatarButton: Button;
    private shopButton: Button;
    private vipButton: Button;
    private sendHandler: Handler;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, dpr: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.key = key;
        this.init();
    }
    init() {
        this.bg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "bg" });
        this.bg.displayWidth = this.width;
        const bagButton = this.createButton("home_bag");
        bagButton.x = -this.width * 0.5 + bagButton.width * 0.5 + 17 * this.dpr;
        this.bagButton = bagButton;
        const friendButton = this.createButton("home_friend");
        friendButton.x = bagButton.x + bagButton.width * 0.5 + 22 * this.dpr + friendButton.width * 0.5;
        this.friendButton = friendButton;
        const avatarButton = this.createButton("home_avater");
        avatarButton.x = friendButton.x + friendButton.width * 0.5 + 22 * this.dpr + avatarButton.width * 0.5;
        this.avatarButton = avatarButton;
        const shopButton = this.createButton("home_shop");
        shopButton.x = avatarButton.x + avatarButton.width * 0.5 + 22 * this.dpr + shopButton.width * 0.5;
        this.shopButton = shopButton;
        const vipButton = this.createButton("home_crown");
        vipButton.x = shopButton.x + shopButton.width * 0.5 + 22 * this.dpr + vipButton.width * 0.5;
        this.vipButton = vipButton;
        this.add([this.bg, bagButton, friendButton, avatarButton, shopButton, vipButton]);
        this.addListen();
    }
    public addListen() {
        this.bagButton.on(ClickEvent.Tap, this.onBagHandler, this);
        this.friendButton.on(ClickEvent.Tap, this.onFriendHandler, this);
        this.avatarButton.on(ClickEvent.Tap, this.onAvatarHandler, this);
        this.shopButton.on(ClickEvent.Tap, this.onShopHandler, this);
        this.vipButton.on(ClickEvent.Tap, this.onVIPHandler, this);
    }

    public removeListen() {
        this.bagButton.off(ClickEvent.Tap, this.onBagHandler, this);
        this.friendButton.off(ClickEvent.Tap, this.onFriendHandler, this);
        this.avatarButton.off(ClickEvent.Tap, this.onAvatarHandler, this);
        this.shopButton.off(ClickEvent.Tap, this.onShopHandler, this);
        this.vipButton.off(ClickEvent.Tap, this.onVIPHandler, this);
    }
    public setHandler(send: Handler) {
        this.sendHandler = send;
    }
    private onBagHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["bag"]);
    }
    private onFriendHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["friend"]);
    }
    private onAvatarHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["avatar"]);
    }

    private onShopHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["shop"]);
    }
    private onVIPHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["vip"]);
    }
    private createButton(frame: string) {
        if (this.isZh_CN) frame = frame + "_1";
        const button = new Button(this.scene, UIAtlasName.iconcommon, frame, frame);
        return button;
    }

    private get isZh_CN() {
        if (i18n.language !== "zh-CN") {
            return false;
        }
        return true;
    }
}
