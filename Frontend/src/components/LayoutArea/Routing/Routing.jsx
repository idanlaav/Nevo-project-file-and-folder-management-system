import { Navigate, Route, Routes } from "react-router-dom"
import Home from "../../HomeArea/Home/Home.jsx"
import "./Routing.css"


function Routing() {


  return (
    <div className="Routing">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="" element={<Navigate to="/home" />} />
        </Routes>
    </div>
  )
}

export default Routing
