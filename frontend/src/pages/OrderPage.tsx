import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import { getOrder } from "../api/api";

import type { Order } from "../types";

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleString(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );
}

function getStatusLabel(
  status: string,
) {
  switch (status) {
    case "NEW":
      return "Order received";

    case "CONFIRMED":
      return "Order confirmed";

    case "PREPARING":
      return "Being prepared";

    case "READY":
      return "Ready for pickup";

    case "COMPLETED":
      return "Completed";

    case "CANCELLED":
      return "Cancelled";

    default:
      return status;
  }
}

export default function OrderPage() {
  const { orderNumber } =
    useParams();

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadOrder =
    useCallback(async () => {
      if (!orderNumber) {
        setError(
          "Invalid order number.",
        );
        setLoading(false);
        return;
      }

      try {
        const data =
          await getOrder(
            orderNumber,
          );

        setOrder(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load order",
        );
      } finally {
        setLoading(false);
      }
    }, [orderNumber]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  if (loading) {
    return (
      <main className="container">
        <p>
          Loading order...
        </p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="container">
        <h1>
          Order not found
        </h1>

        <p className="error">
          {error}
        </p>

        <Link to="/">
          Back to menu
        </Link>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="order-page">
        <h1>
          Order confirmed
        </h1>

        <div className="order-highlight">
          <p>
            Order number
          </p>

          <strong>
            {order.orderNumber}
          </strong>

          <p>
            Pickup code
          </p>

          <strong className="pickup-code">
            {order.pickupCode}
          </strong>
        </div>

        <section className="checkout-section">
          <h2>
            Status
          </h2>

          <div className="order-status">
            {getStatusLabel(
              order.status,
            )}
          </div>

          <p>
            Last status:
            {" "}
            {order.status}
          </p>

          <p>
            Estimated ready:
            {" "}
            <strong>
              {formatDate(
                order.estimatedReadyAt,
              )}
            </strong>
          </p>
        </section>

        <section className="checkout-section">
          <h2>
            Pickup
          </h2>

          <p>
            {formatDate(
              order.pickupSlot.startsAt,
            )}
            {" – "}
            {new Date(
              order.pickupSlot.endsAt,
            ).toLocaleTimeString(
              undefined,
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            )}
          </p>
        </section>

        <section className="checkout-section">
          <h2>
            Order items
          </h2>

          {order.items.map(
            (item, index) => (
              <div
                className="summary-row"
                key={`${item.productName}-${index}`}
              >
                <span>
                  {item.productName} ×{" "}
                  {item.quantity}
                </span>

                <span>
                  €
                  {item.subtotal.toFixed(
                    2,
                  )}
                </span>
              </div>
            ),
          )}

          <div className="summary-row total">
            <strong>
              Total
            </strong>

            <strong>
              €{order.totalPrice.toFixed(2)}
            </strong>
          </div>
        </section>

        <div className="order-actions">
          <button
            className="primary-button"
            onClick={loadOrder}
          >
            Refresh status
          </button>

          <Link
            className="secondary-button"
            to="/"
          >
            Back to menu
          </Link>
        </div>
      </div>
    </main>
  );
}