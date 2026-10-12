import { memo, useState } from "react";

import "@jetbrains/ring-ui-built/components/style.css";
import Popup from "@jetbrains/ring-ui-built/components/popup/popup";
import Toggle from "@jetbrains/ring-ui-built/components/toggle/toggle";
import Heading from "@jetbrains/ring-ui-built/components/heading/heading";
import Dropdown from "@jetbrains/ring-ui-built/components/dropdown/dropdown";
import Select from "@jetbrains/ring-ui-built/components/select/select";
import "./app.css";

const App = () => {
  const [toggle, setToggle] = useState(true)
  return (
    <>
      <Heading className="component">
        Start editing to see some magic happen!
      </Heading>

      <section>
        <Toggle
          defaultChecked={toggle}
          className="component"
          onChange={(e) => setToggle(e.target.checked)}
        >
          Cool toggle
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
    </>
  );
}

export default memo(App)
