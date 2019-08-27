export interface IPoint3 {
  x: number;
  y: number;
  z: number;
}

export class Point3 implements IPoint3 {
  constructor(
    private mX?: number,
    private mY?: number,
    private mZ?: number
  ) {
    if (this.mX === undefined) this.x = 0;
    if (this.mY === undefined) this.y = 0;
    if (this.mZ === undefined) this.z = 0;
  }

  set(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  add(x: number, y: number, z: number) {
    this.x += x;
    this.y += y;
    this.z += z;
  }

  set x(value: number) {
    this.mX = value;
  }

  get x(): number {
    return this.mX;
  }

  set y(value: number) {
    this.mY = value;
  }

  get y(): number {
    return this.mY;
  }

  set z(value: number) {
    this.mZ = value;
  }

  get z(): number {
    return this.mZ;
  }
}