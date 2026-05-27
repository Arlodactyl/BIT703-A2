/* ================================================
   BIT703 - Assessment 2
   Arleia Hebberd - Student Number: 5030710
  
   ================================================ */

/* ================================================
   CART STORAGE
   All cart data lives in localStorage so it
   persists between pages and is only populated
   when the user actually adds something.
   Each item: { name, price, image, model, qty }
   ================================================ */
function getCart() {
    try {
        return JSON.parse(localStorage.getItem('aag_cart')) || [];
    } catch (e) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem('aag_cart', JSON.stringify(cart));
    updateCartBadge();
}

/* -- Full product catalogue used for search suggestions -- */
var PRODUCT_CATALOGUE = [
    { name: 'Alpine Hiking Pack',  price: '$299', image: 'images/product1.jpg', url: 'product.html' },
    { name: 'Trail Running Shoes', price: '$189', image: 'images/product2.jpg', url: 'product.html' },
    { name: 'Waterproof Tent',     price: '$549', image: 'images/product3.jpg', url: 'product.html' },
    { name: 'Sleeping Bag',        price: '$229', image: 'images/product4.jpg', url: 'product.html' },
    { name: 'Climbing Rope',       price: '$149', image: 'images/product5.jpg', url: 'product.html' },
    { name: 'Outdoor Jacket',      price: '$349', image: 'images/product6.jpg', url: 'product.html' }
];

/* -- Runs when page loads -- */
document.addEventListener('DOMContentLoaded', function() {
    initBackToTop();
    initSearch();
    initCartBadge();
    renderCart();
    renderOrderSummary();
    checkFreeShipping();
    updateCartTotal();

    /* -- Shipping page: save choice to localStorage and refresh summary totals -- */
    document.querySelectorAll('input[name="shippingOption"]').forEach(function(radio) {
        radio.addEventListener('change', function() {
            localStorage.setItem('aag_shipping', this.value);
            updateSummaryTotals();
        });
    });
});

/* ================================================
   BACK TO TOP BUTTON
   Shows when user scrolls down 300px
   ================================================ */
function initBackToTop() {
    window.addEventListener('scroll', function() {
        var btn = document.getElementById('backToTop');
        if (btn) {
            if (window.scrollY > 300) {
                btn.style.display = 'block';
            } else {
                btn.style.display = 'none';
            }
        }
    });
}

/* -- Smoothly scrolls back to top when button clicked -- */
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

/* ====================== ==========================
   CART TOTAL CALCULATOR
   Recalculates total when quantities change
   ================================================ */
function updateCartTotal() {
    var qtyInputs = document.querySelectorAll('.cart-qty');

    /* -- Stop if not on cart page -- */
    if (qtyInputs.length === 0) return;

    var subtotal = 0;

    /* -- Loop through each item and add up totals -- */
    qtyInputs.forEach(function(input) {
        var qty = parseInt(input.value);
        var price = parseFloat(input.getAttribute('data-price'));

        /* -- Make sure quantity is at least 1 -- */
        if (qty < 1 || isNaN(qty)) {
            input.value = 1;
            qty = 1;
        }

        subtotal += qty * price;
    });

    /* -- Apply ADVENTURE10 coupon if active (10% off subtotal) -- */
    var coupon   = localStorage.getItem('aag_coupon') || '';
    var discount = (coupon === 'ADVENTURE10') ? Math.round(subtotal * 0.10 * 100) / 100 : 0;
    var discountedSubtotal = subtotal - discount;

    /* -- Show / hide the discount row -- */
    var discountRow = document.getElementById('discountRow');
    var discountEl  = document.getElementById('discount');
    if (discountRow && discountEl) {
        if (discount > 0) {
            discountRow.classList.remove('d-none');
            discountEl.textContent = '-$' + discount.toFixed(2);
        } else {
            discountRow.classList.add('d-none');
        }
    }

    /* -- Calculate tax at 15% GST on the discounted amount -- */
    var tax   = Math.round(discountedSubtotal * 0.15 * 100) / 100;
    var total = discountedSubtotal + tax;

    /* -- Update the summary on screen -- */
    if (document.getElementById('subtotal')) {
        document.getElementById('subtotal').textContent = '$' + subtotal.toFixed(2);
    }
    if (document.getElementById('taxes')) {
        document.getElementById('taxes').textContent = '$' + tax.toFixed(2);
    }
    if (document.getElementById('total')) {
        document.getElementById('total').textContent = '$' + total.toFixed(2);
    }

    /* -- Update free-shipping progress nudge and apply shipping logic -- */
    var freeShippingProgress = document.getElementById('freeShippingProgress');
    if (freeShippingProgress) {
        if (subtotal >= 600) {
            freeShippingProgress.textContent = '✓ Your order qualifies for free shipping!';
            freeShippingProgress.className = 'text-success small';
        } else {
            var remaining = (600 - subtotal).toFixed(2);
            freeShippingProgress.textContent = 'Add $' + remaining + ' more to your order for free shipping!';
            freeShippingProgress.className = 'text-muted small';
        }
    }

    checkFreeShipping();
}

/* ================================================
   FREE SHIPPING LOGIC
   Free shipping auto-applied for orders $600+.
   Express ($20) is the only paid option for
   orders under $600 — free shipping is disabled.
   ================================================ */
function checkFreeShipping() {
    var qtyInputs = document.querySelectorAll('.cart-qty');
    var subtotal = 0;

    if (qtyInputs.length > 0) {
        /* -- On cart.html: read from live DOM inputs -- */
        qtyInputs.forEach(function(input) {
            var qty = parseInt(input.value) || 1;
            var price = parseFloat(input.getAttribute('data-price')) || 0;
            subtotal += qty * price;
        });
    } else {
        /* -- On shipping/payment pages: read from localStorage -- */
        var cart = getCart();
        cart.forEach(function(item) {
            subtotal += (item.price || 0) * (item.qty || 1);
        });
    }

    var freeShippingRadio   = document.getElementById('freeShipping');
    var expressShippingRadio = document.getElementById('expressShipping');
    var freeShippingOption  = document.getElementById('freeShippingOption');
    var freeShippingNotice  = document.getElementById('freeShippingNotice');
    var freeShippingProgress = document.getElementById('freeShippingProgress');

    if (subtotal >= 600) {
        /* -- Unlock and auto-select free shipping -- */
        if (freeShippingRadio) {
            freeShippingRadio.disabled = false;
            freeShippingRadio.checked  = true;
        }
        /* -- Restore free shipping option visually -- */
        if (freeShippingOption) {
            freeShippingOption.style.opacity = '';
            freeShippingOption.title = '';
        }
        /* -- Show the "qualifies" notice -- */
        if (freeShippingNotice) {
            freeShippingNotice.classList.remove('d-none');
        }
        /* -- Hide progress nudge -- */
        if (freeShippingProgress) {
            freeShippingProgress.textContent = '✓ Your order qualifies for free shipping!';
            freeShippingProgress.className = 'text-success small';
        }
        /* -- Persist choice to localStorage so payment page sees it -- */
        localStorage.setItem('aag_shipping', 'free');
    } else {
        /* -- Hide the "qualifies" notice -- */
        if (freeShippingNotice) {
            freeShippingNotice.classList.add('d-none');
        }
        /* -- Disable free shipping and auto-select express ($20) -- */
        if (freeShippingRadio) {
            freeShippingRadio.checked  = false;
            freeShippingRadio.disabled = true;
        }
        if (expressShippingRadio) {
            expressShippingRadio.checked = true;
        }
        /* -- Grey out the free shipping option box -- */
        if (freeShippingOption) {
            freeShippingOption.style.opacity = '0.45';
            freeShippingOption.title = 'Spend $600 or more to unlock free shipping';
        }
        /* -- Show how much more the customer needs to spend -- */
        var remaining = (600 - subtotal).toFixed(2);
        if (freeShippingProgress) {
            freeShippingProgress.textContent = 'Add $' + remaining + ' more to your order for free shipping!';
            freeShippingProgress.className = 'text-muted small';
        }
        /* -- Persist express choice so payment page is correct -- */
        localStorage.setItem('aag_shipping', 'express');
    }

    /* -- Refresh the sidebar totals now that a radio may have changed -- */
    updateSummaryTotals();
}

/* ================================================
   CART BADGE
   Shows the total item count on the Your Cart
   button in the navbar on every page
   ================================================ */
function initCartBadge() {
    /* -- Inject a badge span into the navbar cart button -- */
    var cartBtn = document.querySelector('a.btn[href="cart.html"]');
    if (cartBtn && !document.getElementById('cartBadge')) {
        var badge = document.createElement('span');
        badge.id = 'cartBadge';
        badge.className = 'badge bg-danger rounded-pill ms-1';
        badge.style.cssText = 'font-size:0.7rem; display:none;';
        cartBtn.appendChild(badge);
    }
    updateCartBadge();
}

function updateCartBadge() {
    var badge = document.getElementById('cartBadge');
    if (!badge) return;
    var count = getCart().reduce(function(t, item) { return t + item.qty; }, 0);
    if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'inline';
    } else {
        badge.style.display = 'none';
    }
}

/* ================================================
   ADD TO CART
   Saves the product to localStorage and updates
   the cart badge. Increments qty if same item and
   model is already in the cart.
   ================================================ */
function addToCart(productName, price) {
    /* -- Check a model has been selected (if the page has that selector) -- */
    var modelSelect = document.getElementById('modelSelect');
    var model = '';
    if (modelSelect) {
        if (modelSelect.value === '') {
            alert('Please select a model before adding to cart');
            return;
        }
        model = modelSelect.options[modelSelect.selectedIndex].text;
    }

    /* -- Look up the product image from the catalogue -- */
    var image = 'images/product1.jpg';
    PRODUCT_CATALOGUE.forEach(function(p) {
        if (p.name === productName) image = p.image;
    });

    /* -- Read cart, update or add the item, save back -- */
    var cart = getCart();
    var existing = null;
    cart.forEach(function(item) {
        if (item.name === productName && item.model === model) existing = item;
    });

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ name: productName, price: price, image: image, model: model, qty: 1 });
    }

    saveCart(cart);

    /* -- Show a brief success message on the product page -- */
    var cartMessage = document.getElementById('cartMessage');
    if (cartMessage) {
        cartMessage.textContent = productName + ' has been added to your cart!';
        setTimeout(function() { cartMessage.textContent = ''; }, 3000);
    }
}

/* ================================================
   RENDER CART
   Reads localStorage and builds the cart item rows
   on cart.html. Shows the empty-cart message and
   disables Next if there is nothing in the cart.
   ================================================ */
function renderCart() {
    var container = document.getElementById('cartItems');
    if (!container) return; /* -- Not on cart page, nothing to do -- */

    var cart    = getCart();
    var emptyMsg = document.getElementById('emptyCartMsg');
    var nextBtn  = document.querySelector('a[href="shipping.html"]');

    container.innerHTML = '';

    if (cart.length === 0) {
        if (emptyMsg) emptyMsg.classList.remove('d-none');
        if (nextBtn)  { nextBtn.classList.add('disabled'); nextBtn.setAttribute('aria-disabled', 'true'); }
        updateCartTotal();
        return;
    }

    if (emptyMsg) emptyMsg.classList.add('d-none');
    if (nextBtn)  { nextBtn.classList.remove('disabled'); nextBtn.removeAttribute('aria-disabled'); }

    /* -- Build one row per cart item -- */
    cart.forEach(function(item, index) {
        var row = document.createElement('div');
        row.className = 'd-flex align-items-center border p-3 mb-3';
        row.setAttribute('data-index', index);
        row.innerHTML =
            '<img src="' + item.image + '" style="width:80px; height:80px; object-fit:cover;" class="me-3" alt="' + item.name + '">' +
            '<div class="flex-grow-1">' +
                '<p class="product-name mb-1">' + item.name + '</p>' +
                (item.model ? '<small class="text-muted">' + item.model + '</small>' : '') +
                '<p class="product-price mb-0">$' + item.price + '</p>' +
            '</div>' +
            '<div class="d-flex flex-column align-items-center ms-3">' +
                '<input type="number" class="form-control text-center cart-qty"' +
                ' value="' + item.qty + '" min="1" max="99" style="width:70px;"' +
                ' data-price="' + item.price + '" data-index="' + index + '"' +
                ' onchange="updateQty(this)">' +
            '</div>' +
            '<button class="btn btn-link text-danger ms-3 p-0" onclick="removeCartItem(this)"' +
            ' title="Remove item" style="font-size:1.2rem; line-height:1;">&#x2715;</button>';
        container.appendChild(row);
    });

    updateCartTotal();
}

/* ================================================
   UPDATE QUANTITY
   Called when the qty spinner changes — syncs the
   new value back to localStorage then recalculates.
   ================================================ */
function updateQty(input) {
    var index = parseInt(input.getAttribute('data-index'));
    var qty   = parseInt(input.value);

    if (isNaN(qty) || qty < 1) { qty = 1; input.value = 1; }

    var cart = getCart();
    if (cart[index] !== undefined) {
        cart[index].qty = qty;
        saveCart(cart);
    }
    updateCartTotal();
}

/* ================================================
   ORDER SUMMARY — RENDER ITEMS
   Populates the right-side summary panel on the
   shipping and payment pages from localStorage.
   ================================================ */
function renderOrderSummary() {
    var container = document.getElementById('orderItems');
    if (!container) return; /* -- Not on a checkout summary page -- */

    var cart = getCart();
    container.innerHTML = '';

    cart.forEach(function(item) {
        var row = document.createElement('div');
        row.className = 'd-flex align-items-center mb-3';
        row.innerHTML =
            '<img src="' + item.image + '" style="width:60px;height:60px;object-fit:cover;" class="me-3" alt="' + item.name + '">' +
            '<div>' +
                '<p class="product-name mb-0 small">' + item.name +
                    (item.model ? ' <span class="fw-normal text-muted">(' + item.model + ')</span>' : '') + '</p>' +
                (item.qty > 1 ? '<p class="text-muted mb-0 small">Qty: ' + item.qty + '</p>' : '') +
                '<p class="product-price mb-0 small">$' + (item.price * item.qty).toFixed(2) + '</p>' +
            '</div>';
        container.appendChild(row);
    });

    updateSummaryTotals();
}

/* ================================================
   ORDER SUMMARY — UPDATE TOTALS
   Recalculates subtotal/tax/total for the checkout
   sidebar. Shipping is read from the radio on the
   shipping page or from localStorage on payment.
   ================================================ */
function updateSummaryTotals() {
    var subtotalEl = document.getElementById('summarySubtotal');
    if (!subtotalEl) return; /* -- Not on a checkout summary page -- */

    var cart     = getCart();
    var subtotal = cart.reduce(function(t, item) { return t + item.price * item.qty; }, 0);

    /* -- Apply ADVENTURE10 coupon if active (10% off subtotal) -- */
    var coupon   = localStorage.getItem('aag_coupon') || '';
    var discount = (coupon === 'ADVENTURE10') ? Math.round(subtotal * 0.10 * 100) / 100 : 0;
    var discountedSubtotal = subtotal - discount;

    /* -- Show / hide the discount row -- */
    var discountRow = document.getElementById('summaryDiscountRow');
    var discountEl  = document.getElementById('summaryDiscount');
    if (discountRow && discountEl) {
        if (discount > 0) {
            discountRow.classList.remove('d-none');
            discountEl.textContent = '-$' + discount.toFixed(2);
        } else {
            discountRow.classList.add('d-none');
        }
    }

    /* -- Calculate tax at 15% GST on the discounted amount -- */
    var tax = Math.round(discountedSubtotal * 0.15 * 100) / 100;

    /* -- Determine shipping cost -- */
    var shippingCost  = 0;
    var shippingLabel = 'FREE';
    var expressRadio  = document.getElementById('expressShipping');

    if (expressRadio) {
        /* -- Shipping page: read from the currently selected radio -- */
        if (expressRadio.checked) { shippingCost = 20; shippingLabel = '$20.00'; }
    } else {
        /* -- Payment page: read choice saved when shipping form was submitted -- */
        if (localStorage.getItem('aag_shipping') === 'express') {
            shippingCost = 20; shippingLabel = '$20.00';
        }
    }

    var total = discountedSubtotal + tax + shippingCost;

    subtotalEl.textContent = '$' + subtotal.toFixed(2);

    var taxesEl    = document.getElementById('summaryTaxes');
    var totalEl    = document.getElementById('summaryTotal');
    var shippingEl = document.getElementById('shippingCost');

    if (taxesEl)    taxesEl.textContent    = '$' + tax.toFixed(2);
    if (totalEl)    totalEl.textContent    = '$' + total.toFixed(2);
    if (shippingEl) shippingEl.textContent = shippingLabel;
}

/* ================================================
   NEWSLETTER SUBSCRIPTION
   Validates email before subscribing
   ================================================ */
function subscribeNewsletter() {
    var emailInput = document.getElementById('newsletterEmail');
    var errorMsg = document.getElementById('newsletterError');

    if (!emailInput) return;

    var email = emailInput.value.trim();

    /* -- Check email is not empty -- */
    if (email === '') {
        errorMsg.textContent = 'Please enter your email address';
        return;
    }

    /* -- Check email format using regex -- */
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errorMsg.textContent = 'Please enter a valid email address';
        return;
    }

    /* -- Success -- */
    errorMsg.textContent = '';
    emailInput.value = '';
    alert('Thank you for subscribing to our newsletter!');
}

/* ================================================
   SEARCH INITIALISER
   Wires up the navbar search bar with a live
   dropdown, Enter-key support, and ?q= auto-search.
   Also hooks the shop hero search Enter key.
   ================================================ */
function initSearch() {
    var navSearch  = document.getElementById('searchBar');
    var heroSearch = document.getElementById('shopSearch');

    /* -- Build the dropdown for the navbar search bar -- */
    if (navSearch) {
        /* -- Wrap the input so we can position the dropdown relative to it -- */
        var wrapper = document.createElement('div');
        wrapper.className = 'search-wrapper me-2 ms-3';
        navSearch.parentNode.insertBefore(wrapper, navSearch);
        wrapper.appendChild(navSearch);
        navSearch.classList.remove('me-2', 'ms-3');
        navSearch.style.maxWidth = '';

        /* -- Create and attach the dropdown panel -- */
        var dropdown = document.createElement('div');
        dropdown.id = 'searchDropdown';
        dropdown.className = 'search-dropdown';
        wrapper.appendChild(dropdown);

        /* -- Show suggestions as the user types -- */
        navSearch.addEventListener('input', function() {
            showSearchDropdown(this.value.trim(), dropdown);
        });

        /* -- Arrow keys, Enter, Escape navigation -- */
        navSearch.addEventListener('keydown', function(e) {
            handleSearchKeydown(e, dropdown);
        });

        /* -- Close dropdown when clicking anywhere outside -- */
        document.addEventListener('click', function(e) {
            if (!wrapper.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    }

    /* -- Hero search bar (shop page only) - add Enter key support -- */
    if (heroSearch) {
        heroSearch.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchProducts(this.value.trim());
            }
        });
    }

    /* -- Auto-search when arriving from another page via ?q= -- */
    var urlParams = new URLSearchParams(window.location.search);
    var qParam = urlParams.get('q');
    if (qParam) {
        if (heroSearch) heroSearch.value = qParam;
        if (navSearch)  navSearch.value  = qParam;
        searchProducts(qParam);
    }
}

/* ================================================
   SEARCH DROPDOWN — POPULATE
   Filters the product catalogue and builds the
   dropdown list. Shows "no results" if no match.
   ================================================ */
function showSearchDropdown(term, dropdown) {
    dropdown.innerHTML = '';

    /* -- Hide if nothing typed -- */
    if (term.length === 0) {
        dropdown.style.display = 'none';
        return;
    }

    var lower = term.toLowerCase();
    var matches = PRODUCT_CATALOGUE.filter(function(p) {
        return p.name.toLowerCase().includes(lower);
    });

    if (matches.length === 0) {
        dropdown.innerHTML = '<div class="search-no-results">No products found</div>';
        dropdown.style.display = 'block';
        return;
    }

    /* -- Build one row per matching product -- */
    matches.forEach(function(product) {
        var item = document.createElement('a');
        item.href = product.url;
        item.className = 'search-dropdown-item';
        item.innerHTML =
            '<img src="' + product.image + '" alt="' + product.name + '">' +
            '<div>' +
                '<div class="item-name">' + product.name + '</div>' +
                '<div class="item-price">' + product.price + '</div>' +
            '</div>';
        dropdown.appendChild(item);
    });

    dropdown.style.display = 'block';
}

/* ================================================
   SEARCH DROPDOWN — KEYBOARD NAVIGATION
   Arrow keys move the highlight, Enter navigates
   to the highlighted item or runs a full search,
   Escape closes the dropdown.
   ================================================ */
function handleSearchKeydown(e, dropdown) {
    var items  = dropdown.querySelectorAll('.search-dropdown-item');
    var active = dropdown.querySelector('.search-dropdown-item.active');
    var idx    = -1;

    items.forEach(function(item, i) {
        if (item === active) idx = i;
    });

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (active) active.classList.remove('active');
        idx = (idx + 1) % items.length;
        if (items[idx]) items[idx].classList.add('active');

    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (active) active.classList.remove('active');
        idx = (idx - 1 + items.length) % items.length;
        if (items[idx]) items[idx].classList.add('active');

    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (active) {
            /* -- Navigate directly to the highlighted product -- */
            window.location.href = active.href;
        } else {
            /* -- No item highlighted — run full search / redirect -- */
            searchProducts(e.target.value.trim());
            dropdown.style.display = 'none';
        }

    } else if (e.key === 'Escape') {
        dropdown.style.display = 'none';
    }
}

/* ================================================
   SEARCH FUNCTION
   Filters products based on search input.
   Accepts an optional term; otherwise reads from
   the search inputs on the current page.
   On non-shop pages redirects to shop.html?q=term
   ================================================ */
function searchProducts(term) {
    var heroSearch = document.getElementById('shopSearch');
    var navSearch  = document.getElementById('searchBar');
    var errorMsg   = document.getElementById('searchError');

    /* -- Resolve the search term -- */
    if (term === undefined || term === null) {
        if (heroSearch) {
            term = heroSearch.value.trim();
        } else if (navSearch) {
            term = navSearch.value.trim();
        } else {
            return;
        }
    }

    /* -- If not on the shop page, redirect there with the term -- */
    var productsSection = document.getElementById('products');
    if (!productsSection) {
        if (term !== '') {
            window.location.href = 'shop.html?q=' + encodeURIComponent(term);
        }
        return;
    }

    var searchTerm = term.toLowerCase();
    var products   = document.querySelectorAll('#products .col-12.col-md-6');

    /* -- Empty search: clear error and show all products -- */
    if (searchTerm === '') {
        if (errorMsg) errorMsg.textContent = 'Please enter a search term';
        products.forEach(function(p) { p.style.display = ''; });
        return;
    }

    if (errorMsg) errorMsg.textContent = '';

    /* -- Filter product cards -- */
    var found = 0;
    products.forEach(function(product) {
        var name = product.querySelector('.product-name');
        if (name) {
            if (name.textContent.toLowerCase().includes(searchTerm)) {
                product.style.display = '';
                found++;
            } else {
                product.style.display = 'none';
            }
        }
    });

    /* -- Show message if nothing matched -- */
    if (found === 0 && errorMsg) {
        errorMsg.textContent = 'No products found for "' + term + '"';
    }
}

/* ================================================
   COUPON CODE
   Applies a discount coupon to the cart
   ================================================ */
function applyCoupon() {
    var couponInput   = document.getElementById('couponCode');
    var couponMessage = document.getElementById('couponMessage');

    if (!couponInput) return;

    var code = couponInput.value.trim().toUpperCase();

    if (code === 'ADVENTURE10') {
        /* -- Save coupon and refresh totals so discount shows immediately -- */
        localStorage.setItem('aag_coupon', 'ADVENTURE10');
        couponMessage.textContent = 'Coupon applied! 10% discount added';
        couponMessage.className = 'text-success';
        updateCartTotal();
    } else if (code === '') {
        couponMessage.textContent = 'Please enter a coupon code';
        couponMessage.className = 'text-danger';
    } else {
        couponMessage.textContent = 'Invalid coupon code';
        couponMessage.className = 'text-danger';
    }
}

/* ================================================
   VOUCHER TOGGLE
   Shows and hides the voucher input section
   ================================================ */
function toggleVoucher() {
    var voucherSection = document.getElementById('voucherSection');
    if (voucherSection) {
        voucherSection.classList.toggle('d-none');
    }
}

/* ================================================
   APPLY VOUCHER
   Same as coupon but on shipping and payment pages
   ================================================ */
function applyVoucher() {
    var voucherInput   = document.getElementById('voucherCode');
    var voucherMessage = document.getElementById('voucherMessage');

    if (!voucherInput) return;

    var code = voucherInput.value.trim().toUpperCase();

    if (code === 'ADVENTURE10') {
        /* -- Save voucher and refresh sidebar totals so discount shows immediately -- */
        localStorage.setItem('aag_coupon', 'ADVENTURE10');
        voucherMessage.textContent = 'Voucher applied! 10% discount added';
        voucherMessage.className = 'text-success small';
        updateSummaryTotals();
    } else if (code === '') {
        voucherMessage.textContent = 'Please enter a voucher code';
        voucherMessage.className = 'text-danger small';
    } else {
        voucherMessage.textContent = 'Invalid voucher code';
        voucherMessage.className = 'text-danger small';
    }
}
/* ================================================
   REMOVE CART ITEM
   Removes the item from localStorage then
   re-renders the cart so indices stay correct
   ================================================ */
function removeCartItem(button) {
    var row = button.closest('[data-index]');
    if (!row) return;

    var index = parseInt(row.getAttribute('data-index'));
    var cart  = getCart();

    if (!isNaN(index) && index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        saveCart(cart);
    }

    /* -- Re-render rebuilds rows with correct indices and handles empty state -- */
    renderCart();
}
/* ================================================
   PAYMENT METHOD TOGGLE
   Shows credit card fields or hides them
   depending on which payment method is selected
   ================================================ */
function togglePaymentMethod() {
    var creditCard = document.getElementById('creditCard');
    var cardFields = document.querySelectorAll('#cardNumber, #cardExpiry, #cardCvv, #cardName');

    if (creditCard && creditCard.checked) {
        cardFields.forEach(function(field) {
            field.disabled = false;
        });
    } else {
        cardFields.forEach(function(field) {
            field.disabled = true;
        });
    }
}