import { InputText, CheckBox, NineSliceButton, ClickEvent, BBCodeText, NineSlicePatch } from "apowophaserui";
import { UIAtlasKey, UIAtlasName } from "../../../pica/ui/ui.atals.name";
import { MAIN_WORKER } from "../../../structureinterface/worker.name";
import { Font } from "../../../utils";
import Helpers from "../../../utils/helpers";
import { BasePanel } from "../components/base.panel";
import { UiManager } from "../ui.manager";

export class LoginPanel extends BasePanel {
    private readonly key = "login";
    private readonly areaCode = "86";
    private mPhoneInput: InputText;
    private mPhoneCodeInput: InputText;
    private fetchTime: any;
    private acceptBtn: CheckBox;
    private loginBtn: NineSliceButton;
    private downcount: number = -1;
    private fetchCode: Phaser.GameObjects.Text;
    private mMediator: any;
    constructor(uimanager: UiManager) {
        super(uimanager.scene, uimanager.render);
        this.mMediator = this.render.mainPeer["LoginMediator"];
    }

    public show() {
        super.show();
        if (this.mInitialized) {
            this.setInputVisible(true);
        }
    }

    public setInputVisible(val: boolean) {
        if (this.mPhoneCodeInput) {
            this.mPhoneCodeInput.visible = val;
            this.mPhoneInput.visible = val;
        }
    }

    public destroy() {
        super.destroy();
        if (this.fetchTime) {
            clearTimeout(this.fetchTime);
        }
    }

    public setLoginEnable(val) {
        this.loginBtn.enable = val;
    }

    protected preload() {
        this.addAtlas(this.key, "login/login.png", "login/login.json");
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.commonUrl + ".png", UIAtlasName.commonUrl + ".json");
        super.preload();
    }

    protected init() {
        // const { width, height } = this.scene.cameras.main;
        const width = this.scene.cameras.main.width / this.scale;
        const height = this.scene.cameras.main.height / this.scale;
        const container = this.scene.add.container(0, 0, this);
        const scale = this.scale;

        const backgroundColor = this.scene.make.graphics(undefined, false);
        backgroundColor.fillRect(0, 0, width, height);
        backgroundColor.fillGradientStyle(0x6f75ff, 0x6f75ff, 0x01cdff, 0x01cdff);

        const cloudLeft = this.scene.make.image({
            x: 0,
            y: 0,
            key: this.key,
            frame: "cloud_left"
        }, false).setOrigin(0);
        cloudLeft.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);

        const cloudRight = this.scene.make.image({
            x: width,
            y: 0,
            key: this.key,
            frame: "cloud_right"
        }, false).setOrigin(1, 0);
        cloudRight.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);

        const logo = this.scene.make.image({
            x: width * 0.5,
            y: 44 * this.dpr,
            key: this.key,
            frame: "logo"
        }, false).setOrigin(0.5, 0);
        logo.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        const bg = this.scene.make.image({
            key: this.key,
            frame: "bg"
        });
        bg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        bg.x = width * 0.5;
        bg.y = height - bg.height * 0.5;

        this.mPhoneInput = new InputText(this.scene, 0, 0, 256 * this.dpr, 40 * this.dpr, {
            type: "tel",
            maxLength: 11,
            placeholder: "请输入手机号",
            color: "#717171",
            fontSize: 16 * this.dpr + "px"
        });

        const phoneContaier = this.createInput(this.mPhoneInput, width * 0.5, 97 * this.dpr + logo.y + logo.height);
        const accountData: string = localStorage.getItem("accountphone");
        if (accountData) {
            try {
                this.mPhoneInput.text = JSON.parse(accountData).account;
            } catch {
            }
        }

        this.mPhoneCodeInput = new InputText(this.scene, 0, 0, 156 * this.dpr, 40 * this.dpr, {
            type: "tel",
            maxLength: 4,
            placeholder: "验证码",
            color: "#717171",
            text: "",
            fontSize: 16 * this.dpr + "px"
        }).setOrigin(0, 0.5);
        const codeContainer = this.createInput(this.mPhoneCodeInput, width * 0.5, 172 * this.dpr + logo.y + logo.height, 256 * this.dpr);
        // this.mPhoneCodeInput.resize(100 * this.dpr, this.mPhoneCodeInput.height);
        this.mPhoneCodeInput.x = -codeContainer.width / 2 + 8 * this.dpr;

        const label1 = this.scene.make.text({
            x: width * 0.5,
            text: `抵制不良游戏，拒绝盗版游戏。注意自我保护，谨防受骗上当。\n适度游戏益脑，沉迷游戏伤身。合理安排时间，享受健康生活。`,
            style: {
                color: "#FFEC48",
                align: "center",
                fontSize: 11 * this.dpr,
                fontFamily: Font.DEFULT_FONT
            }
        }, false).setOrigin(0.5);
        label1.setResolution(this.dpr);
        label1.y = height - 50 * this.dpr - label1.height * 0.5;

        const label2 = this.scene.make.text({
            x: width * 0.5,
            text: `本网络游戏适合年满16周岁以上的用户，请您确认已如实进行\n实名注册，为了您的健康，请合理控制游戏时间。`,
            style: {
                color: "#FFFFFF",
                align: "center",
                fontSize: 9.33 * this.dpr,
                fontFamily: Font.DEFULT_FONT
            }
        }).setOrigin(0.5);
        label2.setResolution(this.dpr);
        label2.y = height - 16 * this.dpr - label2.height * 0.5;

        const line = this.scene.make.image({
            x: 12 * this.dpr,
            key: this.key,
            frame: "line",
        }, false);
        line.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.fetchCode = this.scene.make.text({
            text: "获取验证码",
            style: {
                fontSize: 14 * this.dpr,
                fontFamily: Font.DEFULT_FONT,
                color: "#2B5AF3"
            }
        }, false).setOrigin(0.5).setInteractive();
        this.fetchCode.x = (codeContainer.width - this.fetchCode.width) * 0.5 - 22 * this.dpr;
        this.fetchCode.setResolution(this.dpr);
        this.fetchCode.on("pointerup", this.onFetchCodeHandler, this);
        this.fetchCode.on("pointerdown", this.onFetchCodeDownHandler, this);
        codeContainer.add([line, this.fetchCode]);

        this.loginBtn = new NineSliceButton(this.scene, width * 0.5, codeContainer.y + codeContainer.height + 33 * this.dpr, 191 * this.dpr, 50 * this.dpr, UIAtlasKey.commonKey, "yellow_btn", "登 录", this.dpr, 1, {
            left: 12 * this.dpr,
            top: 12 * this.dpr,
            right: 14 * this.dpr,
            bottom: 12 * this.dpr
        });
        this.loginBtn.setTextStyle({
            color: "#995E00",
            fontSize: 22 * this.dpr,
            fontFamily: Font.DEFULT_FONT
        });
        this.loginBtn.setFontStyle("bold");
        this.loginBtn.on(String(ClickEvent.Down), this.LoginDownHandler, this);
        this.loginBtn.on(String(ClickEvent.Tap), this.tryLogin, this);
        const label = new BBCodeText(this.scene, 0, 0, "我已阅读并同意皮卡堂的[area=userService][color=#FFEC48]《用户服务协议》[/color][/area]和[area=privacy][color=#FFEC48]《隐私与保护政策》[/color][/area]", {
            color: "#ffffff",
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
        label.setResolution(this.dpr);

        this.acceptBtn = new CheckBox(this.scene, this.key, "accept_unchecked", "accept_checked").on(String(ClickEvent.Tap), this.onCheckboxHandler, this);
        label.x = this.loginBtn.x + 8 * this.dpr;
        label.y = this.loginBtn.y + this.loginBtn.height * 0.5 + 24 * this.dpr;

        this.acceptBtn.x = label.x - label.width * 0.5 - 8 * this.dpr;
        this.acceptBtn.y = label.y;
        this.acceptBtn.selected = true;
        this.add([backgroundColor, bg, cloudLeft, cloudRight, logo, phoneContaier, codeContainer, label1, label2, this.loginBtn, this.acceptBtn, label]);
        super.init();
    }

    private createInput(input: InputText, x: number, y: number, width?: number) {
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
        this.render.remote[MAIN_WORKER].onFetchCodeHandler();
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
        this.mMediator.login(phone, code, this.areaCode);
        // this.render.remote[MAIN_WORKER].onLoginHandler();
    }

    private LoginDownHandler() {
        if (this.mPhoneInput) {
            this.mPhoneCodeInput.setBlur();
            this.mPhoneInput.setBlur();
        }
    }

    private onCheckboxHandler() {
        if (this.tryLogin) {
            this.loginBtn.enable = this.acceptBtn.selected;
        }
    }
}
