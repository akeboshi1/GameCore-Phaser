import { op_client } from "pixelpai_proto";
import { Url } from "../../utils/resUtil";
import { DragonbonesDisplay } from "../../rooms/display/dragonbones.display";
import { DragonbonesModel } from "../../rooms/display/dragonbones.model";
import { Handler } from "../../Handler/Handler";
import { FrameAnimation } from "../../rooms/Animation/frame.animation";
import { FramesDisplay } from "../../rooms/display/frames.display";
import { FramesModel } from "../../rooms/display/frames.model";
import { Animation } from "../../rooms/display/animation";

export class DetailDisplay extends Phaser.GameObjects.Container {
  private mDisplay: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE;
  private mUrl: string;
  private mImage: Phaser.GameObjects.Image;
  private mDragonboneDisplay: DragonbonesDisplay;
  private mFramesDisplay: FramesDisplay;
  private complHandler: Handler;
  private frameAni: FrameAnimation;
  private mKeepScale = false;
  constructor(scene: Phaser.Scene, keepscale: boolean = false) {
    super(scene);
    this.mKeepScale = keepscale;
  }

  loadDisplay(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE) {
    const display = content.display;
    if (!display) {
      return;
    }
    if (display.texturePath !== "" && display.dataPath !== "") {
      const animation = content.animations;
      if (animation.length > 0) {
        this.loadElement(content);
      } else {
        this.loadUrl(Url.getOsdRes(display.texturePath), Url.getOsdRes(display.dataPath));
      }
    } else {
      this.loadUrl(display.texturePath, display.dataPath);
    }
  }

  loadElement(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE) {
    this.clearDisplay();
    this.mDisplay = content;
    const animation = content.animations;
    if (!this.mFramesDisplay) {
      this.mFramesDisplay = new FramesDisplay(this.scene, undefined, undefined);
    }
    this.add(this.mFramesDisplay);
    const display = content.display;
    if (display && animation.length > 0) {
      const anis = [];
      const aniName = animation[0].node.name;
      for (const ani of animation) {
        anis.push(new Animation(ani));
      }
      this.mFramesDisplay.once("initialized", () => {
        this.mFramesDisplay.play({ name: aniName, flip: false });
        if (this.mKeepScale) {
          const scaleX = this.width / this.mFramesDisplay.spriteWidth;
          const scaleY = this.height / this.mFramesDisplay.spriteHeight;
          this.mFramesDisplay.scale = scaleX > scaleY ? scaleY : scaleX;
        } else {
          this.mFramesDisplay.scale = 1;
        }
      });
      this.mFramesDisplay.load(new FramesModel({
        animations: {
          display,
          defaultAnimationName: aniName,
          animationData: anis
        },
        id: content.id,
      }));
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
  }

  loadUrl(url: string, data?: string) {
    this.mUrl = url;
    this.clearDisplay();
    if (!this.mImage) {
      this.mImage = this.scene.make.image(undefined, false);
    }
    this.add(this.mImage);
    if (this.scene.textures.exists(url)) {
      this.onCompleteHandler();
    } else {
      if (data) {
        this.scene.load.atlas(url, Url.getOsdRes(url), Url.getOsdRes(data));
      } else {
        this.scene.load.image(url, Url.getOsdRes(url));
      }
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
        this.frameAni.scale = scaleX > scaleY ? scaleY : scaleX;
      } else {
        this.frameAni.scale = 1;
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
      this.mImage.scale = 1;
      const scaleX = this.width / this.mImage.displayWidth;
      const scaleY = this.height / this.mImage.displayHeight;
      this.mImage.scale = scaleX > scaleY ? scaleY : scaleX;
    } else {
      this.mImage.scale = 1;
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
    if (this.mKeepScale) {
      this.mImage.scale = 1;
      const scaleX = this.width / this.mImage.displayWidth;
      const scaleY = this.height / this.mImage.displayHeight;
      this.mImage.scale = scaleX > scaleY ? scaleY : scaleX;
    } else {
      this.setSize(this.mImage.width * this.scale, this.mImage.height * this.scale);
    }
    this.emit("show", this.mImage);
    if (this.complHandler) this.complHandler.run();
  }

  private clearDisplay() {
    if (this.mImage) this.remove(this.mImage);
    if (this.mDragonboneDisplay) {
      this.mDragonboneDisplay.destroy();
      this.mDragonboneDisplay = undefined;
    }
    if (this.mFramesDisplay) {
      this.mFramesDisplay.destroy();
      this.mFramesDisplay = undefined;
    }
    this.mDisplay = undefined;
    if (this.frameAni) {
      this.remove(this.frameAni);
      this.frameAni.destroy();
    }
    this.scene.load.off(Phaser.Loader.Events.COMPLETE, this.onCompleteHandler, this);
  }
}
