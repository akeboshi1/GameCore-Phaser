import {MapInfo} from '../common/struct/MapInfo';

/**
 * author aaron
 */
export default interface IGameParam {
    width: number;
    height: number;
    rows: number;
    cols: number;
    mapData: MapInfo;
}
