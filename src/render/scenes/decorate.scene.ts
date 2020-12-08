import { PlayScene } from "./play.scene";
import { SceneName } from "structure";

export class DecorateScene extends PlayScene {
    constructor(config?: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config || { key: SceneName.DECORATE_SCENE });
    }

    protected initInput() {
    }
}
