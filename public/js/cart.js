// public/js/cart.js

document.addEventListener("DOMContentLoaded", function () {
  console.log("cart.js loaded");

  const cartCountEl = document.querySelector("#cart-count");

  async function callAddToCart(payload) {
    try {
      const body = new URLSearchParams(payload);

      const res = await fetch("/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        },
        body
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        console.error("Add to cart error:", data);
        alert(data.message || "Thêm vào giỏ thất bại");
        return;
      }

      if (cartCountEl && typeof data.cartCount === "number") {
        cartCountEl.textContent = data.cartCount;
      }
    } catch (err) {
      console.error("Error calling /cart/add:", err);
      alert("Có lỗi khi kết nối server");
    }
  }

  // Nút trên landing page / danh sách
  document.querySelectorAll(".btn-add-to-cart").forEach((btn) => {
    btn.addEventListener("click", function () {
      const productId = btn.getAttribute("data-product-id");
      const variantId = btn.getAttribute("data-variant-id") || "";
      const qty = btn.getAttribute("data-qty") || "1";

      callAddToCart({ productId, variantId, qty });
    });
  });

  // Nút trên trang chi tiết sản phẩm
  document.querySelectorAll(".btn-add-to-cart-detail").forEach((btn) => {
    btn.addEventListener("click", function () {
      const productId = btn.getAttribute("data-product-id");
      const form = btn.closest("form");
      const variantSelect = form.querySelector('select[name="variantId"]');
      const qtyInput = form.querySelector('input[name="qty"]');

      const payload = {
        productId,
        variantId: variantSelect ? variantSelect.value : "",
        qty: qtyInput ? qtyInput.value || "1" : "1"
      };

      callAddToCart(payload);
    });
  });
});
