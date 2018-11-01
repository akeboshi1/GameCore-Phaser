import {SceneProc} from "../process/SceneProc";
import Globals from "../Globals";

export default class Game extends Phaser.State {

    public init(): void {
        this.game.time.advancedTiming = true;
        Globals.TickManager.init(this.game);
        Globals.LayerManager.init(this.game);
        Globals.LayoutManager.init(this.game);
        // Globals.game.iso.anchor.setTo(0.5, 0.5);
        // Globals.game.iso.anchor.setTo(0.5, 0);
    }

    public create(): void {
        SceneProc.getInstance().beginProc();
    }

    public render(): void {
        this.game.debug.text(this.game.time.fps.toString(), 2, 14, '#a7aebe');
        // this.game.debug.text(this.game.world.width+"|"+this.game.world.height+"|"+this.game.time.fps.toString(), 2, 14, '#a7aebe');
        // this.game.debug.cameraInfo(this.game.camera, 2, 32, '#a7aebe');
    }
}