import { NiceSliceButton } from "../../../../base/component/button/NiceSliceButton";

export class MenuItem extends NiceSliceButton {
  constructor(game: Phaser.Game, x: number, y: number, key: string, overFrame: string, outFrame: string, downFrame: string, width: number, height: number, data?: PhaserNineSlice.NineSliceCacheData, text?: string, fontSize?: number) {
    super(game, x, y, key, overFrame, outFrame, downFrame, width, height, data, text, fontSize);
  }
}