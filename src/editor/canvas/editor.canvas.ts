import { IRectangle } from "game-capsule/lib/helpers";

export interface IEditorCanvasConfig {
    width: number;
    height: number;
    node: {};
    LOCAL_HOME_PATH: string;
    parent?: string;
}

export class EditorCanvas {

    protected mGame: Phaser.Game | undefined;
    protected mConfig: IEditorCanvasConfig;
    protected mEmitter: Phaser.Events.EventEmitter;

    constructor(config: IEditorCanvasConfig) {
        this.mConfig = config;
        this.mGame = new Phaser.Game({
            // width: config.width,
            // height: config.height,
            parent: config.parent || "element-editor",
            type: Phaser.AUTO,
            backgroundColor: "#464646",
            render: {
                pixelArt: true,
                roundPixels: true
            },
            plugins: {
                scene: [
                    {
                        key: "DragonBones",
                        plugin: dragonBones.phaser.plugin.DragonBonesScenePlugin,
                        mapping: "dragonbone"
                    }
                ]
            },
            scale: {
                mode: Phaser.Scale.NONE,
                width: config.width,
                height: config.height,
                autoCenter: Phaser.Scale.CENTER_BOTH
            },
        });

        this.mEmitter = new Phaser.Events.EventEmitter();
    }

    public resize(bounds: IRectangle) {
        if (this.mGame) {
            this.mGame.scale.setGameSize(bounds.width, bounds.height);
        }
    }

    public destroy() {
        if (this.mGame) {
            this.mGame.plugins.removeScenePlugin("DragonBones");
            this.mGame.destroy(true);
            this.mGame = null;
        }

        if (this.mEmitter) {
            this.mEmitter.removeAllListeners();
        }
    }
}
