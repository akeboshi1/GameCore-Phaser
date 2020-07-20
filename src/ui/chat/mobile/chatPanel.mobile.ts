import { BaseChatPanel } from "../base.chat.panel";
import { WorldService } from "../../../game/world.service";
import { TextArea, InputText, BBCodeText, NinePatch, NineSliceButton } from "@apowo/phaserui";
import { Url, Border, WhiteButton } from "../../../utils/resUtil";
export class ChatPanelMobile extends BaseChatPanel {
    private mTextArea: TextArea;
    private mInputText: InputText;
    private mBorder: NinePatch;
    private mSendBtn: NineSliceButton;
    private mInputBg: NinePatch;
    private clickContainer: Phaser.GameObjects.Container;
    private arrow: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.setTween(false);
    }

    public addListen() {
        this.mSendBtn.on("pointerdown", this.onSendMsgHandler, this);
        this.clickContainer.on("pointerdown", this.clickHandler, this);
        this.mInputText.on("focus", this.onFocusHandler, this);
        this.mInputText.on("blur", this.onBlurHandler, this);
    }

    public removeListen() {
        this.mSendBtn.off("pointerdown", this.onSendMsgHandler, this);
        this.clickContainer.off("pointerdown", this.clickHandler, this);
        this.mInputText.off("focus", this.onFocusHandler, this);
        this.mInputText.off("blur", this.onBlurHandler, this);
    }

    public appendChat(val: string) {
        if (this.mTextArea) {
            this.mTextArea.appendText(val);
            this.mTextArea.scrollToBottom();
        }
    }

    public show(param?: any) {
        super.show(param);
        this.tweenExpand(true);
    }

    public setPosition(x?: number, y?: number): this {
        if (!this.mShow) return;
        // DefaultMask在TextBlock中，TextBlock是一个非渲染矩形游戏对象
        const size = this.mWorld.getSize();
        let track;
        let thumb;
        let text;
        if (this.mTextArea) {
            this.mTextArea.destroy();
            this.mTextArea = null;
            text = new BBCodeText(this.scene, 0, 0, "", {
                fontSize: "20px",
                wrap: {
                    mode: "char",
                    width: this.width >> 1
                },
            });

            track = new NineSliceButton(this.scene, 0, 0, 4, 7, "track", "", "", this.dpr, this.scale, {
                left: 0,
                top: 2,
                right: 0,
                bottom: 2
            });
            // track.x = this.width / 2;
            // track.y = 8 * this.mWorld.uiScale;
            thumb = new NineSliceButton(this.scene, 0, 0, 20, 35, "button", "", "", this.dpr, this.scale, {
                left: 4,
                top: 4,
                right: 4,
                bottom: 4
            });
            this.add(text);
            this.add(track);
            this.add(thumb);
        }
        if (this.mInputText) {
            this.mInputText.destroy();
            this.mInputText = null;
            this.mInputText = new InputText(this.scene, 0, 0, 10, 10, {
                type: "input",
                fontSize: "20px",
                color: "#808080"
            })
                .resize(328, 26)
                .setOrigin(0, 0)
                .setStyle({ font: "bold 20px YaHei" });
            // .on("focus", this.onFocusHandler, this)
            // .on("blur", this.onBlurHandler, this);
        }
        if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.LANDSCAPE) {
            this.width = size.width >> 1;
            this.height = size.height;
            this.mBorder.resize(this.width / this.mWorld.uiScale, this.height / this.mWorld.uiScale);
            this.x = 0;
            this.y = 0;
            this.clickContainer.x = this.width / this.mWorld.uiScale + this.clickContainer.width / 2;
            this.clickContainer.y = this.height / (this.mWorld.uiScale * 2);
            this.clickContainer.rotation = Math.PI * .5;
            this.arrow.rotation = Math.PI * .5;
            this.mInputBg.y = this.mBorder.height - this.mInputBg.height / 2;
            this.mTextArea = new TextArea(this.scene, {
                x: this.width * .5 / this.mWorld.uiScale,
                y: this.height / 2,
                textWidth: this.mBorder.width - 20 * this.mWorld.uiScale,
                textHeight: this.height,
                text,
                slider: {
                    track,
                    thumb,
                },
                clamplChildOY: true,
            });
            this.mInputText.setPosition(2, this.mInputBg.y - 12 * this.mWorld.uiScale);
        } else {
            this.width = size.width;
            this.height = size.height / 2;
            this.mBorder.resize(this.width / this.mWorld.uiScale, this.height / this.mWorld.uiScale);
            this.x = 0;
            this.y = this.height + 20 * this.mWorld.uiScale;
            this.mInputBg.y = this.mBorder.height - this.mInputBg.height;
            this.mTextArea = new TextArea(this.scene, {
                x: (this.width - 15) / this.mWorld.uiScale >> 1,
                y: (size.height / 2 - this.mSendBtn.height - 20) / this.mWorld.uiScale >> 1,
                textWidth: this.mBorder.width - 20 * this.mWorld.uiScale,
                textHeight: (size.height / 2 - this.mSendBtn.height - 20) / this.mWorld.uiScale,
                text,
                slider: {
                    track,
                    thumb,
                },
                scroller: {
                    bounds: [0, this.height >> 1],
                },
                clamplChildOY: true,
                backDeceleration: true,
            });
            // this.mTextArea.x = this.mTextArea.childrenMap.child.minWidth >> 1;
            // this.mTextArea.y = this.mTextArea.childrenMap.child.minHeight >> 1;
            this.clickContainer.x = size.width / (this.mWorld.uiScale * 2);
            this.clickContainer.y = -this.clickContainer.height >> 1;
            const silder = (<any>this.mTextArea).getElement("slider");
            silder.y = this.height >> 1;
            this.clickContainer.rotation = Math.PI;
            this.arrow.rotation = Math.PI * 1.5;
            this.mInputText.setPosition(2, this.mInputBg.y - 6 * this.mWorld.uiScale);
        }
        this.mTextArea.layout();
        this.add(this.mTextArea);
        (<any>this.mTextArea).childrenMap.child.textMask.setPosition(-5, size.height - this.height).resize(this.width + 18, this.height - this.mSendBtn.height);
        // this.mBorder = new NinePatch(this.scene, 0, 0, this.width / this.mWorld.uiScale, this.height / this.mWorld.uiScale, Border.getName(), null, Border.getConfig());
        this.mBorder.x = this.mBorder.width / 2;
        this.mBorder.y = this.mBorder.height / 2;
        this.setSize(this.width, this.height);
        // this.mTextArea.x = this.mBorder.width + 100 * this.mWorld.uiScale >> 1;
        this.mInputBg.x = this.mInputBg.width >> 1;
        this.mSendBtn.x = this.mBorder.width - this.mSendBtn.width;
        this.mSendBtn.y = this.mInputBg.y;
        this.scale = this.mWorld.uiScale;
        this.add(this.mInputText);
        return this;
    }

    public destroy() {
        // if (this.mSendBtn) this.mSendBtn.destroy(true);
        // if (this.mInputBg) this.mInputBg.destroy(true);
        // if (this.clickContainer) this.clickContainer.destroy(true);
        // if (this.arrow) this.arrow.destroy(true);
        // if (this.mBorder) this.mBorder.destroy(true);
        // if (this.mTextArea) this.mTextArea.destroy();
        // if (this.mInputText) this.mInputText.destroy();
        // this.mTextArea = null;
        // this.mInputText = null;
        // this.mSendBtn = null;
        // this.clickContainer = null;
        // this.arrow = null;
        // this.mBorder = null;
        // this.mInputBg = null;
        super.destroy();
    }

    public tweenExpand(show: boolean) {
        const toAlpha: number = show === true ? 1 : 0;
        this.scene.tweens.add({
            targets: this,
            duration: 200,
            ease: "Linear",
            props: {
                alpha: { value: toAlpha },
            },
            onComplete: (tween, targets, ship) => {
                if (!show) this.hide();
                this.addListen();
            },
        });
        if (show) this.setPosition();
    }

    public hide() {
        this.removeListen();
        super.hide();
    }

    protected preload() {
        if (!this.scene) {
            return;
        }
        this.scene.load.image("button", Url.getRes("ui/common/button.png"));
        this.scene.load.image("thumbTexture", Url.getRes("ui/common/common_thumb_texture.png"));
        this.scene.load.image("track", Url.getRes("ui/common/common_track.png"));
        this.scene.load.image("channelSelect", Url.getRes("ui/common/common_channelSelect.png"));
        this.scene.load.image("channelUnSelect", Url.getRes("ui/common/common_channelUnSelect.png"));
        this.scene.load.image("arrow", Url.getRes("ui/common/common_arrow.png"));
        this.scene.load.image("chat_input_bg", Url.getRes("ui/chat/input_bg.png"));
        this.scene.load.image(Border.getName(), Border.getPNG());
        this.scene.load.atlas(WhiteButton.getName(), WhiteButton.getPNG(), WhiteButton.getJSON());
        this.scene.load.atlas("chat_atlas", Url.getRes("ui/chat/chat_atlas.png"), Url.getRes("ui/chat/chat_atlas.json"));
        super.preload();
    }

    protected init() {
        if (this.mInitialized) return;
        const size = this.mWorld.getSize();
        if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.LANDSCAPE) {
            this.width = size.width >> 1;
            this.height = size.height;
        } else {
            this.width = size.width;
            this.height = size.height >> 1;
        }
        this.setSize(this.width, this.height);

        this.mBorder = new NinePatch(this.scene, 0, 0, this.width / this.mWorld.uiScale, this.height / this.mWorld.uiScale, Border.getName(), null, undefined, undefined, Border.getConfig());
        this.mBorder.x = this.mBorder.width / 2;
        this.mBorder.y = this.mBorder.height / 2;
        this.addAt(this.mBorder, 0);

        const text = new BBCodeText(this.scene, 0, 0, "", {
            fontSize: "20px",
            wrap: {
                mode: "char",
                width: this.width >> 1
            },
        });

        const track = new NineSliceButton(this.scene, 0, 0, 4, 7, "track", "", "", this.dpr, this.scale, {
            left: 0,
            top: 2,
            right: 0,
            bottom: 2
        });
        track.x = this.width / 2;
        track.y = 8 * this.mWorld.uiScale;
        const thumb = new NineSliceButton(this.scene, 0, 0, 20, 35, "button", "", "", this.dpr, this.scale, {
            left: 4,
            top: 4,
            right: 4,
            bottom: 4
        });
        this.add(text);
        this.add(track);
        this.add(thumb);
        this.mTextArea = new TextArea(this.scene, {
            x: this.width >> 1,
            y: this.height + 178 * this.mWorld.uiScale >> 1,
            textWidth: this.width,
            textHeight: this.height + 150 * this.mWorld.uiScale,
            text,
            slider: {
                track,
                thumb,
            },
        })
            .layout();
        this.add(this.mTextArea);

        this.mInputBg = new NinePatch(this.scene, 0, 0, 340, 30, "chat_input_bg", null, undefined, undefined, { left: 4, top: 4, right: 4, bottom: 4 });
        this.add(this.mInputBg);

        this.mInputText = new InputText(this.scene, 0, 0, 10, 10, {
            type: "input",
            fontSize: "20px",
            color: "#808080"
        })
            .resize(328, 26)
            .setOrigin(0, 0)
            .setStyle({ font: "bold 20px YaHei" })
            .on("focus", this.onFocusHandler, this)
            .on("blur", this.onBlurHandler, this);

        this.mSendBtn = new NineSliceButton(this.scene, 0, 0, 60, 30, WhiteButton.getName(), "", "发送", this.dpr, this.scale, WhiteButton.getConfig());
        this.add(this.mSendBtn);

        this.clickContainer = this.scene.make.container(undefined, false);
        const btnBg = new NinePatch(this.scene, 0, 0, 53 / this.mWorld.uiScale, 30 / this.mWorld.uiScale, Border.getName(), null, undefined, undefined, Border.getConfig());
        this.arrow = this.scene.make.image(undefined, false);
        this.arrow.setTexture("arrow");
        this.clickContainer.setSize(btnBg.width + 4, btnBg.height + 10);
        this.clickContainer.add(btnBg);
        this.clickContainer.add(this.arrow);
        this.clickContainer.setInteractive();
        this.add(this.clickContainer);
        this.add(this.mInputText);
        this.setPosition();
        super.init();
    }

    private clickHandler() {
        this.scene.tweens.add({
            targets: this.clickContainer,
            duration: 50,
            ease: "Linear",
            props: {
                scaleX: { value: .5 },
                scaleY: { value: .5 },
            },
            yoyo: true,
            repeat: 0,
        });
        this.clickContainer.scaleX = this.clickContainer.scaleY = 1;
        this.tweenExpand(false);
        this.mWorld.uiManager.baseFaceTween(true);
    }

    private onSendMsgHandler() {
        const text = this.mInputText.text;
        if (text.length > 0) {
            this.emit("sendChat", text);
            this.mInputText.setText("");
            this.mInputText.setBlur();
        }
        // // =====================tween out/in baseView
        // const baseViewMed: MainUIMediator = this.mWorld.uiManager.getMediator(MainUIMediator.NAME) as MainUIMediator;
        // if (baseViewMed) {
        //     baseViewMed.tweenView(true);
        // }
    }

    private onFocusHandler() {
        if (!this.mWorld || !this.mWorld.inputManager) {
            return;
        }
        // this.mWorld.inputManager.enable = false;
    }

    private onBlurHandler() {
        if (!this.mWorld || !this.mWorld.inputManager) {
            return;
        }
        // this.mWorld.inputManager.enable = true;
    }

}
