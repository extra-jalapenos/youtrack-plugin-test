// You need to import RingUI styles once
import '@jetbrains/ring-ui-built/components/style.css';
import {useEffect, useState} from "react";
import "./App.css"
import Heading from "@jetbrains/ring-ui-built/components/heading/heading";
import RadialChart from './components/RadialChart/RadialChart.tsx';

function App() {
    const [height, _setHeight] = useState(document.documentElement.clientHeight);
    const [width, _setWidth] = useState(document.documentElement.clientWidth);

    useEffect(() => {
        console.log("init")
    }, []);
  return (
    <>
        <Heading>Test</Heading>
        <RadialChart from={new Date(new Date().getTime() - 48*7 * 24 *60 *60 *1000)} to={new Date()} width={width} height={height} />
    </>
  )
}

export default App
