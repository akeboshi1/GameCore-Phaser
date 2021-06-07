import { BaseConfigData } from "gamecore";
import { IRecharge } from "src/pica/structure/irecharge";

export class RechargeConfig extends BaseConfigData {
  static rechargeData = {
    "1": { img: "recharge_diamond_1.99" },
    "2": { img: "recharge_diamond_2.99" },
    "3": { img: "recharge_diamond_9.99" },
    "4": { img: "recharge_diamond_29.99" },
    "5": { img: "recharge_diamond_49.99" },
    "6": { img: "recharge_diamond_99.99" },
    "7": { img: "recharge_banner" },
  };

  public poolDatas: Map<string, IRecharge>;
  parseJson(json: any) {
    if (this.resName === "") {

    }
  }
  get() {

  }
}
