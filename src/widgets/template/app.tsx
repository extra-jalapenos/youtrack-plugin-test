import React, { memo } from "react";

import "@jetbrains/ring-ui-built/components/style.css";
import Popup from "@jetbrains/ring-ui-built/components/popup/popup";
import Toggle from "@jetbrains/ring-ui-built/components/toggle/toggle";
import Heading from "@jetbrains/ring-ui-built/components/heading/heading";
import Dropdown from "@jetbrains/ring-ui-built/components/dropdown/dropdown";
import Select from "@jetbrains/ring-ui-built/components/select/select";
import Theme, {
  ThemeProvider,
} from "@jetbrains/ring-ui-built/components/global/theme";
import "./app.css";

const App = () => {

  return (
    <ThemeProvider className="App" theme={dark ? Theme.DARK : Theme.LIGHT}>
      <Heading className="component">
        Start editing to see some magic happen!
      </Heading>

      <section>
        <Toggle
          defaultChecked={dark}
          className="component"
          onChange={(e) => setDark(e.target.checked)}
        >
          Dark theme
        </Toggle>
      </section>

      <section>
        <Dropdown anchor="Click me" className="component">
          <Popup className="popup">Hello from Ring UI!</Popup>
        </Dropdown>
      </section>
      <section>
        <Select
          className="component"
          data={[
            { key: "1", label: "I am item" },
            { key: "2", label: "Pick me" },
          ]}
        />
      </section>
    </ThemeProvider>
  );
}

export default App
