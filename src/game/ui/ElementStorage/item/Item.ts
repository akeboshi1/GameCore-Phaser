import { DynamicImage } from "../../components/dynamic.image";
import { op_client } from "pixelpai_proto";
import { Url } from "../../../game/core/utils/resUtil";

export class Item extends Phaser.GameObjects.Container {
  private mCount: Phaser.GameObjects.Text;
  private mImage: DynamicImage;
  private mProp: op_client.ICountablePackageItem;
  constructor(scene: Phaser.Scene) {
    super(scene);
    const background = scene.make.image({
      key: "prop_background"
    }).setOrigin(0, 0);
    this.setSize(background.width, background.height);
    this.add(background);

    this.mImage = new DynamicImage(this.scene, 0, 0).setOrigin(0, 0);
    this.add(this.mImage);

    this.mCount = scene.make.text(undefined, false);
    this.mCount.setAlign("right");
    this.mCount.y = this.height - 20;
    this.add(this.mCount);
  }

  setProp(prop: op_client.ICountablePackageItem) {
    this.mProp = prop;
    if (!this.mCount) {
      return;
    }

    if (prop) {
      this.mImage.load(Url.getOsdRes(prop.display.texturePath), this, () => {
        // this.mImage.on("dragstart", this.onPointerUpHandler, this);
        this.mImage.setInteractive();
        this.scene.input.setDraggable(this.mImage);
        let imageScale = 1;
        if (this.mImage.width > this.width) {
          imageScale = this.width / this.mImage.width;
        }
        if (this.mImage.height > this.height) {
          imageScale = this.height / this.mImage.height;
        }
        this.mImage.scale = imageScale;
      });

      this.mCount.setText(prop.count > 1 ? prop.count.toString() : "");
      this.mCount.x = this.width - this.mCount.width;
    }
  }

  clear() {
    if (!this.count) {
      return;
    }
    if (!this.mProp) {
      return;
    }
    this.mCount.setText("");
    this.mImage.setTexture(undefined);
    this.mImage.off("pointerup", this.onPointerUpHandler, this);
    this.mProp = undefined;
  }

  destroy() {
    this.clear();
    super.destroy();
  }

  get prop(): op_client.ICountablePackageItem {
    return this.mProp;
  }

  private onPointerUpHandler() {
    this.emit("click", this.mProp);
  }
}
