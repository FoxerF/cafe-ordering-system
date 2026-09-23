import {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  createOrder,
  getPickupSlots,
} from "../api/api";

import { useCart } from "../context/CartContext";

import type {
  PickupSlot,
} from "../types";

function formatSlot(
  startsAt: string,
  endsAt: string,
) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);

  return `${start.toLocaleDateString(
    undefined,
    {
      day: "2-digit",
      month: "2-digit",
    },
  )} ${start.toLocaleTimeString(
    undefined,
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  )}–${end.toLocaleTimeString(
    undefined,
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  )}`;
}

export default function CheckoutPage() {
  const navigate = useNavigate();

  const {
    items,
    totalPrice,
    clearCart,
  } = useCart();

  const [slots, setSlots] =
    useState<PickupSlot[]>([]);

  const [selectedSlotId, setSelectedSlotId] =
    useState<number | "">("");

  const [customerName, setCustomerName] =
    useState("");

  const [customerPhone, setCustomerPhone] =
    useState("");

  const [customerComment, setCustomerComment] =
    useState("");

  const [loadingSlots, setLoadingSlots] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadSlots() {
      try {
        const data =
          await getPickupSlots();

        setSlots(
          data.filter(
            (slot) =>
              slot.available &&
              slot.isActive,
          ),
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load pickup slots",
        );
      } finally {
        setLoadingSlots(false);
      }
    }

    loadSlots();
  }, []);

  if (items.length === 0) {
    return (
      <main className="container">
        <h1>Checkout</h1>
        <p>
          Your cart is empty.
        </p>

        <button
          className="primary-button"
          onClick={() =>
            navigate("/")
          }
        >
          Back to menu
        </button>
      </main>
    );
  }

  async function handleSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault();
    setError(null);

    if (
      selectedSlotId === ""
    ) {
      setError(
        "Please select a pickup time.",
      );
      return;
    }

    if (!customerName.trim()) {
      setError(
        "Please enter your name.",
      );
      return;
    }

    if (!customerPhone.trim()) {
      setError(
        "Please enter your phone number.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const order = await createOrder({
        customerName:
          customerName.trim(),

        customerPhone:
          customerPhone.trim(),

        customerComment:
          customerComment.trim() ||
          undefined,

        pickupSlotId:
          selectedSlotId,

        items: items.map((item) => ({
          productId:
            item.product.id,

          quantity:
            item.quantity,
        })),
      });

      clearCart();

      navigate(
        `/order/${encodeURIComponent(
          order.orderNumber,
        )}`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create order",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="container">
      <h1>Checkout</h1>

      <form
        className="checkout-form"
        onSubmit={handleSubmit}
      >
        <section className="checkout-section">
          <h2>
            Your information
          </h2>

          <label>
            Name
            <input
              type="text"
              value={customerName}
              onChange={(event) =>
                setCustomerName(
                  event.target.value,
                )
              }
              required
            />
          </label>

          <label>
            Phone
            <input
              type="tel"
              value={customerPhone}
              onChange={(event) =>
                setCustomerPhone(
                  event.target.value,
                )
              }
              required
            />
          </label>

          <label>
            Comment
            <textarea
              value={customerComment}
              onChange={(event) =>
                setCustomerComment(
                  event.target.value,
                )
              }
              placeholder="Optional"
              rows={3}
            />
          </label>
        </section>

        <section className="checkout-section">
          <h2>
            Pickup time
          </h2>

          {loadingSlots ? (
            <p>
              Loading available
              pickup times...
            </p>
          ) : slots.length === 0 ? (
            <p className="error">
              No pickup times are
              currently available.
            </p>
          ) : (
            <div className="slot-list">
              {slots.map((slot) => (
                <label
                  className={
                    selectedSlotId ===
                    slot.id
                      ? "slot-option selected"
                      : "slot-option"
                  }
                  key={slot.id}
                >
                  <input
                    type="radio"
                    name="pickupSlot"
                    value={slot.id}
                    checked={
                      selectedSlotId ===
                      slot.id
                    }
                    onChange={() =>
                      setSelectedSlotId(
                        slot.id,
                      )
                    }
                  />

                  <span>
                    <strong>
                      {formatSlot(
                        slot.startsAt,
                        slot.endsAt,
                      )}
                    </strong>

                    <small>
                      {
                        slot.remainingOrders
                      }{" "}
                      spots remaining
                    </small>
                  </span>
                </label>
              ))}
            </div>
          )}
        </section>

        <section className="checkout-section">
          <h2>
            Order summary
          </h2>

          {items.map((item) => (
            <div
              className="summary-row"
              key={item.product.id}
            >
              <span>
                {item.product.name} ×{" "}
                {item.quantity}
              </span>

              <span>
                €
                {(
                  item.product.price *
                  item.quantity
                ).toFixed(2)}
              </span>
            </div>
          ))}

          <div className="summary-row total">
            <strong>
              Total
            </strong>

            <strong>
              €{totalPrice.toFixed(2)}
            </strong>
          </div>
        </section>

        {error && (
          <p className="error">
            {error}
          </p>
        )}

        <button
          className="primary-button"
          type="submit"
          disabled={
            submitting ||
            loadingSlots ||
            slots.length === 0
          }
        >
          {submitting
            ? "Placing order..."
            : "Place order"}
        </button>
      </form>
    </main>
  );
}