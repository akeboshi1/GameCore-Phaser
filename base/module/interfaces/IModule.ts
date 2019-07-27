import {IDisposeObject} from "../../object/interfaces/IDisposeObject";

export interface IModule extends IDisposeObject {
    name: string;
    startUp();
    setParam( param: any );
    assignParam(param: any);
    recover();
    stop();
    update(param: any);
}
