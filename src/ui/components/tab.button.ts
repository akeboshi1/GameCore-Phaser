import { NinePatchButton } from "./ninepatch.button";
import { IPatchesConfig } from "./patches.config";

export class TabButton extends NinePatchButton {
  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, frame: string, text?: string, config?: IPatchesConfig, data?: any) {
    super(scene, x, y, width, height, key, frame, text, config, data);
  }

  protected onPointerUp() {}
}
