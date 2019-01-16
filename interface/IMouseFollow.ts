import {op_gameconfig} from "../../protocol/protocols";

export interface IMouseFollow {
  /** display */
  display?: (op_gameconfig.IDisplay|null);

  /** animations */
  animations?: (op_gameconfig.IAnimation[]|null);

  /** animationName */
  animationName?: string;
}
