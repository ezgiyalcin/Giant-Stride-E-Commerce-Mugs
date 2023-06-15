let productList = [], 
basketList = [];


toastr.options = {
  closeButton: false,
  debug: false,
  newestOnTop: false,
  progressBar: false,
  positionClass: "toast-bottom-right",
  preventDuplicates: false,
  onclick: null,
  showDuration: "300",
  hideDuration: "1000",
  timeOut: "5000",
  extendedTimeOut: "1000",
  showEasing: "swing",
  hideEasing: "linear",
  showMethod: "fadeIn",
  hideMethod: "fadeOut"
};
  
  
const toggleModal = () => {

    const basketModalEl = document.querySelector(".basketModal");
    basketModalEl.classList.toggle("active");
};
//veri çekme
const getProducts = () => {
    fetch("./products.json")
        .then((res) => res.json())
        .then((product) => (
            productList = product
        ));
};
getProducts();


const createProductStars = (starRate) => {
    let starRateHtml = "";
    for (let i = 1; i <= 5; i++) {
        if (Math.round(starRate) >= i) 
            starRateHtml += `<i class="bi bi-star-fill active"></i>`;
        else starRateHtml += `<i class="bi bi-star-fill"></i>`;
    }
    return starRateHtml;
};
const createProductItemsHtml = () => {
    console.log('createProductItemsHtml calıstı')
    const productListEl = document.querySelector(".productList");
    let productListHtml = "";
    console.log(' productList calıstımı ', productList)

    productList.forEach((product, index) => {
        console.log(`indexi ${index} olan elamanın değeri`, product)

        productListHtml += `
        <div class="col-5 ${index % 2 == 0 && "offset-2"} my-3">
                <div class="row productCard">
                    <div class="col-6">
                        <img class="img-fluid shadow"
                            src="${product.imgSource}"
                            alt="Bla bla bla bla">
                    </div>
                    <div class="col-6 d-flex flex-column justify-content-between">
                        <div class="productDetail">
                            <span class="productCat grey">${product.author}</span><br>
                            <span class="productName fs-6 fw-bold">${product.name}</span><br>
                            <span class="productStarRate">
                               ${createProductStars(product.starRate)}
                            </span>
                            <span class="productReview">${product.reviewCount} Reviews</span>
                        </div>
                        <p class="productDescript grey">${product.description}</p>
                        <div>
                            <span class="black fw-bold fs-6">${product.price} TL</span>
                            ${product.oldPrice ? `<span class="grey text-decoration-line-through ms-2">${product.oldPrice} TL</span>`: ""} 
                        </div>
                        <button class="btnBlue" onclick="addProductToBasket(${product.id})">ADD BASKET</button>
                    </div>
                </div>
            </div>`;
    });
    productListEl.innerHTML = productListHtml;
};

const productTypes = {
    ALL: 'ALL',
    Tumbler: 'Tumblers',
    ThermoMug : 'Thermo Mugs',
    CeramicMug : 'Ceramic Mugs',
    FrenchPress : 'French Press',

};
const createProductTypesHtml = () => {
    const filterEl = document.querySelector(".filter");
    let filterHtml = "";
    let filterTypes = ["ALL"];
    productList.forEach(product =>{
        if(filterTypes.findIndex(filter => filter == product.type) == -1) filterTypes.push(product.type);
        
    });
    filterTypes.forEach((type , index) => {
        filterHtml += `<li class="${index ==0 ? "active" : null}" onclick="filterProducts(this)" data-type="${type}" >${productTypes[type] || type }</li>`
    });
    filterEl.innerHTML = filterHtml;
};
const filterProducts = (filterEl) => {
    document.querySelector(".filter .active").classList.remove("active");
    filterEl.classList.add("active");
    let productType = filterEl.dataset.type;
    getProducts();
    if(productType != "ALL") 
        productList = productList.filter((product) => product.type == productType);
    createProductItemsHtml();
    
};

const listBasketItems = () => {
    const basketListEl = document.querySelector(".basketList");
    const basketCountEl = document.querySelector(".basketCount");
    basketCountEl.innerHTML = basketList.length > 0 ? basketList.length : null ;
    const totalPriceEl = document.querySelector(".totalPrice");
    
    let basketListHtml = "";
    let totalPrice = 0; 
    basketList.forEach(item => {
        totalPrice += item.product.price * item.quantity ;
        basketListHtml +=`<li class="basketItem">
        <img src="${item.product.imgSource}"
            width="70" height="100" alt="">
        <div class="basketItemInfo">
            <p class="fw-bold mb-0 basketItemName">${item.product.name}</p>
            <span>${item.product.price}</span> <br>
            <span class="basketItemRemove" onclick="removeItemFromBasket(${item.product.id})">Remove</span>
        </div>
        <div class="basketItemCounter">
            <span class="basketCounterSign" onclick="decreaseItem(${item.product.id})">-</span>
            <span>${item.quantity}</span>
            <span class="basketCounterSign" onclick="increaseItem(${item.product.id})">+</span>
        </div>
    </li>`;
    });
    basketListEl.innerHTML = basketListHtml ? basketListHtml: `<li class="basketItem ">
    <p text-center>No Items to Buy.</p>
  </li>`
    ;
    totalPriceEl.innerHTML = totalPrice > 0 ? "Total: " + totalPrice.toFixed(2) + " TL": null;
};

const addProductToBasket = (productId) =>{
    let findedProduct = productList.find((product) => product.id == productId);
    if (findedProduct) {
        const basketAlreadyIndex = basketList.findIndex(
            (basket) =>basket.product.id == productId);
        if(basketAlreadyIndex == -1){
        let addedItem = {quantity: 1, product: findedProduct};
        basketList.push(addedItem);
        }else{
            if (basketList[basketAlreadyIndex].quantity < basketList[basketAlreadyIndex].product.stock)
            basketList[basketAlreadyIndex].quantity += 1 ;
            else {toastr.error("Sorry, we don't have enough stock.");
            return;
        }
        }
        listBasketItems();
        toastr.success("Product added to basket successfully.");
    console.log(basketList);
    }
};

const removeItemFromBasket = (productId) =>{
    const findedIndex = basketList.findIndex(basket => basket.product.id == productId);
    if(findedIndex !=-1){
        basketList.splice(findedIndex, 1);
    }
    listBasketItems();
    toastr.success("Product added to basket succesfully.")
};

const decreaseItem =(productId) => {
    const findedIndex = basketList.findIndex(
        (basket) => basket.product.id == productId
    );
    if (findedIndex != -1) {
        if (basketList[findedIndex].quantity !=1)
        basketList[findedIndex].quantity -= 1;
        else removeItemFromBasket(productId);
        listBasketItems();
    }
};

const increaseItem =(productId) => {
    const findedIndex = basketList.findIndex(
        (basket) => basket.product.id == productId
    );
    if (findedIndex != -1) {
        if (basketList[findedIndex].quantity < basketList[findedIndex].product.stock)
        basketList[findedIndex].quantity += 1;
        else toastr.error("Sorry, we don't have enough stock.");
        listBasketItems();
    }
};


setTimeout(() => {
    createProductItemsHtml();
    createProductTypesHtml();
}, 1000);//1000ms = 1sn
