import { PhaserNineSlice} from "../../../lib/nineSlice/Plugin";
import NineSliceCacheData = PhaserNineSlice.NineSliceCacheData;

export class NiceSliceButton extends Phaser.Sprite {
    protected mOverFrame: PhaserNineSlice.NineSlice;
    protected mOutFrame: PhaserNineSlice.NineSlice;
    protected mDownFrame: PhaserNineSlice.NineSlice;

    constructor(game: Phaser.Game, x: number, y: number, key: string, overFrame: string, outFrame: string, downFrame: string, width: number, height: number, data?: NineSliceCacheData) {
        super(game, 0, 0);
        this.mOverFrame = new PhaserNineSlice.NineSlice(game, x, y, key, overFrame, width, height, data);
        this.mOverFrame.visible = false;
        this.mOutFrame = new PhaserNineSlice.NineSlice(game, x, y, key, outFrame, width, height, data);
        this.mOutFrame.visible = true;
        this.mDownFrame = new PhaserNineSlice.NineSlice(game, x, y, key, downFrame, width, height, data);
        this.mDownFrame.visible = false;
        this.addChild(this.mOverFrame);
        this.addChild(this.mOutFrame);
        this.addChild(this.mDownFrame);
        this.init();
    }

    protected init(): void {
        this.inputEnabled = true;
        this.events.onInputOver.add(this.handleOver, this);
        this.events.onInputOut.add(this.handleOut, this);
        this.events.onInputDown.add(this.handleDown, this);
        this.events.onInputUp.add(this.handleUp, this);
    }

    private handleOver(): void {
        this.mOverFrame.visible = true;
        this.mOutFrame.visible = false;
        this.mDownFrame.visible = false;
    }

    private handleOut(): void {
        this.mOverFrame.visible = true;
        this.mOutFrame.visible = false;
        this.mDownFrame.visible = false;
    }

    private handleDown(): void {
        this.mOverFrame.visible = false;
        this.mOutFrame.visible = false;
        this.mDownFrame.visible = true;
    }

    private handleUp(): void {
        this.mOverFrame.visible = false;
        this.mOutFrame.visible = true;
        this.mDownFrame.visible = false;
    }

    public destroy(destroyChildren?: boolean): void {
        if (this.mOverFrame) {
            this.mOverFrame.destroy(true);
        }
        this.mOverFrame = null;
        if (this.mOutFrame) {
            this.mOutFrame.destroy(true);
        }
        this.mOutFrame = null;
        if (this.mDownFrame) {
            this.mDownFrame.destroy(true);
        }
        this.mDownFrame = null;
        super.destroy(destroyChildren);
    }
}