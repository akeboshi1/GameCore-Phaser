import { Logger } from "../../utils/log";
import { ValueResolver } from "../../utils/promise";
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
    private createResolvers: Map<string, ValueResolver<BasicScene>> = new Map();

    constructor(private game: Phaser.Game) {

    }

    public startScene(name: string, data?: any): Promise<BasicScene> {
        if (!this.sceneClass.hasOwnProperty(name)) {
            Logger.getInstance().error("className error: ", name);
        }
        if (this.stateSceneName && this.game.scene.getScene(this.stateSceneName)) {
            if (this.stateSceneName === name) {
                const exitScene = this.game.scene.getScene(this.stateSceneName) as BasicScene;
                exitScene.wake(data);
                return new Promise<BasicScene>((resolve) => {
                    resolve(exitScene);
                });
            }
        }

        const resolver = new ValueResolver<BasicScene>();
        this.createResolvers.set(name, resolver);
        return resolver.promise(() => {
            const newScene = this.game.scene.add(name, this.sceneClass[name], true, { data });
            newScene.events.once("create", this.startedSceneCreated, this);
        });
    }

    public launchScene(name: string, data?: any): Promise<BasicScene> {
        if (!this.stateSceneName || !this.game.scene.getScene(this.stateSceneName)) {
            Logger.getInstance().error("no state scene is running");
            return;
        }

        const resolver = new ValueResolver<BasicScene>();
        this.createResolvers.set(name, resolver);
        return resolver.promise(() => {
            const scene = this.game.scene.getScene(this.stateSceneName);
            const scenePlugin = scene.scene.launch(name, data);
            this.launchedScenes.push(name);
            scenePlugin.scene.events.once("create", this.launchedSceneCreated, this);
        });
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
            return;
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

    public isActive(name: string): boolean {
        if (!this.game.scene.getScene(name)) {
            return false;
        }
        return this.game.scene.getScene(name).scene.isActive();
    }

    private startedSceneCreated(scene: Phaser.Scene) {
        const key = scene.scene.key;
        if (!this.createResolvers.has(key)) {
            return;
        }
        const resolver = this.createResolvers.get(key);
        this.createResolvers.delete(key);
        resolver.resolve(scene as BasicScene);

        if (this.stateSceneName && this.game.scene.getScene(this.stateSceneName)) {
            this.stopScene(this.stateSceneName);
        }
        this.stateSceneName = key;
    }
    private launchedSceneCreated(scene: Phaser.Scene) {
        const key = scene.scene.key;
        if (!this.createResolvers.has(key)) {
            return;
        }
        const resolver = this.createResolvers.get(key);
        this.createResolvers.delete(key);
        resolver.resolve(scene as BasicScene);
    }
}
