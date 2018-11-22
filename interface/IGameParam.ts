/**
 * author aaron
 */
import {IEditorMode} from "./IEditorMode";
import {ISocketConnection} from "./ISocketConnection";

export default interface IGameParam {
    isEditor: boolean;
    width: number;
    height: number;
    editorMode: IEditorMode;
    iSocketConnection: ISocketConnection;
}
