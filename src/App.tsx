// You need to import RingUI styles once
import '@jetbrains/ring-ui-built/components/style.css';
import "./App.css"
import InteractiveChart from "./components/InteractiveChart/InteractiveChart.tsx";
import { testData } from "./components/InteractiveChart/testdata.ts";

function App() {
  return (
    <>
        <InteractiveChart data={testData}/>
    </>
  )
}

export default App
