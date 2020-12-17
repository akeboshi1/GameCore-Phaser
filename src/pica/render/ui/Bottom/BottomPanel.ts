import { UiManager, LabelInput } from "gamecoreRender";
import { BBCodeText, Button, ClickEvent, dragSpeed, TextArea } from "apowophaserui";
import { ModuleName } from "structure";
import { Font, Handler, i18n } from "utils";
import { UIAtlasName } from "picaRes";
import { PicaNewNavigatePanel } from "../PicaNewMain/PicaNewNavigatePanel";
import { PicaBasePanel } from "../pica.base.panel";

export class BottomPanel extends PicaBasePanel {
    private mNavigate: PicaNewNavigatePanel;
    private mOutput: OutputContainer;
    private mInput: InputContainer;
    private resizeColtroll: ResizeControll;
    private chatCatchArr: string[] = [];
    private chatMaxLen: number = 100;
    constructor(uiManager: UiManager) {
        super(uiManager);
        // this.scale = 1;
        this.atlasNames = [UIAtlasName.uicommon, UIAtlasName.iconcommon];
        this.key = ModuleName.BOTTOM;
    }

    show(param?: any) {
        super.show(param);
        if (this.initialized) {
            this.checkUpdateActive();
        }
    }

    resize(w: number, h: number) {
        const zoom = this.scale;
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height / this.scale;
        this.mInput.resize();
        this.mNavigate.y = height - this.mNavigate.height;
        this.mInput.y = this.mNavigate.y - this.mInput.height;
        this.resizeColtroll.x = this.resizeColtroll.width * 0.5;
        this.setSize(width, h + this.mInput.height);
    }

    addListen() {
        this.mInput.on("enter", this.onSendMsgHandler, this);
        this.resizeColtroll.addListen();
        this.resizeColtroll.on("toggleSize", this.onToggleSizeHandler, this);
    }

    removeListen() {
        this.mInput.on("enter", this.onSendMsgHandler, this);
        this.resizeColtroll.removeListen();
        this.resizeColtroll.off("toggleSize", this.onToggleSizeHandler, this);
    }

    public appendChat(val: string) {
        this.chatCatchArr.push(val);
        if (this.chatCatchArr.length > this.chatMaxLen) this.chatCatchArr.shift();
        if (this.mOutput) {
            this.mOutput.appendChat(val);
        }
    }

    preload() {
        this.addAtlas(this.key, "bottom/bottom.png", "bottom/bottom.json");
        super.preload();
    }

    protected init() {
        this.mOutput = new OutputContainer(this.scene, this.dpr, this.scale);
        this.mInput = new InputContainer(this.scene, this.key, this.dpr);
        this.mNavigate = new PicaNewNavigatePanel(this.scene, this.key, this.dpr);
        this.mNavigate.setHandler(new Handler(this, this.onNavigateHandler));
        this.resizeColtroll = new ResizeControll(this.scene, this.key, this.dpr);
        this.add([this.mOutput, this.mInput, this.mNavigate, this.resizeColtroll]);
        this.resize(this.width, this.mOutput.height + this.mInput.height + this.mNavigate.height);
        this.onToggleSizeHandler(true);
        super.init();
    }

    private checkUpdateActive() {
        // this.render.mainPeer.getCurRoom()
        //     .then((curRoom) => {
        //         if (curRoom)
        //             this.setGiftButtonState(curRoom.openingParty);
        //     });
        this.render.mainPeer.getActiveUIData(ModuleName.PICACHAT_NAME)
            .then((arr) => {
                if (arr) {
                    for (const data of arr) {
                        this.updateUIState(data);
                    }
                }
            });
    }

    private sendChat(val: string) {
        if (!val) {
            return;
        }
        const mediator = this.mediator;
        if (!mediator) return;
        mediator.sendChat(val);
    }

    private onSendMsgHandler(val: string) {
        this.sendChat(val);
    }

    private onNavigateHandler(tag: string, data: any) {
        if (tag === "bag") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICABAG_NAME);
        } else if (tag === "friend") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICAFRIEND_NAME);
        } else if (tag === "avatar") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICAAVATAR_NAME);
        } else if (tag === "shop") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICAMARKET_NAME);
        } else if (tag === "vip") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICARECHARGE_NAME);
        }
    }

    private onToggleSizeHandler(expand: boolean) {
        if (expand) {
            this.mOutput.expand();
            this.mOutput.x = 0;
            this.mOutput.y = this.mInput.y - 1 * this.dpr - this.mOutput.height;
            this.resizeColtroll.y = this.mOutput.y - this.resizeColtroll.height * 0.5;
        } else {
            this.mOutput.collapse();
            this.mOutput.x = this.resizeColtroll.width - 1 * this.dpr;
            this.mOutput.y = this.mInput.y - 1 * this.dpr  - this.mOutput.height;
            this.resizeColtroll.y = this.mInput.y - 1 * this.dpr - this.resizeColtroll.height * 0.5;
        }
        this.mOutput.updateLayout();
    }

    get mediator() {
        return this.render.mainPeer[this.key];
    }
}

class OutputContainer extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Graphics;
    private mOutputText: BBCodeText;
    private mTextArea: TextArea;
    constructor(scene: Phaser.Scene, private dpr: number, private scaleRatio: number) {
        super(scene);
        this.background = this.scene.make.graphics(undefined, false);

        const width = this.scene.cameras.main.width;
        const zoom = this.scaleRatio;
        this.mOutputText = new BBCodeText(this.scene, 0, 0, "", {
            fontSize: 12 * this.dpr / zoom + "px",
            fontFamily: Font.DEFULT_FONT,
            stroke: "#000000",
            strokeThickness: 1 * this.dpr * zoom,
            // textMask: false,
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

        const shape = this.scene.add.graphics();
        shape.fillStyle(0xFF9900, 0.2);
        shape.fillRoundedRect(0, 0, 2, 2, 2);

        this.mTextArea = new TextArea(this.scene, {
            x: 0 + 4 * this.dpr * zoom,
            y: 6 * this.dpr,
            background: shape,
            textWidth: width - 4 * this.dpr * zoom,
            textHeight: 126 * this.dpr * zoom,
            text: this.mOutputText,
            textMask: false
        })
            .layout();

        this.add([
            this.background,
            this.mTextArea,
            this.mOutputText,
        ]);

        this.expand();
    }

    resize(width: number, height: number) {
        // const h = 30 * this.dpr;
        this.setSize(width, height);
        this.background.clear();
        this.background.fillStyle(0, 0.6);
        this.background.fillRect(0, 0, width, height);
        this.mTextArea.childrenMap.child.setMinSize(width, (height - 2 * this.dpr) * this.scaleRatio);
        this.mTextArea.layout();
        this.mTextArea.setPosition(this.width / 2 + 4 * this.dpr, 6 * this.dpr * this.scaleRatio);
        const textMask = this.mTextArea.childrenMap.text;
        textMask.y = 6 * this.dpr;
        this.mTextArea.scrollToBottom();
        // resize(width, h);
        // this.background.input = undefined;
        this.background.setInteractive(new Phaser.Geom.Rectangle(0, 0, width / this.scale, height / this.scale), Phaser.Geom.Rectangle.Contains);
    }

    public expand() {
        this.resize(this.scene.cameras.main.width, 125.33 * this.dpr);
    }

    public collapse() {
        this.resize(296 * this.dpr, 40 * this.dpr);
    }

    public updateLayout() {
        const matrix = this.getWorldTransformMatrix(this.getLocalTransformMatrix());
        // this.mTextArea.setPosition(matrix.tx + this.width / 2 + 4 * this.dpr, matrix.ty + this.height * 0.5 + 6 * this.dpr * this.scaleRatio);
    }

    public appendChat(val: string) {
        if (this.mTextArea) {
            this.mTextArea.appendText(val);
            this.mTextArea.scrollToBottom();
        }
    }
}

class InputContainer extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Graphics;
    private inputText: LabelInput;
    private emoji: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, key: string, private dpr: number) {
        super(scene);
        this.background = scene.make.graphics(undefined, false);
        const text = i18n.t("chat.placeholder");
        this.emoji = scene.make.image({
            key,
            frame: "home_face",
        });
        this.emoji.x = 12.67 * dpr + this.emoji.width * 0.5;
        const w = this.scene.cameras.main.width;
        this.inputText = new LabelInput(this.scene, {
            width: w,
            height: 16 * this.dpr,
            placeholder: text,
            fontSize: 11 * this.dpr + "px",
            color: "#ffffff",
        }).setOrigin(0, 0.5);
        this.add([this.background, this.emoji, this.inputText]);
        this.inputText.on("enter", this.onEnterHandler, this);
    }

    public resize() {
        const w = this.scene.cameras.main.width;
        this.setSize(w, 38.33 * this.dpr);
        this.inputText.x = 46 * this.dpr;
        this.inputText.y = this.height * 0.5;

        this.emoji.y = this.height * 0.5;

        this.background.clear();
        this.background.fillStyle(0x000000, 0.6);
        this.background.fillRect(0, 0, w, this.height);
        this.background.input = undefined;
        this.background.setInteractive(new Phaser.Geom.Rectangle(0, 0, w / this.scale, this.height / this.scale), Phaser.Geom.Rectangle.Contains);
        // this.inputText.resize(w - 46 * this.dpr, this.height);
    }

    private onEnterHandler() {
        this.emit("enter", this.inputText.text);
        this.inputText.setBlur();
        this.inputText.setText("");
    }
}

class ResizeControll extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Image;
    private bubble: Phaser.GameObjects.Image;
    private arrow: Button;
    private expaned: boolean = true;
    constructor(scene: Phaser.Scene, key: string, private dpr: number) {
        super(scene);
        this.background = this.scene.make.image({
            key,
            frame: "home_chat_pack_up_bg"
        });
        this.bubble = this.scene.make.image({
            key,
            frame: "home_chat"
        });
        this.arrow = new Button(this.scene, key, "home_unwind");
        this.expand();
        this.bubble.x = (-this.width + this.bubble.width) * 0.5 + 12.67 * dpr;
        this.arrow.x = (-this.width + this.arrow.width) * 0.5 + 43 * dpr;
        this.add([this.background, this.bubble, this.arrow]);
    }

    addListen() {
        this.arrow.on(ClickEvent.Tap, this.onToggleSizeHandler, this);
    }

    removeListen() {
        this.arrow.off(ClickEvent.Tap, this.onToggleSizeHandler, this);
    }

    public expand() {
        this.background.setFrame("home_chat_unwind_bg");
        this.arrow.scaleY = -1;
        this.expaned = true;
        this.setSize(this.background.width, this.background.height);

        this.emit("toggleSize", this.expaned);
    }

    public collapse() {
        this.background.setFrame("home_chat_pack_up_bg");
        this.arrow.scaleY = 1;
        this.expaned = false;
        this.setSize(this.background.width, this.background.height);

        this.emit("toggleSize", this.expaned);
    }

    public getExpaned() {
        return this.expaned;
    }

    private onToggleSizeHandler() {
        if (this.expaned) {
            this.collapse();
        } else {
            this.expand();
        }
    }
}
