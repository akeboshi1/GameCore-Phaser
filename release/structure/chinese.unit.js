export class ChineseUnit {
  static numberToChinese(number, uint = false) {
    const units = "\u4E2A\u5341\u767E\u5343\u4E07@#%\u4EBF^&~";
    const chars = "\u96F6\u4E00\u4E8C\u4E09\u56DB\u4E94\u516D\u4E03\u516B\u4E5D";
    const arr = (number + "").split(""), s = [];
    const len = arr.length - 1;
    if (arr.length > 12) {
      throw new Error("too big");
    } else {
      for (let i = 0; i <= len; i++) {
        const num = Number(arr[i]);
        if (len === 1 || len === 5 || len === 9) {
          if (i === 0) {
            if (arr[i] !== "1")
              s.push(chars.charAt(num));
          } else {
            s.push(chars.charAt(num));
          }
        } else {
          s.push(chars.charAt(num));
        }
        if (uint) {
          if (i !== len) {
            s.push(units.charAt(len - i));
          }
        }
      }
    }
    if (!uint)
      return s.join("");
    return s.join("").replace(/零([十百千万亿@#%^&~])/g, (m, d, b) => {
      b = units.indexOf(d);
      if (b !== -1) {
        if (d === "\u4EBF")
          return d;
        if (d === "\u4E07")
          return d;
        if (arr[len - b] === "0")
          return "\u96F6";
      }
      return "";
    }).replace(/零+/g, "\u96F6").replace(/零([万亿])/g, (m, b) => {
      return b;
    }).replace(/亿[万千百]/g, "\u4EBF").replace(/[零]$/, "").replace(/[@#%^&~]/g, (m) => {
      return { "@": "\u5341", "#": "\u767E", "%": "\u5343", "^": "\u5341", "&": "\u767E", "~": "\u5343" }[m];
    }).replace(/([亿万])([一-九])/g, (m, d, b, c) => {
      c = units.indexOf(d);
      if (c !== -1) {
        if (arr[len - c] === "0")
          return d + "\u96F6" + b;
      }
      return m;
    });
  }
  static getChineseUnit(number, decimalDigit) {
    const me = this;
    decimalDigit = decimalDigit == null ? 2 : decimalDigit;
    const integer = Math.floor(number);
    const digit = me.getDigit(integer);
    const unit = [];
    if (digit > 3) {
      const multiple = Math.floor(digit / 8);
      if (multiple >= 1) {
        const tmp = Math.round(integer / Math.pow(10, 8 * multiple));
        unit.push(me.addWan(tmp, number, 8 * multiple, decimalDigit));
        for (let i = 0; i < multiple; i++) {
          unit.push("\u4EBF");
        }
        return unit.join("");
      } else {
        return me.addWan(integer, number, 0, decimalDigit);
      }
    } else {
      return number;
    }
  }
  static addWan(integer, number, mutiple, decimalDigit) {
    const me = this;
    const digit = me.getDigit(integer);
    if (digit > 3) {
      let remainder = digit % 8;
      if (remainder >= 5) {
        remainder = 4;
      }
      return Math.round(number / Math.pow(10, remainder + mutiple - decimalDigit)) / Math.pow(10, decimalDigit) + "\u4E07";
    } else {
      return Math.round(number / Math.pow(10, mutiple - decimalDigit)) / Math.pow(10, decimalDigit);
    }
  }
  static getDigit(integer) {
    let digit = -1;
    while (integer >= 1) {
      digit++;
      integer = integer / 10;
    }
    return digit;
  }
}
