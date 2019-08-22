import { op_client, op_gameconfig } from "pixelpai_proto";

export class BasicElement {
  protected id: number;
  protected type: string;
  protected x: number;
  protected y: number;
  protected z: number;
  protected display: op_gameconfig.IDisplay | undefined;
  protected animation: op_gameconfig.IAnimation | undefined;
  protected animationName: string;

  protected mLayer: Phaser.GameObjects.Container;
  constructor(parent?: Phaser.GameObjects.Container) {
    this.layer = parent;
  }

  createDisplay(): any {
    return;
  }

  protected onLoadCompleteHandler() {
    if (this.layer) {
      console.error("layer is undefine");
    }
  }

  set layer(layer: Phaser.GameObjects.Container) {
    this.mLayer = layer;
  }

  get lyaer(): Phaser.GameObjects.Container {
    return this.mLayer;
  }
}