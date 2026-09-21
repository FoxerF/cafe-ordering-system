import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { totalItems } = useCart();

  return (
    <header className="navbar">
      <Link
        to="/"
        className="logo"
      >
        Café
      </Link>

      <nav>
        <Link to="/">
          Menu
        </Link>

        <Link to="/cart">
          Cart ({totalItems})
        </Link>
      </nav>
    </header>
  );
}