import { DynamicImage } from "../../components/dynamic.image";

export class Item extends Phaser.GameObjects.Container {
  private mCount: Phaser.GameObjects.Text;
  private mProp: DynamicImage;
  constructor(scene: Phaser.Scene) {
    super(scene);
  }

  setProp() {
  }
}
