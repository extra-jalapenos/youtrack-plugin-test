// You need to import RingUI styles once
import '@jetbrains/ring-ui-built/components/style.css';
import RadialChart, {type dataPointRaw} from "./components/RadialChart/RadialChart.tsx";
import {useEffect, useState} from "react";
import "./App.css"
import DataPoint from './data/fakingData.ts';

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
        <header>
            <h1>My React App</h1>
        </header>
        <main>
            <RadialChart data={data} width={width} height={height} />
            <button onClick={() => _setData(regenerateArray())}>Regenerate</button>
        </main>
    </>
  )
}

export default App
