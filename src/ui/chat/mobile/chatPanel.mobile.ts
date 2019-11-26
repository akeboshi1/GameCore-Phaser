import { BaseChatPanel } from "../base.chat.panel";
import { WorldService } from "../../../game/world.service";
import TextArea from "../../../../lib/rexui/templates/ui/textarea/TextArea";
import InputText from "../../../../lib/rexui/plugins/gameobjects/inputtext/InputText";
import { Url, Border, WhiteButton } from "../../../utils/resUtil";
import { NinePatch } from "../../components/nine.patch";
import BBCodeText from "../../../../lib/rexui/plugins/gameobjects/text/bbocdetext/BBCodeText";
import { NinePatchButton } from "../../components/ninepatch.button";
import { MainUIMediator } from "../../baseView/mainUI.mediator";
export class ChatPanelMobile extends BaseChatPanel {
    private mTextArea: TextArea;
    private mInputText: InputText;
    private mBorder;
    private mSendBtn;
    private mInputBg;
    private clickContainer: Phaser.GameObjects.Container;
    private arrow;
    constructor(scene: Phaser.Scene, private mWorld: WorldService) {
        super(scene);
        this.setTween(false);
    }

    public appendChat(val: string) {
        if (this.mTextArea) {
            this.mTextArea.appendText(val);
            this.mTextArea.scrollToBottom();
        }
    }

    public show(param?: any) {
        super.show(param);
        this.tweenView(true);
    }

    public setLocation(x?: number, y?: number) {
        if (!this.mShowing) return;
        if (this.mBorder) {
            this.mBorder.destroy(true);
            this.mBorder = null;
        }
        // DefaultMask在TextBlock中，TextBlock是一个非渲染矩形游戏对象
        const size = this.mWorld.getSize();
        switch (this.mWorld.game.scale.orientation) {
            case Phaser.Scale.Orientation.LANDSCAPE:
                this.mWidth = size.width >> 1;
                this.mHeight = size.height;
                this.setSize(this.mWidth, this.mHeight);
                this.x = 0;
                this.y = 0;
                this.mTextArea.setMinSize(this.mWidth, size.height);
                this.clickContainer.x = this.mWidth / this.mWorld.uiScale + this.clickContainer.width / 2;
                this.clickContainer.y = this.mHeight / (this.mWorld.uiScale * 2);
                this.clickContainer.rotation = Math.PI * .5;
                this.arrow.rotation = Math.PI * .5;
                break;
            case Phaser.Scale.Orientation.PORTRAIT:
                this.mWidth = size.width;
                this.mHeight = size.height - 20 * this.mWorld.uiScale >> 1;
                this.setSize(this.mWidth, this.mHeight);
                this.x = 0;
                this.y = this.mHeight + 20 * this.mWorld.uiScale;
                this.mTextArea.setMinSize(this.mWidth, size.height);
                this.clickContainer.x = size.width / (this.mWorld.uiScale * 2);
                this.clickContainer.y = -this.clickContainer.height >> 1;
                this.clickContainer.rotation = Math.PI;
                this.arrow.rotation = Math.PI * 1.5;
                break;
        }
        this.mBorder = new NinePatch(this.scene, 0, 0, this.mWidth / this.mWorld.uiScale, this.mHeight / this.mWorld.uiScale, Border.getName(), null, Border.getConfig());
        this.mBorder.x = this.mBorder.width / 2;
        this.mBorder.y = this.mBorder.height / 2;
        this.mTextArea.x = this.mBorder.width + 100 * this.mWorld.uiScale >> 1;
        this.mTextArea.childrenMap.child.textMask.setPosition(-10, size.height - this.height).resize();
        this.mInputBg.x = this.mInputBg.width >> 1;
        this.mInputBg.y = this.mBorder.height - this.mInputBg.height / 2;
        this.mSendBtn.x = this.mBorder.width - this.mSendBtn.width;
        this.mSendBtn.y = this.mInputBg.y;
        this.mInputText.x = 2;
        this.mInputText.y = this.mInputBg.y - 12;
        this.addAt(this.mBorder, 0);
        this.scaleX = this.scaleY = this.mWorld.uiScale;
    }

    public destroy() {
        if (this.mSendBtn) this.mSendBtn.destroy(true);
        if (this.mInputBg) this.mInputBg.destroy(true);
        if (this.clickContainer) this.clickContainer.destroy(true);
        if (this.arrow) this.arrow.destroy(true);
        if (this.mBorder) this.mBorder.destroy(true);
        if (this.mTextArea) this.mTextArea.destroy();
        if (this.mInputText) this.mInputText.destroy();
        this.mTextArea = null;
        this.mInputText = null;
        this.mSendBtn = null;
        this.clickContainer = null;
        this.arrow = null;
        this.mBorder = null;
        this.mInputBg = null;
        super.destroy();
    }

    public tweenView(show: boolean) {
        const toAlpha: number = show === true ? 1 : 0;
        this.mScene.tweens.add({
            targets: this,
            duration: 200,
            ease: "Linear",
            props: {
                alpha: { value: toAlpha },
            },
            onComplete: (tween, targets, ship) => {
                if (!show) this.hide();
            },
        });
        this.setLocation();
    }

    protected preload() {
        if (!this.mScene) {
            return;
        }
        this.mScene.load.image("button", Url.getRes("ui/common/button.png"));
        this.mScene.load.image("thumbTexture", Url.getRes("ui/common/common_thumb_texture.png"));
        this.mScene.load.image("track", Url.getRes("ui/common/common_track.png"));
        this.mScene.load.image("channelSelect", Url.getRes("ui/common/common_channelSelect.png"));
        this.mScene.load.image("channelUnSelect", Url.getRes("ui/common/common_channelUnSelect.png"));
        this.mScene.load.image("arrow", Url.getRes("ui/common/common_arrow.png"));
        this.mScene.load.image("chat_input_bg", Url.getRes("ui/chat/input_bg.png"));
        this.mScene.load.image(Border.getName(), Border.getPNG());
        this.scene.load.atlas(WhiteButton.getName(), WhiteButton.getPNG(), WhiteButton.getJSON());
        this.mScene.load.atlas("chat_atlas", Url.getRes("ui/chat/chat_atlas.png"), Url.getRes("ui/chat/chat_atlas.json"));
        super.preload();
    }

    protected init() {
        if (this.mInitialized) return;
        const size = this.mWorld.getSize();
        if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.LANDSCAPE) {
            this.mWidth = size.width >> 1;
            this.mHeight = size.height;
        } else {
            this.mWidth = size.width;
            this.mHeight = size.height >> 1;
        }
        this.setSize(this.mWidth, this.mHeight);

        const text = new BBCodeText(this.mScene, 0, 0, "", {
            fontSize: "20px",
            wrap: {
                mode: "char",
                width: this.mWidth >> 1
            },
        });

        const track = new NinePatchButton(this.mScene, 0, 0, 4, 7, "track", "", {
            left: 0,
            top: 2,
            right: 0,
            bottom: 2
        });
        track.x = this.mWidth / 2;
        track.y = 8 * this.mWorld.uiScale;
        const thumb = new NinePatchButton(this.mScene, 0, 0, 20, 35, "button", "", {
            left: 4,
            top: 4,
            right: 4,
            bottom: 4
        });
        this.add(text);
        this.add(track);
        this.add(thumb);
        this.mTextArea = new TextArea(this.mScene, {
            x: this.mWidth + 20 * this.mWorld.uiScale >> 1,
            y: this.mHeight + 178 * this.mWorld.uiScale >> 1,
            textWidth: this.mWidth,
            textHeight: this.mHeight + 150 * this.mWorld.uiScale,
            text,
            slider: {
                track,
                thumb,
            },
        })
            .layout();
        this.add(this.mTextArea);

        this.mInputBg = new NinePatch(this.scene, 0, 0, 340, 30, "chat_input_bg", null, { left: 4, top: 4, right: 4, bottom: 4 });
        this.add(this.mInputBg);

        this.mInputText = new InputText(this.mScene, 0, 0, 10, 10, {
            type: "input",
            fontSize: "20px",
            color: "#808080"
        })
            .resize(328, 26)
            .setOrigin(0, 0)
            .setStyle({ font: "bold 20px YaHei" })
            .on("focus", this.onFocusHandler, this)
            .on("blur", this.onBlurHandler, this);
        this.add(this.mInputText);

        this.mSendBtn = new NinePatchButton(this.mScene, 0, 0, 60, 30, WhiteButton.getName(), "发送", WhiteButton.getConfig());
        this.mSendBtn.on("pointerdown", this.onSendMsgHandler, this);
        this.add(this.mSendBtn);

        this.clickContainer = this.mScene.make.container(undefined, false);
        const btnBg = new NinePatch(this.scene, 0, 0, 53 / this.mWorld.uiScale, 30 / this.mWorld.uiScale, Border.getName(), null, Border.getConfig());
        this.arrow = this.mScene.make.image(undefined, false);
        this.arrow.setTexture("arrow");
        this.clickContainer.setSize(btnBg.width + 4, btnBg.height + 10);
        this.clickContainer.add(btnBg);
        this.clickContainer.add(this.arrow);
        this.clickContainer.setInteractive();
        this.clickContainer.on("pointerdown", this.clickHandler, this);
        this.add(this.clickContainer);
        this.setLocation();
        super.init();
    }

    private clickHandler() {
        this.mScene.tweens.add({
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
        this.tweenView(false);
        const mainUIMed: MainUIMediator = this.mWorld.uiManager.getMediator(MainUIMediator.NAME) as MainUIMediator;
        mainUIMed.tweenView(true);
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
        this.mWorld.inputManager.enable = false;
    }

    private onBlurHandler() {
        if (!this.mWorld || !this.mWorld.inputManager) {
            return;
        }
        this.mWorld.inputManager.enable = true;
    }

}
