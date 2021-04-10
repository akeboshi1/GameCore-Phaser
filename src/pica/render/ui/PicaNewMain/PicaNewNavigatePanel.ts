import { Button, ClickEvent } from "apowophaserui";
import { TweenCompent } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { Handler, i18n } from "utils";

export class PicaNewNavigatePanel extends Phaser.GameObjects.Container {
    public exploreButton: Button;
    public homeButton: Button;
    public bagButton: Button;
    public makeButton: Button;
    private dpr: number;
    private key: string;
    private bg: Phaser.GameObjects.Image;
    private friendButton: Button;
    private avatarButton: Button;
    private sendHandler: Handler;
    private buttons: Button[];
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
        this.friendButton = this.createButton("home_friend");
        this.avatarButton = this.createButton("home_avater");
        this.makeButton = this.createButton("home_pikadex");
        this.exploreButton = this.createButton("home_explore");
        this.homeButton = this.createButton("home_home");
        this.buttons = [this.bagButton, this.friendButton, this.avatarButton, this.makeButton, this.exploreButton, this.homeButton];
        this.add(this.bg);
        this.add(this.buttons);
        this.addListen();
        this.LayoutButton();
        // this.render.emitter.emit(EventType.NAVIGATE_RESIZE, this.width, this.height);
    }

    public getIllustredPos() {
        const world = this.makeButton.getWorldTransformMatrix();
        const x = world.tx;
        const y = world.ty;
        return { x, y };
    }

    public tweenButton(index: number) {
        const button = this.buttons[index];
        if (button) {
            const tween = new TweenCompent(this.scene, button, { scale: 1.2, pingpang: true });
            tween.tween();
        }
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

    public updateUIState(datas: any) {
        if (datas.length)
            for (const data of datas) {
                const button = this.getButton(data.name);
                if (button) button.visible = data.visible;
                // if (data.visible) button.enable = data.disable;
            }
        this.LayoutButton();
    }
    public setHandler(send: Handler) {
        this.sendHandler = send;
    }

    protected LayoutButton() {
        let posx = -this.width * 0.5 + this.dpr;
        let before: Button;
        for (const button of this.buttons) {
            if (!button.visible) continue;
            button.x = posx + button.width * 0.5 + (before ? before.width * 0.5 : 0);
            posx = button.x;
            before = button;
        }
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
    private getButton(name: string) {
        if (name === "bottom.bag") {
            return this.bagButton;
        } else if (name === "bottom.friend") {
            return this.friendButton;
        } else if (name === "bottom.avatar") {
            return this.avatarButton;
        } else if (name === "bottom.make") {
            return this.makeButton;
        } else if (name === "bottom.explore") {
            return this.exploreButton;
        } else if (name === "bottom.home") {
            return this.homeButton;
        }
    }
}
