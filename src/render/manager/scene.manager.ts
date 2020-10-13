import { Export, RPCEmitter } from "webworker-rpc";
import { Logger } from "../../utils/log";
import { PlayScene } from "../scenes/play";

export class SceneManager extends RPCEmitter {
    private scenes: Map<number, PlayScene> = new Map<number, PlayScene>();

    constructor(private game: Phaser.Game) {
        super();
    }

    @Export()
    public addScene(name: string, roomID?: number) {
        // TODO: name和class对应
        const scene = this.game.scene.add(name, PlayScene, true, { room }) as PlayScene;
        this.scenes.set(room.id, scene);
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

    public getScene(roomID: number): PlayScene | null {
        if (!this.scenes.has(roomID)) {
            return null;
        }

        return this.scenes.get(roomID);
    }
}
