import { op_client } from "pixelpai_proto";
import { Url } from "../../utils/resUtil";
import { DragonbonesDisplay } from "../../rooms/display/dragonbones.display";
import { DragonbonesModel } from "../../rooms/display/dragonbones.model";

export class DetailDisplay extends Phaser.GameObjects.Container {
  private mDisplay: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE;
  private mUrl: string;
  private mImage: Phaser.GameObjects.Image;
  private mDragonboneDisplay: DragonbonesDisplay;
  constructor(scene: Phaser.Scene) {
    super(scene);
  }

  loadDisplay(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE) {
    this.mDisplay = content;
    this.destroyDragon();
    if (content.display) {
      const display = content.display;
      if (this.scene.textures.exists(display.texturePath)) {
        this.onCompleteHandler();
      } else {
        this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.onCompleteHandler, this);
        this.scene.load.atlas(display.texturePath, Url.getOsdRes(display.texturePath), Url.getOsdRes(display.dataPath));
        this.scene.load.start();
      }
    }
  }

  loadAvatar(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE, scale: number = 1, offset?: Phaser.Geom.Point) {
    if (!this.mDragonboneDisplay) {
      this.mDragonboneDisplay = new DragonbonesDisplay(this.scene, undefined, undefined, true);
      if (offset) {
        this.mDragonboneDisplay.x += offset.x;
        this.mDragonboneDisplay.y += offset.y;
      }
    }
    if (this.mImage) {
      this.remove(this.mImage);
    }
    this.mDragonboneDisplay.once("initialized", () => {
      this.mDragonboneDisplay.play({ animationName: "idle", flip: false });
    });
    this.mDragonboneDisplay.load(new DragonbonesModel({
      id: 0,
      avatar: content.avatar
    }));
    this.mDragonboneDisplay.scale = scale;
    this.add(this.mDragonboneDisplay);
  }

  loadUrl(url: string) {
    this.mUrl = url;
    if (this.mDisplay) this.mDisplay = null;
    this.destroyDragon();
    if (this.scene.textures.exists(url)) {
      this.onCompleteHandler();
    } else {
      this.scene.load.image(url, Url.getOsdRes(url));
      this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.onCompleteHandler, this);
      this.scene.load.start();
    }
  }

  setTexture(key: string, frame?: string) {
    this.destroyDragon();
    if (!this.mImage) {
      this.mImage = this.scene.make.image({
        key,
        frame
      }, false);
    } else {
      this.mImage.setTexture(key, frame);
    }
    this.setSize(this.mImage.width * this.scale, this.mImage.height * this.scale);
    this.add(this.mImage);
    this.emit("show", this.mImage);
  }

  setNearest() {
    if (this.mImage) {
      this.mImage.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
  }

  get display(): op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE {
    return this.mDisplay;
  }

  private onCompleteHandler() {
    if (!this.scene) {
      return;
    }
    if (!this.mImage) {
      this.mImage = this.scene.make.image(undefined, false);
    }
    if (this.mDisplay) {
      const display = this.mDisplay.display;
      const ani = this.mDisplay.animations;
      if (!ani || ani.length <= 0) {
        return;
      }
      this.mImage.setTexture(this.mDisplay.display.texturePath, ani[0].frameName[0]);
    } else {
      this.mImage.setTexture(this.mUrl);
    }
    this.setNearest();
    this.setSize(this.mImage.width * this.scale, this.mImage.height * this.scale);
    this.add(this.mImage);
    this.emit("show", this.mImage);
  }
  private destroyDragon() {
    if (this.mDragonboneDisplay) {
      this.mDragonboneDisplay.destroy();
      this.mDragonboneDisplay = undefined;
    }
  }
}
