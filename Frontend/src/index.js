import { BrowserRouter } from "react-router-dom"
import React from "react"
import ReactDOM from "react-dom/client"
import reportWebVitals from "./reportWebVitals"
import "./index.css"
import Layout from "./components/LayoutArea/Layout/Layout"

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <React.StrictMode>
    <BrowserRouter>
    <Layout></Layout>
    </BrowserRouter>
  </React.StrictMode>
)

reportWebVitals()
