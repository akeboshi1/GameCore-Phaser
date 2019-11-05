import { WorldService } from "../../game/world.service";
import RoundRectangle from "../../../lib/rexui/plugins/gameobjects/shape/roundrectangle/RoundRectangle";
import TextArea from "../../../lib/rexui/templates/ui/textarea/TextArea";
import InputText from "../../../lib/rexui/plugins/gameobjects/inputtext/InputText";
import { Panel } from "../components/panel";
import { NinePatchButton } from "../components/ninepatch.button";
import { Border, Url } from "../../utils/resUtil";
import { CheckButton } from "../components/check.button";
import BBCodeText from "../../../lib/rexui/plugins/gameobjects/text/bbocdetext/BBCodeText";
import { NinePatch } from "../components/nine.patch";

export class ChatPanel extends Panel {
    private mTextArea: TextArea;
    private mInputText: InputText;
    private mVoiceBtn: CheckButton;
    private mMicBtn: CheckButton;
    private mSendKey: Phaser.Input.Keyboard.Key;
    private mPreHei: number = 0;
    private mPreWid: number = 0;
    private outPut: Phaser.GameObjects.Container;
    constructor(scene: Phaser.Scene, private mWorldService: WorldService) {
        super(scene);
    }

    public appendChat(val: string) {
        if (this.mTextArea) {
            this.mTextArea.appendText(val);
            this.mTextArea.scrollToBottom();
        }
    }

    public setLocation(x?: number, y?: number) {
        // TODO 设置位置后，DefaultMask位置不会更新，所以暂时以0 0为准
        // DefaultMask在TextBlock中，TextBlock是一个非渲染矩形游戏对象
        const size = this.mWorldService.getSize();
        if (this.mWorldService.game.device.os.desktop) {
            this.x = 0;
            this.y = size.height - this.mPreHei;
        } else {
            this.x = size.width - this.width / 2 >> 1;
            this.y = size.height - this.height * 1.8;
        }
        if (this.mTextArea) {
            this.mTextArea.childrenMap.child.textMask.setPosition(undefined, size.height - this.height + 5).resize();
        }
    }

    public hide() {
        super.hide();
        this.destroy();
    }

    public destroy() {
        if (this.mTextArea) this.mTextArea.destroy();
        if (this.mInputText) this.mInputText.destroy();
        if (this.mVoiceBtn) this.mVoiceBtn.destroy();
        if (this.mMicBtn) this.mMicBtn.destroy();
        this.mTextArea = null;
        this.mInputText = null;
        this.mVoiceBtn = null;
        this.mMicBtn = null;
        this.mSendKey = null;
        super.destroy();
    }

    protected preload() {
        if (!this.mScene) {
            return;
        }
        this.mScene.load.image("button", Url.getRes("ui/common/button.png"));
        this.mScene.load.image("chat_input_bg", Url.getRes("ui/chat/input_bg.png"));
        // this.mScene.load.image("chat_border_bg", Url.getRes("ui/chat/bg.png"));
        this.mScene.load.image(Border.getName(), Border.getPNG());
        this.mScene.load.atlas("chat_atlas", Url.getRes("ui/chat/chat_atlas.png"), Url.getRes("ui/chat/chat_atlas.json"));
        super.preload();
    }

    protected init() {
        if (this.mInitialized) return;
        super.init();
        const size = this.mWorldService.getSize();
        this.mWidth = 464;
        this.mHeight = 281;
        this.mPreHei = size.height;
        this.mPreWid = size.width;
        this.setSize(this.mWidth, this.mHeight);

        const border = new NinePatch(this.scene, 0, 0, this.width, this.height, Border.getName(), null, Border.getConfig());
        border.x = 4 * this.mWorldService.uiScale + border.width * border.originX;
        border.y = size.height - 260 * this.mWorldService.uiScale + border.height * border.originY;
        this.add(border);

        this.outPut = this.mScene.make.container(undefined, false);
        this.add(this.outPut);

        const background = new RoundRectangle(this.mScene, 0, 0, 2, 2, 3, 0x808080, 0.5);
        this.outPut.add(background);

        const track = new RoundRectangle(this.mScene, 0, 0, 10, 10, 10, 0x260e04);
        track.setPosition(100 * this.mWorldService.uiScale, 10 * this.mWorldService.uiScale);
        this.outPut.add(track);

        const text = new BBCodeText(this.mScene, 0, 0, "", {
            fontSize: "14px",
            wrap: {
                mode: "char",
                width: 400 * this.mWorldService.uiScale
            },
        });
        this.outPut.add(text);

        const thumb = new RoundRectangle(this.mScene, 0, 0, 10, 20, 10, 0xFFFF00);
        this.outPut.add(thumb);
        this.mTextArea = new TextArea(this.mScene, {
            x: 230 * this.mWorldService.uiScale,
            y: size.height - 150 * this.mWorldService.uiScale,
            textWidth: 430,
            textHeight: 200,
            text,
            slider: {
                track,
                thumb,
            },

        })
            .layout();
        this.outPut.add(this.mTextArea);

        const tracks = this.mTextArea.getElement("child");
        if (tracks) {
            // tracks.x += 150;
        }

        const inputContainer = this.mScene.make.container(undefined, false);
        this.add(inputContainer);
        const inputBg = new NinePatch(this.scene, 0, 0, 370, 32, "chat_input_bg", null, { left: 4, top: 4, right: 4, bottom: 4 });
        inputBg.x = 8 * this.mWorldService.uiScale + inputBg.width * inputBg.originX;
        inputBg.y = size.height - 46 * this.mWorldService.uiScale + inputBg.height * inputBg.originY;
        inputContainer.add(inputBg);

        this.mInputText = new InputText(this.mScene, 0, 0, 10, 10, {
            type: "input",
            fontSize: "14px",
            color: "#808080"
        })
            .resize(360, 20)
            .setOrigin(0, 0)
            .setStyle({ font: "bold 16px YaHei" })
            .on("focus", this.onFocusHandler, this)
            .on("blur", this.onBlurHandler, this);
        this.mInputText.x = 12 * this.mWorldService.uiScale;
        this.mInputText.y = size.height - 40 * this.mWorldService.uiScale;
        inputContainer.add(this.mInputText);

        const sendMsgBtn = new NinePatchButton(this.mScene, 0, 0, 60, 30, "button", "发送", {
            left: 4,
            top: 4,
            right: 4,
            bottom: 4
        });
        sendMsgBtn.x = this.width - sendMsgBtn.width + 10 * this.mWorldService.uiScale;
        sendMsgBtn.y = size.height - sendMsgBtn.height;
        sendMsgBtn.on("pointerdown", this.onSendMsgHandler, this);
        this.add(sendMsgBtn);

        this.mSendKey = this.mScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        this.mVoiceBtn = new CheckButton(this.mScene, 0, 0, "chat_atlas", "voice_normal.png", "voice_selected.png");
        this.mVoiceBtn.x = this.width - 60 * this.mWorldService.uiScale;
        this.mVoiceBtn.y = size.height - this.height;
        this.add(this.mVoiceBtn);

        this.mMicBtn = new CheckButton(this.mScene, 0, 0, "chat_atlas", "mic_normal.png", "mic_selected.png");
        this.mMicBtn.x = this.width - 20 * this.mWorldService.uiScale;
        this.mMicBtn.y = size.height - this.height;
        this.add(this.mMicBtn);

        this.mVoiceBtn.on("selected", this.onSelectedVoiceHandler, this);
        this.mMicBtn.on("selected", this.onSelectedMicHandler, this);
        this.setLocation();
    }

    private onSelectedVoiceHandler(val: boolean) {
        if (val === false) {
            this.mMicBtn.selected = false;
        }
        this.emit("selectedVoice", val);
    }

    private onSelectedMicHandler(val: boolean) {
        if (this.mVoiceBtn.selected === false) {
            this.mMicBtn.selected = false;
            return;
        }
        this.emit("selectedMic", val);
    }

    private onSendMsgHandler() {
        const text = this.mInputText.text;
        if (text.length > 0) {
            this.emit("sendChat", text);
            this.mInputText.setText("");
            this.mInputText.setBlur();
        }
    }

    private onFocusHandler() {
        if (!this.mWorldService || !this.mWorldService.inputManager) {
            return;
        }
        this.mWorldService.inputManager.enable = false;
        if (this.mSendKey) {
            this.mSendKey.on("down", this.onDownEnter, this);
        }
    }

    private onBlurHandler() {
        if (!this.mWorldService || !this.mWorldService.inputManager) {
            return;
        }
        this.mWorldService.inputManager.enable = true;
        if (this.mSendKey) {
            this.mSendKey.off("down", this.onDownEnter, this);
        }
    }

    private onDownEnter() {
        this.onSendMsgHandler();
    }

    get outChannel(): number {
        return 0;
    }
}
