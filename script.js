// Key: b6b2e94d
// URL: http://www.omdbapi.com/?i=tt3896198&apikey=b6b2e94d

const url = "https://www.omdbapi.com/?";
const key = "b6b2e94d";

const searchInput = document.getElementById("input");
const displaySearchList = document.querySelector(".favContainer");
const randomMoviesContainer = document.querySelector('.randomMoviesContainer');

// Event listener for search input
searchInput?.addEventListener("input", fetchMoviesDisplayList);

// Fetch movies by search term and page
async function fetchMovies(searchTerm, page) {
  const response = await fetch(`${url}apikey=${key}&s=${searchTerm}&page=${page}`);
  const data = await response.json();
  return data;
}

// Get a random subset of an array
function getRandomSubSet(array, num) {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
}

// Fetch random movies
async function fetchRandomMovies(searchTerm, numberOfRandomMovies) {
  let allMovies = [];
  let page = 1;
  let totalResults = 0;
  let totalPages = 1;

  while (page <= totalPages) {
    const data = await fetchMovies(searchTerm, page);
    if (data.Response === 'True') {
      allMovies = allMovies.concat(data.Search);
      totalResults = parseInt(data.totalResults, 10);
      totalPages = Math.ceil(totalResults / 10);
      page++;
    } else {
      break;
    }
  }

  const randomMovies = getRandomSubSet(allMovies, numberOfRandomMovies);
  displayMovies(randomMovies, randomMoviesContainer);
}

// Fetch and display movies based on user input
function fetchMoviesDisplayList() {
  let input = searchInput.value.trim();
  if (input !== "") {
    findMovies(input);
  } else {
    fetchRandomMovies('sci', numberOfRandomMovies); // Fetch random movies if search input is empty
  }
}

// Find movies by search term
async function findMovies(input) {
  const res = await fetch(`${url}s=${input}&apikey=${key}`);
  const resJSON = await res.json();
  if (resJSON) {
    displayMovies(resJSON.Search, displaySearchList);
  }
}

// Display movies in a given container
function displayMovies(movies, container) {
  if (movies && container) {
    container.innerHTML = movies
      .map((movie) => {
        return `
            <div class="movieCard">
              <img src="${movie.Poster}" class="card-img-top" alt="" onerror="this.onerror=null; this.src='./images/movieimage.avif';">
              <h4 class='movieTitle'>${movie.Title}</h4>
              <div class='addToFavAndMore'> 
                <button class="btn btn-success btn-sm addToFavBtn" onclick="addToFavorites('${movie.imdbID}')">Add Favourites</button>
                <a href="movie.html?id=${movie.imdbID}" class="btn btn-sm moreBtn">More</a>
              </div>
            </div>
        `;
      })
      .join("");
  } else if (container) {
    container.innerHTML = `<div class="startExploring">
        <i class="fa-solid fa-clapperboard"></i>
        <span>Discover New Movies Now!</span>
      </div>`;
  }
}

// Fetch movie details by ID
async function fetchMovieDetails(movieId) {
  const res = await fetch(`${url}i=${movieId}&apikey=${key}`);
  const movieDetails = await res.json();
  displayMovieDetails(movieDetails);
}

// Display movie details in the container
function displayMovieDetails(movieDetails) {
  const movieDetailsContainer = document.getElementById("movieContainer");

  if (movieDetailsContainer && movieDetails.Response && movieDetails.Response === "True") {
    movieDetailsContainer.innerHTML = `
      <div id="movie-container">
        <img src="${movieDetails.Poster}" alt="${movieDetails.Title}">
        <div id="movie-details">
          <div id="movie-head">
            <h2>${movieDetails.Title} (${movieDetails.Year})</h2>
          </div> 
          <span class="genre"> ${movieDetails.Genre}</span>
          <p>IMDb RATING⭐ ${movieDetails.imdbRating}/10</p>
          <p class="mov-details"><strong>Creators:</strong> ${movieDetails.Director}</p>
          <p class="mov-details"><strong>Stars:</strong> ${movieDetails.Actors}</p>
          <p class="mov-details"> ${movieDetails.Plot}</p>
        </div>
      </div>
    `;
  } else if (movieDetailsContainer) {
    movieDetailsContainer.innerHTML = "Movie details not found.";
  }
}

// Add movie to favorites
async function addToFavorites(id) {
  const movie = await getMovieDetails(id);
  if (movie) {
    const favouritesList = JSON.parse(localStorage.getItem("favourites")) || [];
    if (!favouritesList.some((m) => m.imdbID == movie.imdbID)) {
      favouritesList.push(movie);
      localStorage.setItem("favourites", JSON.stringify(favouritesList));
      alert(`${movie.Title} is added to your favourites`);
    } else {
      alert(`${movie.Title} is already in your favourites`);
    }
  }
}

// Get movie details by ID
async function getMovieDetails(imdbID) {
  const response = await fetch(`${url}i=${imdbID}&apikey=${key}`);
  const data = await response.json();
  return data.Response === "True" ? data : null;
}

// Load favorite movies
function favoritesMovieLoader() {
  const favouritesList = JSON.parse(localStorage.getItem("favourites")) || [];
  if (favContainer) {
    favContainer.innerHTML = "";

    if (favouritesList.length === 0) {
      const emptyMessage = document.createElement("h2");
      emptyMessage.textContent = "Your favourites list is empty";
      emptyMessage.classList.add("emptyMessage");
      favContainer.appendChild(emptyMessage);
    } else {
      favouritesList.forEach((movie) => {
        const movieCard = createMovieCard(movie);
        favContainer.appendChild(movieCard);
      });
    }
  }
}

// Create movie card for favorite movies
function createMovieCard(movieDetails) {
  const movieCard = document.createElement("div");
  movieCard.innerHTML = `
    <div class="fav-card movieCard">
      <img src="${movieDetails.Poster}" class="card-img-top" alt="Image not found" onerror="this.onerror=null; this.src='./images/movieimage.avif';">
      <h4 class='movieTitle'>${movieDetails.Title}</h4>
      <div class='addToFavAndMore'>
        <a href="movie.html?id=${movieDetails.imdbID}" class="btn btn-sm moreBtn">More</a>
      </div>
      <button class="removeFavourite" onclick="removeFavourite('${movieDetails.imdbID}')">Remove</button>
    </div>
  `;
  return movieCard;
}

// Remove movie from favorites
function removeFavourite(imdbID) {
  const favouritesList = JSON.parse(localStorage.getItem("favourites")) || [];
  const updatedFavouritesList = favouritesList.filter((movie) => movie.imdbID !== imdbID);
  localStorage.setItem("favourites", JSON.stringify(updatedFavouritesList));
  alert("Movie removed from favourites");
  favoritesMovieLoader();
}

window.onload = function () {
  if (document.body.contains(document.querySelector(".fav-container"))) {
    favoritesMovieLoader();
  }
  if (document.body.contains(document.querySelector(".movieContainer"))) {
    singleMovie();
  }
  if (document.body.contains(document.querySelector('.main'))) {
    fetchRandomMovies('sci', 8);
  }
};
