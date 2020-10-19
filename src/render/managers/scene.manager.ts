import { Scene } from "tooqinggamephaser";
import { Export, RPCEmitter } from "webworker-rpc";
import { Logger } from "../../utils/log";
import { ResUtils } from "../../utils/resUtil";
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
    private readonly sceneClass = {
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

    private stateSceneName: string;
    private launchedScenes: string[] = [];

    constructor(private game: Phaser.Game) {

    }

    public startScene(name: string, data?: any) {
        if (!this.sceneClass.hasOwnProperty(name)) {
            Logger.getInstance().error("className error: ", name);
        }
        if (this.stateSceneName && this.game.scene.getScene(this.stateSceneName)) {
            this.stopScene(this.stateSceneName);
        }

        this.game.scene.add(name, this.sceneClass[name], true, { data });
        this.stateSceneName = name;
    }

    public launchScene(name: string, data?: any) {
        if (!this.stateSceneName || !this.game.scene.isActive(this.stateSceneName)) {
            Logger.getInstance().error("no state scene is running");
            return;
        }

        const scene = this.game.scene.getScene(this.stateSceneName);
        scene.scene.launch(name, data);
        this.launchedScenes.push(name);
    }

    public stopScene(name: string) {
        if (name === this.stateSceneName) {
            for (const ls of this.launchedScenes) {
                if (this.game.scene.getScene(ls)) {
                    this.game.scene.remove(ls);
                }
            }
            this.stateSceneName = null;
            this.launchedScenes.length = 0;
        }
        this.game.scene.remove(name);
    }

    public wakeScene(name: string, data?: any) {
        if (!this.game.scene.getScene(name)) {
            this.startScene(name, data);
        } else {
            const scene = this.game.scene.getScene(name) as BasicScene;
            scene.wake(data);
        }
    }

    public sleepScene(name: string) {
        if (!this.game.scene.getScene(name)) {
            return;
        }
        const scene = this.game.scene.getScene(name) as BasicScene;
        scene.sleep();
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