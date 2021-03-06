import { ClickEvent } from "apowophaserui";

export class CheckboxGroup extends Phaser.Events.EventEmitter {
  private mList: any[] = [];
  private mSelectedButton: any;
  constructor() {
    super();
  }

  public appendItem(item: any): this {
    this.mList.push(item);
    item.on(ClickEvent.Tap, this.onGameObjectUpHandler, this);
    return this;
  }

  public appendItemAll(items: any[]): this {
    this.mList = this.mList.concat(items);
    for (const item of items) {
      item.on(ClickEvent.Tap, this.onGameObjectUpHandler, this);
    }
    return this;
  }

  public removeItem(item: any): this {
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

  public select(item: any) {
    if (this.mSelectedButton === item) {
      return;
    }
    if (this.mSelectedButton) {
      this.mSelectedButton.selected = false;
    }
    item.changeDown();
    this.mSelectedButton = item;
    this.emit(ClickEvent.Selected, item);
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

  get selectedIndex(): number {
    return this.mList.indexOf(this.mSelectedButton);
  }
}
