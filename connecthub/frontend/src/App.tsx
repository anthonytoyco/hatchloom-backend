import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Protected from "./components/Protected";
import AuthCallback from "./pages/AuthCallback";
import ConnecthubProvider from "./context/ConnecthubProvider";
import Classifieds from "./pages/Classifieds";
import Connecthub from "./pages/Connecthub";
import Feed from "./pages/Feed";
import Message from "./pages/Message";

function App() {
  return (
    <BrowserRouter>
      <ConnecthubProvider>
        <Header />
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/"
            element={
              <Protected>
                <Connecthub />
              </Protected>
            }
          />
          <Route
            path="/feed"
            element={
              <Protected>
                <Feed />
              </Protected>
            }
          />
          <Route
            path="/messages"
            element={
              <Protected>
                <Message />
              </Protected>
            }
          />
          <Route
            path="/classifieds"
            element={
              <Protected>
                <Classifieds />
              </Protected>
            }
          />
        </Routes>
      </ConnecthubProvider>
    </BrowserRouter>
  );
}

export default App;
