// You need to import RingUI styles once
import '@jetbrains/ring-ui-built/components/style.css';
import RadialChart, {type dataPoint} from "./components/RadialChart/RadialChart.tsx";
import {useState} from "react";
import DataPoint from './data/fakingData.ts';

const regenerateArray = () => {
    return Array(100).fill(0).map(_ => new DataPoint());
}
regenerateArray()

function App() {
    const [height, setHeight] = useState(100);
    const [data, setData] = useState<Array<dataPoint>>([]);
    const changeRandomNumber = () => {
        setHeight(Math.random() * 399);
    }

    const changeData = () => {
        const newData = regenerateArray();
        console.log(newData[0]);
        setData(newData);
    }

  return (
    // <App/>
    <>
        <header>
            <h1>My React App</h1>
        </header>
        <main>
            <RadialChart data={data} width={500} height={500} />
            <button onClick={changeData}>Regenerate Array</button>
        </main>
    </>
  )
}

export default App
