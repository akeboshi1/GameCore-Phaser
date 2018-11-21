/**
 * author aaron
 */
import {MapInfo} from "../common/struct/MapInfo";
import {IEditorMode} from "./IEditorMode";

export default interface IGameParam {
    isEditor: boolean;
    width: number;
    height: number;
    rows: number;
    cols: number;
    editorMode: IEditorMode;
    mapData: MapInfo;
}
