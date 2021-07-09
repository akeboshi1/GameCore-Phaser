export class CopyProtoType {
  static copyProtoParam(baseData) {
    baseData.forEach((data) => {
      for (const param in data) {
        if (typeof data.constructor.prototype[param] === "function")
          continue;
        if (!data.hasOwnProperty(param)) {
          data[param] = data.constructor.prototype[param];
        }
      }
    });
    return baseData;
  }
}
