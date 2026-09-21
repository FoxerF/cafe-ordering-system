import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    totalPrice,
  } = useCart();

  if (items.length === 0) {
    return (
      <main className="container">
        <h1>Your Cart</h1>

        <p>Your cart is empty.</p>

        <Link to="/">
          Back to menu
        </Link>
      </main>
    );
  }

  return (
    <main className="container">
      <h1>Your Cart</h1>

      <div className="cart-list">
        {items.map((item) => (
          <div
            className="cart-item"
            key={item.product.id}
          >
            <div>
              <h3>
                {item.product.name}
              </h3>

              <p>
                €{item.product.price.toFixed(2)}
              </p>
            </div>

            <div className="quantity-controls">
              <button
                onClick={() =>
                  updateQuantity(
                    item.product.id,
                    item.quantity - 1,
                  )
                }
              >
                −
              </button>

              <span>
                {item.quantity}
              </span>

              <button
                onClick={() =>
                  updateQuantity(
                    item.product.id,
                    item.quantity + 1,
                  )
                }
              >
                +
              </button>
            </div>

            <strong>
              €
              {(
                item.product.price *
                item.quantity
              ).toFixed(2)}
            </strong>

            <button
              onClick={() =>
                removeItem(
                  item.product.id,
                )
              }
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <strong>
          Total: €
          {totalPrice.toFixed(2)}
        </strong>

        <Link
          className="primary-button"
          to="/checkout"
        >
          Continue to checkout
        </Link>
      </div>
    </main>
  );
}