import { UI, CustomWebFonts } from "../../../Assets";
import { op_client } from "pixelpai_proto";
import { GameConfig } from "../../../GameConfig";
import { BasicRankView } from "./BasicRankView";

export class RankView extends BasicRankView {
  private mZoomInBtn: Phaser.Button;
  private mZoomSize: number[];
  private mCurrentIndex: number;

  constructor(game: Phaser.Game) {
    super(game);
  }

  init() {
    super.init();

    this.mZoomSize = [30, 362];

    this.mZoomInBtn = this.game.make.button(153, 349, UI.ZoomArrowDown.getName());
    this.mZoomInBtn.inputEnabled = true;
    this.mZoomInBtn.events.onInputDown.add(this.onZoomInHandler, this);
    this.mZoomInBtn.anchor.set(0.5, 0.5);
    this.add(this.mZoomInBtn);

    this.x = GameConfig.GameWidth - this.width - 10;
    this.y = 21;

    this.currentSizeIndex = 1;
  }

  private onZoomInHandler() {
    this.currentSizeIndex = this.mCurrentIndex === 0 ? 1 : 0;
  }

  private set currentSizeIndex(value: number) {
    if (this.mCurrentIndex === value) {
      return;
    }
    this.mCurrentIndex = value;
    const h = this.mZoomSize[this.mCurrentIndex];

    if (this.mBg.height !== h) {
      this.mBg.resize(328, h);
    }

    if (h > 300) {
      this.add(this.mContentGroup);
      this.mZoomInBtn.angle = 180;
    } else {
      this.mZoomInBtn.angle = 0;
      this.remove(this.mContentGroup);
    }
    this.mZoomInBtn.y = h - 13;
  }
}