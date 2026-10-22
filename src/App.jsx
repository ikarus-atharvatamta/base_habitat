import React, { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

const Layout = lazy(() => import("./Pages/Base/Layout"));
const LayoutPlus = lazy(() => import("./Pages/Base-plus/Layout-Plus"));
const EditorPage = lazy(() => import("./Pages/Editor/EditorPage"));

const PageLoader = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#fbfbf9]">
    <div className="w-[180px] h-1 bg-black/10 rounded-full overflow-hidden">
      <div className="h-full bg-black/80 animate-pulse rounded-full w-full" />
    </div>
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/basehabitat" element={<Layout />} />
          <Route path="/basehabitat/plus" element={<LayoutPlus />} />
          <Route path="/editor" element={<EditorPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;