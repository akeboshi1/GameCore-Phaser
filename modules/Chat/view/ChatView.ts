import "phaser-ce";
import {ModuleViewBase} from "../../../common/view/ModuleViewBase";
import {UI} from "../../../Assets";
import {PhaserNineSlice} from "../../../lib/nineSlice/Plugin";

export class ChatView extends ModuleViewBase {
    public out_tf: Phaser.Text;
    public input_tf: Phaser.Text;
    public bt: any;
    constructor(game: Phaser.Game) {
        super(game);
    }

    public onResize(): void {
        this.x = this.game.camera.x;
        this.y = this.game.camera.y;
    }

    protected init(): void {
        this.game.add.nineSlice(0, this.game.height - 200, UI.DialogBg.getName(), null, 300, 200, this);
        this.game.add.nineSlice(10, this.game.height - 30, UI.InputBg.getName(), null, 260, 24, this);
        this.out_tf = this.game.make.text(12, this.game.height - 200, "", {fontSize: 12, fill: "#ffcc00"});
        this.add(this.out_tf);
        this.input_tf = this.game.make.text(12, this.game.height - 28, "请输入", {fontSize: 12, fill: "#ffcc00"});
        this.add(this.input_tf);
        // @ts-ignore
        this.bt = this.game.add.nineSlice(280, this.game.height - 28, UI.Button1.getName(), null, 30, 24 , this);
    }
}
