export { IButtonState } from "tooqingui";
export class CheckboxGroup extends Phaser.Events.EventEmitter {
  private mList: tooqingui.IButtonState[] = [];
  private mPrevButton: tooqingui.IButtonState;
  constructor() {
    super();
  }

  public appendItem(item: tooqingui.IButtonState): this {
    this.mList.push(item);
    item.on("Tap", this.onGameObjectUpHandler, this);
    return this;
  }

  public appendItemAll(items: tooqingui.IButtonState[]): this {
    this.mList = this.mList.concat(items);
    for (const item of items) {
      item.on("Tap", this.onGameObjectUpHandler, this);
    }
    return this;
  }

  public removeItem(item: tooqingui.IButtonState): this {
    this.mList = this.mList.filter((button) => button !== item);
    item.removeAllListeners();
    return this;
  }

  public selectIndex(index: number): this {
    if (index < 0) {
      index = 0;
    }
    if (index >= this.mList.length) {
      index = this.mList.length - 1;
    }
    if (this.mList.length > 0) {
      this.select(this.mList[index]);
    }
    return this;
  }

  public select(item: tooqingui.IButtonState) {
    if (this.mPrevButton === item) {
      return;
    }
    if (this.mPrevButton) {
      this.mPrevButton.changeNormal();
    }
    item.changeDown();
    this.emit("selected", item, this.mPrevButton);
    this.mPrevButton = item;
  }

  public reset() {
    if (this.mList) {
      this.mList.forEach((item) => {
        this.removeItem(item);
      });
    }
  }

  public destroy() {
    if (this.mList) {
      this.mList.forEach((item) => {
        this.removeItem(item);
        item.destroy();
      });
    }
    super.destroy();
  }

  private onGameObjectUpHandler(pointer, gameobject: any) {
    this.select(gameobject);
  }
}
