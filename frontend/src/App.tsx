import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { CartProvider } from "./context/CartContext";

import Navbar from "./components/Navbar";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Navbar />

        <Routes>
          <Route
            path="/"
            element={<MenuPage />}
          />

          <Route
            path="/cart"
            element={<CartPage />}
          />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;