import { BlockObject } from "../cameras/block.object";

export enum Direction {
  UP,
  LEFT,
  RIGHT,
  DOWN
}

export class Wall extends BlockObject {
  constructor() {
    super();
  }
}
