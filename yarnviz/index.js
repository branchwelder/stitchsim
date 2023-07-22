import { ProcessModel } from "./ProcessModel";
import { Pattern } from "./pattern";
import { YarnModel } from "./YarnModel";
import * as d3 from "d3";

const TEST = ["K", "K", "K", "K"];
const TEST2 = ["K", "K", "K", "K", "K", "T", "T", "K"];
const TEST3 = [
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
];
const pWidth = 4;
const testPattern = new Pattern(TEST3, pWidth);

const testModel = new ProcessModel(testPattern);
const yarnGraph = new YarnModel(testModel.cn);

console.log(yarnGraph.yarnPath);

const cnTypes = {
  ACN: 0,
  PCN: 1,
  UACN: 2,
  ECN: 3,
};

const opTypes = {
  T: 0,
  K: 1,
  S: 2,
};

function makeOpData(pattern, w, h) {
  const ops = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;

      // this is the polygon draw order
      const cnIJ = [
        [2 * x, y],
        [2 * x + 1, y],
        [2 * x + 1, y + 1],
        [2 * x, y + 1],
      ];

      ops.push({
        index: i,
        stitch: pattern[i],
        op: opTypes[pattern[i]],
        cnIndices: cnIJ.map(([i, j]) => j * 2 * w + i),
      });
    }
  }

  return ops;
}

// Data for simulation
const nodes = yarnGraph.contactNodes;
const links = yarnGraph.cnLinkLattice;
const yarnPath = yarnGraph.yarnPath;
const yarnPathLinks = yarnGraph.yarnPathToLinks();

console.log(nodes);
console.log(yarnPath);

const ops = makeOpData(TEST3, 4, 9);

// D3 Simulation begins here
const color = d3.scaleOrdinal(d3.schemeCategory10);
const opColors = d3.scaleOrdinal(d3.schemePastel1);

const svg = d3
  .select("body")
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%");

const operationContainer = svg.append("g").attr("class", "operations");
// const cnLinkContainer = svg.append("g").attr("class", "contact-links");
const yarnContainer = svg.append("g").attr("class", "yarns");
const cnNodeContainer = svg.append("g").attr("class", "contact-nodes");
const labelsContainer = svg.append("g").attr("class", "labels");

const yarnLinks = yarnContainer
  .selectAll()
  .data(yarnPathLinks)
  .join("path")
  .attr("stroke-width", 15)
  .attr("stroke-linecap", "round")
  .attr("fill", "none")
  .attr("stroke", (d) => color(d.row));

// const cnLinks = cnLinkContainer
//   .attr("stroke", "#999")
//   .attr("stroke-opacity", 0.6)
//   .selectAll()
//   .data(links)
//   .join("line")
//   .attr("stroke-width", 2);

const cnNodes = cnNodeContainer
  .attr("stroke", "#fff")
  .attr("stroke-width", 1.5)
  .selectAll()
  .data(nodes)
  .join("circle")
  .attr("r", 3);
// .attr("fill", (d) => color(cnTypes[d.cn]));

const operations = operationContainer
  .selectAll()
  .data(ops)
  .join("polygon")
  .attr("fill", (d) => opColors(d.op));

const opLabels = labelsContainer
  .selectAll()
  .data(ops)
  .join("text")
  .text((d) => d.stitch)
  .attr("text-anchor", "middle")
  .attr("font-size", "40");

cnNodes.append("title").text((d) => d.id);

cnNodes.call(
  d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended)
);

function stitchX(stitch) {
  const inds = stitch.cnIndices;
  return (
    inds.reduce((sum, vertexID) => sum + nodes[vertexID].x, 0) / inds.length
  );
}

function stitchY(stitch) {
  const inds = stitch.cnIndices;
  return (
    inds.reduce((sum, vertexID) => sum + nodes[vertexID].y, 0) / inds.length
  );
}

function getAngle(prev, next) {
  const x = prev.x - next.x;
  const y = prev.y - next.y;

  return Math.atan2(y, x);
}

function cubicYarnPath() {
  // iterate through the yarn path CN list

  let prevAngle = getAngle(
    nodes[yarnPath[index - 1][1] * pWidth + prevCN[0]],
    nodes[currentCN[1] * pWidth + currentCN[0]]
  );

  for (let index = 1; index < yarnPath.length - 1; index++) {
    if (index == 1) {
      prevAngle = getAngle(
        nodes[prevCN[1] * pWidth + prevCN[0]],
        nodes[currentCN[1] * pWidth + currentCN[0]]
      );
    }
    const currentCN = yarnPath[index];
    const prevCN = yarnPath[index - 1];
    const nextCN = yarnPath[index + 1];

    // find the angle between the previous and next CNs
    const angle0 = getAngle(
      nodes[prevCN[1] * pWidth + prevCN[0]],
      nodes[currentCN[1] * pWidth + currentCN[0]]
    );

    const angle1 = getAngle(
      nodes[currentCN[1] * pWidth + currentCN[0]],
      nodes[nextCN[1] * pWidth + nextCN[0]]
    );

    // find the magnitude of the handles
    // update one of the handles in the yarn link on either side of the yarn contact
    console.log(angle0 + angle1 / 2);

    yarnPathLinks[index - 1].handle1 = [0, 0];
    yarnPathLinks[index].handle0 = [0, 0];
  }

  // yarnPath.forEach(([i, j, stitchRow, headOrLeg], index) => {
  //   const prev = index - 1;
  //   const next = index + 1;
  //   if (index == 0 || next == yarnPath.length) return;

  //   let cn = nodes[j * pWidth + i];

  //   console.log(getAngle());

  //   if (cn.index == 0 || cn.index == nodes.length - 1) {
  //     // first or last
  //   }

  //   // find the angle of the handles based on the contact current positions
  //   // find the magnitude of the handles
  //   // update the yarn link on either side of the yarn contact
  // });
}

function yarnCurve(yarnLink) {
  // console.log(yarnLink);

  // let prev = yarnLinks[index - 1];
  // let next = yarnLinks[index + 1];

  let source = yarnLink.source;
  let target = yarnLink.target;

  const angle0 = 4;
  const angle1 = 4;

  const mag = Math.sqrt(source.x);

  let c0x = source.x + mag * Math.cos(angle0);
  let c0y = source.y + mag * Math.sin(angle0);

  let c1x = target.x - mag * Math.cos(angle1);
  let c1y = target.y - mag * Math.sin(angle1);

  return `M ${source.x} ${source.y} C ${c0x} ${c0y} ${c1x} ${c1y} ${target.x} ${target.y}`;
}

function ticked() {
  // console.log(yarnLinks);
  // cnLinks
  //   .attr("x1", (d) => d.source.x)
  //   .attr("y1", (d) => d.source.y)
  //   .attr("x2", (d) => d.target.x)
  //   .attr("y2", (d) => d.target.y);
  // console.log(yarnLinks);

  // yarnLinks.attr(
  //   "d",
  //   d3
  //     .link(d3.curveBundle.beta(0.5))
  //     .x((d) => {
  //       // console.log(d);
  //       return d.x;
  //     })
  //     .y((d) => d.y)
  // );
  cubicYarnPath();

  yarnLinks.attr("d", yarnCurve);

  cnNodes.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

  // positions for stitch operation polygons and text
  operations.attr("points", (d) =>
    d.cnIndices.reduce(
      (str, vertexID) => `${str} ${nodes[vertexID].x},${nodes[vertexID].y}`,
      ""
    )
  );

  opLabels.attr("x", (d) => stitchX(d)).attr("y", (d) => stitchY(d));
}

function dragstarted(event) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  event.subject.fx = event.subject.x;
  event.subject.fy = event.subject.y;
}

function dragged(event) {
  event.subject.fx = event.x;
  event.subject.fy = event.y;
}

function dragended(event) {
  if (!event.active) simulation.alphaTarget(0);
  event.subject.fx = null;
  event.subject.fy = null;
}

const simulation = d3
  .forceSimulation(nodes)
  .force("charge", d3.forceManyBody().strength(-100))
  .force(
    "link",
    d3.forceLink(yarnPathLinks).strength(1).distance(75).iterations(10)
  )
  .force(
    "center",
    d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2)
  )
  .on("tick", ticked);
