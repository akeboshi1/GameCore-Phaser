import { Panel } from "../components/panel";
import { WorldService } from "../../game/world.service";
import { Logger } from "../../utils/log";

export class ActivityPanel extends Panel {
    private readonly key: string = "activity";
    constructor(scene: Phaser.Scene, worldService: WorldService) {
        super(scene, worldService);
        this.setTween(false);
    }

    resize(w: number, h: number) {
        const width = this.scene.cameras.main.width; // / this.scale;
        const height = this.scene.cameras.main.height; // / this.scale;
        this.x = width - 60 * this.dpr;
        this.y = 120 * this.dpr;
        super.resize(width, height);
    }

    protected preload() {
        this.addAtlas(this.key, "activity/activity.png", "activity/activity.json");
        super.preload();
    }

    protected init() {
        for (let i = 0; i < 3; i++) {
            const img = this.scene.make.image({
                key: this.key,
                frame: `icon_${i + 1}.png`
            }, false).setOrigin(0);
            // img.y = i * 50 * this.dpr;
            this.add(img);
        }
        super.init();

        let mainMenuW = 150 * this.dpr;
        const subList = this.list;
        subList.map((btn: Phaser.GameObjects.Image) => mainMenuW -= btn.height);
        const margin = mainMenuW / (subList.length - 1);
        for (let i = 1; i < subList.length; i++) {
            const preButton = <Phaser.GameObjects.Image> subList[i - 1];
            const button = <Phaser.GameObjects.Image> subList[i];
            button.y = preButton.height + preButton.y + margin;
        }

        this.resize(0, 0);
    }
}
