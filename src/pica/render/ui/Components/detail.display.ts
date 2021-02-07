import { AnimationModel, DragonbonesDisplay, FrameAnimation, FramesDisplay, Render, UIDragonbonesDisplay } from "gamecoreRender";
import { IFramesModel, RunningAnimation } from "structure";
import { Handler, Url } from "utils";
import * as sha1 from "simple-sha1";

export class DetailDisplay extends Phaser.GameObjects.Container {
  private mDisplay: any;// op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE
  private mUrl: string;
  private mImage: Phaser.GameObjects.Image;
  private mDragonboneDisplay: UIDragonbonesDisplay;
  private mFramesDisplay: FramesDisplay;
  private complHandler: Handler;
  private mFrameAni: FrameAnimation;
  /**
   * 0 -不固定  1 - 固定尺寸，2 - 固定尺寸缩放取整
   */
  private mFixedSize: number = 0;
  private curLoadType: DisplayLoadType = DisplayLoadType.None;
  private isLoading: boolean = false;
  private mFixScale: number = 1;

  constructor(scene: Phaser.Scene, protected render: Render) {
    super(scene);

  }

  /**
   *
   * @param fixeScale 整体缩放比例 默认是1;
   * @param fixedSize 0 -不固定  1 - 固定尺寸，2 - 固定尺寸缩放取整
   */
  setFixedScale(fixeScale: number = 1, fixedSize: number = 0) {
    this.mFixedSize = fixedSize;
    this.mFixScale = fixeScale;
    this.scale = fixeScale;
    return this;
  }

  loadDisplay(content: any) {// op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE
    const display = content.display;
    if (!display) {
      return;
    }
    if (display.texturePath !== "" && display.dataPath !== "") {
      const animation = content.animations;
      if (animation && animation.length > 0) {
        this.loadElement(content);
      } else {
        this.loadUrl(Url.getOsdRes(display.texturePath), Url.getOsdRes(display.dataPath));
      }
    } else {
      this.loadUrl(display.texturePath, display.dataPath);
    }
  }

  loadElement(content: any) {// op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE
    this.curLoadType = DisplayLoadType.FramesDisplay;
    this.clearDisplay();
    this.mDisplay = content;
    const animation = content.animations;
    if (!this.mFramesDisplay) {
      this.mFramesDisplay = new FramesDisplay(this.scene, this.render, undefined);
    }
    const display = content.display;
    if (display && animation.length > 0) {
      const anis = [];
      const aniName = animation[0].node.name;
      for (const ani of animation) {
        ani.baseLoc = "0,0";
        for (const layer of ani.layer) {
          layer.offsetLoc = { x: 0, y: 0 };
        }
        anis.push(new AnimationModel(ani));
      }
      const addDisplay = () => {
        const { spriteWidth, spriteHeight } = this.mFramesDisplay;
        if (this.mFixedSize !== 0) {
          this.scale = 1;
          const scaleX = this.width / spriteWidth;
          const scaleY = this.height / spriteHeight;
          const tempscale = scaleX > scaleY ? scaleY : scaleX;
          this.mFramesDisplay.scale = this.mFixedSize === 1 ? tempscale : Math.round(tempscale);
        } else {
          this.mFramesDisplay.scale = 1;
          this.scale = this.mFixScale;
        }
        const scale = this.mFramesDisplay.scale;
        this.mFramesDisplay.x = -spriteWidth * 0.5 * scale;
        this.mFramesDisplay.y = -spriteHeight * 0.5 * scale;
        this.addDisplay();
      };
      this.mFramesDisplay.createdHandler = new Handler(this, () => {
        this.mFramesDisplay.play({ name: aniName, flip: false });
        addDisplay();
      });
      const animations = new Map();
      for (const aniData of anis) {
        animations.set(aniData.name, aniData);
      }
      const animode = {
        animations,
        id: content.id,
        gene: sha1.sync(display.dataPath + display.texturePath),
        discriminator: "FramesModel",
        animationName: aniName,
        display
      };
      if (!this.mFramesDisplay.load(animode)) {
        addDisplay();
      }
    }
  }

  loadAvatar(content: any, scale: number = 1, offset?: Phaser.Geom.Point) {// op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE
    this.curLoadType = DisplayLoadType.DragonbonesDisplay;
    this.clearDisplay();
    if (!this.mDragonboneDisplay) {
      this.mDragonboneDisplay = new UIDragonbonesDisplay(this.scene, this.render);
      if (offset) {
        this.mDragonboneDisplay.x += offset.x;
        this.mDragonboneDisplay.y += offset.y;
      }
    }
    this.addDisplay();
    if (content.suits) this.mDragonboneDisplay.setSuits(content.suits);
    this.mDragonboneDisplay.once("initialized", () => {
      this.mDragonboneDisplay.setBack(false);
      this.mDragonboneDisplay.play({ name: "idle", flip: false });
    });
    const dbModel = { id: 0, avatar: content.avatar };
    this.mDragonboneDisplay.load(dbModel);
    this.mDragonboneDisplay.scale = scale;
    this.scale = 1;
  }

  loadUrl(url: string, data?: string) {
    this.mUrl = url;
    this.curLoadType = DisplayLoadType.Image;
    this.clearDisplay();
    if (!this.mImage) {
      this.mImage = this.scene.make.image(undefined, false);
    }
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

  loadSprite(resName: string, textureurl: string, jsonurl: string, scale?: number) {
    this.curLoadType = DisplayLoadType.FrameAnimation;
    this.clearDisplay();
    if (!this.mFrameAni) {
      this.mFrameAni = new FrameAnimation(this.scene);
    }
    this.mFrameAni.load(resName, textureurl, jsonurl, new Handler(this, () => {
      if (scale === undefined) {
        if (this.mFixedSize !== 0) {
          this.scale = 1;
          const scaleX = this.width / this.mFrameAni.width;
          const scaleY = this.height / this.mFrameAni.height;
          const tempscale = scaleX > scaleY ? scaleY : scaleX;
          this.mFrameAni.scale = this.mFixedSize === 1 ? tempscale : Math.round(tempscale);
        } else {
          this.mFrameAni.scale = 1;
          this.scale = this.mFixScale;
        }
      } else {
        this.mFrameAni.scale = scale;
        this.scale = 1;
      }

      this.addDisplay();
    }));
  }
  displayLoading(resName: string, textureurl: string, jsonurl: string, scale?: number) {
    this.loadSprite(resName, textureurl, jsonurl, scale);
    this.isLoading = true;
  }
  setTexture(key: string, frame: string, scale?: number) {
    this.curLoadType = DisplayLoadType.Image;
    this.clearDisplay();
    if (!this.mImage) {
      this.mImage = this.scene.make.image({ key, frame }, false);
    } else {
      this.mImage.setTexture(key, frame);
    }
    this.addDisplay();
    if (scale === undefined) {
      if (this.mFixedSize !== 0) {
        this.scale = 1;
        const scaleX = this.width / this.mImage.width;
        const scaleY = this.height / this.mImage.height;
        const tempscale = scaleX > scaleY ? scaleY : scaleX;
        this.mImage.scale = this.mFixedSize === 1 ? tempscale : Math.round(tempscale);
      } else {
        this.mImage.scale = 1;
        this.scale = this.mFixScale;
      }
    } else {
      this.mImage.scale = scale;
      this.scale = 1;
    }
    this.emit("show", this.mImage);
  }

  setNearest() {
    if (this.mImage) {
      this.mImage.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
  }

  setComplHandler(handler: Handler) {
    this.complHandler = handler;
  }

  setPlayAnimation(ani: RunningAnimation, back: boolean = false) {
    if (this.mDragonboneDisplay) {
      this.mDragonboneDisplay.setBack(back);
      this.mDragonboneDisplay.play(ani);
    }
  }
  get display(): any {// op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE
    return this.mDisplay;
  }

  private onCompleteHandler() {
    if (!this.scene) {
      return;
    }
    this.addDisplay();
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
    if (this.mFixedSize !== 0) {
      this.scale = 1;
      this.mImage.scale = 1;
      const scaleX = this.width / this.mImage.displayWidth;
      const scaleY = this.height / this.mImage.displayHeight;
      const scale = scaleX > scaleY ? scaleY : scaleX;
      this.mImage.scale = this.mFixedSize === 1 ? scale : Math.round(scale);
    } else {
      this.mImage.scale = this.mFixScale;
      this.mImage.scale = 1;
      this.setSize(this.mImage.width * this.scale, this.mImage.height * this.scale);
    }
    this.emit("show", this.mImage);
    if (this.complHandler) this.complHandler.run();
  }

  private clearDisplay() {
    if (this.mImage) this.remove(this.mImage);
    if (this.mDragonboneDisplay) {
      this.remove(this.mDragonboneDisplay);
    }
    if (this.mFramesDisplay) {
      this.remove(this.mFramesDisplay);
    }
    if (this.mFrameAni) {
      if (!this.isLoading) {
        this.remove(this.mFrameAni);
      }
    }
    this.mDisplay = undefined;
    this.scene.load.off(Phaser.Loader.Events.COMPLETE, this.onCompleteHandler, this);
  }
  private addDisplay() {
    if (!this.scene) return;
    if (this.isLoading) {
      this.remove(this.mFrameAni);
    }
    if (this.curLoadType === DisplayLoadType.Image) {
      this.add(this.mImage);
    } else if (this.curLoadType === DisplayLoadType.FramesDisplay) {
      this.add(this.mFramesDisplay);
    } else if (this.curLoadType === DisplayLoadType.FrameAnimation) {
      this.add(this.mFrameAni);
    } else if (this.curLoadType === DisplayLoadType.DragonbonesDisplay) {
      this.add(this.mDragonboneDisplay);
    }
    this.isLoading = false;
  }
}
enum DisplayLoadType {
  None,
  Image,
  DragonbonesDisplay,
  FramesDisplay,
  FrameAnimation
}
