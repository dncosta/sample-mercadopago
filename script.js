function openCart() {
    document.getElementById("cartSidebar").classList.add("open");
}

function closeCart() {
    document.getElementById("cartSidebar").classList.remove("open");
}

function addToCart(productName, productPrice) {
    document.getElementById("productName").textContent = productName;
    document.getElementById("pricePerItem").textContent = `$${productPrice.toFixed(2)}`;
    document.getElementById("subtotal").textContent = `$${productPrice.toFixed(2)}`;
    document.getElementById("quantity").value = 1;
    saveCartToStorage(1, productPrice); // Save initial data to localStorage
    openCart();
}

function updateTotalPrice() {
    const quantity = parseInt(document.getElementById("quantity").value);
    const pricePerItem = 10; // Updated price for the product
    const subtotal = quantity * pricePerItem;

    document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`;
    saveCartToStorage(quantity, subtotal); // Update localStorage with new values
}

function saveCartToStorage(quantity, subtotal) {
    localStorage.setItem('checkoutQuantity', quantity);
    localStorage.setItem('checkoutSubtotal', subtotal.toFixed(2));
}

function calculateShippingVIP() {
    var zipcode = document.getElementById("zipcode").value;
    var shippingCostElement = document.getElementById("shippingCostVIP");
    if (zipcode.trim() !== "") {
        shippingCostElement.innerHTML = `
            <p>7 days - $10.00</p>
            <p>3 days - $15.00</p>
            <p>1 day - $20.00</p>
        `;
    } else {
        shippingCostElement.textContent = "";
    }
}

function calculateShippingSidebar() {
    var zipcode = document.getElementById("sidebarZipcode").value;
    var shippingCostElement = document.getElementById("shippingCostSidebar");
    if (zipcode.trim() !== "") {
        shippingCostElement.innerHTML = `
            <p>7 days - $10.00</p>
            <p>3 days - $15.00</p>
            <p>1 day - $20.00</p>
        `;
    } else {
        shippingCostElement.textContent = "";
    }
}

function sendCheckoutRequest(quantity, unitPrice, source) {
    const url = 'https://api.mercadopago.com/checkout/preferences';

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

    const requestData = {
        items: [
            {
                title: "SimRacing Cockpit",
                description: "Logitech Trophy",
                picture_url: "",
                quantity: quantity,
                currency_id: currencyId,
                unit_price: unitPrice
            }
        ],
        shipments: {
            mode: "me2",
            local_pickup: false,
            dimensions: "20x20x20,20"
        }
    };

    fetch(url, {
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

function buyNow() {
    sendCheckoutRequest(1, 10, 'VIP');
}

function payWithCheckoutExpress() {
    const quantity = parseInt(document.getElementById("quantity").value);
    const subtotal = parseFloat(document.getElementById("subtotal").textContent.replace('$', ''));
    sendCheckoutRequest(quantity, subtotal / quantity, 'Cart');
}

function redirectToCheckout() {
    // Store the current cart state in localStorage before navigating to the checkout page
    const quantity = document.getElementById("quantity").value;
    const subtotal = parseFloat(document.getElementById("subtotal").textContent.replace('$', ''));

    localStorage.setItem('checkoutQuantity', quantity);
    localStorage.setItem('checkoutSubtotal', subtotal.toFixed(2));

    // Redirect to the checkout page
    window.location.href = "checkout.html";
}

// Ensure that the "CONTINUE TO PAYMENT" button in the sidebar uses this function
document.querySelector('.continue-to-payment').onclick = redirectToCheckout;