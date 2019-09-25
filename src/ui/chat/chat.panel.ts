import {IAbstractPanel} from "../abstractPanel";
import {WorldService} from "../../game/world.service";
import {Logger} from "../../utils/log";
import RoundRectangle from "../../../lib/rexui/plugins/gameobjects/shape/roundrectangle/RoundRectangle";
import TextArea from "../../../lib/rexui/templates/ui/textarea/TextArea";
import InputText from "../../../lib/rexui/plugins/gameobjects/inputtext/InputText";
import NinePatch from "../../../lib/rexui/plugins/gameobjects/ninepatch/NinePatch";
import {Panel} from "../components/panel";

export class ChatPanel extends Panel {
    private mParent: Phaser.GameObjects.Container;
    private mTextArea: TextArea;
    constructor(scene: Phaser.Scene, private mWorldService: WorldService) {
        super(scene);
    }

    public appendChat(val: string) {
    }

    public setSize(w: number, h: number) {
        this.mParent.setSize(w, h);
    }

    public setLocation(x: number, y: number) {
        if (!this.mParent) {
            return;
        }
        return;
        // TODO 设置位置后，DefaultMask位置不会更新，所以暂时以0 0为准
        // DefaultMask在TextBlock中，TextBlock是一个非渲染矩形游戏对象
        const size = this.mWorldService.getSize();
        this.mParent.x = 8;
        this.mParent.y = size.height - this.mParent.height - 8;
    }

    protected preload() {
        if (!this.mScene) {
            return;
        }
        super.preload();
    }

    protected init() {
        if (this.mInitialized) return;
        super.init();
        this.mParent = this.mScene.add.container(0, 0);

        const output = this.mScene.make.container(undefined, false);
        this.mParent.add(output);

        const background = new RoundRectangle(this.mScene, 0, 0, 2, 2, 3, 0x808080, 0.5);
        output.add(background);

        const track = new RoundRectangle(this.mScene, 100, 10, 10, 10, 10, 0x260e04);
        output.add(track);

        const text = this.mScene.make.text(undefined, false);
        text.setSize(440, 200);
        output.add(text);

        const thumb = new RoundRectangle(this.mScene, 0, 0, 10, 20, 10, 0xFFFF00);
        output.add(thumb);
        this.mTextArea = new TextArea(this.mScene, {
            x: 228,
            y: 820,
            width: 440,
            height: 200,
            textWidth: 420,
            textHeight: 190,

            background,

            text,
            // text: this.rexUI.add.BBCodeText(),
            // textMask: false,

            slider: {
                track,
                thumb,
            },

        })
            .layout();
        output.add(this.mTextArea);

        let s = "";
        for (let i = 999; i < 100000; i++) {
            s += i + "\n";
        }

        this.mTextArea.setText(s);

        const tracks = this.mTextArea.getElement("child");
        if (tracks) {
            // tracks.x += 150;
        }

        const inputContainer = this.mScene.make.container(undefined, false);
        this.mParent.add(inputContainer);

        const inputText = new InputText(this.mScene, 10, 930, 10, 10, {
            type: "input",
            text: "hello world",
            fontSize: "14px",
        })
            .resize(100, 20)
            .setOrigin(0, 0);

        this.mParent.add(inputText);

        // const sendMsg = this.mScene.make.image();

        // this.setSize(464, 281);
        // this.setLocation(0, 0);
    }
}
