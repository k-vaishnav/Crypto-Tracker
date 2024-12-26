document.addEventListener("DOMContentLoaded", async () => {
  const UrlParams = new URLSearchParams(window.location.search);
  const coinId = UrlParams.get("id");
  const apiKey = "CG-mDVVqLm5xBDjvcVq523LnAmB";
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-cg-demo-api-key": apiKey,
    },
  };

  const coinContainer = document.getElementById("coin-container");
  const shimmerContainer = document.querySelector(".shimmer-container");
  const coinImage = document.getElementById("coin-image");
  const coinName = document.getElementById("coin-name");
  const coinDescription = document.getElementById("coin-description");
  const coinRank = document.getElementById("coin-rank");
  const coinPrice = document.getElementById("coin-price");
  const coinMarketCap = document.getElementById("coin-market-cap");
  const addToFavBtn = document.getElementById("add-to-favorite");
  const showShimmer = () => {
    shimmerContainer.style.display = "flex";
    coinContainer.style.display = "none";
  };
  const hideShimmer = () => {
    shimmerContainer.style.display = "none";
    coinContainer.style.display = "flex";
  };

  async function fetchCoinData() {
    try {
      showShimmer();
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}`,
        options
      );
      const coinData = await response.json();
      displayCoinData(coinData);
    } catch (error) {
      console.error(error);
    } finally {
      hideShimmer();
    }
  }
 
  const displayCoinData = (coin) => {
    coinImage.src = coin.image.large;
    coinImage.alt = coin.name;
    coinName.textContent = coin.name;
    coinDescription.textContent = coin.description.en.split(". ")[0] + ".";
    coinRank.textContent = coin.market_cap_rank;
    coinPrice.textContent = `$${coin.market_data.current_price.usd.toLocaleString()}`;
    coinMarketCap.textContent = `$${coin.market_data.market_cap.usd.toLocaleString()}`;
    // check if the coin is in favorites and update button text
    const favorites = getFavorite();
    console.log(favorites);
   if(favorites.includes(coinId)){
    addToFavBtn.textContent = 'Remove from Favorites';
   }
   else {
    addToFavBtn.textContent = 'Add to Favorites';
}
  };

  function getFavorite() {
    return JSON.parse(localStorage.getItem('favorites')) || [];
  }

  // save favorites to localstorage
  function setFavorite(favorites) {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }

  // Handle favorite icon click
  const handleFavouriteClick = (coinId) => {
    const favorites = toggleFavorite(coinId);
    setFavorite(favorites);
    addToFavBtn.textContent = favorites.includes(coinId)? 'Remove from Favorites' : 'Add to Favorites';
  };
  // Toggle favorites status
  function toggleFavorite(coinId) {
    let favorites = getFavorite();
    if (favorites.includes(coinId)) {
      favorites = favorites.filter((id) => id !== coinId);
    } else {
      favorites.push(coinId);
    }
    return favorites;
  }

  await fetchCoinData();
  const ctx = document.getElementById("coin-chart").getContext("2d");
  let coinChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Price (USD)",
          data: [],
          borderColor: "#229ef1",
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          display: true,
        },
        y: {
          display: true,
          beginAtZero: false,
          ticks: {
            callback: function (value) {
              return `$${value}`;
            },
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              return `$${context.parsed.y}`;
            },
          },
        },
      },
    },
  });

  async function fetchChartData(days) {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`,
        options
      );
      const data = await response.json();
      updateChart(data.prices);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  function updateChart(prices) {
    const labels = prices.map((price) => {
      let date = new Date(price[0]);
      return date.toLocaleDateString();
    });
    const data = prices.map((price) => price[1]);

    coinChart.data.labels = labels;
    coinChart.data.datasets[0].data = data;
    coinChart.update();
  }

  const buttons = document.querySelectorAll(".button-container button");
  buttons.forEach((button) => {
    button.addEventListener("click", (event) => {
      buttons.forEach((btn) => btn.classList.remove("active"));
      event.target.classList.add("active");
      const days =
        event.target.id === "24h" ? 1 : event.target.id === "30d" ? 30 : 90;
      fetchChartData(days);
    });
  });

  // fetch default chart data for 24h
  document.getElementById("24h").click();
  addToFavBtn.addEventListener("click", ()=>{
    handleFavouriteClick(coinId)});
});
