import {MediatorBase} from "../../base/module/core/MediatorBase";
import {ItemDetailView} from "./view/ItemDetailView";
import {op_client, op_gameconfig} from "../../../protocol/protocols";
import {ElementInfo} from "../../common/struct/ElementInfo";
import Globals from "../../Globals";
import {IDisplayLoaderParam} from "../../interface/IDisplayLoaderParam";

export class ItemDetailMediator extends MediatorBase {
  private get view(): ItemDetailView {
    return this.viewComponent as ItemDetailView;
  }

  public onRegister(): void {
    super.onRegister();
    this.initView();
  }

  private initView(): void {
      let param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.getParam();
      let elementInfo: ElementInfo = Globals.DataCenter.SceneData.mapInfo.getElementInfo(param.id);
      if (elementInfo == null || elementInfo.package.items.length === 0) {
          return;
      }

      let animation: op_gameconfig.Animation = new op_gameconfig.Animation();
      animation.baseLoc = "-102,-149";
      animation.collisionArea = "1,1,1,1&1,1,1,1&1,1,1,1&1,1,1,1";
      animation.frame = [0];
      animation.frameRate = 12;
      animation.id = 11095928;
      animation.name = "idle";
      animation.originPoint = [3, 3];
      animation.walkOriginPoint = [3, 3];
      animation.walkableArea = "1,0,0,1&0,0,0,0&0,0,0,0&0,0,0,1";
      let loaderParam: IDisplayLoaderParam = {animations: [animation], display: {texturePath: param.display[0].texturePath, dataPath: param.display[0].dataPath}};
      // let loaderParam: IDisplayLoaderParam = {animations: [animation], display: {texturePath: "lainson/elements/fce84fe9db16315e04be8be0b0f2c4cfdf5d8c0d/4/fce84fe9db16315e04be8be0b0f2c4cfdf5d8c0d.png",
      //         dataPath: "lainson/elements/fce84fe9db16315e04be8be0b0f2c4cfdf5d8c0d/4/fce84fe9db16315e04be8be0b0f2c4cfdf5d8c0d.json"}};
      this.view.m_Icon.loadModel(loaderParam, this, null, this.onLoadComplete);

      let len = param.text.length;
      for (let i = 0; i < len; i++) {
        this.view.m_Text.text += param.text[i].text + "\n";
      }
  }

    protected onLoadComplete(): void {
        if (this.view.m_Icon) {
            this.view.m_Icon.playAnimation("idle");
        }
    }

  public onRemove(): void {
    super.onRemove();
  }
}
