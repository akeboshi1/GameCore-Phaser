import { ConnectionService } from "../net/connection.service";
import InputText from "../../lib/rexui/plugins/gameobjects/inputtext/InputText";

// 编辑器用 Phaser.Scene
export class LoginScene extends Phaser.Scene {
    private mCallBack: Function;
    private mConnect: ConnectionService;
    private mAccount: string;
    private mPassWord: string;
    private mTabDic: Map<number, Phaser.GameObjects.Image>;
    private mCurTabIndex: number = 0;
    private mEnterBtn: Phaser.GameObjects.Image;
    private mQuickBtn: Phaser.GameObjects.Image;
    private mNameInputTxt: InputText;
    private mPassWordInputTxt: InputText;
    constructor() {
        super({ key: LoginScene.name });
    }

    public preload() {
        this.load.atlas("login", "./resources/ui/login/login.png", "./resources/ui/login/login.json");
    }

    public create() {
        const loginRes: string = "login";
        const loginPng: string = "./resources/login.png";
        const width = this.scale.gameSize.width;
        const height = this.scale.gameSize.height;
        const rect = this.add.graphics();
        rect.fillStyle(0);
        rect.fillRect(0, 0, width, height);
        const logo: Phaser.GameObjects.Image = this.add.image((width >> 1) - 30, (height >> 1) - 150, loginRes, "login_logo");
        const panelCon: Phaser.GameObjects.Container = this.add.container(width >> 1, (height >> 1) + 100);

        this.mTabDic = new Map();
        const bg = this.add.image(0, 0, loginRes, "login_loginBgBig");
        const tab0 = this.add.image(-105, -38, loginRes, "login_tabSelect");
        const tab1 = this.add.image(7, -38, loginRes, "login_tabUnSelect");
        this.mQuickBtn = this.add.image(123, -38, loginRes, "login_quickBtn");
        this.mEnterBtn = this.add.image(123, 40, loginRes, "login_loginBtn");
        const inputBg_long0 = this.add.image(-50, 15, loginRes, "login_inputLong");
        const inputBg_long1 = this.add.image(-50, 67, loginRes, "login_inputLong");
        this.mNameInputTxt = new InputText(this, -140, 5, 190, 15, {
            type: "input",
            text: "用戶名",
            fontSize: "14px",
            color: "#847C7C",
        })
            .resize(200, 20)
            .setOrigin(0, 0);
        this.mPassWordInputTxt = new InputText(this, -140, 55, 190, 15, {
            type: "input",
            text: "密碼",
            fontSize: "14px",
            color: "#847C7C",
        })
            .resize(200, 20)
            .setOrigin(0, 0);
        const txt0 = this.add.text(-145, -45, "手机号登录");
        const txt1 = this.add.text(-35, -45, "用户号登录");
        const txt2 = this.add.text(90, -45, "快速游戏");
        const txt3 = this.add.text(110, 35, "登录");
        panelCon.addAt(bg, 0);
        panelCon.addAt(tab0, 1);
        panelCon.addAt(tab1, 2);
        panelCon.addAt(this.mQuickBtn, 3);
        panelCon.addAt(this.mEnterBtn, 4);
        panelCon.addAt(inputBg_long0, 5);
        panelCon.addAt(inputBg_long1, 5);
        panelCon.addAt(this.mNameInputTxt, 6);
        panelCon.addAt(this.mPassWordInputTxt, 7);
        panelCon.add(txt0);
        panelCon.add(txt1);
        panelCon.add(txt2);
        panelCon.add(txt3);

        tab0.setInteractive();
        tab1.setInteractive();
        this.mQuickBtn.setInteractive();
        this.mEnterBtn.setInteractive();
        tab0.tabIndex = 0;
        tab1.tabIndex = 1;
        this.mTabDic.set(tab0.tabIndex, tab0);
        this.mTabDic.set(tab1.tabIndex, tab1);
        this.mCurTabIndex = 0;
        tab0.on("pointerdown", this.tab0Handler, this);
        tab1.on("pointerdown", this.tab1Handler, this);
        this.mQuickBtn.on("pointerdown", this.quickHandler, this);
        this.mEnterBtn.on("pointerdown", this.enterHandler, this);
        panelCon.setSize(bg.width, bg.height);
    }

    public init(data: any) {
        this.mConnect = data.connect;
        this.mCallBack = data.callBack;
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

    private quickHandler() {
        this.addTween(this.mQuickBtn);
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
            if (image.tabIndex === this.mCurTabIndex) {
                tabRes = "login_tabSelect";
            } else {
                tabRes = "login_tabUnSelect";
            }
            image.setTexture("login", tabRes);
        });
    }

    private requestLogin() {
        const login = this;
        const httpRequest = new XMLHttpRequest();
        httpRequest.onload = function () {
            login.mCallBack(httpRequest.responseText);
            // if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            // }
        };
        httpRequest.open("POST", CONFIG.AccountUrl || "http://dev.tooqing.com:17170/account/signin");
        httpRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        httpRequest.send(JSON.stringify({ "account": login.mNameInputTxt.text, "password": login.mPassWordInputTxt.text }));
        // httpRequest.send("account=" + login.mNameInputTxt.text + "&password=" + login.mPassWordInputTxt.text);
    }
}
