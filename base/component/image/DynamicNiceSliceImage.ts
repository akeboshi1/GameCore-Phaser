import { Load } from "../../../Assets";

export class DynamicNiceSliceImage {
  protected mUrl: string;
  protected mLoadCompleteCallBack: Function;
  protected mLoadThisArgs: any;
  protected mImage: PhaserNineSlice.NineSlice;
  protected parent: Phaser.Sprite | Phaser.Group;
  constructor(
    private game: Phaser.Game,
    private mWidth: number,
    private mHeight: number,
    private mParent?: Phaser.Group
  ) { }

  public load(value: string, frame?: string, completeCallBack?: Function, thisArgs?: any) {
    this.mLoadCompleteCallBack = completeCallBack;
    this.mLoadThisArgs = thisArgs;

    this.mUrl = value;
    const key = this.resKey;
    if (this.game.cache.checkImageKey(key)) {
      this.modelLoadCompleteHandler();
    } else {
      this.game.load.onLoadComplete.addOnce(this.modelLoadCompleteHandler, this);
      this.game.load.image(key, Load.Url.getRes(this.mUrl));
      this.game.load.start();
    }
  }

  private modelLoadCompleteHandler() {
    this.mImage = this.game.add.nineSlice(0, 0, null, null, this.mWidth, this.mHeight, this.mParent);

    if (this.mLoadCompleteCallBack) {
      let cb: Function = this.mLoadCompleteCallBack;
    this.mLoadCompleteCallBack = null;
    cb.apply(this.mLoadThisArgs, this.mImage);
    this.mLoadThisArgs = null;
    }
  }

  public get resKey(): string {
    if (this.mUrl === undefined) return "";
    let key: string = Load.Image.getKey(this.mUrl);
    return key;
  }

  public get image(): PhaserNineSlice.NineSlice {
    return this.mImage;
  }
}
