import {SceneProc} from "../process/SceneProc";
import Globals from "../Globals";

export default class Game extends Phaser.State {
    public init(): void {
    }

    public create(): void {
        SceneProc.getInstance().beginProc();
    }
}