const KNIT = "K";
const PURL = "P";
const TUCK = "T";
const MISS = "M";

const ECN = "ECN";
const PCN = "PCN";
const ACN = "ACN";
const UACN = "UACN";

function followTheYarn(DS) {
  let i = 0,
    j = 0,
    legNode = true,
    currentStitchRow = 0;
  const yarnPath = [];

  while (j < DS.height) {
    if (addToList(i, j, legNode, yarnPath, DS)) {
      let location;
      if (legNode) {
        // leg nodes do not move
        location = [i, j, currentStitchRow];
      } else {
        // head nodes might move, find final location
        const final = finalLocation(i, j, DS);
        location = [final.i, final.j, currentStitchRow];
      }
      yarnPath.push(location);
    }

    // figure out which CN to process next
    ({ i, j, legNode, currentStitchRow } = nextCN(
      i,
      j,
      legNode,
      currentStitchRow,
      DS
    ));
  }

  return yarnPath;
}

function addToList(i, j, legNode, yarnPath, DS) {
  // determines whether to add a contact node to the yarn path
  if (legNode) {
    // if it is a leg node
    // let numberOfACNS = acnsAt(i, j, DS).length;
    // if (numberOfACNS > 0) {
    // an anchored CN is here
    //   return true;
    // } else return false;
    return DS.getST(i, j) == KNIT || DS.getST(i, j) == PURL;
  } else {
    // head node
    let AV = DS.getAV(i, j);
    if (AV == ECN) {
      return false;
    } else if (AV == UACN) {
      let m, n;
      if (i % 2 == 0 && j % 2 != 0) {
        // if i is even and j is odd, we look backward in the yarn path
        // last acn in yarn path
        [m, n, _] = yarnPath.at(-1);
      } else {
        // When the parities are the same, the check looks forward along the yarn for a CN that might be at a lower j value.
        // look forward for next ACN in yarn path
        [m, n, _, _] = nextCN(i, j, legNode, j - 1, DS);
      }
      // Determine final location
      let { finalI, finalJ } = finalLocation(i, j, DS);
      if (n < finalJ) {
        // if this CN is anchored
        DS.setAV(i, j, ACN); // update CN state
        return true;
      } else {
        return false;
      }
    } else {
      // it is an ACN or PCN
      return true;
    }
  }
}

function finalLocation(i, j, DS) {
  // determines where ACNs in the CN[i,j] grid end up in the yarn[i,j] grid
  const [dj, di] = DS.getMV(i, j);

  if (j == DS.height - 1) {
    return { i, j };
  } else if (di != 0) {
    // move horizontally
    return finalLocationRecursive(i + di, j, DS);
  } else {
    // move vertically
    return finalLocationRecursive(i, j + dj, DS);
  }
}

function finalLocationRecursive(i, j, DS) {
  if (DS.getST(i, j) == KNIT || DS.getST(i, j) == PURL) {
    // CN is actualized with a knit or purl stitch
    return { i, j };
  } else {
    // Otherwise we need to accumulate vertical movement
    return finalLocationRecursive(i, j + DS.getDeltaJ(i, j), DS);
  }
}

// function acnsAt(i, J, DS) {
// determines which ACNs are positioned at location (i,j) in the CN grid
// const ACNList = [];
// for all in 13*4
// if
// }

function nextCN(i, j, legNode, currentStitchRow, DS) {
  // determines which CN to process next. CNs are processed in a square wave order
  // and reverse direction each row (as a knitting carriage does)
  const movingRight = currentStitchRow % 2 == 0;
  const evenI = i % 2 == 0;

  let iNext = i;
  let jNext = j;
  let nextLegNode = legNode;

  if (legNode) {
    if (movingRight) {
      if (evenI) {
        // left leg node going right; move up to head node
        jNext = j + 1;
        nextLegNode = false;
      } else {
        // right leg node going right; move right to next leg node
        iNext = i + 1;
      }
    } else {
      // moving Left
      if (evenI) {
        // left leg node going left; move left to next leg node
        iNext = i - 1;
      } else {
        // right leg node going left; move up to head node
        jNext = j + 1;
        nextLegNode = false;
      }
    }
  } else {
    // looking at a head node
    if (movingRight) {
      if (evenI) {
        // left head node going right; move right to next head node
        iNext = i + 1;
      } else {
        // right head node going right; move down to leg node
        jNext = j - 1;
        nextLegNode = true;
      }
    } else {
      // moving Left
      if (evenI) {
        // left head node going left; move down to left node
        jNext = j - 1;
        nextLegNode = true;
      } else {
        // right head node going left; move left to next head node
        iNext = i - 1;
      }
    }
  }

  if (iNext < 0 || iNext >= DS.width) {
    // if the next i would be over the pattern edge move up one row:
    return {
      i: i, // original i
      j: j + 1, // original j+1
      legNode: true, // will be leg node
      currentStitchRow: currentStitchRow + 1, // next stitch row
    };
  }

  return {
    i: iNext,
    j: jNext,
    legNode: nextLegNode,
    currentStitchRow: currentStitchRow,
  };
}

export class YarnModel {
  // ok. start by making a grid of nodes. these are all of the contact neighborhoods.
  constructor(cns) {
    this.width = cns.width;
    this.height = cns.height;
    console.log(cns);

    this.contactNodes = cns.contacts.map((cn, i) => {
      return {
        index: i,
        st: cn[0],
        cn: cn[1],
        mv: cn[2],
      };
    });

    this.cnLinkLattice = [];

    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.width; ++x) {
        if (y > 0)
          this.cnLinkLattice.push({
            source: (y - 1) * this.width + x,
            target: y * this.width + x,
          });
        if (x > 0)
          this.cnLinkLattice.push({
            source: y * this.width + (x - 1),
            target: y * this.width + x,
          });
      }
    }

    this.yarnPath = followTheYarn(cns);
  }

  yarnPathToLinks() {
    let source = 0;
    const links = [];
    this.yarnPath.forEach(([i, j, stitchRow]) => {
      let target = j * this.width + i;
      links.push({ source: source, target: target, row: stitchRow });
      source = target;
    });

    return links;
  }
}
