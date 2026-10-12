import { memo, useEffect, useRef, useState } from "react";

import "@jetbrains/ring-ui-built/components/style.css";
import "./app.css";
import Heading from "@jetbrains/ring-ui-built/components/heading/heading";
import TileChart from "./TileChart";

const App = () => {
  const svgRef = useRef(null);
  const [size, setSize] = useState({
    width: 0,
    height: 0
  });

  useEffect(() => {
    const docQuerySelected = document.querySelector("section.svgContainer")
    if (!docQuerySelected)
      return

    setSize({
      width: docQuerySelected.clientWidth,
      height: docQuerySelected.clientHeight
    })
  }, []);

  return (
    <>
      <Heading className="component">Contribution Chart</Heading>

      <section
        className="component svgContainer"
        ref={svgRef}
      >
        <TileChart
          viewBoxWidth={size.width}
          viewBoxHeight={size.height}
          data={[]}
        />
      </section>
    </>
  );
};

export default memo(App);
