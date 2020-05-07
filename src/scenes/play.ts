import { MainUIScene } from "./main.ui";
import { IRoomService } from "../rooms/room";
import { Size } from "../utils/size";
import { BasicScene } from "./basic.scene";
import { PlayCamera } from "../rooms/cameras/play.camera";

// 游戏正式运行用 Phaser.Scene
export class PlayScene extends BasicScene {
    protected mRoom: IRoomService;
    constructor(config?: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config || { key: PlayScene.name });
    }

    public preload() {}

    public init(data: any) {
        if (data) {
            this.mRoom = data.room;
        }
    }

    public create() {
        const scene = this.game.scene.getScene(MainUIScene.name);
        const oldCamera = this.cameras.main;
        this.cameras.addExisting(
            new PlayCamera(0, 0, this.sys.scale.width, this.sys.scale.height, this.mRoom.world.scaleRatio),
            true
        );
        this.cameras.remove(oldCamera);

        if (!scene.scene.isActive()) {
            this.scene.launch(MainUIScene.name, {
                room: this.mRoom,
            });
        }
        this.scene.sendToBack();
        this.scale.on("orientationchange", this.checkOriention, this);
        this.scale.on("resize", this.checkSize, this);
        if (this.mRoom) this.mRoom.startPlay();
    }

    update(time: number, delta: number) {
        // if (this.cameras.main) {
        //   this.cameras.main.emit("renderer", this.cameras.main);
        // }
        if (this.mRoom) {
            this.mRoom.update(time, delta);
        }
    }

    setViewPort(x: number, y: number, width: number, height: number) {
        super.setViewPort(x, y, width, height);
        this.cameras.main.zoom = Math.ceil(window.devicePixelRatio);
    }

    getKey(): string {
        return (this.sys.config as Phaser.Types.Scenes.SettingsConfig).key;
    }

    private checkOriention(orientation) {
        if (orientation === Phaser.Scale.PORTRAIT) {
        } else if (orientation === Phaser.Scale.LANDSCAPE) {
        }
    }

    private checkSize(size: Size) {
        const width: number = size.width;
        const height: number = size.height;
    }
}
