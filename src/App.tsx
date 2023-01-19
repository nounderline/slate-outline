import { useState } from "react"
import reactLogo from "./assets/react.svg"
import "./App.css"
import CheckListsExample from "./Editor"

function App() {
    const [count, setCount] = useState(0)

    return (
        <div>
            <CheckListsExample />
        </div>
    )
}

export default App
