import { PhaserNineSlice} from "../../../lib/nineSlice/Plugin";
import NineSliceCacheData = PhaserNineSlice.NineSliceCacheData;

export class NiceSliceButton extends PhaserNineSlice.NineSlice {
    protected
    protected mOverFrame: string;
    protected mOutFrame: string;
    protected mDownFrame: string;

    constructor(game: Phaser.Game, x: number, y: number, key: string, overFrame: string, outFrame: string, downFrame: string, width: number, height: number, data?: NineSliceCacheData) {
        super(game, x, y, key, outFrame, width, height, data);
        this.mOverFrame = overFrame;
        this.mOutFrame = outFrame;
        this.mDownFrame = downFrame;
        this.init();
    }

    protected init(): void {
        this.inputEnabled = true;
        this.events.onInputOver.add(this.handleOver, this);
        this.events.onInputOut.add(this.handleOut, this);
        this.events.onInputDown.add(this.handleDown, this);
        this.events.onInputUp.add(this.handleUp, this);
    }

    protected updateTexture(frame: string): void {
        this.loadTexture(this.key, frame);
        this.baseFrame = this.texture.frame;
        let s: Phaser.Sprite;
        // The positions we want from the base texture
        let textureXs: number[] = [0, this.leftSize, this.baseFrame.width - this.rightSize, this.baseFrame.width];
        let textureYs: number[] = [0, this.topSize, this.baseFrame.height - this.bottomSize, this.baseFrame.height];
        // These are the positions we need the eventual texture to have
        let finalXs: number[] = [0, this.leftSize, this.localWidth - this.rightSize, this.localWidth];
        let finalYs: number[] = [0, this.topSize, this.localHeight - this.bottomSize, this.localHeight];
        for (let yi = 0; yi < 3; yi++) {
            for (let xi = 0; xi < 3; xi++) {
                s = this.sList[yi][xi];
                this.updateTexturePart(s,
                    textureXs[xi],                      // x
                    textureYs[yi],                      // y
                    textureXs[xi + 1] - textureXs[xi],  // width
                    textureYs[yi + 1] - textureYs[yi]   // height
                );
                s.scale.x = s.scale.y = 2;
            }
        }
    }

    protected updateTexturePart(s: Phaser.Sprite, x: number, y: number, width: number, height: number): void {
        let frameRect = new PIXI.Rectangle(
            this.baseFrame.x + this.texture.frame.x + x,
            this.baseFrame.y + this.texture.frame.y + y,
            Math.max(width, 1),
            Math.max(height, 1)
        );
        s.setTexture(new PIXI.Texture(this.baseTexture, frameRect));
    }

    private handleOver(): void {
        this.updateTexture(this.mOverFrame);
    }

    private handleOut(): void {
        this.updateTexture(this.mOutFrame);
    }

    private handleDown(): void {
        this.updateTexture(this.mDownFrame);
    }

    private handleUp(): void {
        this.updateTexture(this.mOutFrame);
    }

    public destroy(destroyChildren?: boolean): void {
        super.destroy();
        this.mDownFrame = "";
        this.mOverFrame = "";
        this.mOutFrame = "";
    }
}