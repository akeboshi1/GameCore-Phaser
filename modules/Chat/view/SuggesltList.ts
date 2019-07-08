import { ListComponent } from "../../../base/component/list/core/ListComponent";
import { UI } from "../../../Assets";
import { UIEvents } from "../../../base/component/event/UIEvents";
import { SuggestItem } from "./SuggesItemt";
import { PlayerInfo } from "../../../common/struct/PlayerInfo";

export class SuggesltList extends Phaser.Group {
  private mData: PlayerInfo[];
  private mList: ListComponent;
  constructor(game: Phaser.Game, parent?: PIXI.DisplayObjectContainer) {
    super(game, parent);
    this.init();
  }

  public init() {
    let bg = this.game.make.nineSlice(0, 0, UI.Background.getName(), null, 100, 120);
    this.add(bg);

    this.mList = new ListComponent(this.game);

    for (let i = 0; i < 5; i++) {
      let item = new SuggestItem(this.game);
      item.setEnable(true);
      this.mList.addItem(item);
    }
    this.add(this.mList);

  }

  public renderer() {
    if (this.mData) {
      this.clear();
      for (let i = 0; i < this.mData.length; i++) {
        let item = this.mList.getItem(i);
        item.data = this.mData[i].name;
      }
    }
  }

  setData(val: PlayerInfo[]) {
    this.mData = val;
    this.renderer();
  }

  clear() {
    let len = this.mList.getLength();
    for (let i = 0; i < len; i++ ) {
      let item = this.mList.getItem(i);
      item.data = null;
    }
  }

  get list(): ListComponent {
    return this.mList;
  }
}