import {op_gameconfig} from "pixelpai_proto";

export interface IMouseFollow {
  /** display */
  display?: (op_gameconfig.IDisplay|null);

  /** animations */
  animation?: (op_gameconfig.IAnimation|null);

}
