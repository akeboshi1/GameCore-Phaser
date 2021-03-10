import { BBCodeText, CheckBox, ClickEvent, NineSliceButton, NineSlicePatch } from "apowophaserui";
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
    private fetchCode: Phaser.GameObjects.Text;
    private mMediator: any;
    private mLoginBtn: NineSliceButton;

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

    protected preload() {
        this.addAtlas(this.key, "login/login.png", "login/login.json");
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.commonUrl + ".png", UIAtlasName.commonUrl + ".json");
        super.preload();
    }

    protected init() {
        const { width, height } = this.scene.cameras.main;

        const container = this.scene.add.container(width * this.originX, height * this.originY, this);

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
        const codeContainer = this.createInput(this.mPhoneCodeInput, 0, -container.height * 0.5 + 180 * this.dpr, 220 * this.dpr);
        this.mPhoneCodeInput.x = -codeContainer.width / 2 + 8 * this.dpr;

        const line = this.scene.make.image({
            x: 12 * this.dpr,
            key: this.key,
            frame: "line",
        }, false);
        line.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.fetchCode = this.scene.make.text({
            text: "获取验证码",
            style: {
                fontSize: 14 * this.dpr+ "px",
                fontFamily: Font.DEFULT_FONT,
                color: "#2B5AF3"
            }
        }, false).setOrigin(0.5).setInteractive();
        this.fetchCode.x = (codeContainer.width - this.fetchCode.width) * 0.5 - 22 * this.dpr;
        // this.fetchCode.setResolution(this.dpr);
        this.fetchCode.on("pointerup", this.onFetchCodeHandler, this);
        this.fetchCode.on("pointerdown", this.onFetchCodeDownHandler, this);
        codeContainer.add([line, this.fetchCode]);

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

        this.add([bg, title, phoneContaier, codeContainer, label, this.mLoginBtn, this.acceptBtn]);
        // this.add(container);
        super.init();

        // this.x = width * this.originX;
        // this.y = height * this.originY;
    }

    private createInput(input: InputField, x: number, y: number, width?: number) {
        const container = this.scene.make.container({ x, y }, false);
        const frame = this.scene.textures.getFrame(this.key, "input_bg");
        // const height = frame ? frame.height || 50 * this.dpr;
        const bg = new NineSlicePatch(this.scene, input.x - 8 * this.dpr, input.y, (width ? width : input.width) + 14 * this.dpr, frame.height, this.key, "input_bg", {
            left: 27 * this.dpr,
            top: 0 * this.dpr,
            right: 28 * this.dpr,
            bottom: 0 * this.dpr
        }, this.dpr, 1);
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
            this.render.onLoginErrorHanler("error", "手机格式错误");
            return;
        }
        if (this.fetchTime) {
            return;
        }
        // this.fetchTime = setTimeout(() => {
        //     this.fetchTime = null;
        // }, 60000);
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
            this.render.onLoginErrorHanler("error", "手机格式错误");
            return;
        }
        if (!code) {
            this.render.onLoginErrorHanler("error", "验证码格式错误");
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
}
