import type { Product } from "../types";
import { useCart } from "../context/CartContext";

interface Props {
  product: Product;
}

export default function ProductCard({
  product,
}: Props) {
  const { addItem } = useCart();

  return (
    <article className="product-card">
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
        />
      ) : (
        <div className="product-placeholder">
          No image
        </div>
      )}

      <div className="product-content">
        <h3>{product.name}</h3>

        <p>
          {product.description ??
            "No description"}
        </p>

        <div className="product-footer">
          <strong>
            €{product.price.toFixed(2)}
          </strong>

          <button
            onClick={() => addItem(product)}
            disabled={!product.isAvailable}
          >
            {product.isAvailable
              ? "Add to cart"
              : "Unavailable"}
          </button>
        </div>
      </div>
    </article>
  );
}