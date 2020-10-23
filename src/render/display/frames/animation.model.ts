import { LogicPoint } from "../../../utils/logic.point";
import { op_gameconfig_01  } from "pixelpai_proto";

export interface IAnimationModel {
    id: number;
    baseLoc: LogicPoint;
    layer: op_gameconfig_01.IAnimationLayer[];
}
