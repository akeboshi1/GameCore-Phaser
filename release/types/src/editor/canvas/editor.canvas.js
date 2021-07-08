var EditorCanvas = /** @class */ (function () {
    function EditorCanvas(config) {
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
    EditorCanvas.prototype.resize = function (width, height) {
        if (this.mGame) {
            this.mGame.scale.setGameSize(width, height);
        }
    };
    EditorCanvas.prototype.destroy = function () {
        if (this.mGame) {
            this.mGame.plugins.removeScenePlugin("DragonBones");
            this.mGame.destroy(true);
            this.mGame = null;
        }
        if (this.mEmitter) {
            this.mEmitter.removeAllListeners();
        }
    };
    return EditorCanvas;
}());
export { EditorCanvas };
//# sourceMappingURL=editor.canvas.js.map