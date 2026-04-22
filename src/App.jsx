import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./Pages/Base/Layout";
import LayoutPlus from "./Pages/Base-plus/Layout-Plus";



const App = ()=>{
  return (
    <>
    <BrowserRouter>
      <Routes >
        <Route path="/basehabitat" element={<Layout/>}/>
        <Route path="/basehabitat/plus" element={<LayoutPlus/>} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App;