import {SceneProc} from "../process/SceneProc";

export default class Game extends Phaser.State {
    public init(): void {
        new Phaser.Plugin.Isometric(this.game);
    }

    public create(): void {
        SceneProc.getInstance().beginProc();
    }
}