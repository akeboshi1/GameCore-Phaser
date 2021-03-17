import { Button, ClickEvent } from "apowophaserui";
import { UIAtlasName } from "picaRes";
import { Handler, i18n } from "utils";

export class PicaNewNavigatePanel extends Phaser.GameObjects.Container {
    public exploreButton: Button;
    public homeButton: Button;
    public bagButton: Button;
    private dpr: number;
    private key: string;
    private bg: Phaser.GameObjects.Image;
    private friendButton: Button;
    private avatarButton: Button;
    private makeButton: Button;
    private sendHandler: Handler;
    constructor(scene: Phaser.Scene, key: string, dpr: number, scale: number) {
        super(scene);
        this.dpr = dpr;
        this.key = key;
        this.scale = scale;
        this.init();
    }
    init() {
        const shape = this.scene.make.graphics(undefined, false);
        const w = this.scene.cameras.main.width;
        this.bg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "bg" }).setOrigin(0);
        this.bg.displayWidth = w;
        // this.bg.x = w * 0.5;
        this.setSize(this.bg.width, this.bg.height);
        this.bagButton = this.createButton("home_bag");
        this.bagButton.x = -this.width * 0.5 + this.bagButton.width * 0.5 + 1 * this.dpr;
        this.friendButton = this.createButton("home_friend");
        this.friendButton.x = this.bagButton.x + this.bagButton.width * 0.5 + 0 * this.dpr + this.friendButton.width * 0.5;
        this.avatarButton = this.createButton("home_avater");
        this.avatarButton.x = this.friendButton.x + this.friendButton.width * 0.5 + 0 * this.dpr + this.avatarButton.width * 0.5;
        this.makeButton = this.createButton("home_make");
        this.makeButton.x = this.avatarButton.x + this.avatarButton.width * 0.5 + 0 * this.dpr + this.makeButton.width * 0.5;
        this.exploreButton = this.createButton("home_explore");
        this.exploreButton.x = this.makeButton.x + this.makeButton.width * 0.5 + 0 * this.dpr + this.exploreButton.width * 0.5;
        this.homeButton = this.createButton("home_home");
        this.homeButton.x = this.exploreButton.x + this.exploreButton.width * 0.5 + 0 * this.dpr + this.homeButton.width * 0.5;
        this.add([this.bg, this.bagButton, this.friendButton, this.avatarButton, this.makeButton, this.exploreButton, this.homeButton]);
        this.addListen();

        // this.render.emitter.emit(EventType.NAVIGATE_RESIZE, this.width, this.height);
    }
    public addListen() {
        this.bagButton.on(ClickEvent.Tap, this.onBagHandler, this);
        this.friendButton.on(ClickEvent.Tap, this.onFriendHandler, this);
        this.avatarButton.on(ClickEvent.Tap, this.onAvatarHandler, this);
        this.makeButton.on(ClickEvent.Tap, this.onMakeHandler, this);
        this.exploreButton.on(ClickEvent.Tap, this.onExploreHandler, this);
        this.homeButton.on(ClickEvent.Tap, this.onHomeHandler, this);
    }

    public removeListen() {
        this.bagButton.off(ClickEvent.Tap, this.onBagHandler, this);
        this.friendButton.off(ClickEvent.Tap, this.onFriendHandler, this);
        this.avatarButton.off(ClickEvent.Tap, this.onAvatarHandler, this);
        this.makeButton.off(ClickEvent.Tap, this.onMakeHandler, this);
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

    private onMakeHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["make"]);
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
