import { BasePanel } from "../Components/BasePanel";
import { InputPanel } from "../Components/Input.panel";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { PicChatInputPanel } from "./PicChatInputPanel";
import { UIAtlasKey, UIAtlasName } from "../Ui.atals.name";
import { BBCodeText, TextArea, UIType } from "apowophaserui";
import { WorldService } from "../../world.service";
import { Font } from "../../../utils/font";

export class PicaChatPanel extends BasePanel {
    private readonly key: string = "pica_chat";
    private readonly MAX_HEIGHT: number;
    private readonly MIN_HEIGHT: number;
    private mBackground: Phaser.GameObjects.Graphics;
    private mScrollBtn: Phaser.GameObjects.Image;
    private mTileContainer: Phaser.GameObjects.Container;
    private mTitleBg: Phaser.GameObjects.Image;
    private mChatBtn: Phaser.GameObjects.Image;
    private mHornBtn: Phaser.GameObjects.Image;
    private mEmojiBtn: Phaser.GameObjects.Image;
    private mNavigateBtn: Phaser.GameObjects.Image;
    private mOutputText: BBCodeText;
    private mTextArea: TextArea;
    private mInputText: InputPanel | PicChatInputPanel;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.MAX_HEIGHT = 460 * this.dpr;
        this.MIN_HEIGHT = 100 * this.dpr;
        this.scale = 1;
        this.UIType = UIType.Scene;
    }

    show(param?: any) {
        this.mShowData = param;
        if (this.mPreLoad) return;
        if (!this.mInitialized) {
            this.preload();
            return;
        }
        if (this.mShow) return;
        if (this.soundGroup && this.soundGroup.open) this.playSound(this.soundGroup.open);
        if (!this.mTweening && this.mTweenBoo) {
            this.showTween(true);
        } else {
            this.mShow = true;
        }
        this.addListen();
        this.checkUpdateActive();
    }

    resize(w: number, h: number) {
        const zoom = this.scale;
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        w = width;
        h = h ? h : 133 * this.dpr;
        this.setSize(width, h);
        const frame = this.scene.textures.getFrame(this.key, "title_bg");
        const scaleRatio = frame ? (width / this.scale) / frame.width : 1;
        this.mTitleBg.scaleX = scaleRatio;
        this.mTitleBg.x = (width / this.scale) / 2;

        this.y = height - this.height;
        this.mBackground.clear();
        this.mBackground.fillStyle(0, 0.6);
        this.mBackground.fillRect(0, 0, width / this.scale, h / this.scale);
        this.mTextArea.childrenMap.child.setMinSize(w, (h - 16 * this.dpr) * zoom);
        this.mTextArea.layout();
        this.mTextArea.setPosition(this.width / 2 + 4 * this.dpr, this.y + this.mTextArea.height / 2 + 10 * this.dpr * zoom);
        const textMask = this.mTextArea.childrenMap.text;
        textMask.y = 8 * this.dpr;
        this.mTextArea.scrollToBottom();

        this.mNavigateBtn.x = width / this.scale - this.mNavigateBtn.width * 0.5 - 5 * this.dpr;
        super.resize(w, h);
    }

    public appendChat(val: string) {
        if (this.mTextArea) {
            this.mTextArea.appendText(val);
            this.mTextArea.scrollToBottom();
        }

        if (this.mInputText) {
            (<PicChatInputPanel>this.mInputText).appendChat(val);
        }
    }

    public hide() {
        this.mShow = false;
        this.removeInteractive();
    }

    public addListen() {
        if (!this.mInitialized) return;
        this.mChatBtn.setInteractive();
        this.mEmojiBtn.setInteractive();
        this.mScrollBtn.setInteractive();
        this.mNavigateBtn.setInteractive();
        this.mTextArea.childrenMap.child.setInteractive();

        this.mScrollBtn.on("drag", this.onDragHandler, this);
        this.scene.input.setDraggable(this.mScrollBtn, true);
        this.mNavigateBtn.on("pointerup", this.onShowNavigateHandler, this);
        this.mChatBtn.on("pointerup", this.onShowInputHanldler, this);
    }

    public removeListen() {
        if (!this.mInitialized) return;
        this.mChatBtn.disableInteractive();
        this.mEmojiBtn.disableInteractive();
        this.mScrollBtn.disableInteractive();
        this.mNavigateBtn.disableInteractive();
        this.mTextArea.childrenMap.child.disableInteractive();

        this.mScrollBtn.off("drag", this.onDragHandler, this);
        this.mNavigateBtn.off("pointerup", this.onShowNavigateHandler, this);
        this.mChatBtn.off("pointerup", this.onShowInputHanldler, this);
    }

    updateUIState(active?: op_pkt_def.IPKT_UI) {
        if (!this.mInitialized) {
            return;
        }
        if (active.name === "picachat.navigatebtn") {
            if (this.mNavigateBtn.visible !== active.visible) {
                this.mNavigateBtn.visible = active.visible;
                // if (active.visible) {
                //     this.addListen();
                // } else {
                //     this.removeListen();
                // }
            }
        }
    }

    public destroy() {
        if (this.mBackground) this.mBackground.disableInteractive();
        super.destroy();
    }

    protected preload() {
        this.addAtlas(this.key, "pica_chat/pica_chat.png", "pica_chat/pica_chat.json");
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.commonUrl + ".png", UIAtlasName.commonUrl + ".json");
        super.preload();
    }

    protected init() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        this.mBackground = this.scene.make.graphics(undefined, false);
        const zoom = this.scale;
        this.setSize(width, 135 * this.dpr);
        this.mTileContainer = this.scene.make.container(undefined, false);
        this.mScrollBtn = this.scene.make.image({ x: 21 * this.dpr * zoom, key: this.key, frame: "scroll_btn" }, false).setScale(zoom);
        this.mTitleBg = this.scene.make.image({ key: this.key, frame: "title_bg" }, false).setScale(zoom);
        this.mChatBtn = this.scene.make.image({ x: 96 * this.dpr * zoom, key: this.key, frame: "chat_icon" }, false).setScale(zoom);
        this.mHornBtn = this.scene.make.image({ x: 159 * this.dpr * zoom, key: this.key, frame: "horn_icon" }, false).setScale(zoom);
        this.mEmojiBtn = this.scene.make.image({ x: 218 * this.dpr * zoom, key: this.key, frame: "emoji" }, false).setScale(zoom);
        this.mNavigateBtn = this.scene.make.image({ x: 281 * this.dpr, key: this.key, frame: "more_btn" }, false).setScale(zoom);
        const space = 20 * this.dpr;
        this.mTitleBg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.mScrollBtn.x = this.mScrollBtn.width * 0.5 + 5 * this.dpr;
        this.mScrollBtn.y = -this.mScrollBtn.height / 2 + this.mTitleBg.height;

        this.mChatBtn.x = this.mScrollBtn.x + this.mScrollBtn.width * 0.5 + space + this.mChatBtn.width * 0.5;
        this.mChatBtn.y = -this.mChatBtn.height / 2 + this.mTitleBg.height;
        this.mChatBtn.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);

        this.mHornBtn.x = this.mChatBtn.x + this.mChatBtn.width * 0.5 + space + this.mHornBtn.width * 0.5;
        this.mHornBtn.y = -this.mHornBtn.height / 2 + this.mTitleBg.height;
        this.mHornBtn.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);

        this.mEmojiBtn.x = this.mHornBtn.x + this.mHornBtn.width * 0.5 + space + this.mEmojiBtn.width * 0.5;
        this.mEmojiBtn.y = -this.mEmojiBtn.height / 2 + this.mTitleBg.height;
        this.mEmojiBtn.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);

        this.mNavigateBtn.y = -this.mNavigateBtn.height / 2 + this.mTitleBg.height;
        this.mNavigateBtn.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);

        this.mOutputText = new BBCodeText(this.mScene, 0, 0, "", {
            fontSize: 14 * this.dpr / zoom + "px",
            fontFamily: Font.DEFULT_FONT,
            stroke: "#000000",
            strokeThickness: 1 * this.dpr * zoom,
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
                width: width - 12 * this.dpr * zoom
            }
        });
        (<any>this.mOutputText).setResolution(this.dpr);
        const background = this.scene.make.graphics(undefined, false);
        this.mTextArea = new TextArea(this.mScene, {
            x: width / 2 + 4 * this.dpr * zoom,
            y: 160 * this.dpr * zoom,
            // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, 0.2),
            textWidth: width - 4 * this.dpr * zoom,
            textHeight: this.MAX_HEIGHT,
            text: this.mOutputText,
        })
            .layout();
        this.mTileContainer.add([
            this.mTitleBg,
            this.mChatBtn,
            this.mHornBtn,
            this.mEmojiBtn,
            this.mScrollBtn,
            this.mNavigateBtn
        ]);
        this.add([
            this.mBackground,
            this.mTileContainer,
            this.mTextArea,
            this.mOutputText,
            background,
        ]);
        this.mTextArea.setSliderEnable(false);
        // this.mTextArea.childrenMap.child.disableInteractive();
        this.resize(this.width, 133 * this.dpr);
        super.init();
        this.removeInteractive();
        // this.addActionListener();

        // this.appendChat("小盆友[color=yellow]进入房间[/color]\n");
        // this.appendChat("一直狐狸[color=yellow]离开房间[/color]\n");
        // this.appendChat("[color=#ffffff][当前]小盆友：玩家注册后，账户等级为Lv1级。[/color]\n");
        // this.appendChat("[color=#66ffff][喇叭]。用户在游戏内游玩时，使用该道具，经验值收益为4倍增长，时间上限为4h[/color]\n");
        // this.appendChat("[color=#ffff00]等级提升为6级[/color]\n");
    }

    private onDragHandler(pointer, dragX, dragY) {
        const height = this.height + (pointer.prevPosition.y - pointer.position.y);
        if (height > this.MAX_HEIGHT || height < this.MIN_HEIGHT) {
            return;
        }
        this.resize(this.width, height);
    }

    private onShowNavigateHandler() {
        this.emit("showNavigate");
    }

    private onShowInputHanldler() {
        // new InputPanel(this.scene);
        if (this.mInputText) {
            return;
        }
        // const pktGlobal = window["pktGlobal"];
        // if (pktGlobal && pktGlobal.envPlatform === "Cordova") {
        //     if (this.scene.cache.json.has("quickchat")) {
        //         this.openAppInputPanel();
        //     } else {
        //         const jsonUrl = `../../resources/ui/quickchat/${i18n.language}.json`;
        //         this.scene.load.json("quickchat", jsonUrl);
        //         this.scene.load.on(Phaser.Loader.Events.FILE_COMPLETE, this.openAppInputPanel, this);
        //         this.scene.load.start();
        //     }
        // } else {
        this.mInputText = new InputPanel(this.scene, this.mWorld);
        this.mInputText.once("close", this.sendChat, this);
        // }
    }

    private sendChat(val: string) {
        this.mInputText = undefined;
        if (!val) {
            return;
        }
        this.emit("chat", val);
    }

    private openAppInputPanel() {
        if (this.scene.cache.json.has("quickchat")) {
            this.mInputText = new PicChatInputPanel(this.scene, this.mWorld, this.key, this.mTextArea.text);
            this.mInputText.once("close", this.appCloseChat, this);
            this.mInputText.on("send", this.appSendChat, this);
            this.mInputText.setQuickChatData(this.scene.cache.json.get("quickchat"));
            if (this.parentContainer) this.parentContainer.visible = false;
            this.scene.load.off(Phaser.Loader.Events.FILE_COMPLETE, this.openAppInputPanel, this);
        }
    }
    private appSendChat(val: string) {
        if (!val) {
            return;
        }
        this.emit("chat", val);
    }

    private appCloseChat() {
        this.mInputText.off("send", this.appSendChat, this);
        this.mInputText = undefined;
        if (this.parentContainer) this.parentContainer.visible = true;
    }
    private checkUpdateActive() {
        const arr = this.mWorld.uiManager.getActiveUIData("PicaChat");
        if (arr) {
            for (const data of arr) {
                this.updateUIState(data);
            }
        }

    }
}