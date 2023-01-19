import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import CheckListsExample from "./Editor"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <CheckListsExample />
    </React.StrictMode>
)
