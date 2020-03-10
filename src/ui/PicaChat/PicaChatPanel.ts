import { Panel } from "../components/panel";
import { WorldService } from "../../game/world.service";
import TextArea from "../../../lib/rexui/templates/ui/textarea/TextArea";
import BBCodeText from "../../../lib/rexui/plugins/gameobjects/text/bbocdetext/BBCodeText";
import { Font } from "../../utils/font";

export class PicaChatPanel extends Panel {
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
    private mTextArea: TextArea;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.setTween(false);
        this.MAX_HEIGHT = 460 * this.dpr;
        this.MIN_HEIGHT = 100 * this.dpr;
    }

    resize(w: number, h: number) {
        const width = this.scene.cameras.main.width / this.scale;
        const height = this.scene.cameras.main.height;
        const frame = this.scene.textures.getFrame(this.key, "title_bg.png");
        const scaleRatio = (width / frame.width) * this.scale;
        this.mTitleBg.scaleX = scaleRatio;
        this.mTitleBg.x = width / 2;

        this.y = height - this.height * this.scale;
        this.mBackground.clear();
        this.mBackground.fillStyle(0, 0.6);
        this.mBackground.fillRect(0, 0, w, h);
        this.mBackground.setInteractive();

        this.mNavigateBtn.x = width - this.mNavigateBtn.width / 2 - 5 * this.dpr;
        this.mNavigateBtn.y = h - this.mNavigateBtn.height / 2 - 5 * this.dpr;

        this.mScrollBtn.x = width - this.mScrollBtn.displayWidth / 2 - 2 * this.dpr;

        // this.mTextArea.childrenMap.child.textMask.setPosition(-5, size.height - this.height).resize(this.width + 18, this.height - this.mSendBtn.height);
        this.mTextArea.childrenMap.child.textMask.setPosition(this.x, this.y).resize(w, h);
        // this.setInteractive();
        super.resize(w, h);
    }

    public appendChat(val: string) {
        if (this.mTextArea) {
            this.mTextArea.appendText(val);
            this.mTextArea.scrollToBottom();
        }
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
        this.mBackground = this.scene.make.graphics(undefined, false);
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
            .setInteractive();

        this.mTitleBg = this.scene.make.image(
            {
                key: this.key,
                frame: "title_bg.png"
            },
            false
        );
        this.mTitleBg.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

        this.mChatBtn = this.scene.make
            .image(
                {
                    x: 33 * this.dpr,
                    key: this.key,
                    frame: "chat_icon.png"
                },
                false
            )
            .setInteractive();
        this.mChatBtn.y = -this.mChatBtn.height / 2 + this.mTitleBg.height;

        this.mHornBtn = this.scene.make
            .image(
                {
                    x: 96 * this.dpr,
                    key: this.key,
                    frame: "horn_icon.png"
                },
                false
            )
            .setInteractive();
        this.mHornBtn.y = -this.mHornBtn.height / 2 + this.mTitleBg.height;

        this.mEmojiBtn = this.scene.make
            .image(
                {
                    x: 155 * this.dpr,
                    key: this.key,
                    frame: "emoji.png"
                },
                false
            )
            .setInteractive();
        this.mEmojiBtn.y = -this.mEmojiBtn.height / 2 + this.mTitleBg.height;

        const text = new BBCodeText(this.mScene, 0, 0, "", {
            fontSize: 14 * this.dpr + "px",
            fontFamily: Font.DEFULT_FONT,
            stroke: "#000000",
            strokeThickness: 1 * this.dpr,
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
                width: width - 6 * this.dpr
            }
        });

        this.mTextArea = new TextArea(this.mScene, {
            x: width / 2 + 4 * this.dpr,
            y: 160 * this.dpr,
            textWidth: width - 4 * this.dpr,
            textHeight: 300 * this.dpr,
            text,
        })
            .layout();
        this.mNavigateBtn = this.scene.make.image(
            {
                key: this.key,
                frame: "more_btn.png"
            },
            false
        ).setInteractive();

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
            text,
            this.mNavigateBtn
        ]);
        super.init();

        this.scene.input.setDraggable(this.mScrollBtn, true);
        this.mScrollBtn.on("drag", this.onDragHandler, this);
        this.mChatBtn.on("pointerup", this.onChatHandler, this);
        this.mNavigateBtn.on("pointerup", this.onShowNavigateHandler, this);
        this.resize(this.width, this.height);

        this.appendChat("小盆友[color=yellow]进入房间[/color]\n");
        this.appendChat("一直狐狸[color=yellow]离开房间[/color]\n");
        this.appendChat("[color=#ffffff][当前]小盆友：玩家注册后，账户等级为Lv1级。[/color]\n");
        this.appendChat("[color=#66ffff][喇叭]。用户在游戏内游玩时，使用该道具，经验值收益为4倍增长，时间上限为4h[/color]\n");
        this.appendChat("[color=#ffff00]等级提升为6级[/color]\n");

    }

    private onChatHandler() {}

    private onDragHandler(pointer, dragX, dragY) {
        const height =
            this.height + pointer.prevPosition.y - pointer.position.y;
        if (height > this.MAX_HEIGHT || height < this.MIN_HEIGHT) {
            return;
        }
        this.setSize(this.width, height);
        this.resize(this.width, this.height);
    }

    private onShowNavigateHandler() {
      this.emit("showNavigate");
    }
}
