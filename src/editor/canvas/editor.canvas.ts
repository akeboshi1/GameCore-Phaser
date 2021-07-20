export interface IEditorCanvasConfig {
    width: number;
    height: number;
    parent: string;
    osd?: string;// 远程地址
    LOCAL_HOME_PATH?: string;// 本地路径
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
            parent: config.parent,
            type: Phaser.AUTO,
            backgroundColor: "#464646",
            render: {
                pixelArt: true,
                roundPixels: true,
                premultipliedAlpha: false,
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

    public resize(width: number, height: number) {
        if (this.mGame) {
            this.mGame.scale.setGameSize(width, height);
        }
    }

    public enableClick() {
    }

    public disableClick() {
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
