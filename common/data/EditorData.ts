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

    public changeEditorMode(value: IEditorMode) {
        if (this.m_EditorMode == null) {
            this.setEditorMode(value);
        } else {
            this.m_EditorMode.mode = value.mode;
            this.m_EditorMode.data = value.data;
        }
    }

    public setMapInfo(value: SceneInfo): void {
        this._mapInfo = value;
    }

    public get mapInfo(): SceneInfo {
        return this._mapInfo;
    }
}