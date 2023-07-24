import { Pane } from "tweakpane";

export const PARAMS = {
  yarnWidth: 10,
};

const pane = new Pane({
  title: "topology model",
});

pane.addInput(PARAMS, "yarnWidth", {
  min: 1,
  step: 1,
});
