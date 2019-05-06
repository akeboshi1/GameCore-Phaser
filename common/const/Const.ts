export namespace Const {
    export enum SceneConst {
        SceneLayerTop = 1,
        SceneLayerMiddle = 2,
        SceneLayerBottom = 3
    }

    export enum ModuleEnum {
        MODULE_STATUS_RUN = 1,
        MODULE_STATUS_STOP = 2
    }

    export enum LoaderTypeEnum {
        ImageResource = 1,
        SheetResource = 2,
        AudioResource = 3,
        AtlasResource = 4,
        NineSliceImageResource = 5,
        BinaryResource = 6
    }

    export enum GameConst {
        MAP_TILE_WIDTH = 62,
        MAP_TILE_HEIGHT = 32,
        MAP_TILE_DEPTH = 12,
        MAX_TERRAIN_LOAD_COUNT = 1,
        OUT_OF_CAMERA_RELEASE_WAITE_TIME = 3000,
        DEFAULT_VISIBLE_TEST_RADIUS = 150,
        MASK_ALPHA = 0.5,
        ROLE_AVATAR_OFFSET_Y = 8,
        BONES_SCALE = 1
    }

  export enum ClockIDEnum {
    SceneEditor = 1,
    Vote = 2
  }

    export enum UIConst {
        UI_DEFAULT_WIDTH = 500,
        UI_DEFAULT_HEIGHT = 300,
        UI_DRAG_WIDTH = 50,
        UI_DRAG_HEIGHT = 50
    }

    export enum SceneElementType {
        ROLE = 1,
        ELEMENT = 2
    }

    export enum DragType {
        DRAG_TYPE_SHORTCUT = 1,
        DRAG_TYPE_BAG = 2
    }

    export enum DropType {
        DROP_TYPE_SHORTCUT = 1,
        DROP_TYPE_BAG = 2
    }

    export enum ModelStateType {
        BONES_JUMP = "jump",
        BONES_RUN = "run",
        BONES_STAND = "stand",
        BONES_WALK = "walk"
    }

    export enum AvatarSlotType {
        BodyCostDres = "body_cost_$_dres",
        BodyCost = "body_cost_$",
        BodyTail = "body_tail_$",
        BodyWing = "body_wing_$",
        BodyBase = "body_base_$",
        BodySpec = "body_spec_$",
        FlegSpec = "fleg_spec_$",
        FlegBase = "fleg_base_$",
        FlegCost = "fleg_cost_$",
        BarmSpec = "barm_spec_$",
        BarmBase = "barm_base_$",
        BarmCost = "barm_cost_$",
        WeapBarm = "weap_barm_$",
        ShldBarm = "shld_barm_$",
        BlegSpec = "bleg_spec_$",
        BlegBase = "bleg_base_$",
        BlegCost = "bleg_cost_$",
        FarmSpec = "farm_spec_$",
        FarmBase = "farm_base_$",
        FarmCost = "farm_cost_$",
        ShldFarm = "shld_farm_$",
        WeapFarm = "weap_farm_$",
        HeadSpec = "head_spec_$",
        HeadMask = "head_mask_$",
        HeadEyes = "head_eyes_$",
        HeadBase = "head_base_$",
        HeadHairBack = "head_hair_$_back",
        HeadMous = "head_mous_$",
        HeadHair = "head_hair_$",
        HeadHats = "head_hats_$"
    }

    export enum AvatarPartType {
        BarmBase = "barm_base_#_$",
        BarmCost = "barm_cost_#_$",
        BarmSpec = "barm_spec_#_$",
        BlegBase = "bleg_base_#_$",
        BlegCost = "bleg_cost_#_$",
        BlegSpec = "bleg_spec_#_$",
        BodyBase = "body_base_#_$",
        BodyCost = "body_cost_#_$",
        BodyCostDres = "body_cost_#_$_dres",
        BodySpec = "body_spec_#_$",
        BodyTail = "body_tail_#_$",
        BodyWing = "body_wing_#_$",
        FarmBase = "farm_base_#_$",
        FarmCost = "farm_cost_#_$",
        FarmSpec = "farm_spec_#_$",
        FlegBase = "fleg_base_#_$",
        FlegCost = "fleg_cost_#_$",
        FlegSpec = "fleg_spec_#_$",
        HeadBase = "head_base_#_$",
        HeadEyes = "head_eyes_#_$",
        HeadHair = "head_hair_#_$",
        HeadHairBack = "head_hair_#_$_back",
        HeadHats = "head_hats_#_$",
        HeadMask = "head_mask_#_$",
        HeadMous = "head_mous_#_$",
        HeadSpec = "head_spec_#_$",
        ShldFarm = "shld_farm_#_$",
        WeapFarm = "weap_farm_#_$",
        ShldBarm = "shld_barm_#_$",
        WeapBarm = "weap_barm_#_$",
    }
}
