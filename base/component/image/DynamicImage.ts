import { Load } from "../../../Assets";
import Globals from "../../../Globals";
import { ToolTip } from "../tooltip/ToolTip";

export class DynamicImage extends Phaser.Image {
  protected mLoadThisArg: any;
  protected mLoadCompleteCallback: Function;
  protected m_Url: string;
  protected mModelLoaded = false;

  protected mToolTipText: string;
  protected mToolTip: ToolTip;

  constructor(game: Phaser.Game, x: number, y: number, key: string | Phaser.RenderTexture | Phaser.BitmapData | PIXI.Texture, frame?: string | number) {
    super(game, x, y, key, frame);
  }

  public load(value: string, thisArg?: any, onLoadComplete?: Function) {
    this.mLoadCompleteCallback = onLoadComplete;
    this.mLoadThisArg = thisArg;

    this.closeLoadModel();

    this.m_Url = value;
    let key: string = this.resKey;
    if (this.game.cache.checkImageKey(key)) {
        this.modelLoadCompleteHandler();
    } else {
        this.game.load.onLoadComplete.addOnce(this.modelLoadCompleteHandler, this);
        // this.game.load.onFileError
        this.game.load.image(key, Load.Url.getRes(this.m_Url));
        this.game.load.start();
    }
  }

  protected modelLoadCompleteHandler() {
    this.mModelLoaded = true;

    this.onCompleteLoadModel();

    if (this.mLoadCompleteCallback) {
        let cb: Function = this.mLoadCompleteCallback;
        this.mLoadCompleteCallback = null;
        cb.apply(this.mLoadThisArg);
        this.mLoadThisArg = null;
    }
  }

  protected onCompleteLoadModel(): void {
    if (this.game) {
        let key: string = this.resKey;
        this.loadTexture(key);
    }
  }

  protected closeLoadModel() {
    this.mModelLoaded = false;
  }

  public get resKey(): string {
    if (this.m_Url === undefined) return "";
    let key: string = Load.Image.getKey(this.m_Url);
    return key;
  }

  public setToolTip(toolTip: ToolTip) {
    this.mToolTip = toolTip;
    Globals.ToolTipManager.setToolTip(this, toolTip);
  }

  public setToolTipText(text: string) {
      this.mToolTipText = text;
      this.setToolTip(ToolTip.getInstance(this.game));
  }

  public initToolTip() {
      if (this.mToolTip) {
          this.mToolTip.setText(this.mToolTipText);
      }
  }

  public destroy(destroyChildren?: boolean) {
    Globals.ToolTipManager.setToolTip(this, null);
    super.destroy(destroyChildren);
  }
}