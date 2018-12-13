/**
 * author aaron
 */
import {ISocketConnection} from "./ISocketConnection";

export default interface IGameParam {
    isEditor: boolean;
    width: number;
    height: number;
    iSocketConnection?: ISocketConnection;
    homeDir: string;
}
