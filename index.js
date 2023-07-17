import * as d3 from "d3";
import { patternToStitchMesh } from "./stitchMesh";

const KNIT = 0;
const SLIP = 1;

const WALE_REST_LENGTH = 30;
const COURSE_REST_LENGTH = 30;

const ITERATIONS = 2;
const K_SHEAR_KNIT = 0.01;
const K_SHEAR_SLIP = 1.5;
const K_STRETCH = 2.5;

const K_WALE = 2.5;

const pattern = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1,
  0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1,
  0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0,
  0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0,
  0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];
const patternW = 24;
const patternH = 20;

const svg = d3.select("svg");
let width = window.innerWidth;
let height = window.innerHeight;

const { stitches, vertices, stretchLinks, shearLinks, strutLinks } =
  patternToStitchMesh(pattern, patternW, patternH);

const color = d3.scaleOrdinal(d3.schemeCategory10);

function getRestLength(link) {
  if (link.linkType == "course") return COURSE_REST_LENGTH;
  if (link.linkType == "wale") return WALE_REST_LENGTH;
  return 30;
}

// function shearDist

function stitchShear(shear) {
  const stitchType = stitches[shear.stitch].stitchType;
  if (stitchType == KNIT) return K_SHEAR_KNIT;
  if (stitchType == SLIP) return K_SHEAR_SLIP;
  return K_SHEAR_KNIT;
}

function strutForce(links) {
  return d3
    .forceLink(links)
    .distance(2 * WALE_REST_LENGTH)
    .strength(K_WALE)
    .iterations(ITERATIONS);
}

function shearForce(links) {
  return d3
    .forceLink(links)
    .distance(
      8
      // Math.sqrt(
      //   Math.pow(WALE_REST_LENGTH, 2) + Math.pow(COURSE_REST_LENGTH, 2)
      // ) - 10
    )
    .strength((d) => stitchShear(d))
    .iterations(ITERATIONS);
}

function stretchForce(links) {
  return d3
    .forceLink(links)
    .distance((d) => getRestLength(d))
    .strength(K_STRETCH)
    .iterations(ITERATIONS);
}

const simulation = d3
  .forceSimulation(vertices)
  .force("strut", strutForce(strutLinks))
  .force("shear", shearForce(shearLinks))
  .force("stretch", stretchForce(stretchLinks))
  .force("center", d3.forceCenter(width / 2, height / 2))
  .force("charge", d3.forceManyBody().strength(-200).distanceMax(20))
  .force("collision", d3.forceCollide().radius(3))
  .on("tick", ticked);

function getFacePoints(stitch) {
  return stitch.vertices.reduce(
    (str, vertexID) => `${str} ${vertices[vertexID].x},${vertices[vertexID].y}`,
    ""
  );
}

// Add a line for each link, and a circle for each vertex.

const stretch = svg
  .append("g")
  .attr("class", "stretch")
  .selectAll("line")
  .data(stretchLinks)
  .enter()
  .append("line");

const shear = svg
  .append("g")
  .attr("class", "shear")
  .selectAll("line")
  .data(shearLinks)
  .enter()
  .append("line")
  .attr("stroke-width", 2);

const strut = svg
  .append("g")
  .attr("class", "strut")
  .selectAll("line")
  .data(strutLinks)
  .enter()
  .append("line")
  .attr("stroke-width", 2);

const stitchFace = svg
  .append("g")
  .attr("class", "stitchface")
  .selectAll()
  .data(stitches)
  .join("polygon")
  .attr("fill", (d) => color(d.stitchType));

const vertex = svg
  .append("g")
  .attr("class", "vertices")
  .selectAll()
  .data(vertices)
  .join("circle")
  .attr("r", 3)
  .attr("fill", color(0));

// const stitch = svg
//   .append("g")
//   .attr("class", "stitches")
//   .selectAll()
//   .data(stitches)
//   .join("circle")
//   .attr("r", 10)
//   .attr("fill", (d) => color(d.stitchType));

vertex.call(
  d3
    .drag()
    .on("start", vertexDragStarted)
    .on("drag", vertexDragged)
    .on("end", vertexDragEnded)
);

stitchFace.call(
  d3
    .drag()
    .on("start", faceDragStart)
    .on("drag", faceDragged)
    .on("end", faceDragEnded)
);

function stitchX(stitch) {
  return (
    stitch.vertices.reduce((sum, vertexID) => sum + vertices[vertexID].x, 0) /
    stitch.vertices.length
  );
}

function stitchY(stitch) {
  return (
    stitch.vertices.reduce((sum, vertexID) => sum + vertices[vertexID].y, 0) /
    stitch.vertices.length
  );
}

// Set the position attributes of links and vertices each time the simulation ticks.
function ticked() {
  stretch
    .attr("x1", (d) => d.source.x)
    .attr("y1", (d) => d.source.y)
    .attr("x2", (d) => d.target.x)
    .attr("y2", (d) => d.target.y);

  shear
    .attr("x1", (d) => d.source.x)
    .attr("y1", (d) => d.source.y)
    .attr("x2", (d) => d.target.x)
    .attr("y2", (d) => d.target.y);

  strut
    .attr("x1", (d) => d.source.x)
    .attr("y1", (d) => d.source.y)
    .attr("x2", (d) => d.target.x)
    .attr("y2", (d) => d.target.y);

  vertex.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
  stitchFace.attr("points", (d) => getFacePoints(d));

  // stitch.attr("cx", (d) => stitchX(d)).attr("cy", (d) => stitchY(d));
}

// Reheat the simulation when drag starts, and fix the subject position.
function faceDragStart(event) {
  if (!event.active) simulation.alphaTarget(0.5).restart();

  event.subject.vertices.forEach((vertexID) => {
    const vert = vertices[vertexID];
    vert.fx = vert.x;
    vert.fy = vert.y;
  });
}

// Update the subject (dragged vertex) position during drag.
function faceDragged(event) {
  event.subject.vertices.forEach((vertexID) => {
    const vert = vertices[vertexID];
    vert.fx += event.dx;
    vert.fy += event.dy;
  });
}

// Restore the target alpha so the simulation cools after dragging ends.
// Unfix the subject position now that it’s no longer being dragged.
function faceDragEnded(event) {
  if (!event.active) simulation.alphaTarget(0);
  event.subject.vertices.forEach((vertexID) => {
    const vert = vertices[vertexID];
    vert.fx = null;
    vert.fy = null;
  });
}

// Reheat the simulation when drag starts, and fix the subject position.
function vertexDragStarted(event) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  event.subject.fx = event.subject.x;
  event.subject.fy = event.subject.y;
}

// Update the subject (dragged node) position during drag.
function vertexDragged(event) {
  event.subject.fx = event.x;
  event.subject.fy = event.y;
}

// Restore the target alpha so the simulation cools after dragging ends.
// Unfix the subject position now that it’s no longer being dragged.
function vertexDragEnded(event) {
  if (!event.active) simulation.alphaTarget(0);
  event.subject.fx = null;
  event.subject.fy = null;
}

// window.onload = () => {
//   console.log(width);
//   simulation.force(
//     "center",
//     d3.forceCenter(width / 2, height / 2).strength(0.1)
//   );
// };
