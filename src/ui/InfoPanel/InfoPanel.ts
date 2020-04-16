import { WorldService } from "../../game/world.service";
import { BasePanel } from "../components/BasePanel";
import { DynamicImage } from "../components/dynamic.image";
import TextArea from "../../../lib/rexui/lib/ui/textarea/TextArea";
import BBCodeText from "../../../lib/rexui/lib/plugins/gameobjects/text/bbocdetext/BBCodeText.js";
import { op_client } from "pixelpai_proto";
import { NinePatchButton } from "../components/ninepatch.button";
import { Url, Border, Background, BlueButton } from "../../utils/resUtil";
import { GameScroller } from "../../../lib/rexui/lib/ui/scroller/Scroller";
import NinePatch from "../../../lib/rexui/lib/plugins/gameobjects/ninepatch/NinePatch";
import { Font } from "../../utils/font";
import { InfoPanelMediator } from "./InfoPanelMediator";

const GetValue = Phaser.Utils.Objects.GetValue;
export class InfoPanel extends BasePanel {
    private mActor: DynamicImage;
    private mCloseBtn: NinePatchButton;
    private mScroller: GameScroller;
    private mAttributesBBCodeText: BBCodeText;
    private mNameBBCodeText: BBCodeText;
    private mAttributesTextArea: TextArea;
    private mNameTextArea: TextArea;
    constructor(scene: Phaser.Scene, worldService: WorldService) {
        super(scene, worldService);
        this.mWorld = worldService;
    }

    public addListen() {
        if (this.mCloseBtn) this.mCloseBtn.on("pointerup", this.closeHandler, this);
    }

    public removeListen() {
        if (this.mCloseBtn) this.mCloseBtn.off("pointerup", this.closeHandler, this);
    }

    resize(wid: number, hei: number) {
        if (!this.mInitialized) return;
        const size = this.mWorld.getSize();
        const scale: number = this.mWorld.uiScaleNew;
        const zoom: number = this.mWorld.uiRatio;
        this.x = size.width >> 1;
        this.y = size.height >> 1;
        this.mActor.x = -this.width / 2 + 80 * scale * zoom;
        this.mActor.y = -this.height / 2 + 160 * scale * zoom;
        this.mNameTextArea.setMinSize(220 * this.dpr * scale, 222 * this.dpr * scale);
        this.mNameTextArea.setPosition(size.width / 2 + 60 * this.dpr * scale, size.height / 2 - 110 * this.dpr * scale);
        this.mNameTextArea.layout();
        const textMask = this.mNameTextArea.childrenMap.text;
        textMask.x = -10 * this.dpr * scale;
        textMask.y = -200 * this.dpr * scale;
        this.mAttributesTextArea.setMinSize(360 * this.dpr * scale, 180 * this.dpr * scale);
        this.mAttributesTextArea.setPosition(size.width / 2 + 3 * this.dpr * scale, size.height / 2 + 95 * this.dpr * scale);
        this.mAttributesTextArea.layout();
        const attributesMask = this.mAttributesTextArea.childrenMap.text;
        attributesMask.x = -this.width / 2 + 30 * this.dpr * scale;
        attributesMask.y = 5 * this.dpr * scale;
    }

    show(param?: any) {
        if (this.mShowing) return;
        super.show(param);
        if (this.mInitialized) {
            const size = this.mWorld.getSize();
            this.setData("data", param);
            this.setInfo(param);
            this.resize(size.width, size.height);
        }
    }

    hide() {
        super.hide();
    }

    setInfo(data: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI) {
        if (!this.mInitialized || !data) return;
        if (data.actors.length === 0) {
            return;
        }
        const actor = data.actors[0];
        this.mWorld.httpService.userDetail(actor.platformId).then((response) => {
            if (response.code === 200) {
                const resData = response.data;
                if (resData) {
                    this.mActor.load(Url.getOsdRes(`show/${resData.username}.png`), this, undefined, this.loadDefaultAvatar);
                    // this.mNickName.setText(resData.nickname);
                    // this.mLv.setText(resData.level);
                }
            }
        });
        const text: any[] = data.text;
        if (text[0]) {
            this.mNameTextArea.setText(this.checkValue(text[0]));
        }
        if (text[1]) {
            this.mNameTextArea.setText(this.checkValue(text[1]));
        }
    }

    destroy() {
        if (this.mActor) {
            this.mActor.destroy(true);
            this.mActor = null;
        }

        if (this.mNameTextArea) {
            this.mNameTextArea.destroy();
            this.mNameTextArea = null;
        }

        if (this.mAttributesTextArea) {
            this.mAttributesTextArea.destroy();
            this.mAttributesTextArea = null;
        }

        this.mWorld = null;
        super.destroy();
    }

    protected preload() {
        this.scene.load.image(Border.getName(), Border.getPNG());
        this.scene.load.image(Background.getName(), Background.getPNG());
        this.scene.load.atlas(BlueButton.getName(), BlueButton.getPNG(), BlueButton.getJSON());
        super.preload();
    }

    protected init() {
        const size = this.mWorld.getSize();
        const scale: number = this.mWorld.uiScaleNew;
        this.setSize(400 * this.dpr * scale, 500 * this.dpr * scale);
        const background = new NinePatch(this.scene, {
            width: this.width,
            height: this.height,
            key: Background.getName(),
            columns: Background.getColumns(),
            rows: Background.getRows()
        });
        const border = new NinePatch(this.scene, {
            width: this.width - 20 * this.dpr * scale,
            height: this.height - 20 * this.dpr * scale,
            key: Border.getName(),
            columns: Border.getColumns(),
            rows: Border.getRows()
        });

        this.mNameBBCodeText = new BBCodeText(this.scene, 0, 0, "", {
            fontSize: 14 * this.dpr * scale + "px",
            fontFamily: Font.DEFULT_FONT,
            textMask: false,
            wrap: {
                mode: "char",
                width: 270 * this.dpr * scale
            }
        });
        this.mNameTextArea = new TextArea(this.scene, {
            x: this.width / 2 - 80 * scale * this.dpr,
            y: -75 * scale * this.dpr,
            textWidth: 270 * this.dpr * scale,
            textHeight: 180 * this.dpr * scale,
            textMask: true,
            // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
            text: this.mNameBBCodeText,
        })
            .layout();
        this.mAttributesBBCodeText = new BBCodeText(this.scene, 0, 0, "", {
            fontSize: 14 * this.dpr * scale + "px",
            fontFamily: Font.DEFULT_FONT,
            textMask: false,
            wrap: {
                mode: "char",
                width: this.width - 30 * this.dpr * scale
            }
        });
        this.mAttributesTextArea = new TextArea(this.scene, {
            x: size.width / 2 + 3 * this.dpr * scale,
            y: size.height / 2 + 95 * this.dpr * scale,
            textMask: true,
            textWidth: this.width - 60 * this.dpr * scale,
            textHeight: 180 * this.dpr * scale,
            // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
            text: this.mAttributesBBCodeText,
        })
            .layout();

        this.mCloseBtn = new NinePatchButton(this.scene, 258, 145, 80, 34, BlueButton.getName(), "", "关闭", BlueButton.getConfig());
        this.mCloseBtn.x = 0;
        this.mCloseBtn.y = this.height - 100 * this.mWorld.uiRatio * scale >> 1;
        this.mCloseBtn.setTextStyle({ font: Font.YAHEI_16_BOLD });

        this.mActor = new DynamicImage(this.scene, 300, 125).setOrigin(0.5, 1);
        this.mActor.scale = 2;
        (this.mWorld.uiManager.getMediator(InfoPanelMediator.NAME) as InfoPanelMediator).resize();
        this.add([background, border,
            this.mNameBBCodeText, this.mAttributesBBCodeText, this.mCloseBtn, this.mActor]);
        // this.mAttributesTextArea, this.mAttributesBBCodeText,this.mNameTextArea, this.mNameTextArea,
        this.addListen();
        super.init();

        this.setInfo(this.getData("data"));
    }

    private closeHandler(pointer) {
        if (this.checkPointerDis(pointer)) {
            this.hide();
        }
    }

    private checkPointerDis(pointer: Phaser.Input.Pointer) {
        if (!this.mWorld) return true;
        return Math.abs(pointer.downX - pointer.upX) < 10 * this.mWorld.uiRatio * this.mWorld.uiScaleNew ||
            Math.abs(pointer.downY - pointer.upY) < 10 * this.mWorld.uiRatio * this.mWorld.uiScaleNew;
    }

    private loadDefaultAvatar() {
        const url = Url.getOsdRes("show/avatar_default.png");
        if (this.scene.textures.exists(url)) {
            this.mActor.setTexture(url);
            return;
        }
        this.mActor.load(url);
    }

    private checkValue(data: any): any {
        return GetValue(data, "text", "");
    }
}
