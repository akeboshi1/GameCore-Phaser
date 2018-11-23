/**
 * author aaron
 */
import {ISocketSend} from "./ISocketSend";
import {ISocketHandle} from "./ISocketHandle";

export default interface IGameParam {
    isEditor: boolean;
    width: number;
    height: number;
    iSocketSend?: ISocketSend;
    iSocketHandle?: ISocketHandle;
}
