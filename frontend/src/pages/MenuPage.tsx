import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCategories,
  getProducts,
} from "../api/api";

import type {
  Category,
  Product,
} from "../types";

import ProductCard from "../components/ProductCard";

export default function MenuPage() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [selectedCategory, setSelectedCategory] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadMenu() {
      try {
        const [
          productsData,
          categoriesData,
        ] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);

        setProducts(productsData);
        setCategories(categoriesData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load menu",
        );
      } finally {
        setLoading(false);
      }
    }

    loadMenu();
  }, []);

  const filteredProducts =
    useMemo(() => {
      if (
        selectedCategory === null
      ) {
        return products;
      }

      return products.filter(
        (product) =>
          product.categoryId ===
          selectedCategory,
      );
    }, [
      products,
      selectedCategory,
    ]);

  if (loading) {
    return (
      <main className="container">
        <p>Loading menu...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container">
        <p className="error">
          {error}
        </p>
      </main>
    );
  }

  return (
    <main className="container">
      <h1>Our Menu</h1>

      <div className="categories">
        <button
          className={
            selectedCategory === null
              ? "active"
              : ""
          }
          onClick={() =>
            setSelectedCategory(null)
          }
        >
          All
        </button>

        {categories.map(
          (category) => (
            <button
              key={category.id}
              className={
                selectedCategory ===
                category.id
                  ? "active"
                  : ""
              }
              onClick={() =>
                setSelectedCategory(
                  category.id,
                )
              }
            >
              {category.name}
            </button>
          ),
        )}
      </div>

      <section className="product-grid">
        {filteredProducts.map(
          (product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ),
        )}
      </section>

      {filteredProducts.length ===
        0 && (
        <p>No products found.</p>
      )}
    </main>
  );
}