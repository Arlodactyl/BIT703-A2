/* ================================================
   BIT703 - Assessment 2
   Arleia Hebberd - Student Number: 5030710
   
   ================================================ */

/* ================================================
   SHIPPING FORM VALIDATION
   Validates all fields before moving to payment
   ================================================ */
function validateShippingForm() {
    var valid = true;

    /* -- First name check -- */
    var firstName = document.getElementById('firstName');
    var firstNameError = document.getElementById('firstNameError');
    if (firstName.value.trim() === '') {
        firstNameError.textContent = 'First name is required';
        firstName.classList.add('is-invalid');
        valid = false;
    } else if (firstName.value.trim().length < 2) {
        firstNameError.textContent = 'First name must be at least 2 characters';
        firstName.classList.add('is-invalid');
        valid = false;
    } else {
        firstNameError.textContent = '';
        firstName.classList.remove('is-invalid');
        firstName.classList.add('is-valid');
    }

    /* -- Last name check -- */
    var lastName = document.getElementById('lastName');
    var lastNameError = document.getElementById('lastNameError');
    if (lastName.value.trim() === '') {
        lastNameError.textContent = 'Last name is required';
        lastName.classList.add('is-invalid');
        valid = false;
    } else {
        lastNameError.textContent = '';
        lastName.classList.remove('is-invalid');
        lastName.classList.add('is-valid');
    }

    /* -- Address check -- */
    var address = document.getElementById('address');
    var addressError = document.getElementById('addressError');
    if (address.value.trim() === '') {
        addressError.textContent = 'Address is required';
        address.classList.add('is-invalid');
        valid = false;
    } else {
        addressError.textContent = '';
        address.classList.remove('is-invalid');
        address.classList.add('is-valid');
    }

    /* -- Country check -- */
    var country = document.getElementById('country');
    var countryError = document.getElementById('countryError');
    if (country.value === '') {
        countryError.textContent = 'Please select a country';
        country.classList.add('is-invalid');
        valid = false;
    } else {
        countryError.textContent = '';
        country.classList.remove('is-invalid');
        country.classList.add('is-valid');
    }

    /* -- City check -- */
    var city = document.getElementById('city');
    var cityError = document.getElementById('cityError');
    if (city.value.trim() === '') {
        cityError.textContent = 'City is required';
        city.classList.add('is-invalid');
        valid = false;
    } else {
        cityError.textContent = '';
        city.classList.remove('is-invalid');
        city.classList.add('is-valid');
    }

    /* -- NZ postcode check - must be exactly 4 digits -- */
    var postcode = document.getElementById('postcode');
    var postcodeError = document.getElementById('postcodeError');
    var postcodeRegex = /^[0-9]{4}$/;
    if (postcode.value.trim() === '') {
        postcodeError.textContent = 'Postcode is required';
        postcode.classList.add('is-invalid');
        valid = false;
    } else if (!postcodeRegex.test(postcode.value.trim())) {
        postcodeError.textContent = 'Please enter a valid 4 digit NZ postcode';
        postcode.classList.add('is-invalid');
        valid = false;
    } else {
        postcodeError.textContent = '';
        postcode.classList.remove('is-invalid');
        postcode.classList.add('is-valid');
    }

    /* -- Phone number check -- */
    var phone = document.getElementById('phone');
    var phoneError = document.getElementById('phoneError');
    var phoneRegex = /^[0-9+\s()-]{7,15}$/;
    if (phone.value.trim() === '') {
        phoneError.textContent = 'Phone number is required';
        phone.classList.add('is-invalid');
        valid = false;
    } else if (!phoneRegex.test(phone.value.trim())) {
        phoneError.textContent = 'Please enter a valid phone number';
        phone.classList.add('is-invalid');
        valid = false;
    } else {
        phoneError.textContent = '';
        phone.classList.remove('is-invalid');
        phone.classList.add('is-valid');
    }

    /* -- If all valid move to payment page -- */
    if (valid) {
        window.location.href = 'payment.html';
    }
}

/* ================================================
   PAYMENT FORM VALIDATION
   Validates card details before processing payment
   ================================================ */
function validatePaymentForm() {
    var paypalSelected = document.getElementById('paypal');

    /* -- If paypal selected skip card validation -- */
    if (paypalSelected && paypalSelected.checked) {
        alert('Redirecting to PayPal...');
        return;
    }

    var valid = true;

    /* -- Card number check - must be 16 digits -- */
    var cardNumber = document.getElementById('cardNumber');
    var cardNumberError = document.getElementById('cardNumberError');
    var cardNumberClean = cardNumber.value.replace(/\s/g, '');
    var cardNumberRegex = /^[0-9]{16}$/;
    if (cardNumber.value.trim() === '') {
        cardNumberError.textContent = 'Card number is required';
        cardNumber.classList.add('is-invalid');
        valid = false;
    } else if (!cardNumberRegex.test(cardNumberClean)) {
        cardNumberError.textContent = 'Please enter a valid 16 digit card number';
        cardNumber.classList.add('is-invalid');
        valid = false;
    } else {
        cardNumberError.textContent = '';
        cardNumber.classList.remove('is-invalid');
        cardNumber.classList.add('is-valid');
    }

    /* -- Expiry date check - must be MM/YY and not in the past -- */
    var cardExpiry = document.getElementById('cardExpiry');
    var cardExpiryError = document.getElementById('cardExpiryError');
    var expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (cardExpiry.value.trim() === '') {
        cardExpiryError.textContent = 'Expiry date is required';
        cardExpiry.classList.add('is-invalid');
        valid = false;
    } else if (!expiryRegex.test(cardExpiry.value.trim())) {
        cardExpiryError.textContent = 'Please use MM/YY format';
        cardExpiry.classList.add('is-invalid');
        valid = false;
    } else {
        /* -- Check card is not expired -- */
        var parts = cardExpiry.value.split('/');
        var expMonth = parseInt(parts[0]);
        var expYear = parseInt('20' + parts[1]);
        var now = new Date();
        var currentMonth = now.getMonth() + 1;
        var currentYear = now.getFullYear();

        if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
            cardExpiryError.textContent = 'Your card has expired';
            cardExpiry.classList.add('is-invalid');
            valid = false;
        } else {
            cardExpiryError.textContent = '';
            cardExpiry.classList.remove('is-invalid');
            cardExpiry.classList.add('is-valid');
        }
    }

    /* -- CVV check - must be 3 or 4 digits -- */
    var cardCvv = document.getElementById('cardCvv');
    var cardCvvError = document.getElementById('cardCvvError');
    var cvvRegex = /^[0-9]{3,4}$/;
    if (cardCvv.value.trim() === '') {
        cardCvvError.textContent = 'CVV is required';
        cardCvv.classList.add('is-invalid');
        valid = false;
    } else if (!cvvRegex.test(cardCvv.value.trim())) {
        cardCvvError.textContent = 'CVV must be 3 or 4 digits';
        cardCvv.classList.add('is-invalid');
        valid = false;
    } else {
        cardCvvError.textContent = '';
        cardCvv.classList.remove('is-invalid');
        cardCvv.classList.add('is-valid');
    }

    /* -- Cardholder name check -- */
    var cardName = document.getElementById('cardName');
    var cardNameError = document.getElementById('cardNameError');
    if (cardName.value.trim() === '') {
        cardNameError.textContent = 'Cardholder name is required';
        cardName.classList.add('is-invalid');
        valid = false;
    } else if (cardName.value.trim().length < 3) {
        cardNameError.textContent = 'Please enter your full name';
        cardName.classList.add('is-invalid');
        valid = false;
    } else {
        cardNameError.textContent = '';
        cardName.classList.remove('is-invalid');
        cardName.classList.add('is-valid');
    }

    /* -- If all valid show success message -- */
    if (valid) {
        alert('Payment successful! Thank you for your order.');
    }
}

/* ================================================
   REAL TIME VALIDATION
   Validates fields as user types rather than
   waiting until they click submit
   ================================================ */
document.addEventListener('DOMContentLoaded', function() {

    /* -- Format card number with spaces as user types -- */
    var cardNumber = document.getElementById('cardNumber');
    if (cardNumber) {
        cardNumber.addEventListener('input', function() {
            var value = this.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
            var formatted = value.match(/.{1,4}/g);
            this.value = formatted ? formatted.join(' ') : value;
        });
    }

    /* -- Format expiry date with slash as user types -- */
    var cardExpiry = document.getElementById('cardExpiry');
    if (cardExpiry) {
        cardExpiry.addEventListener('input', function() {
            var value = this.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            this.value = value;
        });
    }

    /* -- Only allow numbers in postcode field -- */
    var postcode = document.getElementById('postcode');
    if (postcode) {
        postcode.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    }

    /* -- Only allow numbers in CVV field -- */
    var cardCvv = document.getElementById('cardCvv');
    if (cardCvv) {
        cardCvv.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    }

});