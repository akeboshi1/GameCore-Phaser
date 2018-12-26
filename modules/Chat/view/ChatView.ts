import "phaser-ce";
import {ModuleViewBase} from "../../../common/view/ModuleViewBase";
import {UI} from "../../../Assets";
import {PhaserNineSlice} from "../../../lib/nineSlice/Plugin";

export class ChatView extends ModuleViewBase {
    public tf: Phaser.Text;
    constructor(game: Phaser.Game) {
        super(game);
    }

    public onResize(): void {
        this.x = this.game.camera.x;
        this.y = this.game.camera.y;
    }

    protected init(): void {
        let ns: PhaserNineSlice.NineSlice = this.game.add.nineSlice(0, this.game.height - 200, UI.DialogBg.getName(), null, 300, 200);
        this.add(ns);
        ns = this.game.add.nineSlice(10, this.game.height - 30, UI.InputBg.getName(), null, 260, 24);
        this.add(ns);
        this.tf = this.game.make.text(10, this.game.height - 28, "请输入", {fontSize: 12, fill: "#ffcc00"});
        this.add(this.tf);
    }
}
