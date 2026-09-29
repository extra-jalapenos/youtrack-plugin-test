import './App.css'
import BarChart from "./components/BarChart/BarChart";
import { salesData } from "./data/sales";

function App() {
  return (
    <main>
      <h1>Monthly Sales</h1>
      <BarChart data={salesData} />
    </main>
  );
}

export default App;
