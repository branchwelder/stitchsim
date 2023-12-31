export function patternToStitchMesh(pattern, w, h) {
  const verticesW = w + 1;
  const verticesH = h + 1;
  const vertices = Array.from({ length: verticesW * verticesH }, (_, i) => ({
    index: i,
  }));

  const stitches = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      stitches.push({
        index: i,
        stitchType: pattern[i],
        vertices: [i + y, i + y + 1, i + y + w + 2, i + y + w + 1],
      });
    }
  }

  function indexAt(x, y) {
    return y * verticesW + x;
  }

  const strutLinks = [];
  const shearLinks = [];
  const stretchLinks = [];

  // iterate over vertices to add the various links
  for (let y = 0; y < verticesH; y++) {
    for (let x = 0; x < verticesW; x++) {
      // course stretch links connect horizontally
      if (x > 0) {
        stretchLinks.push({
          source: indexAt(x - 1, y),
          target: indexAt(x, y),
          linkType: "course",
        });

        // Diagonal shear links, top left to bottom right
        if (y < verticesH - 1) {
          shearLinks.push({
            source: indexAt(x - 1, y),
            target: indexAt(x, y + 1),
            linkType: "shear",
            stitch: indexAt(x, y) - (y + 1),
          });
        }

        // Diagonal shear links, top right to bottom left
        if (y < verticesH - 1) {
          shearLinks.push({
            source: indexAt(x, y),
            target: indexAt(x - 1, y + 1),
            linkType: 2,
            stitch: indexAt(x, y) - (y + 1),
          });
        }

        if (x < verticesW - 1) {
          // hStrut links connect vertically across two courses
          strutLinks.push({
            source: indexAt(x - 1, y),
            target: indexAt(x + 1, y),
            linkType: "strut",
          });
        }
      }

      if (y > 0) {
        // wale links connect vertically
        stretchLinks.push({
          source: indexAt(x, y - 1),
          target: indexAt(x, y),
          linkType: "wale",
        });

        if (y < verticesH - 1) {
          // strut links connect vertically across two courses
          strutLinks.push({
            source: indexAt(x, y - 1),
            target: indexAt(x, y + 1),
            linkType: "strut",
          });
        }
      }
    }
  }

  return {
    stitches,
    vertices,
    strutLinks,
    shearLinks,
    stretchLinks,
  };
}
