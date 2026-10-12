import { memo, useEffect, useRef, useState } from "react";

import "@jetbrains/ring-ui-built/components/style.css";
import "./app.css";
import Heading from "@jetbrains/ring-ui-built/components/heading/heading";
import TileChart from "./TileChart";

const App = () => {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Heading className="component">Contribution Chart</Heading>

      <section
        className="component"
        ref={containerRef}
      >
        <TileChart
          width={size.width}
          height={100}
          data={[]}
        />
      </section>
    </>
  );
};

export default memo(App);
