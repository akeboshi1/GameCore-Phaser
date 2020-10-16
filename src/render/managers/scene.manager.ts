import { Export, RPCEmitter } from "webworker-rpc";
import { Logger } from "../../utils/log";
import { BasicScene } from "../scenes/basic.scene";
import { CreateRoleScene } from "../scenes/create.role.scene";
import { GamePauseScene } from "../scenes/game.pause.scene";
import { LoadingScene } from "../scenes/loading.scene";
import { LoginAccountScene } from "../scenes/login.account.scene";
import { LoginScene } from "../scenes/login.scene";
import { MainUIScene } from "../scenes/main.ui.scene";
import { PlayScene } from "../scenes/play.scene";
import { RoomScene } from "../scenes/room.scene";
import { SelectRoleScene } from "../scenes/select.role.scene";
import { SkyBoxScene } from "../scenes/sky.box.scene";

export class SceneManager {
    private readonly sceneClassName = {
        "BasicScene": BasicScene,
        "CreateRoleScene": CreateRoleScene,
        "GamePauseScene": GamePauseScene,
        "LoadingScene": LoadingScene,
        "LoginAccountScene": LoginAccountScene,
        "LoginScene": LoginScene,
        "MainUIScene": MainUIScene,
        "PlayScene": PlayScene,
        "RoomScene": RoomScene,
        "SelectRoleScene": SelectRoleScene,
        "SkyBoxScene": SkyBoxScene
    };

    constructor(private game: Phaser.Game) {

    }

    public startScene(name: string, data?: any) {
        const className = "";// TODO: add global file
        if (!this.sceneClassName.hasOwnProperty(className)) {
            Logger.getInstance().error("className error: ", className);
        }
        this.game.scene.add(name, this.sceneClassName[className], true, { data });
    }

    public stopScene(name: string) {
        this.game.scene.stop(name);
    }

    public wakeScene(name: string) {
        const scene = this.game.scene.getScene(name);
        if (!scene) {
            Logger.getInstance().error("scene not found : ", name);
            return;
        }

        scene.scene.wake(name);
    }

    public sleepScene(name: string) {
        const scene = this.game.scene.getScene(name);
        if (!scene) {
            Logger.getInstance().error("scene not found : ", name);
            return;
        }

        scene.scene.sleep(name);
    }

    public pauseScene(name: string) {
        const scene = this.game.scene.getScene(name);
        if (!scene) {
            Logger.getInstance().error("scene not found : ", name);
            return;
        }

        scene.scene.pause(name);
    }

    public resumeScene(name: string) {
        const scene = this.game.scene.getScene(name);
        if (!scene) {
            Logger.getInstance().error("scene not found : ", name);
            return;
        }

        scene.scene.resume(name);
    }
}
