import { LayerEnum } from "game-capsule";

export class LayerName {
    public static GROUNDCLICK = "groundClickLayer";
    public static GROUND2 = "groundLayer2";
    public static GROUND = LayerEnum.Terrain.toString();
    public static MIDDLE = "middleLayer";
    public static FLOOR = LayerEnum.Floor.toString();
    public static SURFACE = LayerEnum.Surface.toString();
    public static DECORATE = "decorateLayer";
    public static WALL = LayerEnum.Wall.toString();
    public static HANGING = LayerEnum.Hanging.toString();
    public static ATMOSPHERE = "atmosphere";
    public static SCENEUI = "sceneUILayer";
}
