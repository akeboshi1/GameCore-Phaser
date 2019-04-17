import {BasicSceneEntity} from "../../../base/BasicSceneEntity";
import {SceneBase} from "../view/SceneBase";
import BasicElement from "../elements/BasicElement";
import Globals from "../../../Globals";
import {EDITOR} from "../../../Assets";

export class SelectElementEffect extends BasicSceneEntity {
  constructor() {
    super();
  }

  private offsetX = 0;
  private offsetY = 0;

  protected createDisplay() {
    let dis = Globals.game.make.image(0, 0, EDITOR.SelectFlag.getName());
    return dis;
  }

  protected onUpdating(deltaTime: number): void {
    let elementId: number = this.data;
    let element: BasicElement = (<SceneBase>this.scene).getSceneElement(elementId) as BasicElement;
    if (element) {
      this.setPosition(element.ox, element.oy);
      this.baseLoc = new Phaser.Point(-(this.display.width >> 1), -element.display.Loader.height - this.display.height);
    }
  }

  protected onUpdatingDisplay(): void {
    let _ox = this.ox + (this.baseLoc ? this.baseLoc.x : 0);
    let _oy = this.oy + (this.baseLoc ? this.baseLoc.y : 0);
    this.display.x = _ox;
    this.display.y = _oy;
  }
}
