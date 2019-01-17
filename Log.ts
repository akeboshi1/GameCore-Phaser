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
        if (str !== "") {
          console.log(str);
          str = "";
        }
        console.log(value);
      } else {
        if (str !== "") {
          str += ",";
        }
        str += value;
      }
    }
    if (str !== "") {
      console.log(str);
    }
  }
    public static warn(...optionalParams: any[]): void {
      let value: any;
      let str = "";
      for (let key in optionalParams) {
        value = optionalParams[key];
        if (typeof  value === "object") {
          if (str !== "") {
            console.warn(str);
            str = "";
          }
          console.warn(value);
        } else {
          if (str !== "") {
            str += ",";
          }
          str += value;
        }
      }
      if (str !== "") {
        console.warn(str);
      }
    }
}
