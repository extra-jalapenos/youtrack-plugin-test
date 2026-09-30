// You need to import RingUI styles once
import '@jetbrains/ring-ui-built/components/style.css';
import RadialChart, {type dataPoint} from "./components/RadialChart/RadialChart.tsx";
import {useEffect, useState} from "react";

const regenerateArray = () => {
    return Array(100).fill(0).map(_ => ({ x: Math.random() * 100, y: Math.random() * 100 }));
}
regenerateArray()

function App() {
    const [height, setHeight] = useState( 100);
    const [data, setData] = useState<Array<dataPoint>>([]);
    const changeRandomNumber = () => {
        setHeight(Math.random() * 399);
    }

    const changeData = () => {
        const newData = regenerateArray();
        console.log(newData[0]);
        setData(newData);
    }
    useEffect(() => console.log("useEffect App.jsx"), []);
  return (
    // <App/>
    <>
        <header>
            <h1>My React App</h1>
        </header>
        <main>
            <RadialChart data={data} width={340} height={height} />
            <button onClick={changeRandomNumber}>height</button>
            <button onClick={changeData}>Regenerate Array</button>
        </main>
    </>
  )
}

export default App
