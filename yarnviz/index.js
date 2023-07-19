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

const testPattern = new Pattern(TEST3, 4);

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
const yarnPath = yarnGraph.yarnPathToLinks();

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
  .data(yarnPath)
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

function ticked() {
  // cnLinks
  //   .attr("x1", (d) => d.source.x)
  //   .attr("y1", (d) => d.source.y)
  //   .attr("x2", (d) => d.target.x)
  //   .attr("y2", (d) => d.target.y);
  // console.log(yarnLinks);

  yarnLinks.attr(
    "d",
    d3
      .link(d3.curveBundle.beta(0.5))
      .x((d) => {
        // console.log(d);
        return d.x;
      })
      .y((d) => d.y)
  );

  cnNodes.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

  // positions for stitch operation polygons and text
  // operations.attr("points", (d) =>
  //   d.cnIndices.reduce(
  //     (str, vertexID) => `${str} ${nodes[vertexID].x},${nodes[vertexID].y}`,
  //     ""
  //   )
  // );

  // opLabels.attr("x", (d) => stitchX(d)).attr("y", (d) => stitchY(d));
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
  .force("link", d3.forceLink(yarnPath).strength(1).distance(75).iterations(10))
  .force(
    "center",
    d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2)
  )
  .on("tick", ticked);