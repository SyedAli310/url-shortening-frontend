const resDiv = document.querySelector("#url-result");
const spinner = `<div class="spinner mx-auto"></div>`;
const textCollection = ["URLs", "Visits", "Shorten", "Fexy"];
let i = 0;

console.log(
  "%cFexy",
  "font-size: x-large; color: lightblue; font-weight: bold;"
);

async function shortenUrl(longUrl) {
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
      }),
    });
    const data = await res.json();
    console.log(data);
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
      $("#url-submit-btn").removeAttr("disabled");
      $("#url-submit-btn").removeClass("is-loading");
      resDiv.innerHTML = `<p class='err-msgs has-text-danger has-text-centered'><span style='font-size:x-large;'>Hmm,</span><br> seems the URL you provided is not valid. ☹️ <br> please provide a valid URL and try again!</p>`;
    } else {
      $("#url-submit-btn").removeAttr("disabled");
      $("#url-submit-btn").removeClass("is-loading");
      resDiv.innerHTML = `<p class='err-msgs has-text-danger has-text-centered'>${data.msg}</p>`;
    }
  } catch (error) {
    //console.log(error.message);
    //resDiv.innerHTML ="Please try again after some time!";
  }
}

function makeChart(data) {
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
          label: "Visits on the short URL.",
          data: data.y,
          pointBackgroundColor: "crimson",
          // backgroundColor: 'rgba(0, 181, 204, .5)',
          borderColor: "rgba(0, 181, 300, 1)",
          hoverBorderColor: "green",
          color: "red",
          borderWidth: 2,
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

function showResult(result) {
  resDiv.innerHTML = "";
  const dbVisits = result.visits;
  let dates = [];
  let visits = {};
  dbVisits.forEach((visit) => {
    const date = new Date(visit.date).toDateString();
    dates.push(date);
    visits[date] = dates.filter((x) => x === date).length;
  });
  let x = [];
  let y = [];
  Object.entries(visits).forEach(([key, value]) => {
    x.push(key);
    y.push(value);
  });
  if(Object.keys(visits).length > 0){
    $('.graph-div').html(`<p class="has-text-centered">Visits till date</p>`);
    $('#myChart').css('display','block');
    makeChart({ x, y })
  }else{
    $('.graph-div').html(`<p class="has-text-centered">No visits yet!</p>`);
    $('#myChart').css('display','none');
  }
  const resCard = document.createElement("div");
  resCard.classList.add("resCard");
  let long = parseInt(result.longUrl.length);
  let short = parseInt(result.shortUrl.length);
  let percent = ((long - short) / short) * 100;
  resCard.innerHTML = `
    <span>code: <span class='resCard-data'>${result.urlCode}</span></span>
    <span>Short Url: <span class='resCard-data'><a href='${
      result.shortUrl
    }' target='_blank'>${result.shortUrl.replace(
    "https://",
    ""
  )}</a></span></span>
    <span>Total visits: <span class='resCard-data'>${
      result.visits.length
    }</span>
    </span>
    <span class='has-text-warning'>${
      Math.floor(percent) > 0
        ? Math.floor(percent) + "% shorter"
        : -Math.floor(percent) + "% longer"
    } than original</span>
    `;
  resDiv.append(resCard);
}

$("#url-form").on("submit", (e) => {
  e.preventDefault();
  const longUrl = $("#url-input").val();
  shortenUrl(longUrl);
  $("#url-submit-btn").attr("disabled", true);
  $("#url-submit-btn").addClass("is-loading");
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

$("#scroll-btn").on("click", (e) => {
  $([document.documentElement, document.body]).animate(
    {
      scrollTop: $("#shorten-main").offset().top - 100 + "%",
    },
    1000
  );
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
