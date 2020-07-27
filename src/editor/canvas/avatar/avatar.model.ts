import { op_gameconfig, op_gameconfig_01 } from "pixelpai_proto";

export default class AvatarModel {
  public id: string;
  public avatar: op_gameconfig_01.IAvatar;
  public dirable: number[];

  public constructor() { }

  public addCostume(part: string, id: string) {
    if (!this.avatar) return;
    switch (part) {
      case "barm_cost":
        this.avatar.barmCostId = id;
        break;
      case "barm_spec":
        this.avatar.barmSpecId = id;
        break;
      case "bleg_cost":
        this.avatar.blegCostId = id;
        break;
      case "bleg_spec":
        this.avatar.blegSpecId = id;
        break;
      case "body_cost":
        this.avatar.bodyCostId = id;
        break;
      case "body_spec":
        this.avatar.bodySpecId = id;
        break;
      case "body_tail":
        this.avatar.bodyTailId = id;
        break;
      case "body_wing":
        this.avatar.bodyWingId = id;
        break;
      case "farm_cost":
        this.avatar.farmCostId = id;
        break;
      case "farm_spec":
        this.avatar.farmSpecId = id;
        break;
      case "fleg_cost":
        this.avatar.flegCostId = id;
        break;
      case "fleg_spec":
        this.avatar.flegSpecId = id;
        break;
      case "head_eyes":
        this.avatar.headEyesId = id;
        break;
      case "head_hair":
        this.avatar.headHairId = id;
        break;
      case "head_hats":
        this.avatar.headHatsId = id;
        break;
      case "head_mask":
        this.avatar.headMaskId = id;
        break;
      case "head_mous":
        this.avatar.headMousId = id;
        break;
      case "head_spec":
        this.avatar.headSpecId = id;
        break;
      case "shld_farm":
        this.avatar.farmShldId = id;
        break;
      case "weap_farm":
        this.avatar.farmWeapId = id;
        break;
      case "weap_barm":
        this.avatar.barmWeapId = id;
        break;
      case "shld_barm":
        this.avatar.barmShldId = id;
        break;
    }
  }

  public initial(): void {
    this.id = "bones_human01";
  }

  clear() {
    for (let keys = Object.keys(this.avatar), i = 0; i < keys.length; ++i) {
      if (this.avatar[keys[i]] != null) {
        if (keys[i] === "node" || keys[i] === "dirable" || keys[i] === "defaultDir") {
          continue;
        }
        this.avatar[keys[i]] = null;
      }
    }
  }

  public changeAvatarModelByModeVO(value: op_gameconfig.IAvatar): void {
    this.id = value.id;
    this.dirable = value.dirable;
  }
}
