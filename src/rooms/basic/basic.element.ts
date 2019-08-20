import { op_client, op_gameconfig } from "pixelpai_proto";

export class BasicElement {
  protected id: number;
  protected type: string;
  protected x: number;
  protected y: number;
  protected z: number;
  protected display: op_gameconfig.IDisplay;
  protected animationName: string;

  constructor() {
  }

  createDisplay(): any {
    return;
  }
}