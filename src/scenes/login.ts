import { ConnectionService } from "../net/connection.service";
import InputText from "../../lib/rexui/plugins/gameobjects/inputtext/InputText";
import { Alert } from "../ui/alert/alert";
import { WorldService } from "../game/world.service";
import { ComboBox, IComboboxRes, IComboboxItemData } from "../ui/components/comboBox";
import { Logger } from "../utils/log";

// 编辑器用 Phaser.Scene
export class LoginScene extends Phaser.Scene {
    private mCallBack: Function;
    private mConnect: ConnectionService;
    private mTabDic: Map<number, Phaser.GameObjects.Image>;
    private mWorld: WorldService;
    private mCurTabIndex: number = 0;

    private mBg: Phaser.GameObjects.Image;
    private mEnterBtn: Phaser.GameObjects.Image;
    private mQuickBtn: Phaser.GameObjects.Image;
    private mSendCodeBtn: Phaser.GameObjects.Image;
    private mNameInputTxt: InputText;
    private mPassWordInputTxt: InputText;
    private mVerificationCodeTxt: InputText;
    private mTab0: Phaser.GameObjects.Image;
    private mTab1: Phaser.GameObjects.Image;
    private mInputBg_long0: Phaser.GameObjects.Image;
    private mInputBg_long1: Phaser.GameObjects.Image;
    private mInputBg_small: Phaser.GameObjects.Image;
    private combobox: ComboBox;
    private mtxt0: Phaser.GameObjects.Text;
    private mtxt1: Phaser.GameObjects.Text;
    private mtxt2: Phaser.GameObjects.Text;
    private mtxt3: Phaser.GameObjects.Text;
    private mtxt4: Phaser.GameObjects.Text;
    private mtxt5: Phaser.GameObjects.Text;
    private mParentCon: Phaser.GameObjects.Container;
    constructor() {
        super({ key: LoginScene.name });
    }

    public preload() {
        this.load.atlas("login", "./resources/ui/login/login.png", "./resources/ui/login/login.json");
    }

    public create() {
        const loginRes: string = "login";
        const width = this.scale.gameSize.width;
        const height = this.scale.gameSize.height;
        const rect = this.add.graphics();
        rect.fillStyle(0);
        rect.fillRect(0, 0, width, height);

        const accountData: string = localStorage.getItem("account");
        const logo: Phaser.GameObjects.Image = this.make.image(undefined, false);
        logo.setTexture(loginRes, "login_logo");
        this.mParentCon = this.add.container(width >> 1, (height >> 1) + 100);

        this.mBg = this.make.image(undefined, false);

        this.mEnterBtn = this.make.image(undefined, false);
        this.mEnterBtn.setTexture(loginRes, "login_loginBtn");
        this.mEnterBtn.x = 123;

        this.mQuickBtn = this.make.image(undefined, false);
        this.mQuickBtn.setTexture(loginRes, "login_quickBtn");
        this.mQuickBtn.x = 123;
        this.mQuickBtn.y = -38;

        this.mSendCodeBtn = this.make.image(undefined, false);
        this.mSendCodeBtn.setTexture(loginRes, "login_sendBtn");
        this.mSendCodeBtn.x = 10;
        this.mSendCodeBtn.y = 67;

        this.mTab0 = this.make.image(undefined, false);
        this.mTab0.setTexture(loginRes, "login_tabSelect");
        this.mTab0.x = -105;
        this.mTab0.y = -38;

        this.mTab1 = this.make.image(undefined, false);
        this.mTab1.setTexture(loginRes, "login_tabUnSelect");
        this.mTab1.x = 7;
        this.mTab1.y = -38;

        this.mInputBg_long0 = this.make.image(undefined, false);
        this.mInputBg_long0.setTexture(loginRes, "login_inputLong");
        this.mInputBg_long0.x = -50;
        this.mInputBg_long0.y = 15;

        this.mInputBg_long1 = this.make.image(undefined, false);
        this.mInputBg_long1.setTexture(loginRes, "login_inputLong");
        this.mInputBg_long1.x = -50;
        this.mInputBg_long1.y = 67;

        this.mInputBg_small = this.make.image(undefined, false);
        this.mInputBg_small.setTexture(loginRes, "login_inputBg");
        this.mInputBg_small.x = -105;
        this.mInputBg_small.y = 67;

        this.mTabDic = new Map();

        this.mNameInputTxt = new InputText(this, -140, 4, 190, 15, {
            type: "input",
            placeholder: "用戶名",
            fontFamily: "YaHei",
            fontSize: "14px",
            color: "#847C7C",
        })
            .resize(200, 20)
            .setOrigin(0, 0);
        this.mPassWordInputTxt = new InputText(this, -140, 55, 190, 15, {
            type: "password",
            placeholder: "密码",
            fontFamily: "YaHei",
            fontSize: "14px",
            color: "#847C7C",
        })
            .resize(200, 20)
            .setOrigin(0, 0);
        this.mVerificationCodeTxt = new InputText(this, -140, 55, 100, 15, {
            type: "input",
            placeholder: "验证码",
            fontFamily: "YaHei",
            fontSize: "14px",
            color: "#847C7C",
        })
            .resize(100, 20)
            .setOrigin(0, 0);
        this.mtxt0 = this.add.text(-145, -46, "手机号登录", { fontFamily: "YaHei" });
        this.mtxt1 = this.add.text(-35, -46, "用户号登录", { fontFamily: "YaHei" });
        this.mtxt2 = this.add.text(90, -46, "快速游戏", { fontFamily: "YaHei" });
        this.mtxt3 = this.add.text(108, 33, "登录", { fontFamily: "YaHei" });
        this.mtxt4 = this.add.text(-97, 37, "登录其他账号", { fontFamily: "YaHei" });
        this.mtxt5 = this.add.text(-6, 57, "发送", { fontFamily: "YaHei" });

        const config: IComboboxRes = {
            wid: 220,
            hei: 36,
            resKey: "login",
            resPng: "./resources/ui/login/login.png",
            resJson: "./resources/ui/login/login.json",
            resBg: "login_inputLong",
            resArrow: "login_downArrow",
            fontStyle: { size: 20, color: "#ffcc00", bold: false },
            up: true,
            clickCallBack: this.changeID,
        };
        this.combobox = new ComboBox(this, config);
        this.combobox.x = -158;
        this.combobox.y = -28;

        this.changePanelState(accountData);

        this.mParentCon.add(logo);
        this.mParentCon.add(this.mBg);
        this.mParentCon.add(this.mTab0);
        this.mParentCon.add(this.mTab1);
        this.mParentCon.add(this.mQuickBtn);
        this.mParentCon.add(this.mEnterBtn);
        this.mParentCon.add(this.mSendCodeBtn);
        this.mParentCon.add(this.mInputBg_long0);
        this.mParentCon.add(this.mInputBg_long1);
        this.mParentCon.add(this.mInputBg_small);
        this.mParentCon.add(this.mNameInputTxt);
        this.mParentCon.add(this.mPassWordInputTxt);
        this.mParentCon.add(this.mVerificationCodeTxt);
        this.mParentCon.add(this.mtxt0);
        this.mParentCon.add(this.mtxt1);
        this.mParentCon.add(this.mtxt2);
        this.mParentCon.add(this.mtxt3);
        this.mParentCon.add(this.mtxt4);
        this.mParentCon.add(this.mtxt5);
        this.mParentCon.add(this.combobox);

        logo.x = - 30;
        logo.y = (-logo.height / 2) - 80;

        this.mTab0.setInteractive();
        this.mTab1.setInteractive();
        this.mQuickBtn.setInteractive();
        this.mEnterBtn.setInteractive();
        this.mSendCodeBtn.setInteractive();
        this.mtxt4.setInteractive();
        this.mTab0.tabIndex = 0;
        this.mTab1.tabIndex = 1;
        this.mTabDic.set(this.mTab0.tabIndex, this.mTab0);
        this.mTabDic.set(this.mTab1.tabIndex, this.mTab1);
        this.mCurTabIndex = 0;
        this.mTab0.on("pointerdown", this.tab0Handler, this);
        this.mTab1.on("pointerdown", this.tab1Handler, this);
        this.mQuickBtn.on("pointerdown", this.quickHandler, this);
        this.mEnterBtn.on("pointerdown", this.enterHandler, this);
        this.mSendCodeBtn.on("pointerdown", this.sendCodeHandler, this);
        this.mtxt4.on("pointerdown", this.changeAccount, this);

        this.mParentCon.scaleX = this.mParentCon.scaleY = this.mWorld.uiScale;
    }

    public init(data: any) {
        this.mConnect = data.connect;
        this.mCallBack = data.callBack;
        this.mWorld = data.world;
    }

    public update() {
    }

    public awake() {
        this.scene.wake();
    }

    public sleep() {
        this.scene.sleep();
    }

    public remove() {
        this.scene.remove();
    }

    getKey(): string {
        return (this.sys.config as Phaser.Types.Scenes.SettingsConfig).key;
    }

    private changeID(data: IComboboxItemData) {
        Logger.debug("============combobox 123" + data.text);
    }

    private changeAccount() {
        this.changePanelState(undefined);
    }

    private changePanelState(accountData: string) {
        const boo: boolean = !accountData;
        this.verificaHandler(boo);
        const bgRes: string = accountData === undefined ? "login_loginBgBig" : "login_quickLoginBg";
        this.mBg.setTexture("login", bgRes);
        this.mEnterBtn.y = accountData === undefined ? 40 : 15;
        this.mInputBg_long0.visible = accountData === undefined ? true : false;
        // this.mInputBg_long0.y = accountData === undefined ? 15 : -10;
        this.mtxt3.y = accountData === undefined ? 35 : 8;
        this.mNameInputTxt.visible = accountData === undefined ? true : false;
        this.combobox.visible = accountData === undefined ? false : true;
        // this.mNameInputTxt.y = accountData === undefined ? 5 : -20;
        this.mQuickBtn.visible = accountData === undefined ? true : false;
        this.mTab0.visible = accountData === undefined ? true : false;
        this.mTab1.visible = accountData === undefined ? true : false;
        this.mInputBg_long1.visible = accountData === undefined && this.mCurTabIndex !== 0 ? true : false;
        this.mPassWordInputTxt.visible = accountData === undefined && this.mCurTabIndex !== 0 ? true : false;
        this.mtxt0.visible = accountData === undefined ? true : false;
        this.mtxt1.visible = accountData === undefined ? true : false;
        this.mtxt2.visible = accountData === undefined ? true : false;
        this.mtxt4.visible = accountData === undefined ? false : true;

        const accountObj = accountData !== undefined ? JSON.parse(accountData) : undefined;
        this.mNameInputTxt.text = !accountObj ? "" : accountObj.account;
        this.combobox.text = !accountObj ? [""] : [accountObj.account + ""];
        this.mPassWordInputTxt.text = !accountObj ? "" : accountObj.password;
        this.mParentCon.setSize(this.mBg.width, this.mBg.height);
    }

    private verificaHandler(show: boolean) {
        this.mVerificationCodeTxt.visible = show;
        this.mtxt5.visible = show;
        this.mInputBg_small.visible = show;
        this.mSendCodeBtn.visible = show;
        this.mInputBg_long1.visible = !show;
        this.mPassWordInputTxt.visible = !show;
    }

    private quickHandler() {
        this.addTween(this.mQuickBtn);
        // todo quick login
    }

    private sendCodeHandler() {
        this.addTween(this.mSendCodeBtn);
        // todo phone login
    }

    private enterHandler() {
        this.addTween(this.mEnterBtn);
        this.requestLogin();
    }

    private addTween(img: Phaser.GameObjects.Image) {
        this.tweens.add({
            targets: img,
            duration: 50,
            ease: "Linear",
            props: {
                scaleX: { value: .5 },
                scaleY: { value: .5 },
            },
            yoyo: true,
            repeat: 0,
        });
        img.scaleX = img.scaleY = 1;
    }

    private tab0Handler(pointer) {
        this.mCurTabIndex = 0;
        this.tabHandler();
    }

    private tab1Handler(pointer) {
        this.mCurTabIndex = 1;
        this.tabHandler();
    }

    private tabHandler() {
        this.mTabDic.forEach((image: Phaser.GameObjects.Image) => {
            let tabRes: string = "";
            tabRes = image.tabIndex === this.mCurTabIndex ? "login_tabSelect" : "login_tabUnSelect";
            image.setTexture("login", tabRes);
        });
        this.verificaHandler(!this.mCurTabIndex);
    }

    private requestLogin() {
        const login = this;
        const httpRequest = new XMLHttpRequest();
        httpRequest.onload = function() {
            if (httpRequest.status === 200) {
                localStorage.setItem("account", JSON.stringify({ "account": login.mNameInputTxt.text, "password": login.mPassWordInputTxt.text }));
                login.mWorld.account.setAccount(JSON.parse(httpRequest.response));
                login.mCallBack(httpRequest.responseText);
            } else {
                const alert = new Alert(login.mWorld, login);
                alert.show("账号密码错误");
            }
        };
        const accountUrl: string = CONFIG.api_root + "account/signin";
        httpRequest.open("POST", accountUrl);
        httpRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        httpRequest.send(JSON.stringify({ "account": login.mNameInputTxt.text, "password": login.mPassWordInputTxt.text }));
        // httpRequest.send("account=" + login.mNameInputTxt.text + "&password=" + login.mPassWordInputTxt.text);
    }
}
