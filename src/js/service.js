import productsData from '../products.json';
import { Notify } from 'notiflix';

const products = [...productsData].map(product => {
    return {
        ...product,

        totalAmount: 0,
        totalPrice: 0,
    };
});
const checkedItems = new Set([]);

const refs = {
    prodList: document.querySelector('[data-gallery-list]'),
    cartList: document.querySelector('[data-cart-list]'),
    totalAmount: document.querySelector('.cart__total-value'),
    openSectionShippingBtn: document.querySelector('[data-open-shipping-btn]'),
    shippingList: document.querySelector('[data-shipping-section]'),
    messageSection: document.querySelector('[data-message-section]'),
    formOrder: document.querySelector('[data-form-order]'),
};

refs.prodList.innerHTML = renderProductsListMarkup(products);

refs.prodList.addEventListener('click', onToCartBtnClick);
function onToCartBtnClick(e) {
    if (e.target.nodeName !== 'BUTTON') {
        return;
    }

    const cartBtn = e.target;
    const productItem = cartBtn.closest('.product').dataset.id;
    const isActiveCartBtn = cartBtn.classList.contains('product__btn--checked');

    if (isActiveCartBtn) {
        cartBtn.classList.remove('product__btn--checked');

        for (const product of products) {
            if (product.id === Number(productItem)) {
                checkedItems.delete(product);
            }
        }
    } else {
        cartBtn.classList.add('product__btn--checked');

        for (const product of products) {
            if (product.id === Number(productItem)) {
                checkedItems.add(product);
                product.totalAmount = 1;
                product.totalPrice = product.price;

                console.log(checkedItems);
            }
        }
    }

    if (checkedItems.size) {
        document.querySelector('.js-cart').classList.remove('visually-hidden');
    } else {
        document.querySelector('.js-cart').classList.add('visually-hidden');
        refs.shippingList.classList.add('visually-hidden');
        refs.openSectionShippingBtn.classList.remove('product__btn--checked');
    }

    refs.cartList.innerHTML = renderCartListMarkup([...checkedItems]);

    calculateTotalAmount();
}

refs.cartList.addEventListener('click', onCartListItemClick);
function onCartListItemClick(e) {
    const btnDelete = e.target.classList.contains('cart__delete');
    const btnIncrement = e.target.classList.contains('cart__increment');
    const btnDecrement = e.target.classList.contains('cart__decrement');

    if (e.target.nodeName !== 'BUTTON') {
        return;
    } else if (btnDelete) {
        const currentItem = e.target.closest('.cart__item').dataset.id;

        for (const prod of checkedItems) {
            if (prod.id === Number(currentItem)) {
                checkedItems.delete(prod);
                prod.totalAmount = 0;
                prod.totalPrice = 0;

                refs.prodList.children[prod.id - 1]
                    .querySelector('.product__btn')
                    .classList.remove('product__btn--checked');
            }
        }
        console.log(checkedItems);

        refs.cartList.innerHTML = renderCartListMarkup([...checkedItems]);

        if (checkedItems.size === 0) {
            document.querySelector('.js-cart').classList.add('visually-hidden');
            refs.shippingList.classList.add('visually-hidden');
            refs.openSectionShippingBtn.classList.remove('product__btn--checked');
        }
    } else if (btnDecrement) {
        const currentItem = e.target.closest('.cart__item').dataset.id;
        for (const prod of checkedItems) {
            if (prod.id === Number(currentItem)) {
                if (prod.totalAmount === 1) {
                    return;
                }
                prod.totalAmount -= 1;
                prod.totalPrice = prod.totalAmount * prod.price;

                e.target.parentNode.children[1].textContent = `${prod.totalAmount}`;
                refs.cartList.innerHTML = renderCartListMarkup([...checkedItems]);
            }
        }
    } else if (btnIncrement) {
        const currentItem = e.target.closest('.cart__item').dataset.id;

        for (const prod of checkedItems) {
            if (prod.id === Number(currentItem)) {
                prod.totalAmount += 1;
                prod.totalPrice = prod.totalAmount * prod.price;

                e.target.parentNode.children[1].textContent = `${prod.totalAmount}`;
                refs.cartList.innerHTML = renderCartListMarkup([...checkedItems]);
            }
        }
    }

    calculateTotalAmount();
}

refs.openSectionShippingBtn.addEventListener('click', onOpenSectionShippingBtn);
function onOpenSectionShippingBtn() {
    refs.shippingList.classList.toggle('visually-hidden');
    const isActiveItemBtn = refs.openSectionShippingBtn.classList.contains('product__btn--checked');

    if (isActiveItemBtn) {
        refs.openSectionShippingBtn.classList.remove('product__btn--checked');
    } else {
        refs.openSectionShippingBtn.classList.add('product__btn--checked');
    }
}

refs.formOrder.addEventListener('submit', onFormOrderSubmit);
function onFormOrderSubmit(e) {
    e.preventDefault();

    const name = e.currentTarget[0].value.trim();
    const email = e.currentTarget[1].value;
    const phone = e.currentTarget[2].value;
    const address = e.currentTarget[3].value;

    if (name === '' || email === '' || phone === '' || address === '') {
        return Notify.failure('The input field is empty. Enter all your details!');
    }

    const totalOrderSum = [...checkedItems].reduce((acc, order) => {
        return acc + order.totalPrice;
    }, 0);

    const dataOrder = {
        name: name.toLowerCase(),
        email: email,
        phone: phone,
        address: address.trim().toLowerCase(),
        orderItems: [...checkedItems],
        totalOrderSum: totalOrderSum,
    };

    Notify.success('Thank you!');
    console.log(dataOrder);

    resetFormAllData(e.currentTarget);
    showMessageSection(name);
}

function renderProductsListMarkup(products) {
    const markup = products
        .map(product => {
            return `
            <li class="product" data-id=${product.id}>
                <img src="${product.url}" alt="${product.name}" class="product__img" />
                <h3 class="product__title">${product.name}</h3>
                <p class="product__desc">${product.description}</p>
                <p class="product__price">Price: ${product.price}</p>
                <button type="button" class="product__btn">To cart</button>
            </li>
      `;
        })
        .join('');
    return markup;
}

function renderCartListMarkup(products) {
    let position = 0;
    const markup = products
        .map(product => {
            return `
        <li class="cart__item" data-id=${product.id}>
            <p class="cart__title"><span class="cart__item-number">${(position += 1)}. </span>${
                product.name
            }</p>
            <div class="cart__actions">
                <div class="cart__calc">
                    <button type="button" class="cart__decrement cart__btn">-</button>
                    <span class="cart__value">${product.totalAmount}</span>
                    <button type="button" class="cart__increment cart__btn">+</button>
                </div>
                <span>${product.totalAmount * product.price} UAH</span>
                <button type="button" class="cart__delete cart__btn">x</button>
            </div>
            
        </li>`;
        })
        .join('');
    return markup;
}

function calculateTotalAmount() {
    const totalValue = [...checkedItems].reduce((acc, item) => {
        return acc + item.price * item.totalAmount;
    }, 0);

    refs.totalAmount.textContent = `${totalValue}`;
}

function resetFormAllData(inputValues) {
    document
        .querySelectorAll('.product__btn--checked')
        .forEach(item => item.classList.remove('product__btn--checked'));

    inputValues.reset();

    checkedItems.clear();

    console.log(checkedItems);

    document.querySelector('[data-cart-section]').classList.add('visually-hidden');
    refs.shippingList.classList.add('visually-hidden');
}

function showMessageSection(name) {
    document.querySelector('[data-message-name]').innerHTML = `${name}`;
    refs.messageSection.classList.remove('visually-hidden');

    setTimeout(() => {
        refs.messageSection.classList.add('visually-hidden');
    }, 5000);
}
