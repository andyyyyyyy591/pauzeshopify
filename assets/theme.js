/* =============================================================================
   PAUZE THEME — JavaScript
   ============================================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------------------------
     1. Mobile navigation toggle
  --------------------------------------------------------------------------- */
  function initMobileNav() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen);
      nav.setAttribute('aria-hidden', !isOpen);
    });

    // Sub-menu toggles
    nav.querySelectorAll('.mobile-nav__link--toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const sub = this.nextElementSibling;
        const isOpen = sub.classList.toggle('is-open');
        this.setAttribute('aria-expanded', isOpen);
      });
    });
  }

  /* ---------------------------------------------------------------------------
     2. Product image gallery
  --------------------------------------------------------------------------- */
  function initProductGallery() {
    const thumbs = document.querySelectorAll('[data-image-id]');
    const featured = document.getElementById('product-featured-image');
    if (!thumbs.length || !featured) return;

    thumbs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        featured.src = this.dataset.imageUrl;
        thumbs.forEach(function (t) { t.classList.remove('is-active'); });
        this.classList.add('is-active');
      });
    });
  }

  /* ---------------------------------------------------------------------------
     3. Product quantity controls
  --------------------------------------------------------------------------- */
  function initQuantityControls() {
    document.querySelectorAll('[data-qty-minus]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const input = this.parentElement.querySelector('.product__qty-field');
        const val = parseInt(input.value, 10);
        if (val > 1) input.value = val - 1;
      });
    });

    document.querySelectorAll('[data-qty-plus]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const input = this.parentElement.querySelector('.product__qty-field');
        input.value = parseInt(input.value, 10) + 1;
      });
    });
  }

  /* ---------------------------------------------------------------------------
     4. Add to cart (AJAX)
  --------------------------------------------------------------------------- */
  function initAddToCart() {
    const form = document.querySelector('[data-product-form]');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const btn = form.querySelector('[data-add-to-cart]');
      const btnText = form.querySelector('[data-add-to-cart-text]');
      const originalText = btnText ? btnText.textContent : '';

      btn.disabled = true;
      if (btnText) btnText.textContent = 'Adding...';

      const formData = new FormData(form);
      const data = {
        id: formData.get('id'),
        quantity: parseInt(formData.get('quantity'), 10) || 1
      };

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (res) { return res.json(); })
        .then(function (item) {
          if (item.status) {
            // Error from Shopify
            alert(item.description || 'Could not add item to cart.');
          } else {
            updateCartCount();
            openCartDrawer();
          }
        })
        .catch(function () {
          alert('Something went wrong. Please try again.');
        })
        .finally(function () {
          btn.disabled = false;
          if (btnText) btnText.textContent = originalText;
        });
    });
  }

  /* ---------------------------------------------------------------------------
     5. Cart count update
  --------------------------------------------------------------------------- */
  function updateCartCount() {
    fetch('/cart.js')
      .then(function (res) { return res.json(); })
      .then(function (cart) {
        document.querySelectorAll('[data-cart-count]').forEach(function (el) {
          el.textContent = cart.item_count;
          el.classList.toggle('hidden', cart.item_count === 0);
        });
      });
  }

  /* ---------------------------------------------------------------------------
     6. Cart drawer (basic stub — expanded when drawer markup is added)
  --------------------------------------------------------------------------- */
  function openCartDrawer() {
    const drawer = document.querySelector('[data-cart-drawer]');
    if (drawer) {
      drawer.classList.add('is-open');
      document.body.classList.add('drawer-open');
    }
  }

  function closeCartDrawer() {
    const drawer = document.querySelector('[data-cart-drawer]');
    if (drawer) {
      drawer.classList.remove('is-open');
      document.body.classList.remove('drawer-open');
    }
  }

  function initCartDrawer() {
    document.querySelectorAll('[data-cart-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        const drawer = document.querySelector('[data-cart-drawer]');
        if (!drawer) return; // fall back to cart page
        e.preventDefault();
        openCartDrawer();
      });
    });

    document.querySelectorAll('[data-cart-close]').forEach(function (btn) {
      btn.addEventListener('click', closeCartDrawer);
    });

    // Close on overlay click
    document.addEventListener('click', function (e) {
      if (e.target.classList.contains('cart-drawer__overlay')) {
        closeCartDrawer();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeCartDrawer();
    });
  }

  /* ---------------------------------------------------------------------------
     7. Cart item removal (cart page)
  --------------------------------------------------------------------------- */
  function initCartRemove() {
    document.querySelectorAll('[data-remove-item]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const key = this.dataset.removeItem;
        fetch('/cart/change.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: key, quantity: 0 })
        })
          .then(function () { window.location.reload(); });
      });
    });
  }

  /* ---------------------------------------------------------------------------
     8. Collection sort (redirects with sort_by param)
  --------------------------------------------------------------------------- */
  function initCollectionSort() {
    const select = document.querySelector('[data-sort-by]');
    if (!select) return;

    select.addEventListener('change', function () {
      const url = new URL(window.location.href);
      url.searchParams.set('sort_by', this.value);
      window.location.href = url.toString();
    });
  }

  /* ---------------------------------------------------------------------------
     9. Password form toggle
  --------------------------------------------------------------------------- */
  function initPasswordPage() {
    const toggle = document.querySelector('[data-password-toggle]');
    const formEl = document.querySelector('[data-password-form]');
    if (!toggle || !formEl) return;

    toggle.addEventListener('click', function () {
      formEl.hidden = !formEl.hidden;
    });
  }

  /* ---------------------------------------------------------------------------
     10. Sticky header class
  --------------------------------------------------------------------------- */
  function initStickyHeader() {
    const header = document.querySelector('[data-header]');
    if (!header) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          header.classList.toggle('is-scrolled', !entry.isIntersecting);
        });
      },
      { rootMargin: '0px 0px 0px 0px', threshold: 0 }
    );

    const sentinel = document.createElement('div');
    sentinel.style.height = '1px';
    document.body.insertAdjacentElement('afterbegin', sentinel);
    observer.observe(sentinel);
  }

  /* ---------------------------------------------------------------------------
     Init
  --------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initProductGallery();
    initQuantityControls();
    initAddToCart();
    initCartDrawer();
    initCartRemove();
    initCollectionSort();
    initPasswordPage();
    initStickyHeader();
    updateCartCount();
  });

})();
