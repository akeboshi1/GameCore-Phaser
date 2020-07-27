import { WorldService } from "../../game/world.service";
import { TextArea, InputText, BBCodeText, RoundRectangle, NineSliceButton, NinePatch } from "apowophaserui";
import { Border, Url } from "../../utils/resUtil";
import { CheckButton } from "../components/check.button";
import { BaseChatPanel } from "./base.chat.panel";

export class ChatPanelPC extends BaseChatPanel {
    private mTextArea: TextArea;
    private mInputText: InputText;
    private mVoiceBtn: CheckButton;
    private mMicBtn: CheckButton;
    private mSendKey: Phaser.Input.Keyboard.Key;
    private mPreHei: number = 0;
    private mPreWid: number = 0;
    private outPut: Phaser.GameObjects.Container;
    private sendMsgBtn: NineSliceButton;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
    }

    public appendChat(val: string) {
        if (this.mTextArea) {
            this.mTextArea.appendText(val);
            this.mTextArea.scrollToBottom();
        }
    }

    public tweenExpand(show: boolean) {
        if (!this.scene) return;
        const baseX: number = 0;
        const toX: number = show === true ? baseX : baseX - 200;
        const toAlpha: number = show === true ? 1 : 0;
        this.scene.tweens.add({
            targets: this,
            duration: 200,
            ease: "Cubic.Out",
            props: {
                x: { value: toX },
                alpha: { value: toAlpha },
            },
        });
    }

    public setPosition(x?: number, y?: number): this {
        if (!this.mInitialized) return;
        // DefaultMask在TextBlock中，TextBlock是一个非渲染矩形游戏对象
        const size = this.mWorld.getSize();
        super.setPosition(0, size.height - this.mPreHei);
        if (this.mTextArea) {
            // this.mTextArea.childrenMap.child.setMinSize(width, (h - 16 * this.dpr) * zoom);
            // this.mTextArea.layout();
            // this.mTextArea.setPosition(this.width / 2 + 4 * this.dpr, this.y + this.mTextArea.height / 2 + 10 * this.dpr * zoom);
            const textMask = (<any>this.mTextArea).childrenMap.text;
            textMask.y = size.height - this.height + 25 * this.dpr;
            this.mTextArea.scrollToBottom();
            // 每次resize更新textBlock中的textMask的位置
            // this.mTextArea.childrenMap.child.textMask.setPosition(undefined, size.height - this.height + 30).resize();
        }
        return this;
    }

    public addListen() {
        if (!this.mInitialized) return;
        if (this.sendMsgBtn) this.sendMsgBtn.on("pointerdown", this.onSendMsgHandler, this);
        if (this.mVoiceBtn) this.mVoiceBtn.on("selected", this.onSelectedVoiceHandler, this);
        if (this.mMicBtn) this.mMicBtn.on("selected", this.onSelectedMicHandler, this);
        if (this.mInputText) {
            this.mInputText.on("focus", this.onFocusHandler, this);
            this.mInputText.on("blur", this.onBlurHandler, this);
        }
    }

    public removeListen() {
        super.removeListen();
        if (!this.mInitialized) return;
        if (this.sendMsgBtn) this.sendMsgBtn.off("pointerdown", this.onSendMsgHandler, this);
        if (this.mVoiceBtn) this.mVoiceBtn.off("selected", this.onSelectedVoiceHandler, this);
        if (this.mMicBtn) this.mMicBtn.off("selected", this.onSelectedMicHandler, this);
        if (this.mInputText) {
            this.mInputText.off("focus", this.onFocusHandler, this);
            this.mInputText.off("blur", this.onBlurHandler, this);
        }
    }

    public destroy() {
        super.destroy();
    }

    protected preload() {
        if (!this.scene) {
            return;
        }
        this.scene.load.image("button", Url.getRes("ui/common/button.png"));
        this.scene.load.image("thumbTexture", Url.getRes("ui/common/common_thumb_texture.png"));
        this.scene.load.image("track", Url.getRes("ui/common/common_track.png"));
        this.scene.load.image("chat_input_bg", Url.getRes("ui/chat/input_bg.png"));
        // this.scene.load.image("chat_border_bg", Url.getRes("ui/chat/bg.png"));
        this.scene.load.image(Border.getName(), Border.getPNG());
        this.scene.load.atlas("chat_atlas", Url.getRes("ui/chat/chat_atlas.png"), Url.getRes("ui/chat/chat_atlas.json"));
        super.preload();
    }

    protected init() {
        if (this.mInitialized) return;
        const size = this.mWorld.getSize();
        this.mPreHei = size.height;
        this.mPreWid = size.width;
        this.setSize(464, 281);

        const border = new NinePatch(this.scene, 0, 0, this.width, this.height, Border.getName(), null, undefined, undefined, Border.getConfig());
        border.x = 4 * this.mWorld.uiScale + border.width * border.originX;
        border.y = size.height - 260 * this.mWorld.uiScale + border.height * border.originY;
        this.add(border);

        this.outPut = this.scene.make.container(undefined, false);
        this.add(this.outPut);

        const background = new RoundRectangle(this.scene, 0, 0, 2, 2, 3, 0x808080, 0.5);
        this.outPut.add(background);

        const track = new NineSliceButton(this.scene, {
            x: 0, y: 0, width: 4, height: 7, key: "track", dpr: this.dpr, scale: this.scale, config: {
                left: 0,
                top: 2,
                right: 0,
                bottom: 2
            }
        });
        track.x = 100 * this.mWorld.uiScale;
        track.y = 10 * this.mWorld.uiScale;
        this.outPut.add(track);

        const text = new BBCodeText(this.scene, 0, 0, "", {
            fontSize: "14px",
            wrap: {
                mode: "char",
                width: 400 * this.mWorld.uiScale
            },
        });
        this.outPut.add(text);

        const thumb = new NineSliceButton(this.scene, {
            x: 0, y: 0, width: 20, height: 35, key: "button", dpr: this.dpr, scale: this.scale, config: {
                left: 4,
                top: 4,
                right: 4,
                bottom: 4
            }
        });
        // const indicator = new NinePatchButton(this.scene, 0, 0, 8, 10, "thumbTexture", "", {
        //     left: 0,
        //     top: 0,
        //     right: 0,
        //     bottom: 0
        // });
        this.outPut.add(thumb);
        // this.outPut.add(indicator);
        this.mTextArea = new TextArea(this.scene, {
            x: 230 * this.mWorld.uiScale,
            y: size.height - 155 * this.mWorld.uiScale,
            textWidth: 430,
            textHeight: 200,
            text,
            slider: {
                track,
                // indicator,
                thumb,
            },

        })
            .layout();
        this.outPut.add(this.mTextArea);

        const tracks = (<any>this.mTextArea).getElement("child");
        if (tracks) {
            // tracks.x += 150;
        }

        const inputContainer = this.scene.make.container(undefined, false);
        this.add(inputContainer);
        const inputBg = new NinePatch(this.scene, 0, 0, 370, 32, "chat_input_bg", null, undefined, undefined, { left: 4, top: 4, right: 4, bottom: 4 });
        inputBg.x = 8 * this.mWorld.uiScale + inputBg.width * inputBg.originX;
        inputBg.y = size.height - 46 * this.mWorld.uiScale + inputBg.height * inputBg.originY;
        inputContainer.add(inputBg);

        this.mInputText = new InputText(this.scene, 0, 0, 10, 10, {
            type: "input",
            fontSize: "14px",
            color: "#808080"
        })
            .resize(360, 20)
            .setOrigin(0, 0)
            .setStyle({ font: "bold 16px YaHei" });
        this.mInputText.x = 12 * this.mWorld.uiScale;
        this.mInputText.y = size.height - 40 * this.mWorld.uiScale;
        inputContainer.add(this.mInputText);

        this.sendMsgBtn = new NineSliceButton(this.scene, {
            x: 0, y: 0, width: 60, height: 30, key: "button", text: "发送", dpr: this.dpr, scale: this.scale, config: {
                left: 4,
                top: 4,
                right: 4,
                bottom: 4
            }
        });
        this.sendMsgBtn.x = this.width - this.sendMsgBtn.width + 10 * this.mWorld.uiScale;
        this.sendMsgBtn.y = size.height - this.sendMsgBtn.height;
        this.add(this.sendMsgBtn);

        this.mSendKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        this.mVoiceBtn = new CheckButton(this.scene, 0, 0, "chat_atlas", "voice_normal.png", "voice_selected.png");
        this.mVoiceBtn.x = this.width - 60 * this.mWorld.uiScale;
        this.mVoiceBtn.y = size.height - this.height;
        this.add(this.mVoiceBtn);

        this.mMicBtn = new CheckButton(this.scene, 0, 0, "chat_atlas", "mic_normal.png", "mic_selected.png");
        this.mMicBtn.x = this.width - 20 * this.mWorld.uiScale;
        this.mMicBtn.y = size.height - this.height;
        this.add(this.mMicBtn);

        this.setPosition();
        super.init();
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
        this.mMicBtn.selected = val;
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
        if (!this.mWorld || !this.mWorld.inputManager) {
            return;
        }
        if (this.mSendKey) {
            this.mSendKey.on("down", this.onDownEnter, this);
        }
    }

    private onBlurHandler() {
        if (!this.mWorld || !this.mWorld.inputManager) {
            return;
        }
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
