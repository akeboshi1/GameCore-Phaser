import { NineSlicePatch, Button, TextArea, BBCodeText } from "../../../lib/rexui/lib/ui/ui-components";
import { CoreUI } from "../../../lib/rexui/lib/ui/interface/event/MouseEvent";
import { NineSliceButton } from "../../../lib/rexui/lib/ui/button/NineSliceButton";
import { i18n } from "../../i18n";
import InputText from "../../../lib/rexui/lib/plugins/gameobjects/inputtext/InputText";
import { WorldService } from "../../game/world.service";
import { UIAtlasKey } from "../ui.atals.name";
import { Font } from "../../utils/font";

export class PicChatInputPanel extends Phaser.Events.EventEmitter {
    private mBackground: Phaser.GameObjects.Graphics;
    private bottomCon: Phaser.GameObjects.Container;
    private contentCon: Phaser.GameObjects.Container;
    private key: string;
    private sendBtn: Button;
    private cancelBtn: Button;
    private mInput: InputText;
    private mTextArea: TextArea;
    private mOutputText: BBCodeText;
    private world: WorldService;
    private dpr: number;
    private scene: Phaser.Scene;
    constructor(scene: Phaser.Scene, world: WorldService, key: string, outtext: string) {
        super();
        this.key = key;
        this.world = world;
        this.dpr = world.uiRatio;
        this.scene = scene;
        const width = scene.cameras.main.width;
        const height = scene.cameras.main.height;
        this.mBackground = scene.add.graphics();
        this.mBackground.clear();
        this.mBackground.fillStyle(0, 0.6);
        this.mBackground.fillRect(0, 0, width, height);
        this.bottomCon = scene.add.container();
        this.bottomCon.setPosition(width * 0.5, height * 0.5);
        const inputBg = new NineSlicePatch(scene, 0, 0, width, 47 * this.dpr, this.key, "chat_Input_bg", {
            left: 2 * this.dpr,
            top: 0 * this.dpr,
            right: 2 * this.dpr,
            bottom: 0 * this.dpr
        });
        this.bottomCon.add(inputBg);
        this.sendBtn = new Button(this.scene, this.key, "chat_quick_2");
        this.sendBtn.x = -width * 0.5 + this.sendBtn.width * 0.5 + 12 * this.dpr;
        this.sendBtn.on(CoreUI.MouseEvent.Tap, this.onSendHandler, this);
        this.bottomCon.add(this.sendBtn);
        this.cancelBtn = new NineSliceButton(this.scene, 0, 0, 63 * this.dpr, 28 * this.dpr, UIAtlasKey.commonKey, "red_btn_s", i18n.t("common.cancel"), this.dpr, 1, {
            left: 14 * this.dpr,
            top: 0,
            right: 14 * this.dpr,
            bottom: 0
        });
        this.cancelBtn.setTextStyle({ color: "#ffffff", fontSize: 16 * this.dpr, fontFamily: Font.DEFULT_FONT });
        this.cancelBtn.x = width * 0.5 - this.cancelBtn.width * 0.5 - 12 * this.dpr;
        this.cancelBtn.on(CoreUI.MouseEvent.Tap, this.onCancelHandler, this);
        this.bottomCon.add(this.cancelBtn);
        const chatbgWidth = Math.abs(this.sendBtn.x - this.cancelBtn.x) - this.sendBtn.width * 0.5 - this.cancelBtn.width * 0.5 - 16 * this.dpr;
        const chatbgx = this.sendBtn.x + this.sendBtn.width * 0.5 + 8 * this.dpr + chatbgWidth * 0.5;
        const chatInputbg = new NineSlicePatch(this.scene, chatbgx, 0, chatbgWidth, 36 * this.dpr, this.key, "chat_Input", {
            left: 12 * this.dpr,
            top: 0 * this.dpr,
            right: 12 * this.dpr,
            bottom: 0 * this.dpr
        });
        this.bottomCon.add(chatInputbg);
        this.mInput = new InputText(this.scene, chatbgx - chatbgWidth * 0.5, 0, chatbgWidth, 40 * this.dpr, {
            type: "tel",
            placeholder: "",
            color: "#0",
            fontSize: 20 * this.dpr + "px"
        });
        this.mInput.setOrigin(0, 0.5);
        this.bottomCon.add(this.mInput);

        this.contentCon = scene.add.container();
        this.contentCon.setSize(width, height);
        this.mOutputText = new BBCodeText(scene, 0, 0, "", {
            fontSize: 14 * this.dpr + "px",
            fontFamily: Font.DEFULT_FONT,
            stroke: "#000000",
            strokeThickness: 1 * this.dpr,
            textMask: false,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: "#000",
                blur: 4,
                stroke: true,
                fill: true
            },
            wrap: {
                mode: "char",
                width: width - 12 * this.dpr
            }
        });

        this.mOutputText.setResolution(this.dpr);
        this.contentCon.add(this.mOutputText);
        this.mTextArea = new TextArea(scene, {
            x: 0,
            y: 0,
            textWidth: width - 24 * this.dpr,
            textHeight: height,
            text: this.mOutputText,
            textMask: false
        });
        this.mTextArea.setSliderEnable(false);
        this.contentCon.add(this.mTextArea);
        this.contentCon.setPosition(width * 0.5, this.bottomCon.y - 100 * this.dpr);
        this.mTextArea.childrenMap.child.setMinSize(width, height);
        this.mTextArea.layout();
        this.mTextArea.setPosition(0, 0);
        const textMask = this.mTextArea.childrenMap.text;
        textMask.y = 0;
        this.mTextArea.scrollToTop();
    }

    public appendChat(val: string) {
        if (this.mTextArea) {
            this.mTextArea.appendText(val);
            this.mTextArea.scrollToTop();
        }
    }

    private onSendHandler() {
        this.emit("send", this.mInput.text);
        this.mInput.text = "";
    }

    private onCancelHandler() {
        this.mBackground.destroy();
        this.mInput.destroy();
        this.bottomCon.destroy();
        this.contentCon.destroy();
        this.destroy();
        this.scene = undefined;
        this.world = undefined;
        this.emit("close");
    }
}
