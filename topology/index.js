import { ProcessModel } from "./ProcessModel";
import { Pattern } from "../pattern/pattern";
import { YarnModel } from "./YarnModel";
import * as d3 from "d3";

const pWidth = 8;
const pHeight = 8;

const TEST = ["K", "K", "K", "K"];
const TEST2 = ["K", "K", "K", "K", "K", "M", "M", "K", "K", "K", "K", "K"];
const TEST3 = Array(pWidth * pHeight).fill("K");

const testPattern = new Pattern(TEST3, pWidth);

const testModel = new ProcessModel(testPattern);
const yarnGraph = new YarnModel(testModel.cn);

const PARAMS = {
  yarnWidth: 10,
};

// const cnTypes = {
//   ACN: 0,
//   PCN: 1,
//   UACN: 2,
//   ECN: 3,
// };

// const opTypes = {
//   T: 0,
//   K: 1,
//   S: 2,
// };

// function makeOpData(pattern, w, h) {
//   const ops = [];
//   for (let y = 0; y < h; y++) {
//     for (let x = 0; x < w; x++) {
//       const i = y * w + x;

//       // this is the polygon draw order
//       const cnIJ = [
//         [2 * x, y],
//         [2 * x + 1, y],
//         [2 * x + 1, y + 1],
//         [2 * x, y + 1],
//       ];

//       ops.push({
//         index: i,
//         stitch: pattern[i],
//         op: opTypes[pattern[i]],
//         cnIndices: cnIJ.map(([i, j]) => j * 2 * w + i),
//       });
//     }
//   }

//   return ops;
// }

// Data for simulation
const nodes = yarnGraph.contactNodes;
const yarnPath = yarnGraph.makeNice();
const yarnPathLinks = yarnGraph.yarnPathToLinks();

console.log(nodes);
console.log(yarnPath);
console.log(yarnPathLinks);

// const ops = makeOpData(TEST3, 4, 9);

// D3 Simulation begins here
const color = d3.scaleOrdinal(d3.schemeCategory10);
// const opColors = d3.scaleOrdinal(d3.schemePastel1);

const svg = d3
  .select("body")
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%");

// const operationContainer = svg.append("g").attr("class", "operations");

const yarnsBehind = svg.append("g").attr("class", "yarns-behind");
const yarnsFront = svg.append("g").attr("class", "yarns");
const labelsContainer = svg.append("g").attr("class", "labels");
const cnNodeContainer = svg.append("g").attr("class", "contact-nodes");

const backYarns = yarnsBehind
  .attr("filter", "brightness(0.7)")
  .attr("stroke-width", PARAMS.yarnWidth)
  .attr("stroke-linecap", "round")
  .selectAll()
  .data(yarnPathLinks)
  .join("path")
  .filter(function (d) {
    return d.linkType == "LLFL" || d.linkType == "FHLH";
  })

  .attr("fill", "none")
  .attr("stroke", (d) => color(d.row % 4 < 2 ? 0 : 1));

const frontYarns = yarnsFront
  .attr("class", "shadow")
  .attr("stroke-width", PARAMS.yarnWidth)
  .attr("stroke-linecap", "round")
  .selectAll()
  .data(yarnPathLinks)
  .join("path")
  .filter(function (d) {
    return !(d.linkType == "LLFL" || d.linkType == "FHLH");
  })
  .attr("fill", "none")
  .attr("stroke", (d) => color(d.row % 4 < 2 ? 0 : 1));

// const cnNodes = cnNodeContainer
//   .selectAll()
//   .data(nodes)
//   .join("circle")
//   .attr("opacity", 0)
//   .attr("r", 5);

// const operations = operationContainer
//   .selectAll()
//   .data(ops)
//   .join("polygon")
//   .attr("fill", (d) => opColors(d.op));

// const opLabels = labelsContainer
//   .selectAll()
//   .data(ops)
//   .join("text")
//   .text((d) => d.stitch)
//   .attr("text-anchor", "middle")
//   .attr("font-size", "40");

// cnNodes.append("title").text((d) => d.id);

// cnNodes.call(
//   d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended)
// );

backYarns.call(
  d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended)
);

frontYarns.call(
  d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended)
);

// function stitchX(stitch) {
//   const inds = stitch.cnIndices;
//   return (
//     inds.reduce((sum, vertexID) => sum + nodes[vertexID].x, 0) / inds.length
//   );
// }

// function stitchY(stitch) {
//   const inds = stitch.cnIndices;
//   return (
//     inds.reduce((sum, vertexID) => sum + nodes[vertexID].y, 0) / inds.length
//   );
// }

function getNormal(prev, next, flip) {
  if (prev.index === next.index) return [0, 0];
  const x = prev.x - next.x;
  const y = prev.y - next.y;

  const mag = Math.sqrt(x ** 2 + y ** 2);
  if (flip) {
    return [-y / mag, x / mag];
  } else {
    return [y / mag, -x / mag];
  }
}

function updateNormals() {
  yarnPath[0].normal = getNormal(
    nodes[yarnPath[0].cnIndex],
    nodes[yarnPath[1].cnIndex],
    true
  );
  for (let index = 1; index < yarnPath.length - 1; index++) {
    yarnPath[index].normal = getNormal(
      nodes[yarnPath[index - 1].cnIndex],
      nodes[yarnPath[index + 1].cnIndex],
      yarnPath[index].j % 2 != 0
    );
  }

  yarnPath.at(-1).normal = getNormal(
    nodes[yarnPath.at(-2).cnIndex],
    nodes[yarnPath.at(-1).cnIndex],
    true
  );
}

const openYarnCurve = d3
  .line()
  .x((d) => nodes[d.cnIndex].x + (PARAMS.yarnWidth / 2) * d.normal[0])
  .y((d) => nodes[d.cnIndex].y + (PARAMS.yarnWidth / 2) * d.normal[1])
  .curve(d3.curveCatmullRomOpen);

function yarnCurve(yarnLink) {
  const index = yarnLink.index;

  if (index == 0 || index > yarnPathLinks.length - 3) {
    // if is the first or last link, just draw a line
    return `M ${yarnLink.source.x} ${yarnLink.source.y} ${yarnLink.target.x} ${yarnLink.target.y}`;
  }

  const linkData = [
    yarnPath[index - 1],
    yarnPath[index],
    yarnPath[index + 1],
    yarnPath[index + 2],
  ];

  return openYarnCurve(linkData);
}

function ticked() {
  updateNormals();
  frontYarns.attr("d", yarnCurve);
  backYarns.attr("d", yarnCurve);
}

function dragstarted(event) {
  if (!event.active) simulation.alphaTarget(0.9).restart();
  event.subject.source.fx = event.subject.source.x;
  event.subject.source.fy = event.subject.source.y;
  event.subject.target.fx = event.subject.target.x;
  event.subject.target.fy = event.subject.target.y;
}

function dragged(event) {
  event.subject.source.fx += event.dx;
  event.subject.source.fy += event.dy;
  event.subject.target.fx += event.dx;
  event.subject.target.fy += event.dy;
}

function dragended(event) {
  if (!event.active) simulation.alphaTarget(0);
  event.subject.source.fx = null;
  event.subject.source.fy = null;
  event.subject.target.fx = null;
  event.subject.target.fy = null;
}

const simulation = d3
  .forceSimulation(nodes)
  .force("charge", d3.forceManyBody().strength(-25).distanceMax(150))
  .force(
    "link",
    d3
      .forceLink(yarnPathLinks)
      .strength(2)
      .distance((l) => (l.linkType == "LLFL" || l.linkType == "FHLH" ? 20 : 30))
      .iterations(2)
  )
  .force(
    "center",
    d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2)
  )
  .on("tick", ticked);

setTimeout(() => {
  simulation.force("center", null);
}, 1000);
