import { DynamicImage } from "../../components/dynamic.image";
import { op_client } from "pixelpai_proto";
import { Url } from "../../../utils/resUtil";

export class Item extends Phaser.GameObjects.Container {
  private mCount: Phaser.GameObjects.Text;
  private mProp: DynamicImage;
  constructor(scene: Phaser.Scene) {
    super(scene);
    const background = scene.make.image({
      key: "prop_background"
    }).setOrigin(0, 0);
    this.add(background);

    this.mProp = new DynamicImage(this.scene, 0, 0).setOrigin(0, 0);
    this.add(this.mProp);

    this.mCount = scene.make.text(undefined, false);
    this.add(this.mCount);
  }

  setProp(prop: op_client.ICountablePackageItem) {
    if (!this.mCount) {
      return;
    }
    if (prop) {
      this.mProp.load(Url.getOsdRes(prop.display.texturePath));
      this.mCount.setText(prop.count > 1 ? prop.count.toString() : "");
    }
  }

  clear() {
    if (!this.count) {
      return;
    }
    this.mCount.setText("");
    this.mProp.texture = null;
  }
}
