const resDiv = document.querySelector("#url-result");
const searchResultDiv = document.querySelector("#search-result");
const spinner = `<div class="spinner mx-auto"></div>`;
const textCollection = ["URLs", "Visits", "Shorten", "Fexy"];
let i = 0;

console.log(
  "%cWelcome to Fexy 😎",
  "font-size: x-large; color: #485fc7; font-weight: bold; font-family: 'Noto Sans Mono', monospace;"
);

async function getTitle(url) {
  try {
    const res = await fetch(`https://textance.herokuapp.com/title/${url}`);
    const data = await res.text();
    console.log(data);
    if (data.includes("Remote server failed") || data.includes("null")) {
      return "NA";
    }
    return data;
  } catch (error) {
    return "NA";
  }
}

async function shortenUrl(longUrl, slug) {
  try {
    resDiv.innerHTML = spinner;
    const res = await fetch("https://fexy.herokuapp.com/api/url/shorten", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        longUrl: longUrl,
        slug: slug,
      }),
    });
    const data = await res.json();
    //console.log(data);
    if (data.msg == "Created") {
      $("#head-msg").text("new short url generated");
      $("#url-submit-btn").removeAttr("disabled");
      $("#url-submit-btn").removeClass("is-loading");
      showResult(data.url);
    } else if (data.msg == "OK") {
      $("#head-msg").text("short url already found");
      $("#url-submit-btn").removeAttr("disabled");
      $("#url-submit-btn").removeClass("is-loading");
      showResult(data.url);
    } else if (data.msg == "Bad Request Invalid url provided.") {
      $("#myChart").css("display", "none");
      $("#url-submit-btn").removeAttr("disabled");
      $("#url-submit-btn").removeClass("is-loading");
      resDiv.innerHTML = `<p class='err-msgs has-text-danger has-text-centered'><span style='font-size:x-large;'>Hmm,</span><br> seems like the URL you provided is not valid. ☹️ <br> please provide a valid URL and try again!</p>`;
    } else if (data.msg == "Bad Request Please provide slug.") {
      $("#myChart").css("display", "none");
      $("#url-submit-btn").removeAttr("disabled");
      $("#url-submit-btn").removeClass("is-loading");
      resDiv.innerHTML = `<p class='err-msgs has-text-danger has-text-centered'><span style='font-size:x-large;'>Hmm, </span> <br> seems like you're creating a new short URL <br> Please provide a slug to associate with it. 😉 </p>`;
    } else {
      $("#myChart").css("display", "none");
      $("#url-submit-btn").removeAttr("disabled");
      $("#url-submit-btn").removeClass("is-loading");
      resDiv.innerHTML = `<p class='err-msgs has-text-danger has-text-centered'>${data.msg}</p>`;
    }
  } catch (error) {
    $("#myChart").css("display", "none");
    $("#url-submit-btn").removeAttr("disabled");
    $("#url-submit-btn").removeClass("is-loading");
    //console.log(error.message);
    //resDiv.innerHTML ="Please try again after some time!";
  }
}

async function searchUrls(slug) {
  try {
    searchResultDiv.innerHTML = spinner;
    const res = await fetch(
      `https://fexy.herokuapp.com/api/url/search?query=${slug}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    const data = await res.json();
    //console.log(data);
    if (data.msg == "OK") {
      //$("#head-msg").text("new short url generated");
      $("#urls-search-btn").removeAttr("disabled");
      $("#urls-search-btn").removeClass("is-loading");
      if (data.urls.length == 0) {
        searchResultDiv.innerHTML = "";
        searchResultDiv.innerHTML = `<p class="has-text-centered has-text-white">No URLs found with the slug <i class='has-text-danger'>'${slug}'</i></p>`;
      } else {
        showSearchResult(data);
      }
    } else {
      $("#urls-search-btn").removeAttr("disabled");
      $("#urls-search-btn").removeClass("is-loading");
      searchResultDiv.innerHTML = `<p class='err-msgs has-text-danger has-text-centered'>${data.msg}</p>`;
    }
  } catch (error) {
    $("#myChart").css("display", "none");
    $("#urls-search-btn").removeAttr("disabled");
    $("#urls-search-btn").removeClass("is-loading");
    console.log("Catch Error", error.message);
    searchResultDiv.innerHTML = `
    <p class='err-msgs has-text-danger has-text-centered'>
    Something went wrong. Please try again after some time!
    </p>
    `;
  }
}

async function getSingleUrl(code) {
  try {
    resDiv.innerHTML = spinner;
    const res = await fetch(
      `https://fexy.herokuapp.com/api/url/search/${code}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    const data = await res.json();
    //console.log(data);
    if (data.msg == "OK") {
      $("#head-msg").text("short url found");
      $("#fill-searched-url").removeAttr("disabled");
      $("#fill-searched-url").removeClass("is-loading");
      showResult(data.url);
    } else {
      $("#myChart").css("display", "none");
      $("#fill-searched-url").removeAttr("disabled");
      $("#fill-searched-url").removeClass("is-loading");
      resDiv.innerHTML = `<p class='err-msgs has-text-danger has-text-centered'>${data.msg}</p>`;
    }
  } catch (error) {
    $("#myChart").css("display", "none");
    $("#fill-searched-url").removeAttr("disabled");
    $("#fill-searched-url").removeClass("is-loading");
    //console.log(error.message);
    //searchResultDiv.innerHTML ="Please try again after some time!";
  }
}

async function getAllUrls() {
  try {
    const res = await fetch("https://fexy.herokuapp.com/api/url");
    const data = await res.json();
    console.log(data);
    return data;
  } catch (error) {
    console.log(error.message);
  }
}

function makeChart(data, slug) {
  const plugin = {
    id: "custom_canvas_background_color",
    beforeDraw: (chart) => {
      const ctx = chart.canvas.getContext("2d");
      ctx.save();
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = "#1b1b1b";
      ctx.fillRect(0, 0, chart.width, chart.height);
      ctx.restore();
    },
  };
  var ctx = document.getElementById("myChart").getContext("2d");
  var myChart = new Chart(ctx, {
    type: "line",
    plugins: [plugin],
    data: {
      labels: data.x,
      datasets: [
        {
          label: `Visits on ${slug}`,
          data: data.y,
          pointBackgroundColor: "hsl(48, 100%, 67%)",
          backgroundColor: "rgba(0, 181, 300, 0.24)",
          borderColor: "hsl(348, 100%, 61%)",
          hoverBorderColor: "hsl(141, 71%, 48%)",
          color: "hsl(217, 71%, 53%)",
          borderWidth: 1,
          fill: true,
        },
      ],
    },
    options: {
      legend: {
        labels: {
          fontColor: "lightgreen",
          fontSize: 10,
        },
      },
      scales: {
        yAxes: [
          {
            ticks: {
              fontColor: "lightgreen",
              fontSize: 10,
              precision: 0,
              beginAtZero: true,
            },
          },
        ],
        xAxes: [
          {
            ticks: {
              fontColor: "lightgreen",
              precision: 0,
              beginAtZero: true,
              fontSize: 10,
            },
          },
        ],
      },
    },
  });
}

function copyToClipboard(value) {
  let x = null;
  const copied = navigator.clipboard.writeText(value);
  if (x) {
    clearTimeout(x);
  }
  if (copied) {
    $("#copy-btn").html(
      '<ion-icon name="checkmark-done-outline" style="color:#48C78E; font-size:20px;"></ion-icon>&nbsp;copied!'
    );
  }
  x = setTimeout(() => {
    $("#copy-btn").html(
      '<ion-icon name="copy-outline" style=" font-size:20px;"></ion-icon>&nbsp;copy'
    );
  }, 1600);
}

function showResult(result) {
  resDiv.innerHTML = "";
  const dbVisits = result.visits;
  let dates = [];
  let visits = {};
  dbVisits.forEach((visit) => {
    let date = new Date(visit.date).toDateString();
    date = date.split(" ");
    date.shift();
    date = date.join(" ");
    console.log(date);
    dates.push(date);
    visits[date] = dates.filter((x) => x === date).length;
  });
  let x = [];
  let y = [];
  Object.entries(visits).forEach(([key, value]) => {
    x.push(key);
    y.push(value);
  });
  if (Object.keys(visits).length > 0) {
    $(".graph-div").html(`
    <p>Visits till date </p>
    `);
    $("#myChart").css("display", "block");
    makeChart({ x, y }, result.slug);
  } else {
    $(".graph-div").html(`<p class="has-text-centered">No visits yet!</p>`);
    $("#myChart").css("display", "none");
  }
  const resCard = document.createElement("div");
  resCard.classList.add("resCard");
  let long = parseInt(result.longUrl.length);
  let short = parseInt(result.shortUrl.length);
  let percent = ((long - short) / short) * 100;
  resCard.innerHTML = `
  <button class='refresh-stats button is-small is-dark my-4' name='${
    result.urlCode
  }'>
    <ion-icon name="reload-outline" style='font-size:larger;'></ion-icon> &nbsp;refresh
    </button>
    <span>code: <span class='resCard-data'>${result.urlCode}</span></span>
    <span>slug: <span class='resCard-data'>${result.slug.includes(' ') ? result.slug + '&nbsp;<span class="tag is-warning" title="Spaces are no more allowed in slugs." style="cursor:pointer;">deprecated</span>' : result.slug}</span></span>
    <span>Short Url<span class='resCard-data'>
    <a href='${result.shortUrl}' target='_blank'>${result.shortUrl.replace(
    "https://",
    ""
  )}
  </a>
  <span id="copy-btn"><ion-icon name="copy-outline" style=" font-size:20px;"></ion-icon>&nbsp;copy</span>
  </span>
  </span>
    <span>Total visits: <span class='resCard-data'>${
      result.visits.length
    }</span>
    </span>
    <span>created: <span class='resCard-data' style='font-size:smaller;'>${new Date(
      result.createdAt
    ).toDateString()}, at ${new Date(
    result.createdAt
  ).toLocaleTimeString()}</span></span>
    <span class='percent mx-auto has-text-centered'>${
      Math.floor(percent) > 0
        ? Math.floor(percent) + "% shorter"
        : -Math.floor(percent) + "% longer"
    } than original</span>
    `;
  resDiv.append(resCard);
  //console.log($(".percent").text());
  if ($(".percent").text().includes("longer")) {
    $(".percent").css("color", "hsl(348, 100%, 61%)");
  }
  if ($(".percent").text().includes("shorter")) {
    $(".percent").css("color", "hsl(141, 53%, 53%)");
  }
  $("#copy-btn").click(() => {
    copyToClipboard(result.shortUrl);
  });
  $(".refresh-stats").click((e) => {
    getSingleUrl(e.target.name);
  });
}

function showSearchResult(result) {
  searchResultDiv.innerHTML = "";
  const resultsFound = result.length;
  const urls = result.urls;
  $("#search-result-count").text(resultsFound + " results found");
  urls.forEach(async (url) => {
    const title = await getTitle(url.longUrl);
    const searchCard = document.createElement("div");
    searchCard.classList.add("searchCard");
    searchCard.innerHTML = `
    <span>code: <span class='searchCard-data'>${
      url.urlCode
    }</span>&nbsp;&#8226;&nbsp;</span>
    <span>slug: <span class='searchCard-data'>${
      url.slug
    }</span>&nbsp;&#8226;&nbsp;</span>
    <span>Total visits: <span class='searchCard-data'>${
      url.visits.length
    }</span>&nbsp;&#8226;&nbsp;</span>
    <span>info: <span class='info searchCard-data'>${
      title ? title : "NA"
    }</span></span>
    <hr>
    <a href='${url.shortUrl}' target='_blank' title='${url.slug}'>open</a>
    <a href='javascript:void(0)' class='fill-searched-url' title='${
      url.slug
    }' name='${url.urlCode}'>view</a>
    `;
    searchResultDiv.append(searchCard);
    viewBtnClickBinder();
  });
}

function viewBtnClickBinder() {
  $(".fill-searched-url").on("click", (e) => {
    const urlCode = e.target.name;
    $(".fill-searched-url").attr("disabled", true);
    $(".fill-searched-url").addClass("is-loading");
    getSingleUrl(urlCode);
    $("#urls-search-modal").removeClass("is-active");
    $("#url-input").val("");
    $("#slug-input").val("");
  });
}

$("#url-form").on("submit", (e) => {
  e.preventDefault();
  const longUrl = $("#url-input").val();
  const slug = $("#slug-input").val();
  shortenUrl(longUrl, slug);
  $("#url-submit-btn").attr("disabled", true);
  $("#url-submit-btn").addClass("is-loading");
});

$("#urls-search-form").on("submit", (e) => {
  e.preventDefault();
  const slug = $("#urls-search-slug").val().trim();
  searchUrls(slug);
  $("#urls-search-btn").attr("disabled", true);
  $("#urls-search-btn").addClass("is-loading");
});

$(".dropdown-trigger").on("click", () => {
  $(".dropdown").toggleClass("is-active");
  $(".dropdown-content").toggleClass("animate");
  if ($("#hamburger-icon").attr("name") == "menu-outline") {
    $("#hamburger-icon").attr("name", "close-outline");
  } else if ($("#hamburger-icon").attr("name") == "close-outline") {
    $("#hamburger-icon").attr("name", "menu-outline");
  }
});

$("#search-urls-modal-btn").on("click", () => {
  $("#urls-search-modal").toggleClass("is-active");
  $("#urls-search-slug").focus();
});
$(".modal-close-usm").on("click", () => {
  $("#urls-search-modal").removeClass("is-active");
});
setInterval(() => {
  $(".animated-text").text(textCollection[i]);
  $(".animated-text").attr("data-text", textCollection[i]);
  if (i >= 3) {
    i = 0;
  } else {
    i++;
  }
}, 4000);

$(".get-started-btn").on("mouseenter", () => {
  $(".get-started-btn span").text("Shorten a URL");
});
$(".get-started-btn").on("mouseleave", () => {
  $(".get-started-btn span").text("Lets go!");
});
