/**
 * author aaron
 */
import {ISocketConnection} from "./ISocketConnection";
import {IEditorMode} from "./IEditorMode";
import {IPhaserLoadList} from "./IPhaserLoadList";

export default interface IGameParam {
    isEditor: boolean;
    width: number;
    height: number;
    iSocketConnection: ISocketConnection;
    homeDir: string;
    editorMode?: IEditorMode;
    preLoadList?: IPhaserLoadList;
}
