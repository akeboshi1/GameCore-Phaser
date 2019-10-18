import { WorldService } from "../../game/world.service";
import RoundRectangle from "../../../lib/rexui/plugins/gameobjects/shape/roundrectangle/RoundRectangle";
import TextArea from "../../../lib/rexui/templates/ui/textarea/TextArea";
import InputText from "../../../lib/rexui/plugins/gameobjects/inputtext/InputText";
import { Panel } from "../components/panel";
import { NinePatchButton } from "../components/ninepatch.button";
import NinePatch from "../../../lib/rexui/plugins/gameobjects/ninepatch/NinePatch";
import { Url } from "../../utils/resUtil";
import { CheckButton } from "../components/check.button";
import BBCodeText from "../../../lib/rexui/plugins/gameobjects/text/bbocdetext/BBCodeText";

export class ChatPanel extends Panel {
    private mTextArea: TextArea;
    private mInputText: InputText;
    private mVoiceBtn: CheckButton;
    private mMicBtn: CheckButton;
    private mSendKey: Phaser.Input.Keyboard.Key;
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
            this.x = 100;
        } else {
            this.x = size.width - this.width / 2 >> 1;
        }
        this.y = size.height - this.height - 8;
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
        this.mSendKey = null; super.destroy();
    }

    protected preload() {
        if (!this.mScene) {
            return;
        }
        this.mScene.load.image("button", Url.getRes("ui/common/button.png"));
        this.mScene.load.image("chat_input_bg", Url.getRes("ui/chat/input_bg.png"));
        this.mScene.load.image("chat_border_bg", Url.getRes("ui/chat/bg.png"));
        this.mScene.load.atlas("chat_atlas", Url.getRes("ui/chat/chat_atlas.png"), Url.getRes("ui/chat/chat_atlas.json"));
        super.preload();
    }

    protected init() {
        if (this.mInitialized) return;
        super.init();
        const size = this.mWorldService.getSize();
        this.mWidth = 464;
        this.mHeight = 281;
        this.setSize(this.mWidth, this.mHeight);

        const border = new NinePatch(this.mScene, 4, size.height - 260, {
            width: this.mWidth,
            height: this.mHeight,
            key: "chat_border_bg",
            columns: [4, 2, 4],
            rows: [4, 2, 4]
        }).setOrigin(0, 0);
        this.add(border);

        const output = this.mScene.make.container(undefined, false);
        this.add(output);

        const background = new RoundRectangle(this.mScene, 0, 0, 2, 2, 3, 0x808080, 0.5);
        output.add(background);

        const track = new RoundRectangle(this.mScene, 100, 10, 10, 10, 10, 0x260e04);
        output.add(track);

        // const text = this.mScene.make.text({
        //     width: 410,
        //     height: 200,
        //     style: { font: "bold 14px YaHei", wordWrap: { width: 410, useAdvancedWrap: true }}
        // }, false);
        // const text = new BBCodeText(this.mScene, 0, 0, "", {
        //     width: 410,
        //     height: 200,
        //     style: {
        //         fontSize: "14px",
        //         wrap: {
        //             mode: "char",
        //             width: 100
        //         }
        //     },
        // });
        const text = new BBCodeText(this.mScene, 0, 0, "", {
            fontSize: "14px",
            wrap: {
                mode: "char",
                width: 400
            },
        });
        output.add(text);

        const thumb = new RoundRectangle(this.mScene, 0, 0, 10, 20, 10, 0xFFFF00);
        output.add(thumb);
        this.mTextArea = new TextArea(this.mScene, {
            x: 230,
            y: size.height - 150,
            width: 440,
            height: 200,

            // background,

            text,
            // text: this.rexUI.add.BBCodeText(),
            // textMask: false,

            slider: {
                track,
                thumb,
            },

        })
            .layout();
        output.add(this.mTextArea);

        const tracks = this.mTextArea.getElement("child");
        if (tracks) {
            // tracks.x += 150;
        }

        const inputContainer = this.mScene.make.container(undefined, false);
        this.add(inputContainer);

        const inputBg = new NinePatch(this.mScene, 8, size.height - 46, {
            width: 370,
            height: 32,
            key: "chat_input_bg",
            columns: [4, 2, 4],
            rows: [4, 2, 4]
        }).setOrigin(0, 0);
        inputContainer.add(inputBg);

        this.mInputText = new InputText(this.mScene, 12, size.height - 40, 10, 10, {
            type: "input",
            fontSize: "14px",
            color: "#808080"
        })
            .resize(360, 20)
            .setOrigin(0, 0)
            .setStyle({ font: "bold 16px YaHei" })
            .on("focus", this.onFocusHandler, this)
            .on("blur", this.onBlurHandler, this);

        inputContainer.add(this.mInputText);

        const sendMsgBtn = new NinePatchButton(this.mScene, 60, size.height - 30, {
            width: 60,
            height: 30,
            key: "button",
            columns: [4, 2, 4],
            rows: [4, 2, 4]
        }, "发送");
        sendMsgBtn.x = 420;
        sendMsgBtn.y = 940;
        sendMsgBtn.on("pointerdown", this.onSendMsgHandler, this);
        inputContainer.add(sendMsgBtn);

        this.mSendKey = this.mScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        this.mVoiceBtn = new CheckButton(this.mScene, this.width - 60, size.height - this.height, "chat_atlas", "voice_normal.png", "voice_selected.png");
        this.add(this.mVoiceBtn);

        this.mMicBtn = new CheckButton(this.mScene, this.width - 20, size.height - this.height, "chat_atlas", "mic_normal.png", "mic_selected.png");
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
