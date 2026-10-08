// You need to import RingUI styles once
import '@jetbrains/ring-ui-built/components/style.css';
import {useEffect, useState} from "react";
import "./App.css"
import Heading from "@jetbrains/ring-ui-built/components/heading/heading";
import MyChart from "./components/Chart/MyChart.tsx";

function App() {
    const [height, _setHeight] = useState(document.documentElement.clientHeight);
    const [width, _setWidth] = useState(document.documentElement.clientWidth);

    useEffect(() => {
        console.log("init")
    }, []);
  return (
    <>
        <MyChart from={new Date(2025, 0, 1)} to={new Date(2026,0,4)}/>
    </>
  )
}

export default App
