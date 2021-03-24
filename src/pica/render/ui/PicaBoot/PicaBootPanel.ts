import { Button, ClickEvent, NineSliceButton } from "apowophaserui";
import { UIAtlasKey, UIAtlasName } from "picaRes";
import { BasePanel, UiManager } from "gamecoreRender";
import { ModuleName } from "structure";
import { Font, i18n, Logger } from "utils";

export class PicaBootPanel extends BasePanel {
    private playBtn: Button;
    private navigate: Navigate;

    private mMediator: any;
    constructor(uimanager: UiManager) {
        super(uimanager.scene, uimanager.render);
        this.key = ModuleName.PICA_BOOT_NAME;
        this.mMediator = this.render.mainPeer[ModuleName.PICA_BOOT_NAME];
    }

    show(param?: any) {
        super.show(param);
        if (this.mInitialized) {
            this.playBtn.enable = true;
        }
    }

    addListen() {
        this.playBtn.on(ClickEvent.Tap, this.onPlayHandler, this);
        this.navigate.addListen();
        this.navigate.on("showLogin", this.onShowLoginHandler, this);
    }

    removeListen() {
        if (!this.mInitialized) return;
        this.playBtn.off(ClickEvent.Tap, this.onPlayHandler, this);
        this.navigate.removeListen();
        this.navigate.off("showLogin", this.onShowLoginHandler, this);
    }

    init() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        const scaleW = width / this.scale;
        const scaleH = height / this.scale;
        this.x = width * this.originX;
        this.y = height * this.originY;

        const logo = this.scene.make.image({
            x: 0,
            y: -(scaleH) * 0.5 + 40 * this.dpr,
            key: this.key,
            frame: "login_logo"
        }, false).setOrigin(0.5, 0);
        logo.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        const bg = this.scene.make.image({
            key: this.key,
            frame: "login_bg"
        });
        const heightRatio = height / bg.height;
        bg.setScale(heightRatio);
        bg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        // bg.x = 0;
        // bg.y = height * 0.5;

        const label1 = this.scene.make.text({
            text: `抵制不良游戏，拒绝盗版游戏。注意自我保护，谨防受骗上当。\n适度游戏益脑，沉迷游戏伤身。合理安排时间，享受健康生活。`,
            style: {
                color: "#FFEC48",
                align: "center",
                fontSize: 11 * this.dpr + "px",
                fontFamily: Font.DEFULT_FONT
            }
        }, false).setOrigin(0.5);
       // label1.setResolution(this.dpr);
        label1.y = (scaleH - label1.height) * 0.5 - 50 * this.dpr ;

        const label2 = this.scene.make.text({
            text: `本网络游戏适合年满16周岁以上的用户，请您确认已如实进行\n实名注册，为了您的健康，请合理控制游戏时间。`,
            style: {
                color: "#FFFFFF",
                align: "center",
                fontSize: 9.33 * this.dpr,
                fontFamily: Font.DEFULT_FONT
            }
        }).setOrigin(0.5);
        // label2.setResolution(this.dpr);
        label2.y = (scaleH - label2.height) * 0.5 - 16 * this.dpr ;

        this.playBtn = new NineSliceButton(this.scene, 0, -scaleH * 0.5 + scaleH * 0.75, 191 * this.dpr, 60 * this.dpr, UIAtlasKey.commonKey, "yellow_btn", i18n.t("boot.play"), this.dpr, 1, {
            left: 12 * this.dpr,
            top: 12 * this.dpr,
            right: 14 * this.dpr,
            bottom: 12 * this.dpr
        });
        this.playBtn.setTextStyle({
            color: "#995E00",
            fontSize: 22 * this.dpr,
            fontFamily: Font.DEFULT_FONT
        });
        this.playBtn.setFontStyle("bold");

        this.navigate = new Navigate(this.scene, this.key, this.dpr);
        this.navigate.x = scaleW * 0.5 - 38 * this.dpr;
        this.navigate.y = -scaleH * 0.5 + 41 * this.dpr;

        // const frame: any = this.scene.add.dom(scaleW * 0.5, scaleH * 0.5, "iframe", { width: window.innerWidth * 0.8 + "px", height: window.innerHeight * 0.8 + "px" });
        // frame.node.src = "https://baidu.com";
        // this.register = new PhoneRegisterPanel(this, this.scene, this.key, this.dpr);
        this.add([bg, logo, label1, label2, this.playBtn, this.navigate]);
        super.init();

        this.resize();

        this.scene.children.add(this);
    }

    updatePanelList() {
        if (!this.scene) {
            return;
        }
        const children = this.scene.children;
        if (!children) {
            return;
        }
        this.hasPanel(children.length > 1);
    }

    popPanel() {
        this.hasPanel(true);
    }

    hidePanel() {
        this.hasPanel(false);
    }

    public tryLogin(phone: string, code: string, phoneArea: string) {
        const mediator = this.mMediator;
        if (mediator) {
            mediator.phoneLogin(phone, code, phoneArea);
        }
    }

    protected preload() {
        this.addAtlas(this.key, "pica_boot/pica_boot.png", "pica_boot/pica_boot.json");
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.commonUrl + ".png", UIAtlasName.commonUrl + ".json");
        super.preload();
    }

    private onPlayHandler() {
        if (!this.logged()) {
            return this.showLogin();
        }
        if (this.mMediator) {
            this.mMediator.enterGame();
            this.playBtn.enable = false;
        }
    }

    private logged() {
        const token = this.render.localStorageManager.getItem("token");
        if (token) {
            try {
                const account = JSON.parse(token);
                this.render.setAccount(account);
            } catch (error) {
                Logger.getInstance().error(`parse token ${token} failed`);
                return false;
            }
            return true;
        }
        return false;
    }

    private showLogin() {
        if (this.mMediator) {
            this.mMediator.showLogin();
        }
    }

    private onShowLoginHandler() {
        this.showLogin();
    }

    private hasPanel(val: boolean) {
        if (!this.mInitialized) return;
        this.playBtn.visible = !val;
        this.navigate.visible = !val;
    }
}

class Navigate extends Phaser.GameObjects.Container {
    private btns: Button[];
    constructor(scene: Phaser.Scene, private key: string, dpr: number) {
        super(scene);

        this.btns = [];
        // const frames = ["login_notice", "login_user", "login_repair", "login_feedback"];
        const frames = ["login_user"];
        for (let i = 0; i < frames.length; i++) {
            const btn = new Button(this.scene, this.key, frames[i]);
            btn.y = i * 58 * dpr;
            this.btns.push(btn);
        }
        this.add(this.btns);
    }

    addListen() {
        for (const btn of this.btns) {
            btn.on(ClickEvent.Tap, this.onClickBtnHandler, this);
        }
    }

    removeListen() {
        for (const btn of this.btns) {
            btn.off(ClickEvent.Tap, this.onClickBtnHandler, this);
        }
    }

    private onClickBtnHandler(pointer, target) {
        switch (target) {
            case this.btns[0]:
            this.emit("showLogin");
            break;
        }
    }
}
