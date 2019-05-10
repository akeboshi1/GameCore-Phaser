import { SceneInfo } from "../../../common/struct/SceneInfo";
import { BasicSceneEntity } from "../../../base/BasicSceneEntity";
import { Const } from "../../../common/const/Const";
import Globals from "../../../Globals";
import { MessageType } from "../../../common/const/MessageType";
import { SelfRoleElement } from "../elements/SelfRoleElement";
import { RoleElement } from "../elements/RoleElement";
import BasicElement from "../elements/BasicElement";
import { SceneBase } from "./SceneBase";
import { BasicTerrain } from "../elements/BasicTerrain";
import { SelectElementEffect } from "../effects/SelectElementEffect";
import { ReferenceArea } from "../../../common/struct/ReferenceArea";
import { ReferenceElementEffect } from "../effects/ReferenceElementEffect";

export class SceneView extends SceneBase {
  public currentSelfPlayer: SelfRoleElement;

  public addSceneElement(
    sceneElementType: number,
    uid: number,
    elemetData: any,
    isSelf: boolean = false
  ): BasicSceneEntity {
    let element: BasicSceneEntity = this.createElementByType(sceneElementType, elemetData, isSelf);

    element.uid = uid;
    element.elementTypeId = sceneElementType;
    element.data = elemetData;

    // element.setCollisionArea(elemetData.collisionArea, elemetData.originCollisionPoint, this.mapSceneInfo.tileWidth >> 1
    //   , this.mapSceneInfo.tileHeight >> 1);

    this.addSceneEntity(element);

    Globals.MessageCenter.emit(MessageType.ADD_SCENE_ELEMENT, element);

    return element;
  }

  public addTerrainElement(uid: string, elementData: any): BasicSceneEntity {
    let element: BasicSceneEntity = new BasicTerrain();
    element.uid = uid;
    element.data = elementData;

    this.addTerrainEntity(element);
    return element;
  }

  public insertTerrainElement(
    uid: string,
    elementData: any,
    all: boolean = false
  ): BasicSceneEntity {
    let element: BasicSceneEntity = new BasicTerrain();
    element.uid = uid;
    element.data = elementData;

    this.insertTerrainEntity(element, all);
    return element;
  }

  protected selectEffect: SelectElementEffect;
  public playSelectElementEffect(value: number): void {
    if (this.selectEffect) {
      this.stopSelectElementEffect();
    }
    this.selectEffect = new SelectElementEffect();
    this.selectEffect.data = value;
    this.addSceneEffect(this.selectEffect);
  }

  public stopSelectElementEffect(): void {
    if (this.selectEffect) {
      this.removeSceneEffect(this.selectEffect);
      this.selectEffect = null;
    }
  }

  protected referenceEffect: ReferenceElementEffect;
  public showReferenceEffect(value: number): void {
    if (this.referenceEffect) {
      this.stopReferenceEffect();
    }
    this.referenceEffect = new ReferenceElementEffect();
    this.referenceEffect.data = value;
    this.addSceneEffect(this.referenceEffect, 0);
  }

  public stopReferenceEffect(): void {
    if (this.referenceEffect) {
      this.removeSceneEffect(this.referenceEffect, 0);
      this.referenceEffect = null;
    }
  }

  public setReferenceScale(scaleX: boolean): void {
    if (this.referenceEffect) {
      this.referenceEffect.setScale(scaleX);
    }
  }

  protected onInitializeScene(value: SceneInfo): void {
    this.mapSceneInfo = value;
    super.onInitializeScene(value);
  }

  protected onClearScene(): void {
    super.onClearScene();
    this.currentSelfPlayer = null;
  }

  protected createElementByType(
    sceneElementType: number,
    elemetData: any,
    isSelf: boolean = false
  ): BasicSceneEntity {
    let element: BasicSceneEntity = null;

    switch (sceneElementType) {
      case Const.SceneElementType.ROLE:
        // 当前玩家
        if (isSelf) {
          if (!this.currentSelfPlayer) {
            this.currentSelfPlayer = new SelfRoleElement();
          }
          element = this.currentSelfPlayer;
        } else {
          element = new RoleElement();
        }
        break;

      case Const.SceneElementType.ELEMENT:
        element = new BasicElement();
        break;

      default:
        break;
    }

    return element;
  }
}
