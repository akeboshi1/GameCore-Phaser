import { BBCodeText, Button, CheckBox, ClickEvent, NineSliceButton, NineSlicePatch } from "apowophaserui";
import { BasePanel, InputField, UiManager } from "gamecoreRender";
import { UIAtlasKey, UIAtlasName } from "picaRes";
import { ModuleName } from "structure";
import { Font, Helpers } from "utils";

export class PicaLoginPanel extends BasePanel {
    private readonly areaCode = "86";
    private mPhoneInput: InputField;
    private mPhoneCodeInput: InputField;
    private fetchTime: any;
    private acceptBtn: CheckBox;
    private downcount: number = -1;
    private fetchCode: Button;
    private mMediator: any;
    private mLoginBtn: NineSliceButton;
    private mErrorTips: Phaser.GameObjects.Text;
    private mMaskBg: Phaser.GameObjects.Graphics;
    private parent: Phaser.GameObjects.Container;

    constructor(uiManager: UiManager) {
        super(uiManager.scene, uiManager.render);
        this.key = ModuleName.PICA_LOGIN_NAME;
    }

    setInputVisible(val: boolean) {
        if (this.mPhoneCodeInput) {
            this.mPhoneCodeInput.visible = val;
            this.mPhoneInput.visible = val;
        }
    }

    destroy() {
        if (this.parent) this.parent.destroy(true);
        super.destroy();
        if (this.fetchTime) {
            clearTimeout(this.fetchTime);
        }
    }

    setLoginEnable(val) {
        this.mLoginBtn.enable = val;
    }

    addListen() {
        this.mLoginBtn.on(ClickEvent.Tap, this.onLoginHandler, this);
    }

    removeListen() {
        this.mLoginBtn.off(ClickEvent.Tap, this.onLoginHandler, this);
    }

    showError(err: string) {
        this.mErrorTips.setText(err);
    }

    resize() {
        const { width, height } = this.scene.cameras.main;
        const hitArea = new Phaser.Geom.Rectangle(-width * 0.5, -height * 0.5, width, height);
        this.mMaskBg.clear();
        this.mMaskBg.fillStyle(0, 0);
        this.mMaskBg.fillRect(hitArea.x, hitArea.y, hitArea.width, hitArea.height);
        if (this.mMaskBg.input) {
            this.mMaskBg.input.hitArea = hitArea;
        } else {
            this.mMaskBg.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
        }
    }

    protected preload() {
        this.addAtlas(this.key, "pica_login/pica_login.png", "pica_login/pica_login.json");
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.commonUrl + ".png", UIAtlasName.commonUrl + ".json");
        super.preload();
    }

    protected init() {
        const { width, height } = this.scene.cameras.main;

        this.parent = this.scene.add.container(width * this.originX, height * this.originY, this);

        const container = this.scene.make.container(undefined, false);
        container.add(this);

        this.mMaskBg = this.scene.make.graphics(undefined, false);
        this.parent.add([this.mMaskBg, container]);

        const bg = this.scene.make.image({
            key: UIAtlasKey.commonKey,
            frame: "bg"
        }, false);
        container.setSize(bg.width, bg.height);

        const title = this.scene.make.text({
            y: -container.height * 0.5 + 19 * this.dpr,
            text: "登  陆",
            style: {
                color: "#FFD248",
                fontSize: 26 * this.dpr,
                fontFamily: Font.DEFULT_FONT
            }
        }).setOrigin(0.5, 0).setFontStyle("bold").setStroke("#572D00", 4 * this.dpr);
        title.setFontStyle("bold");

        this.mPhoneInput = new InputField(this.scene, 0, 0, 220 * this.dpr, 40 * this.dpr, {
            type: "tel",
            maxLength: 11,
            placeholder: "请输入手机号码",
            color: "#717171",
            fontSize: 16 * this.dpr + "px"
        });
        this.mPhoneInput.on("enter", this.onEnterPhoneHandler, this);
        this.mPhoneInput.on("textchange", this.onCodeChangeHandler, this);

        const phoneContaier = this.createInput(this.mPhoneInput, 0, -container.height * 0.5 + 100 * this.dpr);
        const accountData: string = localStorage.getItem("accountphone");
        if (accountData) {
            try {
                this.mPhoneInput.text = JSON.parse(accountData).account;
            } catch {
            }
        }

        this.mPhoneCodeInput = new InputField(this.scene, 0, 0, 156 * this.dpr, 40 * this.dpr, {
            type: "tel",
            maxLength: 4,
            placeholder: "验证码",
            color: "#717171",
            text: "",
            fontSize: 16 * this.dpr + "px"
        }).setOrigin(0, 0.5);
        this.mPhoneCodeInput.on("enter", this.onEnterCodeHandler, this);
        this.mPhoneCodeInput.on("textchange", this.onCodeChangeHandler, this);
        const codeContainer = this.createInput(this.mPhoneCodeInput, 0, -container.height * 0.5 + 180 * this.dpr, 220 * this.dpr);
        this.mPhoneCodeInput.x = -codeContainer.width / 2 + 8 * this.dpr;

        this.fetchCode = new Button(this.scene, this.key, "login_resend_pin_butt", undefined, "发送验证码");
        this.fetchCode.x = (codeContainer.width - this.fetchCode.width) * 0.5 - 4.33 * this.dpr;
        this.fetchCode.setTextStyle({
            fontSize: 12.45 * this.dpr,
            fontFamily: Font.DEFULT_FONT
        });
        this.fetchCode.on("pointerup", this.onFetchCodeHandler, this);
        this.fetchCode.on("pointerdown", this.onFetchCodeDownHandler, this);
        codeContainer.add([this.fetchCode]);

        this.mLoginBtn = new NineSliceButton(this.scene, 0, container.height * 0.5 - 51 * this.dpr, 191 * this.dpr, 60 * this.dpr, UIAtlasKey.commonKey, "yellow_btn", "登 陆", this.dpr, 1, {
            left: 12 * this.dpr,
            top: 12 * this.dpr,
            right: 14 * this.dpr,
            bottom: 12 * this.dpr
        });
        this.mLoginBtn.setTextStyle({
            color: "#995E00",
            fontSize: 22 * this.dpr,
            fontFamily: Font.DEFULT_FONT
        });
        this.mLoginBtn.setFontStyle("bold");

        this.mErrorTips = this.scene.make.text({
            x: -codeContainer.width * 0.5,
            y: codeContainer.y + codeContainer.height * 0.5 + 8 * this.dpr,
            style: {
                color: "#FF0000",
                fontSize: 12 * this.dpr + "px",
                fontFamily: Font.DEFULT_FONT
            }
        }, false).setOrigin(0, 0);

        const label = new BBCodeText(this.scene, 0, 0, "我已阅读并同意皮卡堂的[area=userService][color=#253FCA]《用户服务协议》[/color][/area]", {
            color: "#8C8C8C",
            fontSize: 11 * this.dpr,
            fontFamily: Font.DEFULT_FONT,
        }).setOrigin(0.5, 0.5).setInteractive().on("areadown", (key) => {
            if (key === "userService") {
                // TODO 链接放到环境变量中
                Helpers.openUrl("https://picatown.com/con_news/news.php?nid=1201");
            } else {
                Helpers.openUrl("https://picatown.com/con_news/news.php?nid=1201");
            }
        });
        // label.setResolution(this.dpr);

        this.acceptBtn = new CheckBox(this.scene, this.key, "accept_unchecked", "accept_checked").on(ClickEvent.Tap, this.onCheckboxHandler, this);
        label.x = 8 * this.dpr;
        label.y = this.mLoginBtn.y - this.mLoginBtn.height * 0.5 - 20 * this.dpr;

        this.acceptBtn.x = label.x - label.width * 0.5 - 8 * this.dpr;
        this.acceptBtn.y = label.y;
        this.acceptBtn.selected = true;

        this.add([bg, title, phoneContaier, codeContainer, label, this.mLoginBtn, this.mErrorTips, this.acceptBtn]);
        super.init();

        this.resize();
    }

    private createInput(input: InputField, x: number, y: number, width?: number) {
        const container = this.scene.make.container({ x, y }, false);
        const frame = this.scene.textures.getFrame(this.key, "input_bg");
        // const height = frame ? frame.height || 50 * this.dpr;
        // const bg = new NineSlicePatch(this.scene, input.x - 8 * this.dpr, input.y, (width ? width : input.width) + 14 * this.dpr, frame.height, this.key, "input_bg", {
        //     left: 27 * this.dpr,
        //     top: 0 * this.dpr,
        //     right: 28 * this.dpr,
        //     bottom: 0 * this.dpr
        // }, this.dpr, 1);
        const bg = this.scene.make.image({ key: this.key, frame: "input_bg" });
        container.add([input, bg]);
        container.setSize(bg.width, bg.height);
        return container;
    }

    private onFetchCodeDownHandler() {
        if (this.mPhoneInput) {
            this.mPhoneCodeInput.setBlur();
            this.mPhoneInput.setBlur();
        }
    }

    private onFetchCodeHandler() {
        const text = this.mPhoneInput.text;
        if (text.length !== 11) {
            this.mErrorTips.setText("手机格式错误");
            // this.render.onLoginErrorHanler("error", "手机格式错误");
            return;
        }
        if (this.fetchTime) {
            return;
        }
        this.downcount = 60;
        this.fetchTime = setInterval(() => {
            if (--this.downcount <= 0) {
                clearInterval(this.fetchTime);
                this.fetchTime = undefined;
            }
            if (this.downcount > 0) {
                this.fetchCode.setText(`获取验证码(${this.downcount})`);
            } else {
                this.fetchCode.setText(`获取验证码`);
            }
        }, 1000);
        // this.render.remote[MAIN_WORKER].onFetchCodeHandler();
    }

    private tryLogin() {
        const phone = this.mPhoneInput.text;
        const code = this.mPhoneCodeInput.text;
        if (phone.length !== 11) {
            // this.render.onLoginErrorHanler("error", "手机格式错误");
            this.mErrorTips.setText("手机格式错误");
            return;
        }
        if (!code) {
            // this.render.onLoginErrorHanler("error", "验证码格式错误");
            this.mErrorTips.setText("验证码格式错误");
            return;
        }
        if (!this.acceptBtn.selected) {
            this.mErrorTips.setText("必须接受用户协议");
            return;
        }
        if (!this.mMediator) this.mMediator = this.render.mainPeer[ModuleName.PICA_LOGIN_NAME];
        this.mMediator.phoneLogin(phone, code, this.areaCode);
        // this.render.remote[MAIN_WORKER].onLoginHandler();
    }

    private onEnterPhoneHandler() {
        this.mPhoneCodeInput.setFocus();
    }

    private onEnterCodeHandler() {
        this.mPhoneCodeInput.setBlur();
        this.tryLogin();
    }

    private onCheckboxHandler() {
        this.mLoginBtn.enable = this.acceptBtn.selected;
    }

    private onLoginHandler() {
        this.tryLogin();
    }

    private onCodeChangeHandler() {
        if (this.mErrorTips.text) {
            this.mErrorTips.setText("");
        }
    }
}
