import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import TextArea from "../../../lib/rexui/lib/ui/textarea/TextArea";
import BBCodeText from "../../../lib/rexui/lib/plugins/gameobjects/text/bbocdetext/BBCodeText.js";
import { Font } from "../../utils/font";
import { InputPanel } from "../components/input.panel";

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
    private mInputText: InputPanel;
    private mScale: number = 1;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.setTween(false);
        this.MAX_HEIGHT = 460 * this.dpr;
        this.MIN_HEIGHT = 100 * this.dpr;
        this.scale = 1;
        this.mScale = this.mWorld.uiScaleNew;
    }

    resize(w: number, h: number) {
        const zoom = this.mScale;
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        const frame = this.scene.textures.getFrame(this.key, "title_bg.png");
        const scaleRatio = (width / frame.width) * zoom;
        this.mTitleBg.scaleX = scaleRatio;
        this.mTitleBg.x = width / 2 / zoom;

        this.y = height - this.height * this.scale;
        this.mBackground.clear();
        this.mBackground.fillStyle(0, 0.6);
        this.mBackground.fillRect(0, 0, w, h);
        // this.mBackground.setInteractive();

        this.mNavigateBtn.x = width - this.mNavigateBtn.width / 2 - 5 * this.dpr * zoom;
        this.mNavigateBtn.y = h - this.mNavigateBtn.height / 2 - 5 * this.dpr * zoom;

        this.mScrollBtn.x = width - this.mScrollBtn.displayWidth / 2 - 2 * this.dpr * zoom;

        this.mTextArea.childrenMap.child.setMinSize(w, (h - 16 * this.dpr) * zoom);
        this.mTextArea.layout();
        this.mTextArea.setPosition(this.width / 2 + 4 * this.dpr, this.y + this.mTextArea.height / 2 + 10 * this.dpr * zoom);
        const textMask = this.mTextArea.childrenMap.text;
        textMask.y = 8 * this.dpr;
        this.mTextArea.scrollToBottom();
        super.resize(w, h);
    }

    public appendChat(val: string) {
        if (this.mTextArea) {
            this.mTextArea.appendText(val);
            this.mTextArea.scrollToBottom();
        }
    }
    public hide() {
        this.mShowing = false;
    }

    public addListen() {
        // this.mBackground.setInteractive();
        this.mChatBtn.setInteractive();
        this.mEmojiBtn.setInteractive();
        this.mScrollBtn.setInteractive();
        this.mNavigateBtn.setInteractive();
        this.mTextArea.childrenMap.child.setInteractive();

        this.scene.input.setDraggable(this.mScrollBtn, true);
        this.mScrollBtn.on("drag", this.onDragHandler, this);
        this.mChatBtn.on("pointerup", this.onChatHandler, this);
        this.mNavigateBtn.on("pointerup", this.onShowNavigateHandler, this);

        this.mChatBtn.on("pointerup", this.onShowInputHanldler, this);
    }

    public removeListen() {
        this.mBackground.disableInteractive();
        this.mChatBtn.disableInteractive();
        this.mEmojiBtn.disableInteractive();
        this.mScrollBtn.disableInteractive();
        this.mNavigateBtn.disableInteractive();
        this.mTextArea.childrenMap.child.disableInteractive();

        // this.scene.input.setDraggable(this.mScrollBtn, false);
        this.mScrollBtn.off("drag", this.onDragHandler, this);
        this.mChatBtn.off("pointerup", this.onChatHandler, this);
        // this.resize(this.width, this.height);

        this.mChatBtn.off("pointerup", this.onShowInputHanldler, this);
    }

    protected preload() {
        this.addAtlas(
            this.key,
            "pica_chat/pica_chat.png",
            "pica_chat/pica_chat.json"
        );
        super.preload();
    }

    protected init() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        this.mBackground = this.scene.make.graphics(undefined, false);
        const zoom = this.mScale;
        this.setSize(width, 135 * this.dpr);

        this.mTileContainer = this.scene.make.container(undefined, false);
        this.mScrollBtn = this.scene.make
            .image(
                {
                    key: this.key,
                    frame: "scroll_btn.png"
                },
                false
            )
            .setScale(zoom)
            .setInteractive();

        this.mTitleBg = this.scene.make.image(
            {
                key: this.key,
                frame: "title_bg.png"
            },
            false
        )
            .setScale(zoom);
        this.mTitleBg.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

        this.mChatBtn = this.scene.make
            .image(
                {
                    x: 33 * this.dpr * zoom,
                    key: this.key,
                    frame: "chat_icon.png"
                },
                false
            )
            .setScale(zoom)
            .setInteractive();
        this.mChatBtn.y = -this.mChatBtn.height / 2 + this.mTitleBg.height;

        this.mHornBtn = this.scene.make
            .image(
                {
                    x: 96 * this.dpr * zoom,
                    key: this.key,
                    frame: "horn_icon.png"
                },
                false
            )
            .setScale(zoom)
            .setInteractive();
        this.mHornBtn.y = -this.mHornBtn.height / 2 + this.mTitleBg.height;

        this.mEmojiBtn = this.scene.make
            .image(
                {
                    x: 155 * this.dpr * zoom,
                    key: this.key,
                    frame: "emoji.png"
                },
                false
            )
            .setScale(zoom)
            .setInteractive();
        this.mEmojiBtn.y = -this.mEmojiBtn.height / 2 + this.mTitleBg.height;

        this.mOutputText = new BBCodeText(this.mScene, 0, 0, "", {
            fontSize: 14 * this.dpr * zoom + "px",
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

        const background = this.scene.make.graphics(undefined, false);
        this.mTextArea = new TextArea(this.mScene, {
            x: width / 2 + 4 * this.dpr * zoom,
            y: 160 * this.dpr * zoom,
            // background: (<any> this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, 0.2),
            textWidth: width - 4 * this.dpr * zoom,
            textHeight: this.MAX_HEIGHT,
            text: this.mOutputText,
        })
            .layout();
        this.mNavigateBtn = this.scene.make.image(
            {
                key: this.key,
                frame: "more_btn.png"
            },
            false
        )
            .setScale(zoom)
            .setInteractive();

        this.mTileContainer.add([
            this.mTitleBg,
            this.mChatBtn,
            this.mHornBtn,
            this.mEmojiBtn,
            this.mScrollBtn
        ]);
        this.add([
            this.mBackground,
            this.mTileContainer,
            this.mTextArea,
            this.mOutputText,
            background,
            this.mNavigateBtn
        ]);
        this.mTextArea.setSliderEnable(false);
        // this.mTextArea.childrenMap.child.disableInteractive();
        super.init();

        this.resize(this.width, this.height);

        // this.addActionListener();

        this.appendChat("小盆友[color=yellow]进入房间[/color]\n");
        this.appendChat("一直狐狸[color=yellow]离开房间[/color]\n");
        this.appendChat("[color=#ffffff][当前]小盆友：玩家注册后，账户等级为Lv1级。[/color]\n");
        this.appendChat("[color=#66ffff][喇叭]。用户在游戏内游玩时，使用该道具，经验值收益为4倍增长，时间上限为4h[/color]\n");
        this.appendChat("[color=#ffff00]等级提升为6级[/color]\n");
    }
    private onChatHandler() { }

    private onDragHandler(pointer, dragX, dragY) {
        const height = this.height + (pointer.prevPosition.y - pointer.position.y);
        if (height > this.MAX_HEIGHT || height < this.MIN_HEIGHT) {
            return;
        }
        this.setSize(this.width, height);
        this.resize(this.width, this.height);
    }

    private onShowNavigateHandler() {
        this.emit("showNavigate");
    }

    private onShowInputHanldler() {
        // new InputPanel(this.scene);
        if (this.mInputText) {
            return;
        }
        this.mInputText = new InputPanel(this.scene, this.mWorld);
        this.mInputText.once("close", this.sendChat, this);
    }

    private sendChat(val: string) {
        this.mInputText = undefined;
        if (!val) {
            return;
        }
        this.emit("chat", val);
    }
}
