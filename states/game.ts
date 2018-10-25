import {SceneProc} from "../process/SceneProc";
import Globals from "../Globals";

export default class Game extends Phaser.State {
    public init(): void {
        this.game.iso.anchor.setTo(0.5, 0.5);
        Globals.LayerManager.init(this.game);
        Globals.LayoutManager.init(this.game);
    }

    public create(): void {
        SceneProc.getInstance().beginProc();
    }

    public render(): void {
        this.game.debug.cameraInfo(this.game.camera, 2, 32, '#a7aebe');
    }
}