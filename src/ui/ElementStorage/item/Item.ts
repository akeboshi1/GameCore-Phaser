import { DynamicImage } from "../../components/dynamic.image";
import { op_client } from "pixelpai_proto";
import { Url } from "../../../utils/resUtil";
import { Logger } from "../../../utils/log";

export class Item extends Phaser.GameObjects.Container {
  private mCount: Phaser.GameObjects.Text;
  private mImage: DynamicImage;
  private mProp: op_client.ICountablePackageItem;
  constructor(scene: Phaser.Scene) {
    super(scene);
    const background = scene.make.image({
      key: "prop_background"
    }).setOrigin(0, 0);
    this.add(background);

    this.mImage = new DynamicImage(this.scene, 0, 0).setOrigin(0, 0);
    this.add(this.mImage);

    this.mCount = scene.make.text(undefined, false);
    this.add(this.mCount);
  }

  setProp(prop: op_client.ICountablePackageItem) {
    this.mProp = prop;
    if (!this.mCount) {
      return;
    }

    if (prop) {
      this.mImage.load(Url.getOsdRes(prop.display.texturePath), this, () => {
        this.mImage.setInteractive();
        this.mImage.on("pointerup", this.onPointerUpHandler, this);
      });

      this.mCount.setText(prop.count > 1 ? prop.count.toString() : "");
    }
  }

  clear() {
    if (!this.count) {
      return;
    }
    this.mCount.setText("");
    this.mImage.texture = null;
    this.mImage.off("pointerup", this.onPointerUpHandler, this);
    this.mProp = undefined;
  }

  private onPointerUpHandler() {
    this.emit("click", this.mProp);
  }
}
