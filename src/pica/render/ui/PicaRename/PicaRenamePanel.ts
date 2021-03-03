import { Button, ClickEvent, InputText, NineSliceButton } from "apowophaserui";
import { Handler, i18n, UIHelper } from "utils";
import { AvatarSuit, AvatarSuitType, ModuleName, RunningAnimation } from "structure";
import { UiManager, CommonBackground, UIDragonbonesDisplay, ButtonEventDispatcher, ToggleButton, MainUIScene } from "gamecoreRender";
import { PicaBasePanel } from "../pica.base.panel";
import { UIAtlasName } from "picaRes";
import { op_client, op_gameconfig, op_def } from "pixelpai_proto";
import { ICountablePackageItem } from "picaStructure";

export class PicaRenamePanel extends PicaBasePanel {
    private commonBackground: CommonBackground;
    private mBottomBg: Phaser.GameObjects.Image;
    private content: Phaser.GameObjects.Container;
    private backButton: Button;
    private dragonbones: UIDragonbonesDisplay;
    private inputCon: Phaser.GameObjects.Container;
    private enterButton: NineSliceButton;
    private randomButton: Button;
    private inputTex: InputText;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.setTween(false);
        const container = this.scene.add.container(0, 0);
        container.add(this);
        this.atlasNames = [UIAtlasName.uicommon, UIAtlasName.createrole];
        this.textures = [{ atlasName: "Create_bg_texture", folder: "texture" }, {
            atlasName: "Create_role_bg",
            folder: "texture"
        }];
        this.key = ModuleName.PICARENAME_NAME;
        this.uiLayer = MainUIScene.LAYER_DIALOG;
    }

    resize(wid: number, hei: number) {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.content.x = width * 0.5;
        this.content.y = height * 0.5;
    }

    public setSuitDatas(datas: AvatarSuit[]) {
        this.displayAvatar(datas);
    }
    init() {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.content = this.scene.make.container(undefined, false);
        this.add(this.content);
        this.commonBackground = new CommonBackground(this.scene, 0, 0, width, height);
        this.mBottomBg = this.scene.make.image({ key: "Create_bg_texture" });
        this.mBottomBg.y = height * 0.5 - this.mBottomBg.height * 0.5;
        const mTopBg = this.scene.make.image({ key: "Create_role_bg" });
        mTopBg.y = -140 * this.dpr;
        this.dragonbones = new UIDragonbonesDisplay(this.scene, this.render);
        this.dragonbones.scale = this.dpr * 2.2;
        this.dragonbones.y = mTopBg.y + 80 * this.dpr;
        this.dragonbones.on("initialized", this.loadDragonbonesComplete, this);

        const avatarclickCon = new ButtonEventDispatcher(this.scene, 0, 0);
        avatarclickCon.setSize(130 * this.dpr, 130 * this.dpr);
        avatarclickCon.enable = true;
        avatarclickCon.on(ClickEvent.Tap, this.onAvatarClickHandler, this);
        avatarclickCon.y = this.dragonbones.y - 65 * this.dpr;
        this.backButton = new Button(this.scene, UIAtlasName.uicommon, "back_arrow");
        this.backButton.x = -width * 0.5 + this.backButton.width * 0.5 + 20 * this.dpr;
        this.backButton.y = -height * 0.5 + this.backButton.height * 0.5 + 23 * this.dpr;
        this.backButton.on(ClickEvent.Tap, this.onBackHandler, this);
        this.inputCon = this.scene.make.container(undefined, false);
        this.inputCon.y = this.dragonbones.y + 90 * this.dpr;
        const inputbg = this.scene.make.image({ key: UIAtlasName.createrole, frame: "Create_role_id_bg" });
        this.inputTex = new InputText(this.scene, -20 * this.dpr, 0, 190 * this.dpr, 52 * this.dpr, {
            type: "input",
            fontSize: 18 * this.dpr + "px",
            color: "#717171",
            align: "center",
            placeholder: i18n.t("create_role.enter_nick")
        }).setOrigin(0.5);
        this.randomButton = new Button(this.scene, UIAtlasName.createrole, "Create_role_id_random", "Create_role_id_random");
        this.randomButton.x = inputbg.width * 0.5 - 12 * this.dpr - this.randomButton.width * 0.5;
        this.randomButton.y = 0;
        this.randomButton.on(ClickEvent.Tap, this.onRandomNameHandler, this);
        this.inputCon.add([inputbg, this.inputTex, this.randomButton]);
        this.enterButton = new NineSliceButton(this.scene, 0, 0, 191 * this.dpr, 55 * this.dpr, UIAtlasName.uicommon, "yellow_btn_normal", i18n.t("common.confirm"), this.dpr, this.scale, UIHelper.button(this.dpr));
        this.enterButton.setTextStyle(UIHelper.brownishStyle(this.dpr, 23));
        this.enterButton.setFontStyle("bold");
        this.enterButton.on(ClickEvent.Tap, this.onSubmitHandler, this);
        this.enterButton.y = this.inputCon.y + 100 * this.dpr;
        this.content.add([this.commonBackground, this.mBottomBg, mTopBg, this.dragonbones, avatarclickCon, this.inputCon, this.enterButton]);
        super.init();
        this.resize(0, 0);
    }
    setNickName(val: string) {
        if (this.inputTex) {
            this.inputTex.text = val;
        }
    }
    private onSubmitHandler() {
        this.render.renderEmitter(this.key + "_submit", this.inputTex.text);
    }
    private onRandomNameHandler() {
        this.inputTex.setBlur();
        this.render.renderEmitter(this.key + "_randomname", this.inputTex.text);
    }
    private onAvatarClickHandler() {
        const anis = ["walk", "run", "greet01"];
        const ani = anis[Math.floor(Math.random() * (anis.length))];
        const aniData: RunningAnimation = {
            name: (ani),
            flip: false,
            times: 1,
            playingQueue: {
                name: "idle", playTimes: -1
            }
        };
        this.dragonbones.play(aniData);
    }

    private onBackHandler() {
        this.render.renderEmitter(this.key + "_hide");
    }

    private displayAvatar(datas: AvatarSuit[]) {
        const avatar = AvatarSuitType.createHasBaseAvatar(datas);
        this.dragonbones.load({
            id: 0,
            avatar
        });
        this.dragonbones.startLoad();
    }

    private loadDragonbonesComplete() {
        this.dragonbones.play({ name: "idle", flip: false });
    }
}
