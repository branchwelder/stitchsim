export class Pattern {
  constructor(opArr, width) {
    this.width = width;
    this.height = opArr.length / width;
    this.ops = opArr;
  }

  op(x, y) {
    if (x > this.width - 1 || x < 0 || y > this.height - 1 || y < 0) {
      return -1;
    }
    return this.ops.at(x + y * this.width);
  }
}
