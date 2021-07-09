export class NumberUtils {
  static NumberConvertZHCN(number) {
    const map = { "0": "\u96F6", "1": "\u4E00", "2": "\u4E8C", 3: "\u4E09", 4: "\u56DB", 5: "\u4E94", 6: "\u516D", 7: "\u4E03", 8: "\u516B", 9: "\u4E5D" };
    let convert = "";
    const numberstr = number + "";
    for (const n of numberstr) {
      const temp = map[n];
      convert += temp;
    }
    return convert;
  }
}
