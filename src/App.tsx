// You need to import RingUI styles once
import '@jetbrains/ring-ui-built/components/style.css';
import RadialChart, {type dataPoint} from "./components/RadialChart/RadialChart.tsx";
import {useEffect, useState} from "react";
import DataPoint from './data/fakingData.ts';

const regenerateArray = () => {
    return Array(100).fill(0).map(_ => new DataPoint());
}

function App() {
    const [height, setHeight] = useState(0);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        setHeight(100);
        setWidth(100);

        const newData = regenerateArray();
        setData(newData);
    }, [])

    const [data, setData] = useState<Array<dataPoint>>(regenerateArray());


  return (
    <>
        <header>
            <h1>My React App</h1>
        </header>
        <main>
            <RadialChart data={data} width={width} height={height} />
        </main>
    </>
  )
}

export default App
