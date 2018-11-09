import {IDisposeObject} from "../../IDisposeObject";

export interface IModule extends IDisposeObject{
    name: string;
    startUp();
    setParam( param: any );
    recover();
    stop();
}