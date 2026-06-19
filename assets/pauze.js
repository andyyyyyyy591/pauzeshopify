/* =============================================================================
   PAUZE — JavaScript global
   ============================================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------------------------
     1. MOBILE NAV DRAWER (slide desde izquierda)
  --------------------------------------------------------------------------- */
  function initMobileNav() {
    const toggle = document.querySelector('[data-pauze-menu-toggle]');
    const drawer = document.querySelector('[data-pauze-mobile-nav]');
    const overlay = document.querySelector('[data-pauze-nav-overlay]');
    const closeBtn = document.querySelector('[data-pauze-nav-close]');
    if (!toggle || !drawer) return;

    function openNav() {
      drawer.classList.add('is-open');
      if (overlay) overlay.classList.add('is-visible');
      toggle.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeNav() {
      drawer.classList.remove('is-open');
      if (overlay) overlay.classList.remove('is-visible');
      toggle.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', function () {
      drawer.classList.contains('is-open') ? closeNav() : openNav();
    });

    if (closeBtn) closeBtn.addEventListener('click', closeNav);
    if (overlay) overlay.addEventListener('click', closeNav);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeNav();
    });

    // Sub-menus móviles
    drawer.querySelectorAll('[data-pauze-submenu-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const sub = this.nextElementSibling;
        if (!sub) return;
        const isOpen = sub.classList.toggle('is-open');
        this.setAttribute('aria-expanded', isOpen.toString());
      });
    });
  }

  /* ---------------------------------------------------------------------------
     2. HEADER STICKY (clase al hacer scroll)
  --------------------------------------------------------------------------- */
  function initStickyHeader() {
    const header = document.querySelector('[data-pauze-header]');
    if (!header) return;

    let lastScroll = 0;
    let ticking = false;

    function updateHeader() {
      const scroll = window.scrollY;
      header.classList.toggle('is-scrolled', scroll > 10);
      header.classList.toggle('is-hidden', scroll > lastScroll && scroll > 200);
      lastScroll = scroll;
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---------------------------------------------------------------------------
     3. CART COUNTER (actualiza desde /cart.js)
  --------------------------------------------------------------------------- */
  function updateCartCount() {
    fetch('/cart.js')
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        document.querySelectorAll('[data-pauze-cart-count]').forEach(function (el) {
          el.textContent = cart.item_count;
          el.classList.toggle('is-empty', cart.item_count === 0);
          el.hidden = cart.item_count === 0;
        });
      })
      .catch(function () {});
  }

  /* ---------------------------------------------------------------------------
     4. CART DRAWER (open/close)
  --------------------------------------------------------------------------- */
  function initCartDrawer() {
    const drawer = document.querySelector('[data-pauze-cart-drawer]');
    const overlay = document.querySelector('[data-pauze-cart-overlay]');

    function openCart() {
      if (!drawer) return false;
      drawer.classList.add('is-open');
      if (overlay) overlay.classList.add('is-visible');
      document.body.style.overflow = 'hidden';
      return true;
    }

    function closeCart() {
      if (!drawer) return;
      drawer.classList.remove('is-open');
      if (overlay) overlay.classList.remove('is-visible');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('[data-pauze-cart-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        if (drawer) {
          e.preventDefault();
          openCart();
        }
      });
    });

    document.querySelectorAll('[data-pauze-cart-close]').forEach(function (btn) {
      btn.addEventListener('click', closeCart);
    });

    if (overlay) overlay.addEventListener('click', closeCart);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeCart();
    });

    window.pauzeOpenCart = openCart;
    window.pauzeCloseCart = closeCart;
  }

  /* ---------------------------------------------------------------------------
     5. ADD TO CART (AJAX)
  --------------------------------------------------------------------------- */
  function initAddToCart() {
    document.addEventListener('submit', function (e) {
      const form = e.target;
      if (!form.hasAttribute('data-pauze-product-form')) return;
      e.preventDefault();

      const btn = form.querySelector('[data-pauze-atc-btn]');
      const btnText = form.querySelector('[data-pauze-atc-text]');
      const originalText = btnText ? btnText.textContent : '';

      if (btn) btn.disabled = true;
      if (btnText) btnText.textContent = 'Agregando...';

      const formData = new FormData(form);
      const data = {
        id: parseInt(formData.get('id'), 10),
        quantity: parseInt(formData.get('quantity') || 1, 10)
      };

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (r) { return r.json(); })
        .then(function (item) {
          if (item.status) {
            alert(item.description || 'No se pudo agregar al carrito.');
          } else {
            updateCartCount();
            if (!window.pauzeOpenCart || !window.pauzeOpenCart()) {
              window.location.href = '/cart';
            }
          }
        })
        .catch(function () {
          alert('Ocurrió un error. Por favor intentá de nuevo.');
        })
        .finally(function () {
          if (btn) btn.disabled = false;
          if (btnText) btnText.textContent = originalText;
        });
    });
  }

  /* ---------------------------------------------------------------------------
     6. PRODUCT GALLERY (thumbnails)
  --------------------------------------------------------------------------- */
  function initProductGallery() {
    const featured = document.getElementById('pauze-featured-img');
    if (!featured) return;

    document.querySelectorAll('[data-pauze-thumb]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        featured.src = this.dataset.pauzeThumb;
        document.querySelectorAll('[data-pauze-thumb]').forEach(function (b) {
          b.classList.remove('is-active');
        });
        this.classList.add('is-active');
      });
    });
  }

  /* ---------------------------------------------------------------------------
     7. QUANTITY CONTROLS
  --------------------------------------------------------------------------- */
  function initQuantityControls() {
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-pauze-qty-minus]')) {
        const input = e.target.closest('.product__quantity-input')
          ? e.target.closest('.product__quantity-input').querySelector('.product__qty-field')
          : e.target.closest('[data-pauze-qty-wrapper]')?.querySelector('[data-pauze-qty-input]');
        if (input) {
          const val = parseInt(input.value, 10);
          if (val > 1) input.value = val - 1;
        }
      }
      if (e.target.closest('[data-pauze-qty-plus]')) {
        const input = e.target.closest('.product__quantity-input')
          ? e.target.closest('.product__quantity-input').querySelector('.product__qty-field')
          : e.target.closest('[data-pauze-qty-wrapper]')?.querySelector('[data-pauze-qty-input]');
        if (input) {
          input.value = parseInt(input.value, 10) + 1;
        }
      }
    });
  }

  /* ---------------------------------------------------------------------------
     8. CART: REMOVE ITEM
  --------------------------------------------------------------------------- */
  function initCartRemove() {
    document.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-remove-item]');
      if (!btn) return;
      const key = btn.dataset.removeItem;
      fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, quantity: 0 })
      }).then(function () { window.location.reload(); });
    });
  }

  /* ---------------------------------------------------------------------------
     9. COLLECTION SORT
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
     10. FAQ ACCORDION
  --------------------------------------------------------------------------- */
  function initFaqAccordion() {
    document.querySelectorAll('[data-pauze-faq]').forEach(function (details) {
      details.addEventListener('toggle', function () {
        if (this.open) {
          document.querySelectorAll('[data-pauze-faq]').forEach(function (other) {
            if (other !== details) other.open = false;
          });
        }
      });
    });
  }

  /* ---------------------------------------------------------------------------
     11. NEWSLETTER POPUP
  --------------------------------------------------------------------------- */
  function initNewsletterPopup() {
    const modal = document.querySelector('[data-pauze-popup]');
    if (!modal) return;

    const shown = sessionStorage.getItem('pauze_popup_shown');
    if (shown) return;

    setTimeout(function () {
      modal.classList.add('is-visible');
      sessionStorage.setItem('pauze_popup_shown', '1');
    }, 8000);

    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.hasAttribute('data-pauze-popup-close')) {
        modal.classList.remove('is-visible');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') modal.classList.remove('is-visible');
    });
  }

  /* ---------------------------------------------------------------------------
     12. STICKY ATC MOBILE
  --------------------------------------------------------------------------- */
  function initStickyAtc() {
    const bar = document.querySelector('[data-pauze-sticky-atc]');
    if (!bar) return;

    window.addEventListener('scroll', function () {
      bar.classList.toggle('is-visible', window.scrollY > 600);
    }, { passive: true });
  }

  /* ---------------------------------------------------------------------------
     13. PDP PACK / VARIANT SELECTOR
  --------------------------------------------------------------------------- */
  function initPdpPackSelector() {
    var packBtns = document.querySelectorAll('[data-pauze-pack]');
    if (!packBtns.length) return;

    var variantInput    = document.querySelector('[data-pauze-variant-id]');
    var priceCurrentEl  = document.querySelector('[data-pauze-price-current]');
    var priceCompareEl  = document.querySelector('[data-pauze-price-compare]');
    var priceSavingsEl  = document.querySelector('[data-pauze-price-savings]');
    var atcText         = document.querySelector('[data-pauze-atc-text]');
    var atcBtn          = document.querySelector('[data-pauze-atc-btn]');
    var stickyPrice     = document.querySelector('[data-pauze-sticky-price]');

    packBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        packBtns.forEach(function (b) {
          b.classList.remove('is-active');
          b.setAttribute('aria-pressed', 'false');
        });
        this.classList.add('is-active');
        this.setAttribute('aria-pressed', 'true');

        var variantId        = this.dataset.pauzePack;
        var priceFormatted   = this.dataset.pauzePriceFormatted;
        var compareFormatted = this.dataset.pauzeCompareFormatted;
        var compareRaw       = parseInt(this.dataset.pauzeCompare || 0, 10);
        var priceRaw         = parseInt(this.dataset.pauzePrice || 0, 10);
        var available        = this.dataset.pauzeAvailable !== 'false';
        var savings          = parseInt(this.dataset.pauzeSavings || 0, 10);

        if (variantInput)   variantInput.value = variantId;

        if (priceCurrentEl) priceCurrentEl.textContent = priceFormatted;

        if (priceCompareEl) {
          if (compareRaw > priceRaw) {
            priceCompareEl.textContent = compareFormatted;
            priceCompareEl.style.display = '';
          } else {
            priceCompareEl.style.display = 'none';
          }
        }

        if (priceSavingsEl) {
          if (savings > 0) {
            priceSavingsEl.textContent = 'AHORRÁS ' + savings + '%';
            priceSavingsEl.style.display = '';
          } else {
            priceSavingsEl.style.display = 'none';
          }
        }

        if (atcBtn)  atcBtn.disabled = !available;
        if (atcText) {
          atcText.textContent = available
            ? 'AGREGAR AL CARRITO \u00a0·\u00a0 ' + priceFormatted
            : 'AGOTADO';
        }
        if (stickyPrice) stickyPrice.textContent = priceFormatted;
      });
    });
  }

  /* ---------------------------------------------------------------------------
     14. PASSWORD PAGE TOGGLE
  --------------------------------------------------------------------------- */
  function initPasswordPage() {
    const toggle = document.querySelector('[data-password-toggle]');
    const form = document.querySelector('[data-password-form]');
    if (!toggle || !form) return;
    toggle.addEventListener('click', function () {
      form.hidden = !form.hidden;
      toggle.hidden = true;
    });
  }

  /* ---------------------------------------------------------------------------
     INIT
  --------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initStickyHeader();
    initCartDrawer();
    initAddToCart();
    initProductGallery();
    initQuantityControls();
    initCartRemove();
    initCollectionSort();
    initFaqAccordion();
    initNewsletterPopup();
    initStickyAtc();
    initPasswordPage();
    initPdpPackSelector();
    updateCartCount();
  });

})();
