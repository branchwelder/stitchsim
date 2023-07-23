class Base {
  constructor(name) {
    this.name = name;
  }
}

class Knit extends Base {
  constructor() {
    super("knit");
    this.edges = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ];
    this.waleEdges = [0, 2];
  }
}

class Slip extends Base {
  constructor() {
    super("slip");
  }
}

class Tuck extends Base {
  constructor() {
    super("tuck");
  }
}

class Purl extends Base {
  constructor() {
    super("purl");
  }
}

class Transfer extends Base {
  constructor() {
    super("transfer");
  }
}

class Empty extends Base {
  constructor() {
    super("empty");
  }
}

export const StitchTypes = {
  0: Knit,
  1: Slip,
  2: Tuck,
  3: Purl,
  4: Transfer,
  5: Empty,
};
