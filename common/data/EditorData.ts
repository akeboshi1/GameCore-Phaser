import BaseSingleton from "../../base/BaseSingleton";
import {IEditorMode} from "../../interface/IEditorMode";
import {SceneInfo} from "../struct/SceneInfo";
import Globals from "../../Globals";
import {MessageType} from "../const/MessageType";

export class EditorData extends BaseSingleton {
  private m_EditorMode: IEditorMode;

  constructor() {
    super();
  }

  private _mapInfo: SceneInfo;

  public get mapInfo(): SceneInfo {
    return this._mapInfo;
  }

  public get editorMode(): IEditorMode {
    return this.m_EditorMode;
  }

  public setEditorMode(value: IEditorMode) {
    this.m_EditorMode = value;
  }

  public changeEditorMode(mode: string, type?: any) {
    this.m_EditorMode.mode = mode;
    this.m_EditorMode.type = (type === undefined) ? 0 : type;
    Globals.MessageCenter.emit(MessageType.EDITOR_CHANGE_MODE);
  }

  public setMapInfo(value: SceneInfo): void {
    this._mapInfo = value;
  }
}
