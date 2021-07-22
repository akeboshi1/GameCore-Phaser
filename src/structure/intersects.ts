import { LogicRectangle } from "./logic.rectangle";

export class Intersects {
    public static RectangleToRectangle(rectA: LogicRectangle, rectB: LogicRectangle): boolean {
        if (rectA.width <= 0 || rectA.height <= 0 || rectB.width <= 0 || rectB.height <= 0) {
            return false;
        }
        return !(rectA.right < rectB.x || rectA.bottom < rectB.y || rectA.x > rectB.right || rectA.y > rectB.bottom);
    }

}
