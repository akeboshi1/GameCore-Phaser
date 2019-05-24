import {BasicSceneEntity} from "../../../base/BasicSceneEntity";
import {ReferenceArea} from "../../../common/struct/ReferenceArea";
import Globals from "../../../Globals";
import BasicElement from "../elements/BasicElement";
import {SceneBase} from "../view/SceneBase";
import {ElementInfo} from "../../../common/struct/ElementInfo";

export class ReferenceElementEffect extends BasicSceneEntity {
  constructor() {
    super();
  }

  protected createDisplay() {
    let dis = new ReferenceArea(Globals.game);
    return dis;
  }

  protected onInitialize() {
    super.onInitialize();
    let element: ElementInfo = Globals.DataCenter.SceneData.mapInfo.getElementInfo(this.data);
    if (element && element.config) {
      this.display.setting(element.config.collisionArea, element.config.originPoint ? new Phaser.Point(element.config.originPoint[0], element.config.originPoint[1]) : new Phaser.Point());
    }
  }

  protected onUpdating(deltaTime: number): void {
    let elementId: number = this.data;
    let element: BasicElement = (<SceneBase>this.scene).getSceneElement(elementId) as BasicElement;
    if (element) {
      this.display.setScale(element.scaleX);
      this.display.setPosition(element.ox, element.oy);
      this.display.visible = true;
    } else {
      this.display.visible = false;
    }
  }
}
