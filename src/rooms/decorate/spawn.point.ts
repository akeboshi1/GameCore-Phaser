import { Element } from "../element/element";
import { ISprite } from "../element/sprite";
import { IElementManager } from "../element/element.manager";

export class SpawnPoint extends Element {
  constructor(sprite: ISprite, mElementManager: IElementManager) {
    super(sprite, mElementManager);
  }
}
