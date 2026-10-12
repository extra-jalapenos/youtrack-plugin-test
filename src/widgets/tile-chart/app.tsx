import { memo, useState } from "react";

import "@jetbrains/ring-ui-built/components/style.css";
import "./app.css";
import Heading from "@jetbrains/ring-ui-built/components/heading/heading";
import TileChart from "./TileChart";

const App = () => {
  const [width, _setWidth] = useState(parent.innerWidth);
  const [height, _setHeight] = useState(parent.innerHeight);
  return (
    <>
      <Heading className="component">
        Contribution Chart
      </Heading>

      <section>
        <TileChart
          width={width}
          height={height*0.4}
          data={[]}
        />
      </section>
    </>
  );
}

export default memo(App)
