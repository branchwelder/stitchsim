import { StitchTypes } from "./Stitch";

class HalfEdge {
  constructor(tail, head) {
    this.head = head;
    this.tail = tail;
    this.next = null;
    this.twin = null;
    this.face = null; // the integer index of the stitch face
  }
}

class Vertex {
  constructor() {
    //this.point = point; // Coordinate position
    this.halfedge = null;
  }
}

class StitchFace {
  constructor(stitchType, index) {
    this.stitchType = stitchType;
    this.id = index;
  }
}

class HalfEdgeMesh {
  constructor() {
    this.verts = [];
    this.edges = {};
    this.stitchFaces = [];
    this.pattern = null;
  }

  vertID = 0;

  addVert() {
    this.verts.push(new Vertex());
  }

  addHalfEdge(head, tail) {
    if (!([head, tail] in this.edges)) {
      // To store halfedges, we use the head and tail as a key to reference the halfedge object.
      var E = new HalfEdge(this.verts[head], this.verts[tail]);
      this.edges[[head, tail]] = E;
      return E;
    }
  }

  buildFromPattern(pattern) {
    this.pattern = pattern;

    for (let y = 0; y < pattern.height; y++) {
      for (let x = 0; x < pattern.width; x++) {
        // Iterate over the operations in the pattern and create a stitch face for each one
        const op = pattern.op(x, y);

        const stitchFaceIndex = y * pattern.width + x;
        const stitchType = StitchTypes[op];

        this.stitchFaces.push(new StitchFace(stitchType, stitchFaceIndex));

        this.addVert();

        if (x == 0) {
          // we are at the leftmost edge of the pattern.
        }

        if (x == pattern.width - 1) {
          // we are at the rightmost edge of the pattern.
        }

        if (y == 0) {
          // we are at the top edge of the pattern.
        }

        if (y == pattern.height - 1) {
          // we are at the bottom edge of the pattern.
        }

        // if (
        //   x == 0 ||
        //   y == 0 ||
        //   x == pattern.width - 1 ||
        //   y == pattern.height - 1
        // ) {
        // this stitch is at the edge of the pattern.... how to handle these?
        // }

        const vertPairs = [];
      }
    }
  }
}
