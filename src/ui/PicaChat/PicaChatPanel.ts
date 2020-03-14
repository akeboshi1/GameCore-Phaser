import { Panel } from "../components/panel";
import { WorldService } from "../../game/world.service";
import TextArea from "../../../lib/rexui/templates/ui/textarea/TextArea";
import BBCodeText from "../../../lib/rexui/plugins/gameobjects/text/bbocdetext/BBCodeText";
import { Font } from "../../utils/font";
import { Logger } from "../../utils/log";

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
    private mOutputText: BBCodeText;
    private mTextArea: TextArea;
    private mInputText: InputPanel;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.setTween(false);
        this.MAX_HEIGHT = 460 * this.dpr;
        this.MIN_HEIGHT = 100 * this.dpr;
    }

    show() {
        super.show();
        if (this.mInitialized) {
            this.addActionListener();
        }
    }

    close() {
        if (this.mInitialized) {
            this.removeActionListener();
        }
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
        // this.mBackground.setInteractive();

        this.mNavigateBtn.x = width - this.mNavigateBtn.width / 2 - 5 * this.dpr;
        this.mNavigateBtn.y = h - this.mNavigateBtn.height / 2 - 5 * this.dpr;

        this.mScrollBtn.x = width - this.mScrollBtn.displayWidth / 2 - 2 * this.dpr;

        this.mTextArea.childrenMap.child.setMinSize(w, h - 10 * this.dpr);
        this.mTextArea.layout();
        this.mTextArea.setPosition(this.width / 2 + 4 * this.dpr, this.y + this.mTextArea.height / 2 + 10 * this.dpr);
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

        this.mOutputText = new BBCodeText(this.mScene, 0, 0, "", {
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

        const background = this.scene.make.graphics(undefined, false);
        this.mTextArea = new TextArea(this.mScene, {
            x: width / 2 + 4 * this.dpr,
            y: 160 * this.dpr,
            // background: (<any> this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, 0.2),
            textWidth: width - 4 * this.dpr,
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
        this.appendChat("小盆友[color=yellow]进入房间[/color]\n");
        this.appendChat("一直狐狸[color=yellow]离开房间[/color]\n");
        this.appendChat("[color=#ffffff][当前]小盆友：玩家注册后，账户等级为Lv1级。[/color]\n");
        this.appendChat("[color=#66ffff][喇叭]。用户在游戏内游玩时，使用该道具，经验值收益为4倍增长，时间上限为4h[/color]\n");
        this.appendChat("小盆友[color=yellow]进入房间[/color]\n");
        this.appendChat("一直狐狸[color=yellow]离开房间[/color]\n");
        this.appendChat("[color=#ffffff][当前]小盆友：玩家注册后，账户等级为Lv1级。[/color]\n");
        this.appendChat("[color=#66ffff][喇叭]。用户在游戏内游玩时，使用该道具，经验值收益为4倍增长，时间上限为4h[/color]\n");
        this.appendChat("[color=#ffff00]等级提升为6级[/color]\n");
        this.appendChat("小盆友[color=yellow]进入房间[/color]\n");
        this.appendChat("一直狐狸[color=yellow]离开房间[/color]\n");
        this.appendChat("[color=#ffffff][当前]小盆友：玩家注册后，账户等级为Lv1级。[/color]\n");
        this.appendChat("[color=#66ffff][喇叭]。用户在游戏内游玩时，使用该道具，经验值收益为4倍增长，时间上限为4h[/color]\n");
        this.appendChat("小盆友[color=yellow]进入房间[/color]\n");
        this.appendChat("一直狐狸[color=yellow]离开房间[/color]\n");
        this.appendChat("[color=#ffffff][当前]小盆友：玩家注册后，账户等级为Lv1级。[/color]\n");
        this.appendChat("[color=#66ffff][喇叭]。用户在游戏内游玩时，使用该道具，经验值收益为4倍增长，时间上限为4h[/color]\n");
        this.appendChat("[color=#ffff00]等级提升为6级[/color]\n");
        this.appendChat("小盆友[color=yellow]进入房间[/color]\n");
        this.appendChat("一直狐狸[color=yellow]离开房间[/color]\n");
        this.appendChat("[color=#ffffff][当前]小盆友：玩家注册后，账户等级为Lv1级。[/color]\n");
        this.appendChat("[color=#66ffff][喇叭]。用户在游戏内游玩时，使用该道具，经验值收益为4倍增长，时间上限为4h[/color]\n");
        this.appendChat("小盆友[color=yellow]进入房间[/color]\n");
        this.appendChat("一直狐狸[color=yellow]离开房间[/color]\n");
        this.appendChat("[color=#ffffff][当前]小盆友：玩家注册后，账户等级为Lv1级。[/color]\n");
        this.appendChat("[color=#66ffff][喇叭]。用户在游戏内游玩时，使用该道具，经验值收益为4倍增长，时间上限为4h[/color]\n");
        this.appendChat("[color=#ffff00]等级提升为6级[/color]\n");
        this.appendChat("小盆友[color=yellow]进入房间[/color]\n");
        this.appendChat("一直狐狸[color=yellow]离开房间[/color]\n");
        this.appendChat("[color=#ffffff][当前]小盆友：玩家注册后，账户等级为Lv1级。[/color]\n");
        this.appendChat("[color=#66ffff][喇叭]。用户在游戏内游玩时，使用该道具，经验值收益为4倍增长，时间上限为4h[/color]\n");
    }

    private addActionListener() {
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

    private removeActionListener() {
        this.mBackground.disableInteractive();
        this.mChatBtn.disableInteractive();
        this.mEmojiBtn.disableInteractive();
        this.mScrollBtn.disableInteractive();
        this.mNavigateBtn.disableInteractive();
        this.mTextArea.childrenMap.child.disableInteractive();

        // this.scene.input.setDraggable(this.mScrollBtn, false);
        this.mScrollBtn.off("drag", this.onDragHandler, this);
        this.mChatBtn.off("pointerup", this.onChatHandler, this);
        this.resize(this.width, this.height);

        this.mChatBtn.off("pointerup", this.onShowInputHanldler, this);
    }

    private onChatHandler() {}

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
        if (!val) {
            return;
        }
        this.emit("chat", val);
        this.mInputText = undefined;
    }
}

class InputPanel extends Phaser.Events.EventEmitter {
    private mBackground: Phaser.GameObjects.Graphics;
    private mInput;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super();
        const width = scene.cameras.main.width;
        const height = scene.cameras.main.height;
        this.mBackground = scene.add.graphics();
        this.mBackground.fillStyle(0x0, 0.6);
        this.mBackground.fillRect(0, 0, width, height).setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);

        this.mInput = (<any>scene.add).rexInputText(6 * world.uiRatio, 6 * world.uiRatio, width - 12 * world.uiRatio, 40 * world.uiRatio, {
            fontSize: `${20 * world.uiRatio}px`,
            color: "#0",
            backgroundColor: "#FFFFFF",
            borderColor: "#FF9900"
        }).setOrigin(0, 0).setFocus();
        // this.mInput.y = -height / 2;
        this.mInput.node.addEventListener("keypress", (e) => {
            const keycode = e.keyCode || e.which;
            if (keycode === 13) {
                this.onCloseHandler();
            }
        });
    }

    private onCloseHandler() {
        this.emit("close", this.mInput.text);
        this.mBackground.destroy();
        this.mInput.destroy();
        this.destroy();
    }
}
