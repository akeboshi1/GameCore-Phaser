import {ModuleViewBase} from "../../../common/view/ModuleViewBase";
import {UI} from "../../../Assets";
import {PhaserNineSlice} from "../../../lib/nineSlice/Plugin";

export class ChatView extends ModuleViewBase {
    constructor(game: Phaser.Game) {
        super(game);
    }

    public onResize(): void {
        this.x = this.game.camera.x;
        this.y = this.game.camera.y;
    }

    protected init(): void {
        let ns: PhaserNineSlice.NineSlice = this.game.add.nineSlice(0, this.game.height - 100, UI.DialogBg.getName(), null, 150, 100);
        this.add(ns);
        ns = this.game.add.nineSlice(10, this.game.height, UI.InputBg.getName(), null, 130, 24);
        this.add(ns);
    }
}
