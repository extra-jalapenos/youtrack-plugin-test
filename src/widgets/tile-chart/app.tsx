import { memo, use, useEffect, useRef, useState, type ReactNode } from "react";

import "@jetbrains/ring-ui-built/components/style.css";
import "./app.css";
import Heading from "@jetbrains/ring-ui-built/components/heading/heading";
import TileChart from "./TileChart";

const App = () => {
  const [loading, setLoading] = useState(true);
  const [isResizing, setIsResizing] = useState(false);

    useEffect(() => {
      let timeoutId: number;

      function handleResize() {
        setIsResizing(true);

        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setIsResizing(false);
        }, 250);
      }

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        clearTimeout(timeoutId);
      };
    }, []);

  const svgContainerRef = useRef<HTMLElement>(null);

  const [size, setSize] = useState({
    width: 0,
    height: 0
  });

  const triggerSetSize = (): void => {
    if (!svgContainerRef.current) {
      return
    }
    setSize({
      width: svgContainerRef.current.clientWidth,
      height: svgContainerRef.current.clientHeight
    })
    console.log(size)
  }

  useEffect(() => {
    console.log("container has changed");
    setLoading(true);
    triggerSetSize()
  }, [svgContainerRef]);

  if (isResizing) {
    return (
      <div>
        skeleton
      </div>
    )
  }

  return (
    <>
      <Heading className="component">Contribution Chart</Heading>
      <section
        className="component"
        ref={svgContainerRef}
      >

          <TileChart
            from={new Date(2026, 1, 1)}
            to={new Date()}
            viewBoxWidth={size.width}
            viewBoxHeight={size.height}
            data={[]}
          />
      </section>
    </>
  );
};

export default memo(App);
