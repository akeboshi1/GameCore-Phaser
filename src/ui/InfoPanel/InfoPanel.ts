import { WorldService } from "../../game/world.service";
import { Panel } from "../components/panel";
import { DynamicImage } from "../components/dynamic.image";
import { Button } from "../../../lib/rexui/lib/ui/button/Button";
import TextArea from "../../../lib/rexui/lib/ui/textarea/TextArea";
import BBCodeText from "../../../lib/rexui/lib/plugins/gameobjects/text/bbocdetext/BBCodeText.js";
import { op_client } from "pixelpai_proto";
import { NinePatchButton } from "../components/ninepatch.button";
import { Url, Border, Background, BlueButton } from "../../utils/resUtil";
import { GameScroller } from "../../../lib/rexui/lib/ui/scroller/Scroller";
import NinePatch from "../../../lib/rexui/lib/plugins/gameobjects/ninepatch/NinePatch";
import { Font } from "../../utils/font";
import { InfoPanelMediator } from "./InfoPanelMediator";
import { Size } from "../../utils/size";

export class InfoPanel extends Panel {
    private mActor: DynamicImage;
    private mCloseBtn: NinePatchButton;
    private mScroller: GameScroller;
    private mAttributesBBCodeText: BBCodeText;
    private mNameBBCodeText: BBCodeText;
    // private mAttributesTextArea: TextArea;
    // private mNameTextArea: TextArea;
    constructor(scene: Phaser.Scene, worldService: WorldService) {
        super(scene, worldService);
        this.mWorld = worldService;
    }

    resize(wid: number, hei: number) {
        const size = this.mWorld.getSize();
        const scale: number = this.mWorld.uiScaleNew;
        const zoom: number = this.mWorld.uiRatio;
        this.x = size.width >> 1;
        this.y = size.height >> 1;
        this.mActor.x = -this.width / 2 + 80 * scale * zoom;
        this.mActor.y = -this.height / 2 + 133 * scale * zoom;
        // this.mNameTextArea.childrenMap.child.setMinSize(150 * this.dpr * zoom, 220 * this.dpr * zoom);
        // this.mNameTextArea.layout();
        // const textMask = this.mNameTextArea.childrenMap.text;
        // textMask.x = 200;
        // textMask.y = 100;
        // this.mNameTextArea.scrollToBottom();
        // const attributesMask = this.mAttributesTextArea.childrenMap.text;
        // attributesMask.y=0;
    }

    show(param?: any) {
        super.show(param);
        if (this.mInitialized) {
            this.addListen();
        }
        this.setData("data", param);
        this.setInfo(param);
    }

    hide() {
        this.removeListen();
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
        this.mNameBBCodeText.setText(text[0].text);
        this.mAttributesBBCodeText.setText(text[1].text);
        // this.mNameTextArea.appendText(text[0].text);
        // this.mNameTextArea.scrollToBottom();
        // this.mAttributesTextArea.appendText(text[1].text);
    }

    destroy() {
        if (this.mActor) {
            this.mActor.destroy(true);
            this.mActor = null;
        }
        // if (this.mScroller) {
        //     this.mScroller.destroy();
        //     this.mScroller = null;
        // }

        // if (this.mNameTextArea) {
        //     this.mNameTextArea.destroy();
        //     this.mNameTextArea = null;
        // }

        // if (this.mAttributesTextArea) {
        //     this.mAttributesTextArea.destroy();
        //     this.mAttributesTextArea = null;
        // }

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
        const zoom: number = this.mWorld.uiRatio;
        const scale: number = this.mWorld.uiScaleNew;
        this.setSize(400 * this.dpr * zoom, 500 * this.dpr * zoom);
        this.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.width, this.height), Phaser.Geom.Rectangle.Contains);
        const background = new NinePatch(this.scene, {
            width: this.width,
            height: this.height,
            key: Background.getName(),
            columns: Background.getColumns(),
            rows: Background.getRows()
        });
        const border = new NinePatch(this.scene, {
            width: this.width - 20 * this.dpr * zoom,
            height: this.height - 20 * this.dpr * zoom,
            key: Border.getName(),
            columns: Border.getColumns(),
            rows: Border.getRows()
        });

        this.mNameBBCodeText = new BBCodeText(this.scene, this.width / 2 - 120 * zoom * scale, -155 * zoom * scale, "", {
            fontSize: 14 * this.dpr * zoom + "px",
            fontFamily: Font.DEFULT_FONT,
            textMask: false,
            wrap: {
                mode: "char",
                width: 120 * this.dpr * zoom
            }
        });
        // const bg = this.scene.add.graphics();
        // bg.fillStyle(0xffffff);
        // bg.fillRect(0, 0, 150 * this.dpr * zoom, 220 * this.dpr * zoom);
        // this.mNameTextArea = new TextArea(this.scene, {
        //     x: this.width / 2 - 80 * zoom * scale,
        //     y: -75 * zoom * scale,
        //     textWidth: 150 * this.dpr * zoom,
        //     textHeight: 220 * this.dpr * zoom,
        //     textMask: true,
        //     background: bg,
        //     text: this.mNameBBCodeText,
        // })
        //     .layout()
        //     .setSliderEnable(false);
        this.mAttributesBBCodeText = new BBCodeText(this.scene, -this.width / 2 + 40 * zoom * scale, 0, "", {
            fontSize: 14 * this.dpr * zoom + "px",
            fontFamily: Font.DEFULT_FONT,
            textMask: false,
            wrap: {
                mode: "char",
                width: 120 * this.dpr * zoom
            }
        });
        // this.mAttributesTextArea = new TextArea(this.scene, {
        //     x: this.width >> 1,
        //     y: this.height >> 1,
        //     width: this.mAttributesBBCodeText.width,
        //     height: 220 * this.dpr * zoom,
        //     textWidth: this.mAttributesBBCodeText.width,
        //     textHeight: 220 * this.dpr * zoom,
        //     text: this.mAttributesBBCodeText,
        //     content: "123"
        // }).layout();

        this.mCloseBtn = new NinePatchButton(this.scene, 258, 145, 80, 34, BlueButton.getName(), "", "关闭", BlueButton.getConfig());
        this.mCloseBtn.x = 0;
        this.mCloseBtn.y = this.height - 100 * this.mWorld.uiRatio * zoom >> 1;
        this.mCloseBtn.setTextStyle({ font: Font.YAHEI_16_BOLD });

        this.mActor = new DynamicImage(this.scene, 300, 125).setOrigin(0.5, 1);
        this.mActor.scale = 2;
        (this.mWorld.uiManager.getMediator(InfoPanelMediator.NAME) as InfoPanelMediator).resize();
        this.add([background, border,
            this.mNameBBCodeText, this.mAttributesBBCodeText, this.mCloseBtn, this.mActor]);
        // this.mAttributesTextArea, this.mAttributesBBCodeText,this.mNameTextArea,
        this.addListen();
        super.init();

        this.setInfo(this.getData("data"));
    }

    private addListen() {
        // this.mNameTextArea.childrenMap.child.setInteractive();
        if (this.mCloseBtn) this.mCloseBtn.on("pointerup", this.closeHandler, this);
    }

    private removeListen() {
        // this.mNameTextArea.childrenMap.child.disableInteractive();
        if (this.mCloseBtn) this.mCloseBtn.off("pointerup", this.closeHandler, this);
    }

    private closeHandler(pointer) {
        if (this.checkPointerDelection(pointer)) {
            this.hide();
        }
    }

    private checkPointerDelection(pointer: Phaser.Input.Pointer) {
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
}
