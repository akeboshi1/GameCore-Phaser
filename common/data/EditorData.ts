import BaseSingleton from "../../base/BaseSingleton";
import {IEditorMode} from "../../interface/IEditorMode";
import {SceneInfo} from "../struct/SceneInfo";
import Globals from "../../Globals";
import {MessageType} from "../const/MessageType";

export class EditorData extends BaseSingleton {
    private m_EditorMode: IEditorMode;
    private _mapInfo: SceneInfo;
    constructor() {
        super();
    }

    public get editorMode(): IEditorMode {
        return this.m_EditorMode;
    }

    public setEditorMode(value: IEditorMode) {
        this.m_EditorMode = value;
    }

    public changeEditorMode(mode: string, data?: any) {
        let boo = false;
        if (this.m_EditorMode === undefined) {
            boo = true;
            this.m_EditorMode.mode = mode;
            this.m_EditorMode.data = data;
        } else {
            boo = this.m_EditorMode.mode !== mode;
            this.m_EditorMode.mode = mode;
            this.m_EditorMode.data = data;
        }
        if (boo) {
          Globals.MessageCenter.emit(MessageType.EDITOR_CHANGE_MODE);
        }
    }

    public setMapInfo(value: SceneInfo): void {
        this._mapInfo = value;
    }

    public get mapInfo(): SceneInfo {
        return this._mapInfo;
    }
}
