import { Button, ClickEvent } from "apowophaserui";
import { UIAtlasName } from "picaRes";
import { Handler, i18n } from "utils";

export class PicaNewNavigatePanel extends Phaser.GameObjects.Container {
    public exploreButton: Button;
    private dpr: number;
    private key: string;
    private bg: Phaser.GameObjects.Image;
    private bagButton: Button;
    private friendButton: Button;
    private avatarButton: Button;
    private shopButton: Button;
    private homeButton: Button;
    private sendHandler: Handler;
    constructor(scene: Phaser.Scene, key: string, dpr: number) {
        super(scene);
        this.dpr = dpr;
        this.key = key;
        this.init();
    }
    init() {
        const shape = this.scene.make.graphics(undefined, false);
        const w = this.scene.cameras.main.width;
        this.bg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "bg" }).setOrigin(0);
        this.bg.displayWidth = w;
        // this.bg.x = w * 0.5;
        this.setSize(this.bg.width, this.bg.height);
        const bagButton = this.createButton("home_bag");
        bagButton.x = -this.width * 0.5 + bagButton.width * 0.5 + 1 * this.dpr;
        this.bagButton = bagButton;
        const friendButton = this.createButton("home_friend");
        friendButton.x = bagButton.x + bagButton.width * 0.5 + 0 * this.dpr + friendButton.width * 0.5;
        this.friendButton = friendButton;
        const avatarButton = this.createButton("home_avater");
        avatarButton.x = friendButton.x + friendButton.width * 0.5 + 0 * this.dpr + avatarButton.width * 0.5;
        this.avatarButton = avatarButton;
        const shopButton = this.createButton("home_shop");
        shopButton.x = avatarButton.x + avatarButton.width * 0.5 + 0 * this.dpr + shopButton.width * 0.5;
        this.shopButton = shopButton;
        const exploreButton = this.createButton("home_explore");
        exploreButton.x = shopButton.x + shopButton.width * 0.5 + 0 * this.dpr + exploreButton.width * 0.5;
        this.exploreButton = exploreButton;
        const homeButton = this.createButton("home_home");
        homeButton.x = exploreButton.x + exploreButton.width * 0.5 + 0 * this.dpr + homeButton.width * 0.5;
        this.homeButton = homeButton;
        this.add([this.bg, bagButton, friendButton, avatarButton, shopButton, exploreButton, homeButton]);
        this.addListen();

        // this.render.emitter.emit(EventType.NAVIGATE_RESIZE, this.width, this.height);
    }
    public addListen() {
        this.bagButton.on(ClickEvent.Tap, this.onBagHandler, this);
        this.friendButton.on(ClickEvent.Tap, this.onFriendHandler, this);
        this.avatarButton.on(ClickEvent.Tap, this.onAvatarHandler, this);
        this.shopButton.on(ClickEvent.Tap, this.onShopHandler, this);
        this.exploreButton.on(ClickEvent.Tap, this.onExploreHandler, this);
        this.homeButton.on(ClickEvent.Tap, this.onHomeHandler, this);
    }

    public removeListen() {
        this.bagButton.off(ClickEvent.Tap, this.onBagHandler, this);
        this.friendButton.off(ClickEvent.Tap, this.onFriendHandler, this);
        this.avatarButton.off(ClickEvent.Tap, this.onAvatarHandler, this);
        this.shopButton.off(ClickEvent.Tap, this.onShopHandler, this);
        this.exploreButton.off(ClickEvent.Tap, this.onExploreHandler, this);
        this.homeButton.off(ClickEvent.Tap, this.onHomeHandler, this);
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
    private onExploreHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["explore"]);
    }
    private onHomeHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["home"]);
    }
    private createButton(frame: string) {
        if (this.isZh_CN) frame = frame + "_1";
        const button = new Button(this.scene, UIAtlasName.iconcommon, frame, frame);
        button.y = (this.height) * 0.5;
        return button;
    }

    private get isZh_CN() {
        if (i18n.language !== "zh-CN") {
            return false;
        }
        return true;
    }
}
