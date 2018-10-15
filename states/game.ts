import {SceneProc} from "../process/SceneProc";
export default class Game extends Phaser.State {
    public init(): void {

    }

    public create(): void {
        new Phaser.Plugin.Isometric(this.game);
        SceneProc.getInstance().beginProc();
    }
}