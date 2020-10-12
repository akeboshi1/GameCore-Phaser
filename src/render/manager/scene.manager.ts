import { Export, RPCEmitter } from "webworker-rpc";
import { Logger } from "../../utils/log";
import { PlayScene } from "../scenes/play";

export class SceneManager extends RPCEmitter {
    constructor(private game: Phaser.Game) {
        super();
    }

    @Export()
    public addScene(name: string, room) {// TODO: 只传id，所有由scene发起的逻辑，转移到worker中
        this.game.scene.add(name, PlayScene, true, { room });
    }

    @Export()
    public removeScene(name: string) {
        this.game.scene.remove(name);
    }

    @Export()
    public pauseScene(name: string) {
        const scene = this.game.scene.getScene(name);
        if (!scene) {
            Logger.getInstance().error("scene not found : ", name);
            return;
        }

        scene.scene.pause();
    }

    @Export()
    public resumeScene(name: string) {
        const scene = this.game.scene.getScene(name);
        if (!scene) {
            Logger.getInstance().error("scene not found : ", name);
            return;
        }

        scene.scene.resume(name);
    }
}
