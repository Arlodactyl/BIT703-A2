/* ================================================
   BIT703 - Assessment 2
   Arleia Hebberd - Student Number: 5030710
  
   ================================================ */

/* -- Cart item prices, used to calculate totals -- */
var cartItems = [
    { name: 'Alpine Hiking Pack', price: 299 },
    { name: 'Trail Running Shoes', price: 189 }
];

/* -- Runs when page loads -- */
document.addEventListener('DOMContentLoaded', function() {
    initBackToTop();
    initSearch();
    checkFreeShipping();
    updateCartTotal();
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

/* ================================================
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

    /* -- Calculate tax at 15% GST -- */
    var tax = Math.round(subtotal * 0.15 * 100) / 100;
    var total = subtotal + tax;

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

    /* -- Check if free shipping applies -- */
    checkFreeShipping();
}

/* ================================================
   FREE SHIPPING LOGIC
   Automatically applies free shipping if total
   is over $600 as required by the assessment
   ================================================ */
function checkFreeShipping() {
    var qtyInputs = document.querySelectorAll('.cart-qty');
    var subtotal = 0;

    qtyInputs.forEach(function(input) {
        var qty = parseInt(input.value) || 1;
        var price = parseFloat(input.getAttribute('data-price')) || 0;
        subtotal += qty * price;
    });

    /* -- On shipping page, auto select free shipping if over $600 -- */
    var freeShippingRadio = document.getElementById('freeShipping');
    var freeShippingNotice = document.getElementById('freeShippingNotice');
    var shippingCost = document.getElementById('shippingCost');

    if (subtotal >= 600) {
        /* -- Auto select free shipping -- */
        if (freeShippingRadio) {
            freeShippingRadio.checked = true;
        }
        /* -- Show the notice -- */
        if (freeShippingNotice) {
            freeShippingNotice.classList.remove('d-none');
        }
        /* -- Update shipping cost display -- */
        if (shippingCost) {
            shippingCost.textContent = 'FREE';
        }
    } else {
        if (freeShippingNotice) {
            freeShippingNotice.classList.add('d-none');
        }
    }
}

/* ================================================
   ADD TO CART
   Shows confirmation message when product added
   ================================================ */
function addToCart(productName, price) {
    /* -- Check a model has been selected -- */
    var modelSelect = document.getElementById('modelSelect');
    if (modelSelect && modelSelect.value === '') {
        alert('Please select a model before adding to cart');
        return;
    }

    /* -- Show success message -- */
    var cartMessage = document.getElementById('cartMessage');
    if (cartMessage) {
        cartMessage.textContent = productName + ' has been added to your cart!';
        /* -- Hide message after 3 seconds -- */
        setTimeout(function() {
            cartMessage.textContent = '';
        }, 3000);
    }
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
   SEARCH FUNCTION
   Filters products based on search input
   ================================================ */
function searchProducts() {
    var searchInput = document.getElementById('shopSearch');
    var errorMsg = document.getElementById('searchError');

    if (!searchInput) return;

    var searchTerm = searchInput.value.trim().toLowerCase();

    /* -- Check search is not empty -- */
    if (searchTerm === '') {
        if (errorMsg) errorMsg.textContent = 'Please enter a search term';
        return;
    }

    if (errorMsg) errorMsg.textContent = '';

    /* -- Find all product items and filter them -- */
    var products = document.querySelectorAll('.col-12.col-md-6');
    var found = 0;

    products.forEach(function(product) {
        var name = product.querySelector('.product-name');
        if (name) {
            if (name.textContent.toLowerCase().includes(searchTerm)) {
                product.style.display = 'block';
                found++;
            } else {
                product.style.display = 'none';
            }
        }
    });

    /* -- Show message if nothing found -- */
    if (found === 0 && errorMsg) {
        errorMsg.textContent = 'No products found for "' + searchTerm + '"';
    }
}

/* ================================================
   COUPON CODE
   Applies a discount coupon to the cart
   ================================================ */
function applyCoupon() {
    var couponInput = document.getElementById('couponCode');
    var couponMessage = document.getElementById('couponMessage');

    if (!couponInput) return;

    var code = couponInput.value.trim().toUpperCase();

    /* -- Valid coupon codes -- */
    if (code === 'ADVENTURE10') {
        couponMessage.textContent = 'Coupon applied! 10% discount added';
        couponMessage.className = 'text-success';
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
    var voucherInput = document.getElementById('voucherCode');
    var voucherMessage = document.getElementById('voucherMessage');

    if (!voucherInput) return;

    var code = voucherInput.value.trim().toUpperCase();

    if (code === 'ADVENTURE10') {
        voucherMessage.textContent = 'Voucher applied! 10% discount added';
        voucherMessage.className = 'text-success small';
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
   Removes an item from the cart when clicked
   ================================================ */
function removeCartItem(button) {
    /* -- Find the parent item div and remove it -- */
    var item = button.closest('.d-flex.align-items-center.border');
    if (item) {
        item.remove();
        /* -- Recalculate total after removing -- */
        updateCartTotal();

        /* -- Show empty cart message if no items left -- */
        var remaining = document.querySelectorAll('.cart-qty');
        var emptyMsg = document.getElementById('emptyCartMsg');
        var nextBtn = document.querySelector('a[href="shipping.html"]');

        if (remaining.length === 0) {
            if (emptyMsg) emptyMsg.classList.remove('d-none');
            /* -- Disable Next button so user can't proceed with empty cart -- */
            if (nextBtn) {
                nextBtn.classList.add('disabled');
                nextBtn.setAttribute('aria-disabled', 'true');
            }
        }
    }
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