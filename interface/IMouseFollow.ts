import {op_gameconfig} from "../../protocol/protocols";

export interface IMouseFollow {
  /** display */
  display?: (op_gameconfig.IDisplay|null);

  /** animations */
  animation?: (op_gameconfig.IAnimation|null);

}
