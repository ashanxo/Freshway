// Function to open the cart modal
function openCartModal() {
    document.getElementById('cartModal').style.display = 'block';
    displayCartModal(); // Refresh the cart display in the modal
}

// Function to close the cart modal
function closeCartModal() {
    document.getElementById('cartModal').style.display = 'none';
}

// Function to display the cart items in the modal
function displayCartModal() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsDiv = document.getElementById('cartItems');
    let total = 0;

    cartItemsDiv.innerHTML = `
        <table id="cartTable" class="cart-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Unit</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${cart.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.unit}</td>
                        <td>
                            <select onchange="updateQuantity('${item.name}', this.value)">
                                ${[...Array(10).keys()].map(i => `
                                    <option value="${i+1}" ${item.quantity === i+1 ? 'selected' : ''}>${i+1}</option>
                                `).join('')}
                            </select>
                        </td>
                        <td>${item.price.toFixed(2)}</td>
                        <td>${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="4">Total</td>
                    <td id="cartTotal">${calculateTotal().toFixed(2)}</td>
                </tr>
            </tfoot>
        </table>
        <button onclick="clearCart('modal')">Clear Cart</button>
        <button onclick="proceedToCheckout()">Go to Checkout</button>
    `;
}

// Function to calculate the total price of the cart
function calculateTotal() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Function to update quantity of items in the cart
function updateQuantity(itemName, newQuantity) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemIndex = cart.findIndex(item => item.name === itemName);

    if (itemIndex !== -1) {
        cart[itemIndex].quantity = parseInt(newQuantity, 10); // Ensure quantity is an integer
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartModal(); // Refresh the cart display in the modal
    }
}

// Function to clear the cart
function clearCart(context) {
    localStorage.removeItem('cart');
    if (context === 'modal') {
        displayCartModal(); // Refresh the cart display in the modal
    } else if (context === 'checkout') {
        displayCart(); // Refresh the cart display on the checkout page
    }
}

// Function to proceed to checkout
function proceedToCheckout() {
    closeCartModal();
    window.location.href = 'checkout.html'; // Redirect to checkout page
}

// Function to add an item to the cart and show the modal
function addToCart(itemName, itemPrice, itemUnit) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemIndex = cart.findIndex(item => item.name === itemName);

    if (itemIndex === -1) {
        cart.push({ name: itemName, price: itemPrice, unit: itemUnit, quantity: 1 });
    } else {
        cart[itemIndex].quantity++;
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    openCartModal(); // Show the cart modal
}

// Function to display the cart items on the checkout page
function displayCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartTable = document.getElementById('checkoutTable').getElementsByTagName('tbody')[0];
    let total = 0;

    cartTable.innerHTML = ''; // Clear existing table rows

    cart.forEach(item => {
        const row = cartTable.insertRow();
        row.insertCell(0).innerText = item.name;
        row.insertCell(1).innerText = item.unit;

        // Quantity cell with dropdown
        const quantityCell = row.insertCell(2);
        quantityCell.innerHTML = `
            <select class="quantity-select" onchange="updateQuantity('${item.name}', this.value)">
                ${[...Array(10).keys()].map(i => `
                    <option value="${i+1}" ${item.quantity === i+1 ? 'selected' : ''}>${i+1}</option>
                `).join('')}
            </select>
        `;

        row.insertCell(3).innerText = item.price.toFixed(2);
        row.insertCell(4).innerText = (item.price * item.quantity).toFixed(2);

        total += item.price * item.quantity;
    });

    document.getElementById('totalPrice').innerText = total.toFixed(2);
}

// Function to save the current bill to favorites
function addToFavoriteBill() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    // Retrieve form data
    const personalDetails = getFormData('personalDetailsForm');
    const deliveryDetails = getFormData('deliveryDetailsForm');
    const paymentDetails = getFormData('paymentForm');

    // Save to favorite bills
    const favoriteBills = JSON.parse(localStorage.getItem('favoriteBills')) || [];
    const newFavorite = { 
        id: new Date().toISOString(), 
        items: cart, 
        personalDetails: personalDetails, 
        deliveryDetails: deliveryDetails, 
        paymentDetails: paymentDetails 
    };

    favoriteBills.push(newFavorite);
    localStorage.setItem('favoriteBills', JSON.stringify(favoriteBills));
    
    // Clear cart after saving to favorites
    localStorage.removeItem('cart');
    
    alert("Bill added to favorites!");
}

// Function to get form data as an object
function getFormData(formId) {
    const form = document.getElementById(formId);
    if (!form) return {}; // Return empty object if form is not found

    const data = new FormData(form);
    const obj = {};
    data.forEach((value, key) => {
        obj[key] = value;
    });
    return obj;
}

// Function to display favorite bills on the favorites page with checkboxes
function displayFavorites() {
    const favoriteBills = JSON.parse(localStorage.getItem('favoriteBills')) || [];
    const favoritesContainer = document.getElementById('favoritesContainer');

    favoritesContainer.innerHTML = ''; // Clear existing cards

    favoriteBills.forEach(bill => {
        const card = document.createElement('div');
        card.className = 'favorite-card';
        card.innerHTML = `
            <h2>Favorite Bill</h2>
            <input type="checkbox" class="favorite-checkbox" data-id="${bill.id}">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Unit</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${bill.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.unit}</td>
                            <td>${item.quantity}</td>
                            <td>${item.price.toFixed(2)}</td>
                            <td>${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        favoritesContainer.appendChild(card);
    });
}

// Function to apply the selected favorite bill to the checkout
function applySelectedFavorites() {
    const favoriteBills = JSON.parse(localStorage.getItem('favoriteBills')) || [];
    const selectedCheckboxes = document.querySelectorAll('.favorite-checkbox:checked');

    if (selectedCheckboxes.length === 0) {
        alert("Please select a favorite bill.");
        return;
    }

    selectedCheckboxes.forEach(checkbox => {
        const selectedBillId = checkbox.getAttribute('data-id');
        const selectedBill = favoriteBills.find(bill => bill.id === selectedBillId);

        if (selectedBill) {
            localStorage.setItem('cart', JSON.stringify(selectedBill.items));
            window.location.href = 'checkout.html'; // Navigate back to checkout page with selected bill applied
        } else {
            alert("Selected favorite bill not found.");
        }
    });
}

// Function to proceed to the favorite bills page
function proceedToFavoriteBills() {
    window.location.href = 'favorites.html'; // Navigate to the favorites page
}

// Event listeners for buttons
document.addEventListener('DOMContentLoaded', () => {
    // Display favorites on favorites page
    if (document.getElementById('favoritesContainer')) {
        displayFavorites(); // Refresh the favorites display on the favorites page
    }
    
    // Setup button events
    const addToFavoritesButton = document.getElementById('addToFavoritesButton');
    if (addToFavoritesButton) {
        addToFavoritesButton.addEventListener('click', addToFavoriteBill);
    }

    const applyFavoritesButton = document.getElementById('applyFavoritesButton');
    if (applyFavoritesButton) {
        applyFavoritesButton.addEventListener('click', applySelectedFavorites);
    }

    const goToFavoritesButton = document.getElementById('goToFavoritesButton');
    if (goToFavoritesButton) {
        goToFavoritesButton.addEventListener('click', proceedToFavoriteBills);
    }

    // Checkout page setup
    if (document.getElementById('checkoutTable')) {
        displayCart(); // Refresh the cart display on the checkout page
    }
});

// Function to proceed to the order summary page
function proceedToOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    localStorage.setItem('orderSummary', JSON.stringify(cart));
    window.location.href = 'order-summary.html'; // Navigate to order summary page
}

// Function to display the order summary on the order-summary page
function displayOrderSummary() {
    const order = JSON.parse(localStorage.getItem('orderSummary')) || [];
    const orderTable = document.getElementById('orderSummaryTable').getElementsByTagName('tbody')[0];
    let total = 0;

    orderTable.innerHTML = ''; // Clear existing table rows

    order.forEach(item => {
        const row = orderTable.insertRow();
        row.insertCell(0).innerText = item.name;
        row.insertCell(1).innerText = item.unit;

        // Quantity cell
        row.insertCell(2).innerText = item.quantity;

        row.insertCell(3).innerText = item.price.toFixed(2);
        row.insertCell(4).innerText = (item.price * item.quantity).toFixed(2);

        total += item.price * item.quantity;
    });

    document.getElementById('orderTotalPrice').innerText = total.toFixed(2);
}

// Event listeners for the order summary page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('orderSummaryTable')) {
        displayOrderSummary(); // Refresh the order summary display
    }
});

// Function to format input fields
function formatCardNumber(event) {
    const input = event.target;
    let value = input.value.replace(/\D/g, '');
    value = value.slice(0, 16); // Limit to 16 digits
    input.value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiryDate(event) {
    const input = event.target;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    input.value = value;
}

function formatCVV(event) {
    const input = event.target;
    let value = input.value.replace(/\D/g, '');
    input.value = value.slice(0, 3);
}

function validateForm() {
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s+/g, '');
    const expiryDate = document.getElementById('expiryDate').value;
    const cvv = document.getElementById('cvv').value;

    const cardNumberPattern = /^\d{16}$/;
    const expiryDatePattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
    const cvvPattern = /^\d{3}$/;

    if (!cardNumberPattern.test(cardNumber)) {
        alert("Card number must be exactly 16 digits.");
        return false;
    }

    if (!expiryDatePattern.test(expiryDate)) {
        alert("Expiry date must be in MM/YY format.");
        return false;
    }

    if (!cvvPattern.test(cvv)) {
        alert("CVV must be exactly 3 digits.");
        return false;
    }

    return true;
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('cardNumber').addEventListener('input', formatCardNumber);
    document.getElementById('expiryDate').addEventListener('input', formatExpiryDate);
    document.getElementById('cvv').addEventListener('input', formatCVV);

    document.getElementById('paymentForm').addEventListener('submit', function(event) {
        if (!validateForm()) {
            event.preventDefault();
        } else {
            // Redirect to the success page
            event.preventDefault();
            window.location.href = 'success.html';
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    // Attach event listener to the payment form
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevent the default form submission
            
            // Perform form validation or other processing here

            // Redirect to confirmation page
            window.location.href = 'confirmation.html';
        });
    }
});





