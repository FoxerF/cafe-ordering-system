import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  clearAuthToken,
  createCategory,
  createPickupSlot,
  createProduct,
  deactivatePickupSlot,
  deleteCategory,
  deleteProduct,
  getAdminOrders,
  getAdminSummary,
  getAuthToken,
  getCategories,
  getCurrentUser,
  getPickupSlots,
  getProducts,
  updateCategory,
  updateOrderStatus,
  updateProduct,
} from "../api/api";

import type {
  AdminSummary,
  AuthUser,
  Category,
  Order,
  PickupSlot,
  Product,
} from "../types";

type Tab =
  | "dashboard"
  | "orders"
  | "products"
  | "categories"
  | "slots";

const STATUS_TRANSITIONS: Record<
  string,
  string[]
> = {
  NEW: [
    "CONFIRMED",
    "CANCELLED",
  ],

  CONFIRMED: [
    "PREPARING",
    "CANCELLED",
  ],

  PREPARING: ["READY"],

  READY: ["COMPLETED"],

  COMPLETED: [],

  CANCELLED: [],
};

export default function AdminPage() {
  const navigate = useNavigate();

  const [user, setUser] =
    useState<AuthUser | null>(
      null,
    );

  const [tab, setTab] =
    useState<Tab>("dashboard");

  const [summary, setSummary] =
    useState<AdminSummary | null>(
      null,
    );

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [slots, setSlots] =
    useState<PickupSlot[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState<string | null>(null);

  const [newCategoryName, setNewCategoryName] =
    useState("");

  const [editingCategoryId, setEditingCategoryId] =
    useState<number | null>(null);

  const [editingCategoryName, setEditingCategoryName] =
    useState("");

  const [productForm, setProductForm] =
    useState({
      name: "",
      description: "",
      price: "",
      imageUrl: "",
      categoryId: "",
    });

  const [editingProductId, setEditingProductId] =
    useState<number | null>(null);

  const [editProductForm, setEditProductForm] =
    useState({
      name: "",
      description: "",
      price: "",
      imageUrl: "",
      categoryId: "",
      isAvailable: true,
    });

  const [slotForm, setSlotForm] =
    useState({
      startsAt: "",
      endsAt: "",
      maxOrders: "4",
    });

  const showError =
    useCallback((value: string) => {
      setError(value);
      setMessage(null);
    }, []);

  const showMessage =
    useCallback((value: string) => {
      setMessage(value);
      setError(null);
    }, []);

  const refreshAll =
    useCallback(async () => {
      const [
        summaryData,
        ordersData,
        productsData,
        categoriesData,
        slotsData,
      ] = await Promise.all([
        getAdminSummary(),
        getAdminOrders(),
        getProducts(),
        getCategories(),
        getPickupSlots(),
      ]);

      setSummary(summaryData);
      setOrders(ordersData);
      setProducts(productsData);
      setCategories(categoriesData);
      setSlots(slotsData);
    }, []);

  useEffect(() => {
    async function initialize() {
      const token =
        getAuthToken();

      if (!token) {
        navigate(
          "/admin/login",
          { replace: true },
        );
        return;
      }

      try {
        const currentUser =
          await getCurrentUser();

        if (
          currentUser.role !==
          "ADMIN"
        ) {
          clearAuthToken();

          navigate(
            "/admin/login",
            { replace: true },
          );

          return;
        }

        setUser(currentUser);

        await refreshAll();
      } catch {
        clearAuthToken();

        navigate(
          "/admin/login",
          { replace: true },
        );
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, [navigate, refreshAll]);

  function logout() {
    clearAuthToken();

    navigate(
      "/admin/login",
      { replace: true },
    );
  }

  async function handleCreateCategory() {
    if (
      !newCategoryName.trim()
    ) {
      return;
    }

    try {
      await createCategory(
        newCategoryName.trim(),
      );

      setNewCategoryName("");

      await refreshAll();

      showMessage(
        "Category created.",
      );
    } catch (err) {
      showError(
        err instanceof Error
          ? err.message
          : "Failed to create category",
      );
    }
  }

  async function handleSaveCategory(
    id: number,
  ) {
    if (
      !editingCategoryName.trim()
    ) {
      return;
    }

    try {
      await updateCategory(
        id,
        editingCategoryName.trim(),
      );

      setEditingCategoryId(null);
      setEditingCategoryName("");

      await refreshAll();

      showMessage(
        "Category updated.",
      );
    } catch (err) {
      showError(
        err instanceof Error
          ? err.message
          : "Failed to update category",
      );
    }
  }

  async function handleDeleteCategory(
    id: number,
  ) {
    if (
      !window.confirm(
        "Delete this category?",
      )
    ) {
      return;
    }

    try {
      await deleteCategory(id);

      await refreshAll();

      showMessage(
        "Category deleted.",
      );
    } catch (err) {
      showError(
        err instanceof Error
          ? err.message
          : "Failed to delete category",
      );
    }
  }

  async function handleCreateProduct() {
    const price = Number(
      productForm.price,
    );

    const categoryId = Number(
      productForm.categoryId,
    );

    if (
      !productForm.name.trim()
    ) {
      showError(
        "Product name is required.",
      );
      return;
    }

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      showError(
        "Price must be a valid number.",
      );
      return;
    }

    if (
      !Number.isInteger(
        categoryId,
      ) ||
      categoryId <= 0
    ) {
      showError(
        "Select a category.",
      );
      return;
    }

    try {
      await createProduct({
        name: productForm.name.trim(),
        description:
          productForm.description.trim() ||
          undefined,
        price,
        imageUrl:
          productForm.imageUrl.trim() ||
          undefined,
        categoryId,
      });

      setProductForm({
        name: "",
        description: "",
        price: "",
        imageUrl: "",
        categoryId: "",
      });

      await refreshAll();

      showMessage(
        "Product created.",
      );
    } catch (err) {
      showError(
        err instanceof Error
          ? err.message
          : "Failed to create product",
      );
    }
  }

  function beginProductEdit(
    product: Product,
  ) {
    setEditingProductId(product.id);

    setEditProductForm({
      name: product.name,
      description:
        product.description ?? "",
      price: String(product.price),
      imageUrl:
        product.imageUrl ?? "",
      categoryId: String(
        product.categoryId,
      ),
      isAvailable:
        product.isAvailable,
    });
  }

  async function handleSaveProduct(
    id: number,
  ) {
    const price = Number(
      editProductForm.price,
    );

    const categoryId = Number(
      editProductForm.categoryId,
    );

    if (
      !editProductForm.name.trim()
    ) {
      showError(
        "Product name is required.",
      );
      return;
    }

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      showError(
        "Price must be a valid number.",
      );
      return;
    }

    if (
      !Number.isInteger(
        categoryId,
      ) ||
      categoryId <= 0
    ) {
      showError(
        "Select a category.",
      );
      return;
    }

    try {
      await updateProduct(id, {
        name: editProductForm.name.trim(),
        description:
          editProductForm.description.trim(),
        price,
        imageUrl:
          editProductForm.imageUrl.trim(),
        categoryId,
        isAvailable:
          editProductForm.isAvailable,
      });

      setEditingProductId(null);

      await refreshAll();

      showMessage(
        "Product updated.",
      );
    } catch (err) {
      showError(
        err instanceof Error
          ? err.message
          : "Failed to update product",
      );
    }
  }

  async function handleDeleteProduct(
    id: number,
  ) {
    if (
      !window.confirm(
        "Delete this product?",
      )
    ) {
      return;
    }

    try {
      await deleteProduct(id);

      await refreshAll();

      showMessage(
        "Product deleted.",
      );
    } catch (err) {
      showError(
        err instanceof Error
          ? err.message
          : "Failed to delete product",
      );
    }
  }

  async function handleStatusChange(
    orderId: number,
    status: string,
  ) {
    try {
      await updateOrderStatus(
        orderId,
        status,
      );

      await refreshAll();

      showMessage(
        "Order status updated.",
      );
    } catch (err) {
      showError(
        err instanceof Error
          ? err.message
          : "Failed to update order",
      );
    }
  }

  async function handleCreateSlot() {
    if (
      !slotForm.startsAt ||
      !slotForm.endsAt
    ) {
      showError(
        "Start and end time are required.",
      );
      return;
    }

    const maxOrders = Number(
      slotForm.maxOrders,
    );

    if (
      !Number.isInteger(maxOrders) ||
      maxOrders <= 0
    ) {
      showError(
        "Maximum orders must be a positive integer.",
      );
      return;
    }

    try {
      await createPickupSlot({
        startsAt: new Date(
          slotForm.startsAt,
        ).toISOString(),

        endsAt: new Date(
          slotForm.endsAt,
        ).toISOString(),

        maxOrders,
      });

      setSlotForm({
        startsAt: "",
        endsAt: "",
        maxOrders: "4",
      });

      await refreshAll();

      showMessage(
        "Pickup slot created.",
      );
    } catch (err) {
      showError(
        err instanceof Error
          ? err.message
          : "Failed to create slot",
      );
    }
  }

  async function handleDeactivateSlot(
    id: number,
  ) {
    if (
      !window.confirm(
        "Deactivate this pickup slot?",
      )
    ) {
      return;
    }

    try {
      await deactivatePickupSlot(
        id,
      );

      await refreshAll();

      showMessage(
        "Pickup slot deactivated.",
      );
    } catch (err) {
      showError(
        err instanceof Error
          ? err.message
          : "Failed to deactivate slot",
      );
    }
  }

  function formatDate(
    value: string,
  ) {
    return new Date(
      value,
    ).toLocaleString(
      undefined,
      {
        dateStyle: "medium",
        timeStyle: "short",
      },
    );
  }

  if (loading) {
    return (
      <main className="container">
        <p>
          Loading administration...
        </p>
      </main>
    );
  }

  return (
    <main className="container admin-page">
      <div className="admin-header">
        <div>
          <h1>
            Administration
          </h1>

          <p>
            Signed in as{" "}
            <strong>
              {user?.email}
            </strong>
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={logout}
        >
          Sign out
        </button>
      </div>

      <div className="admin-tabs">
        {(
          [
            [
              "dashboard",
              "Dashboard",
            ],
            ["orders", "Orders"],
            ["products", "Products"],
            [
              "categories",
              "Categories",
            ],
            ["slots", "Pickup slots"],
          ] as const
        ).map(
          ([value, label]) => (
            <button
              key={value}
              className={
                tab === value
                  ? "active"
                  : ""
              }
              onClick={() =>
                setTab(value)
              }
            >
              {label}
            </button>
          ),
        )}
      </div>

      {error && (
        <div className="admin-message error">
          {error}
        </div>
      )}

      {message && (
        <div className="admin-message success">
          {message}
        </div>
      )}

      {tab === "dashboard" && (
        <section>
          <h2>
            Dashboard
          </h2>

          <div className="stats-grid">
            <div className="stat-card">
              <span>
                Active orders
              </span>

              <strong>
                {summary?.activeOrders ??
                  0}
              </strong>
            </div>

            <div className="stat-card">
              <span>
                Preparing
              </span>

              <strong>
                {summary?.preparingOrders ??
                  0}
              </strong>
            </div>

            <div className="stat-card">
              <span>
                Ready
              </span>

              <strong>
                {summary?.readyOrders ??
                  0}
              </strong>
            </div>
          </div>

          <div className="admin-section">
            <h3>
              Upcoming pickup slots
            </h3>

            {summary?.upcomingSlots
              .length === 0 ? (
              <p>
                No upcoming slots.
              </p>
            ) : (
              <div className="admin-list">
                {summary?.upcomingSlots.map(
                  (slot) => (
                    <div
                      className="admin-list-row"
                      key={slot.id}
                    >
                      <span>
                        {formatDate(
                          slot.startsAt,
                        )}
                      </span>

                      <span>
                        {slot.currentOrders}
                        /
                        {
                          slot.maxOrders
                        }{" "}
                        orders
                      </span>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {tab === "orders" && (
        <section>
          <h2>
            Orders
          </h2>

          <div className="admin-list">
            {orders.length === 0 ? (
              <p>
                No orders yet.
              </p>
            ) : (
              orders.map((order) => (
                <div
                  className="admin-card"
                  key={order.id}
                >
                  <div className="admin-card-header">
                    <div>
                      <strong>
                        {order.orderNumber}
                      </strong>

                      <p>
                        {
                          order.customerName
                        }{" "}
                        ·{" "}
                        {
                          order.customerPhone
                        }
                      </p>
                    </div>

                    <strong>
                      €
                      {order.totalPrice.toFixed(
                        2,
                      )}
                    </strong>
                  </div>

                  <p>
                    Pickup:{" "}
                    {formatDate(
                      order.pickupSlot
                        .startsAt,
                    )}
                  </p>

                  <p>
                    Estimated ready:{" "}
                    {order.estimatedReadyAt
                      ? formatDate(
                          order.estimatedReadyAt,
                        )
                      : "N/A"}
                  </p>

                  <div className="admin-order-items">
                    {order.items.map(
                      (
                        item,
                        index,
                      ) => (
                        <span
                          key={`${order.id}-${index}`}
                        >
                          {
                            item.productName
                          }{" "}
                          ×{" "}
                          {
                            item.quantity
                          }
                        </span>
                      ),
                    )}
                  </div>

                  <div className="admin-order-actions">
                    <span className="status-badge">
                      {order.status}
                    </span>

                    {order.id &&
                      STATUS_TRANSITIONS[
                        order.status
                      ]?.map(
                        (
                          nextStatus,
                        ) => (
                          <button
                            key={
                              nextStatus
                            }
                            className="secondary-button"
                            onClick={() =>
                              handleStatusChange(
                                order.id!,
                                nextStatus,
                              )
                            }
                          >
                            →{" "}
                            {nextStatus}
                          </button>
                        ),
                      )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {tab === "products" && (
        <section>
          <h2>
            Products
          </h2>

          <div className="admin-form-card">
            <h3>
              Add product
            </h3>

            <div className="form-grid">
              <input
                placeholder="Name"
                value={
                  productForm.name
                }
                onChange={(event) =>
                  setProductForm({
                    ...productForm,
                    name: event.target.value,
                  })
                }
              />

              <input
                placeholder="Price"
                type="number"
                step="0.01"
                value={
                  productForm.price
                }
                onChange={(event) =>
                  setProductForm({
                    ...productForm,
                    price: event.target.value,
                  })
                }
              />

              <select
                value={
                  productForm.categoryId
                }
                onChange={(event) =>
                  setProductForm({
                    ...productForm,
                    categoryId:
                      event.target.value,
                  })
                }
              >
                <option value="">
                  Select category
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={
                        category.id
                      }
                      value={
                        category.id
                      }
                    >
                      {category.name}
                    </option>
                  ),
                )}
              </select>

              <input
                placeholder="Image URL"
                value={
                  productForm.imageUrl
                }
                onChange={(event) =>
                  setProductForm({
                    ...productForm,
                    imageUrl:
                      event.target.value,
                  })
                }
              />

              <textarea
                placeholder="Description"
                value={
                  productForm.description
                }
                onChange={(event) =>
                  setProductForm({
                    ...productForm,
                    description:
                      event.target.value,
                  })
                }
                rows={3}
              />
            </div>

            <button
              className="primary-button"
              onClick={
                handleCreateProduct
              }
            >
              Add product
            </button>
          </div>

          <div className="admin-list">
            {products.map(
              (product) => (
                <div
                  className="admin-card"
                  key={product.id}
                >
                  {editingProductId ===
                  product.id ? (
                    <>
                      <input
                        value={
                          editProductForm.name
                        }
                        onChange={(
                          event,
                        ) =>
                          setEditProductForm(
                            {
                              ...editProductForm,
                              name:
                                event.target.value,
                            },
                          )
                        }
                      />

                      <textarea
                        value={
                          editProductForm.description
                        }
                        onChange={(
                          event,
                        ) =>
                          setEditProductForm(
                            {
                              ...editProductForm,
                              description:
                                event.target.value,
                            },
                          )
                        }
                        rows={2}
                      />

                      <input
                        type="number"
                        step="0.01"
                        value={
                          editProductForm.price
                        }
                        onChange={(
                          event,
                        ) =>
                          setEditProductForm(
                            {
                              ...editProductForm,
                              price:
                                event.target.value,
                            },
                          )
                        }
                      />

                      <input
                        value={
                          editProductForm.imageUrl
                        }
                        placeholder="Image URL"
                        onChange={(
                          event,
                        ) =>
                          setEditProductForm(
                            {
                              ...editProductForm,
                              imageUrl:
                                event.target.value,
                            },
                          )
                        }
                      />

                      <select
                        value={
                          editProductForm.categoryId
                        }
                        onChange={(
                          event,
                        ) =>
                          setEditProductForm(
                            {
                              ...editProductForm,
                              categoryId:
                                event.target.value,
                            },
                          )
                        }
                      >
                        {categories.map(
                          (
                            category,
                          ) => (
                            <option
                              key={
                                category.id
                              }
                              value={
                                category.id
                              }
                            >
                              {
                                category.name
                              }
                            </option>
                          ),
                        )}
                      </select>

                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={
                            editProductForm.isAvailable
                          }
                          onChange={(
                            event,
                          ) =>
                            setEditProductForm(
                              {
                                ...editProductForm,
                                isAvailable:
                                  event
                                    .target
                                    .checked,
                              },
                            )
                          }
                        />

                        Available
                      </label>

                      <div className="button-row">
                        <button
                          className="primary-button"
                          onClick={() =>
                            handleSaveProduct(
                              product.id,
                            )
                          }
                        >
                          Save
                        </button>

                        <button
                          className="secondary-button"
                          onClick={() =>
                            setEditingProductId(
                              null,
                            )
                          }
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="admin-card-header">
                        <div>
                          <strong>
                            {
                              product.name
                            }
                          </strong>

                          <p>
                            {
                              product.category
                                .name
                            }
                          </p>
                        </div>

                        <strong>
                          €
                          {product.price.toFixed(
                            2,
                          )}
                        </strong>
                      </div>

                      <p>
                        {product.description}
                      </p>

                      <p>
                        Status:{" "}
                        {product.isAvailable
                          ? "Available"
                          : "Unavailable"}
                      </p>

                      <div className="button-row">
                        <button
                          className="secondary-button"
                          onClick={() =>
                            beginProductEdit(
                              product,
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="secondary-button"
                          onClick={() =>
                            handleDeleteProduct(
                              product.id,
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ),
            )}
          </div>
        </section>
      )}

      {tab === "categories" && (
        <section>
          <h2>
            Categories
          </h2>

          <div className="admin-form-card">
            <h3>
              Add category
            </h3>

            <input
              value={
                newCategoryName
              }
              onChange={(event) =>
                setNewCategoryName(
                  event.target.value,
                )
              }
              placeholder="Category name"
            />

            <button
              className="primary-button"
              onClick={
                handleCreateCategory
              }
            >
              Add category
            </button>
          </div>

          <div className="admin-list">
            {categories.map(
              (category) => (
                <div
                  className="admin-list-row"
                  key={category.id}
                >
                  {editingCategoryId ===
                  category.id ? (
                    <>
                      <input
                        value={
                          editingCategoryName
                        }
                        onChange={(
                          event,
                        ) =>
                          setEditingCategoryName(
                            event.target.value,
                          )
                        }
                      />

                      <div className="button-row">
                        <button
                          className="primary-button"
                          onClick={() =>
                            handleSaveCategory(
                              category.id,
                            )
                          }
                        >
                          Save
                        </button>

                        <button
                          className="secondary-button"
                          onClick={() =>
                            setEditingCategoryId(
                              null,
                            )
                          }
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <strong>
                        {
                          category.name
                        }
                      </strong>

                      <div className="button-row">
                        <button
                          className="secondary-button"
                          onClick={() => {
                            setEditingCategoryId(
                              category.id,
                            );

                            setEditingCategoryName(
                              category.name,
                            );
                          }}
                        >
                          Edit
                        </button>

                        <button
                          className="secondary-button"
                          onClick={() =>
                            handleDeleteCategory(
                              category.id,
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ),
            )}
          </div>
        </section>
      )}

      {tab === "slots" && (
        <section>
          <h2>
            Pickup slots
          </h2>

          <div className="admin-form-card">
            <h3>
              Create pickup slot
            </h3>

            <div className="form-grid">
              <label>
                Start
                <input
                  type="datetime-local"
                  value={
                    slotForm.startsAt
                  }
                  onChange={(
                    event,
                  ) =>
                    setSlotForm({
                      ...slotForm,
                      startsAt:
                        event.target.value,
                    })
                  }
                />
              </label>

              <label>
                End
                <input
                  type="datetime-local"
                  value={
                    slotForm.endsAt
                  }
                  onChange={(
                    event,
                  ) =>
                    setSlotForm({
                      ...slotForm,
                      endsAt:
                        event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Maximum orders
                <input
                  type="number"
                  min="1"
                  value={
                    slotForm.maxOrders
                  }
                  onChange={(
                    event,
                  ) =>
                    setSlotForm({
                      ...slotForm,
                      maxOrders:
                        event.target.value,
                    })
                  }
                />
              </label>
            </div>

            <button
              className="primary-button"
              onClick={
                handleCreateSlot
              }
            >
              Create slot
            </button>
          </div>

          <div className="admin-list">
            {slots.length === 0 ? (
              <p>
                No active upcoming
                slots.
              </p>
            ) : (
              slots.map((slot) => (
                <div
                  className="admin-list-row"
                  key={slot.id}
                >
                  <div>
                    <strong>
                      {formatDate(
                        slot.startsAt,
                      )}
                    </strong>

                    <p>
                      {slot.currentOrders}
                      /
                      {slot.maxOrders}{" "}
                      orders
                    </p>
                  </div>

                  <button
                    className="secondary-button"
                    onClick={() =>
                      handleDeactivateSlot(
                        slot.id,
                      )
                    }
                  >
                    Deactivate
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      <button
        className="refresh-button"
        onClick={async () => {
          try {
            await refreshAll();
            showMessage(
              "Data refreshed.",
            );
          } catch (err) {
            showError(
              err instanceof Error
                ? err.message
                : "Failed to refresh",
            );
          }
        }}
      >
        Refresh data
      </button>
    </main>
  );
}