import {op_gameconfig} from "../../protocol/protocols";

export class IDisplayLoaderParam {
  display: op_gameconfig.IDisplay;
  defaultAnimation: string;
  animations: op_gameconfig.IAnimation[];
}
