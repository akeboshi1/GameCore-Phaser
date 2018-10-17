export namespace Const {
    export enum SceneConst {
        SceneLayerTop = 1,
        SceneLayerMiddle = 2,
        SceneLayerBottom = 3
    }

    export enum GameConst {
        SHARE_OBJECT_CACHE_SWIP_TIME = 1,
        MAP_TILE_DEPTH = 12,
        MAX_TERRAIN_LOAD_COUNT = 1,
        OUT_OF_CAMERA_RELEASE_WAITE_TIME = 10,
        MAP_TILE_WIDTH = 62,
        HALF_MAP_TILE_WIDTH = 31,
        MAP_TILE_HEIGHT = 32,
        HALF_MAP_TILE_HEIGHT = 16,
        DEFAULT_VISIBLE_TEST_RADIUS = 150,
        MASK_ALPHA = 0.5
    }

    export enum SceneElementType {
        ROLE = 1,
        ELEMENT = 2
    }

    export enum ModelStateType {
        BONES_JUMP = "jump",
        BONES_RUN = "run",
        BONES_STAND = "stand",
        BONES_WALK = "walk"
    }
}