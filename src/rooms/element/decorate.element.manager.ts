import { ElementManager } from "./element.manager";
import { IRoomService } from "../room";
import { ISprite } from "./sprite";
import { Element } from "./element";
import { DecorateRoom } from "../decorate.room";

export class DecorateElementManager extends ElementManager {
  constructor(room: IRoomService) {
    super(room);
  }

  protected _add(sprite: ISprite): Element {
    const ele = super._add(sprite);
    // (<DecorateRoom> this.mRoom).setMap()
    return ele;
  }
}
