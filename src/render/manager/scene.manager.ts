import { Export, RPCEmitter } from "webworker-rpc";
import { Logger } from "../../utils/log";
import { BasicScene } from "../scenes/basic.scene";
import { CreateRoleScene } from "../scenes/create.character";
import { LoadingScene } from "../scenes/loading";
import { PlayScene } from "../scenes/play.scene";
import { RoomScene } from "../scenes/room.scene";

export class SceneManager extends RPCEmitter {
    private readonly sceneClassName = {
        "BasicScene": BasicScene,
        "RoomScene": RoomScene,
        "PlayScene": PlayScene,
        "CreateRoleScene": CreateRoleScene,
        "LoadingScene": LoadingScene
    };
    private roomScenes: Map<number, RoomScene> = new Map<number, RoomScene>();
    private currentSceneName: string;

    constructor(private game: Phaser.Game) {
        super();
    }

    @Export()
    public addScene(name: string, className: string, room?: any) {
        if (!this.sceneClassName.hasOwnProperty(className)) {
            Logger.getInstance().error("className error: ", className);
        }
        if (this.currentSceneName && this.currentSceneName.length > 0) {
            this.game.scene.remove(this.currentSceneName);
        }
        const scene = this.game.scene.add(name, this.sceneClassName[className], true, { room });
        this.currentSceneName = name;
        if (scene instanceof RoomScene) {
            if (!room) {
                Logger.getInstance().error("no room data: ", name, className);
                return;
            }
            this.roomScenes.set(room.id, scene);
        }
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

    public getRoomScene(roomID: number): RoomScene | null {
        if (!this.roomScenes.has(roomID)) {
            return null;
        }

        return this.roomScenes.get(roomID);
    }
}
