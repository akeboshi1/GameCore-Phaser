import {MediatorBase} from "../../base/module/core/MediatorBase";
import {MainMenuView} from "./view/MainMenuView";
import {ModuleTypeEnum} from "../../base/module/base/ModuleType";
import Globals from "../../Globals";
import {EditorType} from "../../common/const/EditorType";
import {UI} from "../../Assets";
import {GameConfig} from "../../GameConfig";

export class MainMenuMediator extends MediatorBase {
  private txt: Phaser.Text;
  private modeArr: string[] = [EditorType.MODE_MOVE, EditorType.MODE_ERASER, EditorType.MODE_BRUSH, EditorType.MODE_ZOOM];
  private modeIdx = 0;

  private get view(): MainMenuView {
    return this.viewComponent as MainMenuView;
  }

  public onRegister(): void {
    this.view.on("open", this.openHandle, this);
    let style = { font: "12px Arial", fill: "#ff0044", align: "center" };
    this.txt = Globals.game.make.text(0, GameConfig.GameHeight - UI.SpriteSheetsBlueBtn.getFrameHeight() - 20, this.modeArr[this.modeIdx], style);
    this.view.add(this.txt);
  }

  private openHandle(): void {
    // Globals.ModuleManager.openModule(ModuleTypeEnum.BAG);
    ++this.modeIdx;
    let len: number = this.modeArr.length;
    let modeStr: string = this.modeArr[this.modeIdx % len];
    this.txt.text = modeStr;
    Globals.DataCenter.EditorData.changeEditorMode(modeStr);
  }
}
