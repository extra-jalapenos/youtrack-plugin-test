import { memo, useEffect, useRef, useState } from "react";

import "@jetbrains/ring-ui-built/components/style.css";
import "./app.css";
import Heading from "@jetbrains/ring-ui-built/components/heading/heading";
import TileChart from "./TileChart";

const App = () => {

  const [size, setSize] = useState({
    width: 0,
    height: 0
  });

  const svgContainerRef = useRef(null);
  const triggerSetSize = (): void => {
    if (!svgContainerRef.current) {
      return
    }
    setSize({
      width: svgContainerRef.current.clientWidth,
      height: svgContainerRef.current.clientHeight
    })
  }

  useEffect(() => {
    console.log("container has changed");
    triggerSetSize()
  }, [svgContainerRef]);

  window.addEventListener("resize", () => {
    console.log("resize");
    triggerSetSize()
  })

  return (
    <>
      <Heading className="component">Contribution Chart</Heading>

      <section
        className="component"
        ref={svgContainerRef}
      >
        {
          <TileChart
            viewBoxWidth={size.width}
            viewBoxHeight={size.height}
            data={[]}
          />
        }
      </section>
    </>
  );
};

export default memo(App);
