import { useEffect } from "react";
// Visibility Script
import { onDOMReady } from "./utilities/domUtils";
// Dark Mode Script
import { applyTheme } from "./utilities/themeUtils";
// Components
import BreachProtocol from "./components/BreachProtocolQuickhack";


export default function App() {
  useEffect(() => {
    applyTheme();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      onDOMReady(() => {
        document.body.style.visibility = "visible";
      });
    }, 200);
  }, []);

  return (
    <>
      <BreachProtocol />
    </>
  );
}
