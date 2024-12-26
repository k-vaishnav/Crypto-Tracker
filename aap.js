// API request options
const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    "x-cg-demo-api-key": "CG-mDVVqLm5xBDjvcVq523LnAmB",
  },
};
//  Show shimmer effect during loading
const showShimmer = () => document.querySelector('.shimmer-container').style.display = 'flex';

// Hide shimmer effect after loading
const hideShimmer = () => document.querySelector('.shimmer-container').style.display = 'none';

//state variables
let coins = []; //Array to store coins data
let currentPage = 1; //current page number for pagination
const initializePage = async () => {

  await fetchCoins(currentPage);
  renderCoins(coins, currentPage, 25);
  updatePaginationControls(); //ensure pagination controls are updated on load
};
// Fetch coins from API
const fetchCoins = async (page = 1) => {
  try {
    showShimmer(); // Show loading effect
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap+desc&per_page=25&page=${page}`,
      options
    );
    coins = await response.json();
    hideShimmer(); // Hide loading effect
  } catch (e) {
    console.error(e);
    hideShimmer();
  }
  return coins;
};
// Retrieve Favorites from local storage
function getFavorite() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

// save favorites to localstorage
function setFavorite(favorites) {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

// Handle favorite icon click
const handleFavouriteClick = (coinId) => {
  const favorites = toggleFavorite(coinId);
  setFavorite(favorites);
  renderCoins(coins, currentPage, 25);
};
// Toggle favorites status
function toggleFavorite(coinId) {
  let favorites = getFavorite();
  console.log(favorites);
  if (favorites.includes(coinId)) {
    favorites = favorites.filter((id) => id !== coinId);
  } else {
    favorites.push(coinId);
  }
  return favorites;
}
//  Render a single coin row
const renderCoins = (coins, currentPage, itemsPerpage) => {
  const start = (currentPage - 1) * itemsPerpage + 1;
  const favorites = getFavorite();
  const tbody = document.querySelector("#crypto-table tbody");
  tbody.innerHTML = "";
  coins.forEach((coin, index) => {
    const row = rendercoinsRow(coin, index, start,favorites);
    attatchRowEvents(row, coin.id);
    tbody.appendChild(row);
  });
};
// Create a coin row
const rendercoinsRow = (coin, index, start,favorites) => {
  console.log(favorites.includes(coin.id))
  const isFavorite = favorites.includes(coin.id);
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${start + index}</td>
    <td><img src = "${coin.image}" alt="${
    coin.name
  }" width="25" height="25"/></td>
    <td>${coin.name}</td>
    <td>$${coin.current_price.toLocaleString()}</td>
    <td>$${coin.total_volume.toLocaleString()}</td>
    <td>$${coin.market_cap.toLocaleString()}</td>
   <td>
   <i class="fas fa-star favorite-icon ${
     isFavorite ? "favorite" : ""
   }" data-id =${coin.id}></i>
    `;
  return row;
};

// Attatch events to a coin row

function attatchRowEvents(row, coinId) {
  row.addEventListener("click", (event) => {
    if (!event.target.classList.contains("favorite-icon")) {
      window.location.href = `coin1.html?id=${coinId}`;
    }
  });
  row.querySelector(".favorite-icon").addEventListener("click", (event) => {
    event.stopPropagation();
    handleFavouriteClick(coinId);
  });
}
// Update the state of "Prev" and "Next" buttons
const updatePaginationControls = async () => {
  document.querySelector("#pagination-controls #next-button").disabled =
    coins.length < 25;
  document.querySelector("#pagination-controls #prev-button").disabled =
    currentPage === 1;
};
// Handle "Prev" button click
const handlePrevBtnClick = async () => {
  if (currentPage > 1) currentPage--;
  await fetchCoins(currentPage);
  renderCoins(coins, currentPage, 25);
  updatePaginationControls();
};
// Handle "Next" button click
const handleNextBtnClick = async () => {
  currentPage++;
  await fetchCoins(currentPage);
  renderCoins(coins, currentPage, 25);
  updatePaginationControls();
};
let debounceTimeout ;
const debounce = (func,delay)=>{
  clearTimeout(debounceTimeout);  // Clear existing timeout before setting a new one
  debounceTimeout = setTimeout(func,delay);
}
const fetchSearchResults = async (query) => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${query}`,
      options
    );
    const data = await response.json();
    return data.coins;
  } catch (e) {
    console.error("Error fetching search resluts:", e);
    return [];
  }
};
const displaySearchResults = (results) => {
  const searchDialog = document.querySelector("#search-dialog");
  const resultsList = document.querySelector("#search-results");
  resultsList.innerHTML = "";
  if (results.length !== 0) {
    results.slice(0, 10).forEach((coin) => {
      const li = document.createElement("li");
      li.innerHTML = `<img src = "${coin.thumb}" alt = "${coin.name}" width ="23" height="25"/>
            <span>${coin.name}</span>`;
      li.dataset.id = coin.id; // Set coin ID as data attribute for easy access in event listener
      resultsList.appendChild(li);
    });
  } else {
    resultsList.innerHTML = "<li>No results found</li>";
  }
  // Attach event listeners
  resultsList.querySelectorAll("li").forEach((item) => {
    item.addEventListener("click", (event) => {
      const coinId = event.currentTarget.dataset.id;
      console.log(coinId);
      window.location.href = `coin1.html?id=${coinId}`;
    });
  });
  searchDialog.style.display = "block";
};
const closeSearchDialog = () => {
  const searchDialog = document.querySelector("#search-dialog");
  searchDialog.style.display = "none";
};
// to handle search dialog
const handleSearchInput =  () => {
debounce(async ()=>{
  const searchTerm = document.querySelector("#search-input").value.trim();
  console.log(searchTerm);
  if (searchTerm) {
    console.log(searchTerm);
    const results = await fetchSearchResults(searchTerm);
    displaySearchResults(results);
  } else {
    closeSearchDialog(); // Close dialog if search term is empty
  }
},300)
};
document.addEventListener("DOMContentLoaded", initializePage);
document
  .querySelector("#search-input")
  .addEventListener("input", handleSearchInput);
document
  .querySelector("#search-icon")
  .addEventListener("click", handleSearchInput);
document
  .querySelector(".close-btn")
  .addEventListener("click", closeSearchDialog);

// sorting coins by field
const sortCoinsByField = (field, order) => {
  coins.sort((a, b) =>
    order === "asc" ? a[field] - b[field] : b[field] - a[field]
  );
  renderCoins(coins, currentPage, 25);
};
document.querySelector("#sort-price-asc").addEventListener("click", () => {
  console.log(currentPage);
  sortCoinsByField("current_price", "asc");
});
document
  .querySelector("#sort-price-desc")
  .addEventListener("click", () => sortCoinsByField("current_price", "desc"));
document
  .querySelector("#sort-volume-asc")
  .addEventListener("click", () => sortCoinsByField("total_volume", "asc"));
document
  .querySelector("#sort-volume-desc")
  .addEventListener("click", () => sortCoinsByField("total_volume", "desc"));
document
  .querySelector("#sort-market-asc")
  .addEventListener("click", () => sortCoinsByField("market_cap", "asc"));
document
  .querySelector("#sort-market-desc")
  .addEventListener("click", () => sortCoinsByField("market_cap", "desc"));
