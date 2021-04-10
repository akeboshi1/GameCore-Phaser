import { BasePanel, UiManager, LabelInput } from "gamecoreRender";
import { BBCodeText, TextArea, InputText } from "apowophaserui";
import { ModuleName } from "structure";
import { Font, i18n } from "utils";

export class ChatPanel extends BasePanel {
    private mBackground: Phaser.GameObjects.Graphics;
    private mOutputText: BBCodeText;
    private mTextArea: TextArea;
    private mInputPanel: InputPanle;
    private chatCatchArr: string[] = [];
    private chatMaxLen: number = 100;
    constructor(private uiManager: UiManager) {
        super(uiManager.scene, uiManager.render);
        this.scale = 1;
        this.key = ModuleName.CHAT_NAME;
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
        w = width;
        h = h ? h : 133 * this.dpr;
        this.mInputPanel.resize();
        this.setSize(width, h + this.mInputPanel.height);

        this.y = height - this.height - 54 * this.dpr;
        this.mBackground.clear();
        this.mBackground.fillStyle(0, 0.6);
        this.mBackground.fillRect(0, 0, width / this.scale, h / this.scale);
        this.mTextArea.childrenMap.child.setMinSize(w, (h - 16 * this.dpr) * zoom);
        this.mTextArea.layout();
        this.mTextArea.setPosition(this.width / 2 + 4 * this.dpr, this.y + this.mTextArea.height / 2 + 10 * this.dpr * zoom);
        const textMask = this.mTextArea.childrenMap.text;
        textMask.y = 8 * this.dpr;
        this.mTextArea.scrollToBottom();
        super.resize(w, h);
        this.mBackground.input = undefined;
        this.mBackground.setInteractive(new Phaser.Geom.Rectangle(0, 0, width / this.scale, h / this.scale), Phaser.Geom.Rectangle.Contains);
    }

    addListen() {
        this.mInputPanel.on("enter", this.onSendMsgHandler, this);
    }

    removeListen() {
        this.mInputPanel.on("enter", this.onSendMsgHandler, this);
    }

    public appendChat(val: string) {
        this.chatCatchArr.push(val);
        if (this.chatCatchArr.length > this.chatMaxLen) this.chatCatchArr.shift();
        if (this.mTextArea) {
            this.mTextArea.appendText(val);
            this.mTextArea.scrollToBottom();
        }

        // if (this.mInputText && this.mInputText instanceof PicaChatInputPanel) {
        //     (<PicaChatInputPanel>this.mInputText).appendChat(val);
        // }
    }

    protected init() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        this.mBackground = this.scene.make.graphics(undefined, false);

        const zoom = this.scale;
        this.mOutputText = new BBCodeText(this.mScene, 0, 0, "", {
            fontSize: 12 * this.dpr / zoom + "px",
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

        this.mTextArea = new TextArea(this.mScene, {
            x: width / 2 + 4 * this.dpr * zoom,
            y: 160 * this.dpr * zoom,
            // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, 0.2),
            textWidth: width - 4 * this.dpr * zoom,
            textHeight: 126 * this.dpr * zoom,
            text: this.mOutputText,
        })
            .layout();

        this.mInputPanel = new InputPanle(this.scene, this.dpr);
        this.mInputPanel.y = 134 * this.dpr;
        this.add([
            this.mBackground,
            this.mTextArea,
            this.mOutputText,
            this.mInputPanel
        ]);
        this.resize(this.width, 133 * this.dpr);
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
        // this.mInputText = undefined;
        if (!val) {
            return;
        }
        const mediator = this.mediator;
        if (!mediator) return;
        mediator.sendChat(val);
        // this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_chat", val);
    }

    private onSendMsgHandler(val: string) {
        this.sendChat(val);
    }

    get mediator() {
        return this.render.mainPeer[ModuleName.CHAT_NAME];
    }
}

class InputPanle extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Graphics;
    private inputText: LabelInput;
    constructor(scene: Phaser.Scene, private dpr: number) {
        super(scene);
        this.background = scene.make.graphics(undefined, false);
        const text = i18n.t("chat.placeholder");
        const w = this.scene.cameras.main.width;
        this.inputText = new LabelInput(this.scene, {
            width: w,
            height: 16 * this.dpr,
            placeholder: text,
            fontSize: 11 * this.dpr + "px",
            color: "#ffffff",
        }).setOrigin(0, 0.5);
        this.add([this.background, this.inputText]);
        this.inputText.on("enter", this.onEnterHandler, this);
    }

    public resize() {
        const w = this.scene.cameras.main.width;
        this.setSize(w, 38.33 * this.dpr);
        this.inputText.x = 46 * this.dpr;
        this.inputText.y = this.height * 0.5;
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
