export class ObjectAssign {
  static excludeTagAssign(source, target, tag = "exclude") {
    if (!source || !target) {
      return;
    }
    const excludes = source[tag] || target[tag];
    for (const key in target) {
      if (key !== tag && target.hasOwnProperty(key)) {
        const value = target[key];
        if (typeof value === "object") {
          if (!source.hasOwnProperty(key)) {
            if (Array.isArray(value))
              source[key] = [];
            else
              source[key] = {};
          }
          this.excludeTagAssign(source[key], value, tag);
        } else {
          if (excludes) {
            if (excludes.indexOf(key) === -1) {
              source[key] = target[key];
            }
          } else {
            source[key] = target[key];
          }
        }
      }
    }
  }
  static excludeAssign(source, target, excludes) {
    for (const key in target) {
      if (target.hasOwnProperty(key)) {
        const value = target[key];
        if (typeof value === "object") {
          if (!source.hasOwnProperty(key)) {
            if (Array.isArray(value))
              source[key] = [];
            else
              source[key] = {};
          }
          this.excludeAssign(source[key], value);
        } else {
          if (excludes) {
            if (excludes.indexOf(key) === -1) {
              source[key] = target[key];
            }
          } else {
            source[key] = target[key];
          }
        }
      }
    }
  }
  static excludeAllAssign(source, target) {
    for (const key in target) {
      if (target.hasOwnProperty(key)) {
        const value = target[key];
        if (typeof value === "object") {
          if (!source.hasOwnProperty(key)) {
            if (Array.isArray(value))
              source[key] = [];
            else
              source[key] = {};
          }
          this.excludeAllAssign(source[key], value);
        } else {
          if (!source.hasOwnProperty(key)) {
            source[key] = value;
          }
        }
      }
    }
  }
}
