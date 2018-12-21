/**
 * author aaron
 */
import Globals from "./Globals";

export class Log {
  public static trace(...optionalParams: any[]): void {
    let value: any;
    let str = "";
    for (let key in optionalParams) {
      value = optionalParams[key];
      if (typeof  value === "object") {
        console.log(value);
      } else {
        if (str !== "") {
          str += ",";
        }
        str += value;
        console.log(str);
        str = "";
      }
    }
    // if (typeof optionalParams === "string") {
    //   let text: string = optionalParams.join(", ");
    //   console.log("[Log]" + text);
    // } else {
    //   console.log(optionalParams);
    // }
  }

  public static debug(...optionalParams: any[]): void {
    let text: string = optionalParams.join(", ");
    Globals.game.debug.text("[Log]" + text, 0, 14, "#be0823");
  }
}
