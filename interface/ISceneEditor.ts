import {TerrainInfo} from "../common/struct/TerrainInfo";

export interface ISceneEditor {
    addTerrainItem( x: number, y: number, value: TerrainInfo);
    removeTerrainItem( col: number, row: number );
}