import { Render } from "gamecoreRender";
import { Handler } from "utils";
import { PicaGiftLateralItem } from "./PicaGiftLateralItem";

export class PicaGiftLaterctPanel extends Phaser.GameObjects.Container {
    private key: string;
    private dpr: number;
    private giftQueue: any[] = [];
    private isPlaying: boolean = false;
    constructor(scene: Phaser.Scene, private render: Render, key: string, dpr: number) {
        super(scene);
        this.key = key;
        this.dpr = dpr;
    }
    play(data: any[]) {
        this.giftQueue.push(data);
        this.playNext();
    }

    private playNext() {
        if (this.isPlaying) return;
        if (this.giftQueue.length > 0) {
            const data = this.giftQueue.shift();
            const item = new PicaGiftLateralItem(this.scene, this.key, this.dpr);
            item.setItemData(Handler.create(this, () => {
                this.isPlaying = false;
                this.playNext();
            }));
            item.playMove();
            this.add(item);
            this.isPlaying = true;
        }
    }
}
