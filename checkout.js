document.addEventListener('DOMContentLoaded', function() {
    // Retrieve the selected country from localStorage and set it in the checkout page
    const savedCountry = localStorage.getItem('selectedCountry');
    if (savedCountry) {
        document.querySelector('.country-select').value = savedCountry;
    }
    
    const quantity = parseInt(localStorage.getItem('checkoutQuantity')) || 1;
    
    // Calculate the subtotal as quantity * 10
    const subtotal = quantity * 10;

    // Set the quantity and subtotal in the checkout page
    document.getElementById('checkoutQuantity').textContent = quantity;
    document.getElementById('checkoutSubtotal').textContent = subtotal.toFixed(2);
    
    // Initial calculation of total with default shipping (if any)
    updateTotal();

    // Show/hide credit card form based on selection
    document.querySelectorAll('input[name="paymentMethod"]').forEach(input => {
        input.addEventListener('change', function() {
            const creditCardForm = document.getElementById('creditCardForm');
            if (this.value === 'Credit Card') {
                creditCardForm.style.display = 'block';
            } else {
                creditCardForm.style.display = 'none';
            }
        });
    });

    // Add event listeners for real-time validation
    document.getElementById('cardNumber').addEventListener('input', formatCardNumber);
    document.getElementById('cardName').addEventListener('input', validateCardName);
    document.getElementById('cardExpDate').addEventListener('input', validateExpDate);
    document.getElementById('cardCVV').addEventListener('input', validateCVV);
});

function formatCardNumber(event) {
    const input = event.target;
    let cardNumber = input.value.replace(/\D/g, '').substring(0, 16); // Remove non-digits and limit to 16 digits
    cardNumber = cardNumber.match(/.{1,4}/g)?.join(' ') || cardNumber; // Group digits into sets of 4
    input.value = cardNumber;
}

function validateCardName(event) {
    const input = event.target;
    const value = input.value;
    const valid = /^[a-zA-Z\s]*$/.test(value); // Only allow letters and spaces
    if (!valid) {
        input.setCustomValidity('Please enter a valid name without numbers.');
    } else {
        input.setCustomValidity('');
    }
}

function validateExpDate(event) {
    const input = event.target;
    const value = input.value;
    const valid = /^(0[1-9]|1[0-2])\/\d{2}$/.test(value); // Validate MM/YY format
    if (!valid) {
        input.setCustomValidity('Please enter a valid expiration date in MM/YY format.');
    } else {
        input.setCustomValidity('');
    }
}

function validateCVV(event) {
    const input = event.target;
    const value = input.value;
    const valid = /^\d{3}$/.test(value); // Validate 3-digit CVV
    if (!valid) {
        input.setCustomValidity('Please enter a valid 3-digit CVV.');
    } else {
        input.setCustomValidity('');
    }
}

function updateTotal() {
    const subtotal = parseFloat(document.getElementById('checkoutSubtotal').textContent);
    const shippingCost = parseFloat(document.querySelector('input[name="shippingOption"]:checked')?.value || 0);
    const total = subtotal + shippingCost;

    // Update the shipping cost and total in the checkout summary
    document.getElementById('shippingCost').textContent = shippingCost.toFixed(2);
    document.getElementById('checkoutTotal').textContent = total.toFixed(2);
}

document.getElementById('addressForm').addEventListener('input', function() {
    const formValid = [...document.querySelectorAll('#addressForm input')].every(input => input.value.trim() !== '');
    if (formValid) {
        document.getElementById('shippingOptions').style.display = 'block';
    }
});

document.querySelectorAll('input[name="shippingOption"]').forEach(input => {
    input.addEventListener('change', updateTotal);
});

document.addEventListener('input', function() {
    const personalFormValid = [...document.querySelectorAll('#personalForm input')].every(input => input.value.trim() !== '');
    const addressFormValid = [...document.querySelectorAll('#addressForm input')].every(input => input.value.trim() !== '');
    const shippingSelected = document.querySelector('input[name="shippingOption"]:checked') !== null;
    const paymentMethodSelected = document.querySelector('input[name="paymentMethod"]:checked').value;

    let paymentFormValid = true;
    if (paymentMethodSelected === 'Credit Card') {
        paymentFormValid = validateCreditCardForm();
    }

    if (personalFormValid && addressFormValid && shippingSelected && paymentFormValid) {
        document.getElementById('payButton').disabled = false;
    } else {
        document.getElementById('payButton').disabled = true;
    }
});

function validateCreditCardForm() {
    const cardNumber = document.getElementById('cardNumber').value.trim();
    const cardName = document.getElementById('cardName').value.trim();
    const cardExpDate = document.getElementById('cardExpDate').value.trim();
    const cardCVV = document.getElementById('cardCVV').value.trim();

    // Ensure all validations are correct
    return (
        /^[a-zA-Z\s]+$/.test(cardName) && // Name validation
        /^\d{16}$/.test(cardNumber.replace(/\s/g, '')) && // Card number validation (ignoring spaces)
        /^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpDate) && // Expiration date validation
        /^\d{3}$/.test(cardCVV) // CVV validation
    );
}

function payNow() {
    const paymentMethodSelected = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    if (paymentMethodSelected === 'Credit Card') {
        processCreditCardPayment();
    } else {
        // Existing Mercado Pago logic
        processMercadoPagoPayment();
    }
}

function processCreditCardPayment() {
    if (!validateCreditCardForm()) {
        alert('Please ensure all credit card details are correct.');
        return; // Stop if the form is not valid
    }

    // Show loading bar
    document.getElementById('loadingBar').style.display = 'block';
    document.getElementById('payButton').disabled = true;

    // Simulate payment processing delay
    setTimeout(function() {
        // Hide loading bar and show payment message
        document.getElementById('loadingBar').style.display = 'none';
        document.getElementById('paymentMessage').style.display = 'block';
    }, 3000);
}

function processMercadoPagoPayment() {
    const country = document.querySelector('.country-select').value;
    let accessToken = '';
    let currencyId = '';

    switch (country) {
        case 'ARGENTINA':
            accessToken = 'Bearer APP_USR-750267766834259-112313-2d20e275a549dcdcb689015ce2c747cb-1371769672';
            currencyId = 'ARS';
            break;
        case 'BRAZIL':
            accessToken = 'Bearer APP_USR-4670284813038273-062516-69446ce19360fa25cb43f65f1f72f5ef-1871926001';
            currencyId = 'BRL';
            break;
        case 'MEXICO':
            accessToken = 'Bearer APP_USR-9542731695882-091719-30637ad6cb555f565badaaf904904424-1429380844';
            currencyId = 'MXN';
            break;
        default:
            alert('Invalid country selected.');
            return;
    }

    const total = parseFloat(document.getElementById('checkoutTotal').textContent);

    const requestData = {
        items: [
            {
                title: "SimRacing Cockpit",
                description: "Logitech Trophy",
                picture_url: "",
                quantity: 1, // The total is now the unit price for the single product
                currency_id: currencyId,
                unit_price: total
            }
        ]
    };

    fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
            'Authorization': accessToken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.init_point) {
            window.location.href = data.init_point;
        } else {
            alert('Error: Could not retrieve checkout URL.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error: Could not complete the checkout process.');
    });
}

function fillDummyInfo() {
    document.getElementById('fullname').value = "John Wick";
    document.getElementById('email').value = "john.wick@continental.com";
    document.getElementById('phone').value = "(99) 9999-9999";
    document.getElementById('document').value = Math.floor(Math.random() * 1000000) + 10000000;
    document.getElementById('zip').value = "12345";
    document.getElementById('street').value = "56 Beaver Street";
    document.getElementById('neighborhood').value = "Manhattan Financial District";
    document.getElementById('city').value = "New York";
    document.getElementById('state').value = "NY";
    document.getElementById('country').value = "United States";
    
    // Trigger input event to enable shipping options and PAY button if valid
    document.getElementById('personalForm').dispatchEvent(new Event('input'));
    document.getElementById('addressForm').dispatchEvent(new Event('input'));
}    
