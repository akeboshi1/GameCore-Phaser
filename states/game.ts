import {SceneProc} from "../process/SceneProc";
import {Isometric} from "phaser-plugin-isometric";

export default class Game extends Phaser.State {
    public init(): void {

    }

    public create(): void {
        this.game.plugins.add(new Isometric(this.game));
        SceneProc.getInstance().beginProc();
    }
}