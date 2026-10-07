// You need to import RingUI styles once
import '@jetbrains/ring-ui-built/components/style.css';
import {useEffect, useState} from "react";
import "./App.css"
import Heading from "@jetbrains/ring-ui-built/components/heading/heading";
import TilePlotAlternative from "./components/RadialChart/TilePlotAlternative.tsx";
import RadialChart from './components/RadialChart/RadialChart.tsx';

function App() {
    const [height, _setHeight] = useState(document.documentElement.clientHeight);
    const [width, _setWidth] = useState(document.documentElement.clientWidth);

    useEffect(() => {
        console.log("init")
    }, []);
  return (
    <>
        <TilePlotAlternative from={new Date(2025, 11, 4)} to={new Date(2026,0,4)} width={width} height={height}/>
    </>
  )
}

export default App
