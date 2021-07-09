export class Tool {
  static equalArr(a, b) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }
  static getPosByScenes(fromScene, pos) {
    const camera = fromScene.cameras.main;
    const px = pos.x - camera.scrollX;
    const py = pos.y - camera.scrollY;
    return { x: px, y: py };
  }
  static twoPointDistance(p1, p2) {
    const dis = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    return dis;
  }
  static twoPointRadin(baseP, moveP) {
    const x = baseP.x - moveP.x;
    const y = baseP.y - moveP.y;
    const dis = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    let rad = Math.acos(x / dis);
    if (moveP.y < baseP.y) {
      rad = -rad;
    }
    return rad;
  }
  static formatChineseString(context, fontSize, lineWidth) {
    if (typeof fontSize === "string")
      fontSize = parseInt(fontSize, 10);
    const wrapWidth = Math.floor(lineWidth / fontSize);
    return this.chunk(context, wrapWidth).join(" ");
  }
  static checkChinese(name) {
    const pattern = /[\u4e00-\u9fa5]+/;
    const arr = name.split("");
    for (let i = 0, len = arr.length; i < len; i++) {
      if (pattern.test(arr[i])) {
        return true;
      }
    }
    return false;
  }
  static checkItemName(name, checkStr) {
    const checkStrList = checkStr.split("") || [];
    let checkBoo = false;
    checkStrList.forEach((str) => {
      if (str) {
        const pattern = new RegExp(str);
        const arr = name.split("");
        for (let i = 0, len = arr.length; i < len; i++) {
          if (pattern.test(arr[i])) {
            checkBoo = true;
            break;
          }
        }
      }
    });
    return checkBoo;
  }
  static calcAngle(p1, p2) {
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    return angle * (180 / Math.PI);
  }
  static calculateDirectionByRadin(radin) {
    const angle = radin * (180 / Math.PI);
    let direction = -1;
    if (angle > 90) {
      direction = 3;
    } else if (angle >= 0) {
      direction = 5;
    } else if (angle >= -90) {
      direction = 7;
    } else {
      direction = 1;
    }
    return direction;
  }
  static angleToDirections(angle, dirMode, out) {
    if (out === void 0) {
      out = {};
    }
    out.left = false;
    out.right = false;
    out.up = false;
    out.down = false;
    angle = (angle + 360) % 360;
    switch (dirMode) {
      case 0:
        if (angle < 180) {
          out.down = true;
        } else {
          out.up = true;
        }
        break;
      case 1:
        if (angle > 90 && angle <= 270) {
          out.left = true;
        } else {
          out.right = true;
        }
        break;
      case 2:
        if (angle > 45 && angle <= 135) {
          out.down = true;
        } else if (angle > 135 && angle <= 225) {
          out.left = true;
        } else if (angle > 225 && angle <= 315) {
          out.up = true;
        } else {
          out.right = true;
        }
        break;
      case 3:
        if (angle > 22.5 && angle <= 67.5) {
          out.down = true;
          out.right = true;
        } else if (angle > 67.5 && angle <= 112.5) {
          out.down = true;
        } else if (angle > 112.5 && angle <= 157.5) {
          out.down = true;
          out.left = true;
        } else if (angle > 157.5 && angle <= 202.5) {
          out.left = true;
        } else if (angle > 202.5 && angle <= 247.5) {
          out.left = true;
          out.up = true;
        } else if (angle > 247.5 && angle <= 292.5) {
          out.up = true;
        } else if (angle > 292.5 && angle <= 337.5) {
          out.up = true;
          out.right = true;
        } else {
          out.right = true;
        }
        break;
    }
    return out;
  }
  static checkPointerContains(gameObject, pointer) {
    if (!gameObject)
      return false;
    const left = -gameObject.width / 2;
    const right = gameObject.width / 2;
    const top = -gameObject.height / 2;
    const bottom = gameObject.height / 2;
    if (pointer) {
      const worldMatrix = gameObject.getWorldTransformMatrix();
      const zoom = worldMatrix.scaleX;
      const x = (pointer.x - worldMatrix.tx) / zoom;
      const y = (pointer.y - worldMatrix.ty) / zoom;
      if (left <= x && right >= x && top <= y && bottom >= y) {
        return true;
      }
      return false;
    }
    return false;
  }
  static baseName(str) {
    let base = new String(str).substring(str.lastIndexOf("/") + 1);
    if (base.lastIndexOf(".") !== -1)
      base = base.substring(0, base.lastIndexOf("."));
    return base;
  }
  static isNumeric(str) {
    if (typeof str !== "string")
      return false;
    return !isNaN(str) && !isNaN(parseFloat(str));
  }
  static chunk(str, n) {
    const result = [];
    for (let i = 0; i < str.length; i += n) {
      result.push(str.substr(i, n));
    }
    return result;
  }
}
