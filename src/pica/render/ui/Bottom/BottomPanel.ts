import { UiManager, LabelInput } from "gamecoreRender";
import { BBCodeText, Button, ClickEvent, TextArea } from "apowophaserui";
import { EventType, ModuleName } from "structure";
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
    private expanded: boolean;
    private scaleRatio: number;
    private background: Phaser.GameObjects.Graphics;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.scaleRatio = this.scale;
        this.atlasNames = [UIAtlasName.uicommon, UIAtlasName.iconcommon];
        this.key = ModuleName.BOTTOM;
        this.scale = 1;
        this.maskLoadingEnable = false;
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
        const height = this.scene.cameras.main.height;
        this.mInput.resize();
        this.y = height;
        this.mNavigate.y = -this.mNavigate.displayHeight;
        this.mInput.y = this.mNavigate.y - this.mInput.displayHeight;

        this.updateOutputLayout();
    }
    public updateUIState(datas: any) {
        if (this.mInitialized) return;
        this.mNavigate.updateUIState(datas);
    }
    addListen() {
        this.mInput.on("enter", this.onSendMsgHandler, this);
        this.mInput.on("pointerScene", this.onPointerSceneHandler, this);
        this.resizeColtroll.addListen();
        this.resizeColtroll.on("toggleSize", this.onToggleSizeHandler, this);
        // this.mInput.on("focus", this.onFocusHandler, this);
        // this.mInput.on("blur", this.onBlurHandler, this);
    }

    removeListen() {
        if (!this.mInitialized) return;
        this.mInput.on("enter", this.onSendMsgHandler, this);
        this.mInput.off("pointerScene", this.onPointerSceneHandler, this);
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

    showKeyboard(width: number, height: number) {
        const ch = this.cameraHeight;
        const keyboard = ch - height;
        if (keyboard === 0) {
            // 第三方输入法收起键盘没有事件
            this.hideKeyboard();
            return;
        }
        this.mInput.y = (-keyboard - this.mInput.height * this.scaleRatio);
        // this.mOutput.y = this.mInput.y - 1 * this.dpr - this.mOutput.height;
        // this.resizeColtroll.y = this.mInput.y - this.resizeColtroll.height * 0.5;
        // this.mOutput.updateLayout();
        this.updateOutputLayout();
    }

    hideKeyboard() {
        this.mInput.y = this.mNavigate.y - this.mInput.height * this.scaleRatio;
        this.updateOutputLayout();
        // this.mOutput.y = this.mInput.y - 1 * this.dpr - this.mOutput.height;
        // this.resizeColtroll.y = this.mInput.y - this.resizeColtroll.height * 0.5;
        // this.mOutput.updateLayout();
    }

    getInputFocusing() {
        return this.mInput.getFocusing();
    }
    exitUser() {
        this.mWorld.exitUser();
    }
    get navigatePanel(): Phaser.GameObjects.Container {
        return this.mNavigate;
    }

    protected onShow() {
        super.onShow();
    }

    protected onHide() {
        this.mInput.blurInput();
    }

    protected init() {
        this.mOutput = new OutputContainer(this.scene, this.dpr, this.scaleRatio);
        this.mInput = new InputContainer(this.scene, this.key, this.dpr, this.scaleRatio);
        this.mNavigate = new PicaNewNavigatePanel(this.scene, this.key, this.dpr, this.scaleRatio);
        this.mNavigate.setHandler(new Handler(this, this.onNavigateHandler));
        this.background = this.scene.make.graphics(undefined);
        this.resizeColtroll = new ResizeControll(this.scene, this.key, this.dpr, this.scaleRatio);
        this.addAt(this.background, 0);
        this.add([this.mOutput, this.mInput, this.mNavigate, this.resizeColtroll]);
        this.resize(this.width, this.mOutput.height + this.mInput.height + this.mNavigate.height);
        super.init();
        this.onToggleSizeHandler(false);
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
                    this.updateUIState(arr);
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
            this.render.renderEmitter(ModuleName.BOTTOM + "_showpanel", ModuleName.PICABAG_NAME);
        } else if (tag === "friend") {
            this.render.renderEmitter(ModuleName.BOTTOM + "_showpanel", ModuleName.PICAFRIEND_NAME);
        } else if (tag === "avatar") {
            this.render.renderEmitter(ModuleName.BOTTOM + "_showpanel", ModuleName.PICAAVATAR_NAME);
        } else if (tag === "make") {
            this.render.renderEmitter(ModuleName.BOTTOM + "_showpanel", ModuleName.PICAILLUSTRATED_NAME);
        } else if (tag === "explore") {
            this.render.renderEmitter(ModuleName.BOTTOM + "_showpanel", ModuleName.PICAEXPLORELIST_NAME);
        } else if (tag === "home") {
            this.render.renderEmitter(ModuleName.BOTTOM + "_gohome");
        }
    }

    private onToggleSizeHandler(expand: boolean) {
        this.expanded = expand;
        if (expand) {
            this.mOutput.expand();
            this.resizeColtroll.expand();
        } else {
            this.mOutput.collapse();
            this.resizeColtroll.collapse();
        }
        this.render.renderEmitter(EventType.CHAT_PANEL_EXTPAND, expand);
        this.updateOutputLayout();
    }

    private onPointerSceneHandler(gameobjects?: Phaser.GameObjects.GameObject[]) {
        if (gameobjects && gameobjects.length > 0) {
            for (const gameobject of gameobjects) {
                const parent = gameobject.parentContainer;
                if (parent === this.resizeColtroll) return;
            }
        }
        this.mInput.blurInput();
    }

    private updateOutputLayout() {
        if (this.expanded) {
            this.mOutput.x = 0;
            this.mOutput.y = this.mInput.y - 1 * this.dpr - this.mOutput.height;
            this.resizeColtroll.y = this.mOutput.y - this.resizeColtroll.displayHeight * 0.5;
            this.mOutput.expand();
        } else {
            this.mOutput.x = this.resizeColtroll.displayWidth;
            this.mOutput.y = this.mInput.y - 1 * this.dpr - this.mOutput.height;
            this.resizeColtroll.y = this.mInput.y - 1 * this.dpr - this.resizeColtroll.displayHeight * 0.5;
            this.mOutput.collapse();
        }
        this.mOutput.updateLayout();
        const width = this.scene.cameras.main.width;
        const height = this.mOutput.y * -1;
        this.background.clear();
        this.background.fillStyle(0, 0);
        this.background.fillRect(0, this.mOutput.y, width, height);
        const hitArea = new Phaser.Geom.Rectangle(0, this.mOutput.y, width, height);
        if (this.background.input) {
            this.background.input.hitArea = hitArea;
        } else {
            this.background.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
        }
    }

    // private onFocusHandler() {
    //     this.showKeyboard(window.document.documentElement.clientWidth * window.devicePixelRatio, window.document.documentElement.clientHeight * window.devicePixelRatio);
    // }

    // private onBlurHandler() {
    //     this.hideKeyboard();
    // }

    get mediator() {
        return this.render.mainPeer[this.key];
    }
}

class OutputContainer extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Graphics;
    private mOutputText: BBCodeText;
    private mTextArea: TextArea;
    private mTextMask: any;
    constructor(scene: Phaser.Scene, private dpr: number, private scaleRatio: number) {
        super(scene);
        this.background = this.scene.make.graphics(undefined, false);
        this.background.clear();

        const width = this.scene.cameras.main.width;
        // const zoom = this.scaleRatio;
        this.mOutputText = new BBCodeText(this.scene, 0, 0, "", {
            fontSize: 12 * this.dpr * scaleRatio + "px",
            fontFamily: Font.DEFULT_FONT,
            stroke: "#000000",
            strokeThickness: 1 * this.dpr * scaleRatio,
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
                width: width - 12 * this.dpr * scaleRatio
            }
        }).setOrigin(0, 0);
        this.mOutputText.height = 40 * this.dpr * scaleRatio;

        this.mTextArea = new TextArea(this.scene, { text: this.mOutputText })
            .layout()
            .setOrigin(0, 0);
        this.updateLayout();
        this.add([
            this.background,
            this.mTextArea,
            this.mOutputText,
            this.mTextArea.childrenMap.child
        ]);
        this.mTextMask = this.mTextArea.childrenMap.text;
    }

    resize(width: number, height: number) {
        this.setSize(width, height);
        this.background.clear();
        this.background.fillStyle(0, 0.6);
        this.background.fillRect(0, 0, width, height);
        this.mTextArea.childrenMap.child.setMinSize((width - 8 * this.dpr * this.scaleRatio), (height - 8 * this.dpr * this.scaleRatio));

        this.mTextArea.layout();
        // this.mOutputText.width = width - 4 * this.dpr * this.scaleRatio;
        this.mOutputText.setWrapWidth(width - 8 * this.dpr * this.scaleRatio);
        // (<any>this.mTextArea).setChildOY(1 * this.dpr * this.scaleRatio);
        this.updateLayout();
        const textMask = this.mTextArea.childrenMap.text;
        textMask.y = 4 * this.dpr * this.scaleRatio;
        this.mTextArea.scrollToBottom();
    }

    public expand() {
        this.resize(this.scene.cameras.main.width, 125.33 * this.dpr * this.scaleRatio);
        this.mTextArea.setScrollerEnable(true);
    }

    public collapse() {
        this.resize(296 * this.dpr * this.scaleRatio, 40 * this.dpr * this.scaleRatio);
        this.mTextArea.setScrollerEnable(false);
    }

    public updateLayout() {
        // const matrix = this.getWorldTransformMatrix(this.getLocalTransformMatrix());
        // this.mTextArea.setPosition(this.width * this.scaleRatio * 0.5, this.mTextArea.height * 0.5 + 6 * this.scaleRatio);
        this.mTextArea.setPosition(4 * this.dpr * this.scaleRatio, 4 * this.dpr * this.scaleRatio);
        this.mTextArea.scrollToBottom();
    }

    public appendChat(val: string) {
        if (this.mTextArea) {
            this.mTextArea.appendText(val);
            this.mTextArea.scrollToBottom();
            if (this.mTextMask) this.mTextMask.y = 4 * this.dpr * this.scaleRatio;
        }
    }
}

class InputContainer extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Graphics;
    private inputText: LabelInput;
    private emoji: Phaser.GameObjects.Image;
    private mFocusing: boolean = false;
    constructor(scene: Phaser.Scene, key: string, private dpr: number, scale: number) {
        super(scene);
        this.scale = scale;
        this.background = scene.make.graphics(undefined, false);
        const text = i18n.t("chat.placeholder");
        this.emoji = scene.make.image({
            key,
            frame: "home_face",
        });
        this.emoji.x = 12.67 * dpr + this.emoji.width * 0.5;
        const w = this.scene.cameras.main.width;
        this.inputText = new LabelInput(this.scene, {
            width: w - 46 * this.dpr,
            height: 16 * this.dpr,
            placeholder: text,
            fontSize: 11 * this.dpr + "px",
            color: "#ffffff",
        }).setOrigin(0, 0.5).setAutoBlur(false);
        this.add([this.background, this.emoji, this.inputText]);
        this.inputText.on("enter", this.onEnterHandler, this);
        this.inputText.on("blur", this.onInputBlurHandler, this);
        this.inputText.on("focus", this.onInputFocusHandler, this);
    }

    public resize() {
        const w = this.scene.cameras.main.width;
        this.setSize(w, 38.33 * this.dpr);
        this.inputText.x = 46 * this.dpr;
        this.inputText.y = this.height * 0.5;
        this.inputText.setSize(this.inputText.width, this.height);

        this.emoji.y = this.height * 0.5;

        this.background.clear();
        this.background.fillStyle(0x000000, 0.6);
        this.background.fillRect(0, 0, w, this.height);
    }

    public setText(text: string) {
        this.inputText.setText(text);
    }

    public blurInput() {
        this.inputText.setBlur();
    }

    public getFocusing() {
        return this.mFocusing;
    }

    private onEnterHandler(text: string) {
        this.emit("enter", text);
        this.inputText.setText("");
    }

    private onInputBlurHandler() {
        this.scene.input.off("pointerdown", this.onPointerSceneHandler, this);
        this.inputText.setBlur();
    }

    private onInputFocusHandler() {
        this.scene.input.on("pointerdown", this.onPointerSceneHandler, this);
        this.mFocusing = true;
        // this.emit("focus");
    }

    private onPointerSceneHandler(pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) {
        this.emit("pointerScene", currentlyOver);
        this.inputText.setBlur();
        this.mFocusing = false;
    }
}

class ResizeControll extends Phaser.GameObjects.Container {
    private background: Button;
    private bubble: Phaser.GameObjects.Image;
    private arrow: Phaser.GameObjects.Image;
    private expaned: boolean = true;
    constructor(scene: Phaser.Scene, key: string, private dpr: number, scale: number) {
        super(scene);
        this.scale = scale;
        this.background = new Button(this.scene, key, "home_chat_pack_up_bg");
        this.background.tweenEnable = false;
        this.bubble = this.scene.make.image({
            key,
            frame: "home_chat"
        });
        this.arrow = this.scene.make.image({
            key,
            frame: "home_unwind"
        });
        // this.arrow = new Button(this.scene, key, "home_unwind");
        this.setSize(this.background.width, this.background.height);
        this.bubble.x = (-this.width + this.bubble.width) * 0.5 + 12.67 * dpr;
        this.arrow.x = (-this.width + this.arrow.width) * 0.5 + 43 * dpr;
        this.add([this.background, this.bubble, this.arrow]);
        this.x = this.displayWidth * 0.5;
    }

    addListen() {
        this.background.on(ClickEvent.Tap, this.onToggleSizeHandler, this);
    }

    removeListen() {
        this.background.off(ClickEvent.Tap, this.onToggleSizeHandler, this);
    }

    public expand() {
        this.background.setFrame("home_chat_unwind_bg");
        this.arrow.scaleY = -1;
        this.expaned = true;
        this.setSize(this.background.width, this.background.height);
    }

    public collapse() {
        this.background.setFrame("home_chat_pack_up_bg");
        this.arrow.scaleY = 1;
        this.expaned = false;
        this.setSize(this.background.width, this.background.height);
    }

    public getExpaned() {
        return this.expaned;
    }

    private onToggleSizeHandler() {
        this.expaned = !this.expaned;
        this.emit("toggleSize", this.expaned);
    }
}
