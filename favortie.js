const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    "x-cg-demo-api-key": "CG-mDVVqLm5xBDjvcVq523LnAmB",
  },
};
let coins = [];
let currentPage = 1;

// Function to show shimmer
const showShimmer = () =>{
  const shimmerContainer = document.querySelector(".shimmer-container");
  shimmerContainer.style.display = "flex";
}
// Function to hide shimmer
const hideShimmer =()=>{
  const shimmerContainer = document.querySelector(".shimmer-container");
  shimmerContainer.style.display = "none";
}
function getFavorite() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

async function fetchFavoriteCoins(ids) {
  try {
    showShimmer();
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids.join(
        ","
      )}`,
      options
    );
    coins = await response.json();
    hideShimmer();
    return coins;
    
  } catch (err) {
    console.error(err);
    hideShimmer()
  }
}

function renderCoins(coins) {
  const tbody = document.querySelector("#coin-table");
  const noFavoritesMessage = document.querySelector(".no-favorite");
  tbody.innerHTML = "";
  if (coins.length === 0) {
    noFavoritesMessage.style.display = "block";
    return;
  } else {
    noFavoritesMessage.style.display = "none";
  }
  coins.forEach((coin, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
                <td>${index + 1}</td>
                <td><img src="${coin.image}" alt="${
      coin.name
    }" width="24" height="24" /></td>
                <td>${coin.name}</td>
                <td>${coin.current_price.toFixed(2)}</td>
                <td>${coin.total_volume.toLocaleString()}</td>
                <td>${coin.market_cap.toLocaleString()}</td>
                `;
    row.addEventListener("click", () => {
      window.location.href = `coin1.html?id=${coin.id}`;
    });
    tbody.appendChild(row);
  });
}

const searchQuery = (query,coins)=>{
  const filteredCoins = coins.filter(coin =>{
    return coin.name.toLowerCase().includes(query.toLowerCase()) 
  });
  if(filteredCoins.length === 0){
    document.querySelector(".no-favorite").textContent = "No matching coins found. Explore and add them to your favorites."
    document.querySelector(".no-favorite").style.display = "block";
  }
  else {
    document.querySelector(".no-favorite").style.display = "none";
  }
  renderCoins(filteredCoins);
}
document.addEventListener("DOMContentLoaded", async () => {
  const favorite = getFavorite();
  console.log("favorite:", favorite);
  if (favorite.length === 0) {
    renderCoins([]);
  } else {
    await fetchFavoriteCoins(favorite);
    renderCoins(coins);
  }
  await fetchFavoriteCoins(favorite);

  const searchDialog = document.querySelector("#search-input");
  searchDialog.addEventListener("input", ()=>{
    const query = searchDialog .value;
    searchQuery(query,coins)
  })
});

// Search functionality
function sortByprice(order) {
  if (order === "asc") {
    coins.sort((a, b) => a.current_price - b.current_price);
  }
  if (order === "desc") {
    coins.sort((a, b) => b.current_price - a.current_price);
  }
  renderCoins(coins, currentPage, 25);
}
function sortByVolume(order) {
    if (order === "asc") {
      coins.sort((a, b) => a.total_volume - b.total_volume);
    }
    if (order === "desc") {
      coins.sort((a, b) => b.total_volume - a.total_volume);
    }
    renderCoins(coins, currentPage, 25);
  }

  function sortByMarketcap(order) {
    if (order === "asc") {
      coins.sort((a, b) => a.market_cap - b.market_cap);
    }
    if (order === "desc") {
      coins.sort((a, b) => b.market_cap - a.market_cap);
    }
    renderCoins(coins, currentPage, 25);
  }
document
  .getElementById("sort-price-asc")
  .addEventListener("click", () => sortByprice("asc"));
document
  .getElementById("sort-price-desc")
  .addEventListener("click", () => sortByprice("desc"));
  document
  .getElementById("sort-volume-asc")
  .addEventListener("click", () => sortByVolume("asc"));
document
  .getElementById("sort-volume-desc")
  .addEventListener("click", () => sortByVolume("desc"));
  document
  .getElementById("sort-market-asc")
  .addEventListener("click", () => sortByMarketcap("asc"));
document
  .getElementById("sort-market-desc")
  .addEventListener("click", () => sortByMarketcap("desc"));