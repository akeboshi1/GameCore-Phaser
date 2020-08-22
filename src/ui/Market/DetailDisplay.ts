import { op_client } from "pixelpai_proto";
import { Url } from "../../utils/resUtil";
import { DragonbonesDisplay } from "../../rooms/display/dragonbones.display";
import { DragonbonesModel } from "../../rooms/display/dragonbones.model";
import { Handler } from "../../Handler/Handler";
import { FrameAnimation } from "../../rooms/Animation/frame.animation";

export class DetailDisplay extends Phaser.GameObjects.Container {
  private mDisplay: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE;
  private mUrl: string;
  private mImage: Phaser.GameObjects.Image;
  private mDragonboneDisplay: DragonbonesDisplay;
  private complHandler: Handler;
  private frameAni: FrameAnimation;
  private mKeepScale = false;
  constructor(scene: Phaser.Scene, keepscale: boolean = false) {
    super(scene);
    this.mKeepScale = keepscale;
  }

  loadDisplay(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE) {
    this.clearDisplay();
    this.mDisplay = content;
    if (!this.mImage) {
      this.mImage = this.scene.make.image(undefined, false);
    }
    this.add(this.mImage);
    if (content.display) {
      const display = content.display;
      if (this.scene.textures.exists(display.texturePath)) {
        this.onCompleteHandler();
      } else {
        this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.onCompleteHandler, this);
        if (display.texturePath !== "" && display.dataPath !== "") {
          this.scene.load.atlas(display.texturePath, Url.getOsdRes(display.texturePath), Url.getOsdRes(display.dataPath));
        } else {
          this.loadUrl(Url.getOsdRes(display.texturePath));
        }
        this.scene.load.start();
      }
    }
  }

  loadAvatar(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE, scale: number = 1, offset?: Phaser.Geom.Point) {
    this.clearDisplay();
    if (!this.mDragonboneDisplay) {
      this.mDragonboneDisplay = new DragonbonesDisplay(this.scene, undefined, undefined, true);
      if (offset) {
        this.mDragonboneDisplay.x += offset.x;
        this.mDragonboneDisplay.y += offset.y;
      }
    }
    this.mDragonboneDisplay.once("initialized", () => {
      this.mDragonboneDisplay.play({ name: "idle", flip: false });
    });
    this.mDragonboneDisplay.load(new DragonbonesModel({
      id: 0,
      avatar: content.avatar
    }));
    this.mDragonboneDisplay.scale = scale;
    this.add(this.mDragonboneDisplay);
    this.scale = 1;
  }

  loadUrl(url: string) {
    this.mUrl = url;
    this.clearDisplay();
    if (!this.mImage) {
      this.mImage = this.scene.make.image(undefined, false);
    }
    this.add(this.mImage);
    if (this.scene.textures.exists(url)) {
      this.onCompleteHandler();
    } else {
      this.scene.load.image(url, Url.getOsdRes(url));
      this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.onCompleteHandler, this);
      this.scene.load.start();
    }
  }

  loadSprite(resName: string, textureurl: string, jsonurl: string, keepscale: boolean = false) {
    this.clearDisplay();
    if (!this.frameAni) {
      this.frameAni = new FrameAnimation(this.scene);
    }
    if (this.mImage) {
      this.remove(this.mImage);
    }
    this.scale = 1;
    this.frameAni.load(resName, textureurl, jsonurl, new Handler(this, () => {
      if (keepscale) {
        const scaleX = this.width / this.frameAni.width;
        const scaleY = this.height / this.frameAni.height;
        this.scale = scaleX > scaleY ? scaleY : scaleX;
      } else {
        this.scale = 1;
      }
    }));
    this.add(this.frameAni);
  }

  setTexture(key: string, frame?: string) {
    this.clearDisplay();
    if (!this.mImage) {
      this.mImage = this.scene.make.image({
        key,
        frame
      }, false);
    } else {
      this.mImage.setTexture(key, frame);
    }
    this.add(this.mImage);
    this.emit("show", this.mImage);
    if (this.mKeepScale) {
      const scaleX = this.width / this.mImage.displayWidth;
      const scaleY = this.height / this.mImage.height;
      this.scale = scaleX > scaleY ? scaleY : scaleX;
    } else {
      this.setSize(this.mImage.width * this.scale, this.mImage.height * this.scale);
    }
  }

  setNearest() {
    if (this.mImage) {
      this.mImage.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
  }

  setComplHandler(handler: Handler) {
    this.complHandler = handler;
  }

  get display(): op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE {
    return this.mDisplay;
  }

  private onCompleteHandler() {
    if (!this.scene) {
      return;
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
    if (this.mKeepScale) {
      const scaleX = this.width / this.mImage.displayWidth;
      const scaleY = this.height / this.mImage.height;
      this.scale = scaleX > scaleY ? scaleY : scaleX;
    } else {
      this.setSize(this.mImage.width * this.scale, this.mImage.height * this.scale);
    }
    this.emit("show", this.mImage);
    if (this.complHandler) this.complHandler.run();
  }
  private destroyDragon() {
    if (this.mDragonboneDisplay) {
      this.mDragonboneDisplay.destroy();
      this.mDragonboneDisplay = undefined;
    }
  }

  private clearDisplay() {
    if (this.mImage) this.remove(this.mImage);
    if (this.mDragonboneDisplay) this.remove(this.mDragonboneDisplay);
    this.mDisplay = undefined;
    if (this.frameAni) {
      this.remove(this.frameAni);
      this.frameAni.destroy();
    }
  }
}
