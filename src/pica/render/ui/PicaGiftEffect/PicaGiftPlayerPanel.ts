import { Render } from "gamecoreRender";
import { Handler } from "utils";
import { PicaGiftLateralItem } from "./PicaGiftLateralItem";

export class PicaGiftPlayerPanel extends Phaser.GameObjects.Container {
    private key: string;
    private dpr: number;
    private giftQueue: any[] = [];
    private isPlaying: boolean = false;
    constructor(scene: Phaser.Scene, private render: Render, width: number, height: number, key: string, dpr: number) {
        super(scene);
        this.setSize(width, height);
        this.key = key;
        this.dpr = dpr;
    }
    play(data: any[]) {
        this.giftQueue.push(new Array(30));
        this.playNext();
    }

    private playNext() {
        // if (this.isPlaying) return;
        // if (this.giftQueue.length > 0) {
        //     const data = this.giftQueue.shift();
        //     const item = new PicaGiftLateralItem(this.scene, this.key, this.dpr);
        //     item.setItemData(Handler.create(this, () => {
        //         this.isPlaying = false;
        //         this.playNext();
        //     }));
        //     item.playMove(-this.width * 0.5 - item.width * 0.5, -this.width * 0.5 + item.width * 0.5);
        //     this.add(item);
        //     this.isPlaying = true;
        // }
    }
}
