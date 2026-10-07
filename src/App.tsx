// You need to import RingUI styles once
import '@jetbrains/ring-ui-built/components/style.css';
import {useEffect, useState} from "react";
import "./App.css"
import Heading from "@jetbrains/ring-ui-built/components/heading/heading";
import TilePlotAlternative from "./components/RadialChart/TilePlotAlternative.tsx";
import RadialChart from './components/RadialChart/RadialChart.tsx';

function App() {
    useEffect(() => {
        console.log("init")
    }, []);

    const today = new Date();
    const lastYear = new Date(new Date().setFullYear(today.getFullYear() - 1));
  return (
    <>
        <TilePlotAlternative from={new Date(2026, 0, 1)}
                             to={new Date(2026, 11, 31)}
                             squareSize={20}
        />
    </>
  )
}

export default App
