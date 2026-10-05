// You need to import RingUI styles once
import '@jetbrains/ring-ui-built/components/style.css';
import RadialChart, {type dataPointRaw} from "./components/RadialChart/RadialChart.tsx";
import {useEffect, useState} from "react";
import "./App.css"
import DataPoint from './data/fakingData.ts';
import Heading from "@jetbrains/ring-ui-built/components/heading/heading";
import Button from "@jetbrains/ring-ui-built/components/button/button";

const regenerateArray = () => {
    return Array(100).fill(0).map(_ => new DataPoint());
}

function App() {
    const [height, _setHeight] = useState(document.documentElement.clientHeight);
    const [width, _setWidth] = useState(document.documentElement.clientWidth);
    const [data, _setData] = useState<Array<dataPointRaw>>(regenerateArray());

    useEffect(() => {
        console.log("init")
    }, []);
  return (
    <>
        <Heading>Test</Heading>
        <RadialChart data={data} width={width} height={height} />
        <Button onClick={() => _setData(regenerateArray())}>Regenerate Array</Button>
    </>
  )
}

export default App
