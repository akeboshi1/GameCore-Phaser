import { Panel } from "../components/panel";
import { WorldService } from "../../game/world.service";
import { NinePatchButton } from "../components/ninepatch.button";
import { i18n } from "../../i18n";
import { DetailDisplay } from "../Market/DetailDisplay";
import { Font } from "../../utils/font";
import { op_client, op_def } from "pixelpai_proto";
import { DynamicImage } from "../components/dynamic.image";
import { CheckboxGroup } from "../components/checkbox.group";
import { TextButton } from "../Market/TextButton";

export class FurniBagPanel extends Panel {
  private mKey: string = "furni_bag";
  private mBackground: Phaser.GameObjects.Graphics;
  private mCategoriesBar: Phaser.GameObjects.Graphics;
  private mSelectedElement: SelectedElement;
  private mShelfContainer: Phaser.GameObjects.Container;
  private mCategeoriesContainer: Phaser.GameObjects.Container;
  private mPropsContainer: Phaser.GameObjects.Container;
  private mItems: Item[];
  private mCategeories: TextButton[];

  constructor(scene: Phaser.Scene, world: WorldService) {
    super(scene, world);
  }

  resize(w: number, h: number) {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    super.resize(w, h);
    this.mBackground.clear();
    this.mBackground.fillStyle(0x02ccff);
    this.mBackground.fillRect(0, 0, width, height);
  }

  setCategories(subcategorys: op_def.IStrMap[]) {
    const group = new CheckboxGroup();
    const capW = 56 * this.dpr;
    const capH = 41 * this.dpr;
    this.mCategeories = [];
    for (let i = 0; i < subcategorys.length; i++) {
      const textBtn = new TextButton(this.scene, subcategorys[i].value, i * capW + capW / 2 , capH / 2);
      textBtn.setData("category", subcategorys[i]);
      textBtn.setSize(capW, capH);
      textBtn.setFontSize(15 * this.dpr);
      this.mCategeories[i] = textBtn;
    }
    this.mCategeoriesContainer.add(this.mCategeories);
    group.appendItemAll(this.mCategeories);
    group.on("selected", this.onSelectSubCategoryHandler, this);
    group.selectIndex(0);
  }

  protected preload() {
    this.addAtlas(this.mKey, "furni_bag/furni_bag.png", "furni_bag/furni_bag.json");
    super.preload();
  }

  protected init() {
    this.mBackground = this.scene.make.graphics(undefined, false);

    this.mSelectedElement = new SelectedElement(this.scene, this.mKey, this.dpr);
    this.mShelfContainer = this.scene.make.container(undefined, false);
    this.mPropsContainer = this.scene.make.container(undefined, false);
    this.mCategeoriesContainer = this.scene.make.container(undefined, false);

    this.add([this.mBackground, this.mSelectedElement, this.mShelfContainer]);
    this.mShelfContainer.add([this.mCategeoriesContainer, this.mPropsContainer]);
    super.init();
  }

  private onSelectSubCategoryHandler(gameobject) {
    
  }
}

class SelectedElement extends Phaser.GameObjects.Container {
  private mAdd: NinePatchButton;
  private mDetailBubbleContainer: Phaser.GameObjects.Container;
  private mDetailBubble: Phaser.GameObjects.Graphics;
  private mDetailDisplay: DetailDisplay;
  private mDesText: Phaser.GameObjects.Text;
  private mSource: Phaser.GameObjects.Text;
  private mSelectedProp: any;
  constructor(scene: Phaser.Scene, key: string, dpr: number) {
    super(scene, dpr);

    const frame = this.scene.textures.getFrame(key, "yellow_btn_normal");
    this.mAdd = new NinePatchButton(this.scene, 0, 0, 80 * dpr, 40 * dpr, key, "yellow_btn", i18n.t("furni_bag.add"), {
      left: 14 * dpr,
      top: 14 * dpr,
      right: frame.width - 2 - 14 * dpr,
      bottom: frame.height - 2 - 14 * dpr
    });
    this.mDetailDisplay = new DetailDisplay(this.scene);

    const bubbleW = 110 * dpr;
    const bubbleH = 96 * dpr;
    this.mDetailBubble = this.scene.make.graphics(undefined, false);
    this.mDetailBubble.fillStyle(0xFFFFFF, 0.1);
    this.mDetailBubble.fillRoundedRect(0, 0, bubbleW, bubbleH);

    this.mDetailBubbleContainer = this.scene.make.container(undefined, false);
    this.mDetailBubbleContainer.setSize(bubbleW, bubbleH);

    this.mDesText = this.scene.make.text({
      x: 8 * dpr,
      y: 56 * dpr,
      style: {
        color: "#32347b",
        fontSize: 10 * dpr,
        fontFamily: Font.DEFULT_FONT,
        wordWrap: {
          width: 90 * dpr,
          useAdvancedWrap: true
        }
      }
    }, false);

    this.mSource = this.scene.make.text({
      x: 8 * dpr,
      y: 38 * dpr,
      style: {
        fontSize: 10 * dpr,
        fontFamily: Font.DEFULT_FONT,
      }
    }, false);

    this.add([this.mAdd, this.mDetailBubbleContainer]);
    this.mDetailBubbleContainer.add([this.mDetailBubble, this.mDesText, this.mSource]);
  }

  setProp(prop) {
    this.mSelectedProp = prop;
  }

  setResource(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE) {
    if (content.display) {
      this.mDetailDisplay.loadDisplay(content);
    } else if (content.avatar) {
      this.mDetailDisplay.loadAvatar(content);
    } else {
      this.mDetailDisplay.loadUrl(this.mSelectedProp.icon);
    }
    // this.mDetailDisplay.loadDisplay(content.display || this.mSelectedProp.icon);
  }
}

class Item extends Phaser.GameObjects.Container {
  private mCounter: Phaser.GameObjects.Text;
  private mPropImage: DynamicImage;
  constructor(scene: Phaser.Scene, key: string, dpr: number) {
    super(scene);

    const background = scene.make.image({
      key,
      frame: "prop_bg.png"
    }, false);

    this.mPropImage = new DynamicImage(this.scene, 0, 0);

    this.mCounter = scene.make.text({
      style: {
        fontSize: 12 * dpr,
        fontFamily: Font.DEFULT_FONT
      }
    }, false);
    this.add([background, this.mPropImage, this.mCounter]);
  }

  setProp() {

  }
}
