// create workout class -common to all activities
class Workout {
  // add id,isMarked
  date = new Date();
  id = (Date.now() + "").slice(-10);
  isMarked = false;
  months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  // set attribute coords,distance,duration,note,customdate
  constructor(coords, distance, duration, note, customDate) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
    this.note = note;
    this.customDate = customDate;
  }
  // create a method for making description and set description attribute
  _setDescription() {
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      this.customDate.split("-")[2]
    } ${this.months[this.customDate.split("-")[1] - 1]} 
    `;
  }
}

// create a class for Running
class Running extends Workout {
  // define type of activity
  type = "running";

  constructor(coords, distance, duration, note, customDate) {
    // import and set arguments from parent class
    super(coords, distance, duration, note, customDate);
    // create a method for calculating pace and set pace attribute
    this.calcPace();
    // set description
    this._setDescription();
  }
  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

// create a class for cycling
class Cycling extends Workout {
  // define type of activity
  type = "cycling";
  constructor(coords, distance, duration, note, customDate) {
    // import and set arguments from parent class
    super(coords, distance, duration, note, customDate);
    // create a method for calculating speed and set speed attribute
    this.calcCycleSpeed();
    // set description
    this._setDescription();
  }
  calcCycleSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}
// create a class for swimming
class Swimming extends Workout {
  // define type of activity
  type = "swimming";
  constructor(coords, distance, duration, note, customDate) {
    // import and set arguments from parent class
    super(coords, distance, duration, note, customDate);
    // create a method for calculating speed and set speed attribute
    this.calcSwimSpeed();
    this._setDescription();
  }
  calcSwimSpeed() {
    this.speed = (this.distance * 1000) / (this.duration * 60);
    return this.speed;
  }
}

////////////////   APPLICATION ARCHITECTURE   /////////////////////

const htmlElement = document.documentElement;
const mainContainer = document.querySelector(".main-container");

// navigation elements
const logo = document.querySelector(".logo-primary");
const sortBtn = document.querySelector(".nav-sort");
const showAllWorkoutBtn = document.querySelector(".nav-allworkout");
const resetBtn = document.querySelector(".nav-deleteall");
const allMarkedBtn = document.querySelector(".nav-marked");
const personInfoBtn = document.querySelector(".nav-person");
const calorieGraphBtn = document.querySelector(".nav-graph");
const navigationContainer = document.querySelector(".nav-container");
const mobileNavigationList = document.querySelector(".nav-list");
const mobileNavigationClose = document.querySelector(".nav-close");

// message box elements
const messageEl = document.querySelector(".message");
const messageClose = document.querySelector(".message-close");
const messageContent = document.querySelector(".message-content");

const personalInfo = document.querySelector(".personal-info");
const personalInfoForm = document.querySelector(".personal-info-form");
const inputAge = document.querySelector(".personal-input-age");
const inputGender = document.querySelector(".personal-input-gender");
const inputWeight = document.querySelector(".personal-input-weight");

const sortInfo = document.querySelector(".sort-info");
const sortInfoForm = document.querySelector(".sort-form");
const inputSortType = document.querySelector(".sort-type-input");
const inputSortOrder = document.querySelector(".sort-order-input");

const graphChart = document.querySelector(".graph-chart");
const calorieGraph = document.querySelector(".calorie-graph");

const allParents = document.querySelectorAll(".parent");
const messageBox = document.querySelector(".message-box");
const allMessageClose = document.querySelectorAll(".message-close");

// sidebar elements
const mainSidebarContainer = document.querySelector(".sidebar-main-container");
const form = document.querySelector(".form");
const inputType = document.querySelector(".form-input--activity");
const inputDistance = document.querySelector(".form-input--distance");
const inputDuration = document.querySelector(".form-input--duration");
const inputCustomDate = document.querySelector(".form-input--date");
const inputNote = document.querySelector(".form-input--note");
const bikeGif = document.querySelector(".bike-gif");

// map elements
const eyeopenBtn = document.querySelector(".eye-open");
const eyecloseBtn = document.querySelector(".eye-close");

// create app class
class App {
  // private attributes
  #accessLocation;
  #age;
  #gender;
  #weight;
  #map;
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = [];
  #markers = [];
  #markerCoordinates = [];
  #marked = [];
  #personalInfoList = [];
  #caloriesBurnt = {};
  #workoutIdAndData = [];

  constructor() {
    // find a way to check if map is loaded or not
    this._isMapLoaded;
    // add eventlistners to close icons for parent messages
    allMessageClose.forEach((icon) =>
      icon.addEventListener("click", this._closeMessage)
    );
    // get current positon
    this._getPosition();
    // retrieve info from local storage
    this._getLocalStorage();
    // show bike if no workout present
    this._showBike();

    personInfoBtn.addEventListener("click", this._showPersonalForm.bind(this));
    personalInfoForm.addEventListener(
      "submit",
      this._getAndSetPersonalInfo.bind(this)
    );
    // add event listener to reset btn
    resetBtn.addEventListener("click", () => {
      // this code is necessary to make screen scrollable once user presses deleteall btn
      document.documentElement.style.overflowY = "scroll";
      this._resetAll();
      // remove personal infor from local storage
      localStorage.removeItem("personalinfo");
      location.reload();
    });
    // add event listener to sort btn
    sortBtn.addEventListener("click", this._showSortForm.bind(this));
    // listen for sortinfoform submit
    sortInfoForm.addEventListener(
      "submit",
      this._displaySortedWorkout.bind(this)
    );
    // add event listener to allmarked btn
    allMarkedBtn.addEventListener("click", this._showMarked.bind(this));
    // listen for workout form submition
    form.addEventListener("submit", this._newWorkout.bind(this));
    // addeventlistener to workout and move to workout popup on click
    mainSidebarContainer.addEventListener(
      "click",
      this._moveToPopup.bind(this)
    );
    // addeventlistener to graph btn
    calorieGraphBtn.addEventListener("click", this._showGraph.bind(this));
    showAllWorkoutBtn.addEventListener("click", this._fitMarkers.bind(this));
    logo.addEventListener("click", function () {
      location.reload();
    });
    // addeventlistener to mobile navigation buttons
    mobileNavigationList.addEventListener("click", (e) => {
      navigationContainer.classList.toggle("nav-open");
      // this code is necessary to make screen scrollable once user presses deleteall btn
      document.documentElement.style.overflowY = "hidden";
    });
    mobileNavigationClose.addEventListener("click", (e) => {
      navigationContainer.classList.toggle("nav-open");
      // this code is necessary to make screen scrollable once user presses deleteall btn
      document.documentElement.style.overflowY = "scroll";
    });
    eyecloseBtn.addEventListener("click", (e) => {
      this._openPopup(e);
    });
    eyeopenBtn.addEventListener("click", (e) => {
      this._closePopup(e);
    });
  }

  // close popup displayed on the map
  _closePopup(e) {
    e.stopPropagation();
    // hide eyeopen btn and show eyeclose
    eyecloseBtn.classList.remove("hide");
    eyeopenBtn.classList.add("hide");
    let currentMarkers = this.#markers;
    currentMarkers.forEach((marker) => {
      marker.closePopup();
    });
  }
  // open popup again
  _openPopup(e) {
    e.stopPropagation();
    // hide eyeclose btn and show eyeopen
    eyeopenBtn.classList.remove("hide");
    eyecloseBtn.classList.add("hide");
    let currentMarkers = this.#markers;
    false;
    currentMarkers.forEach((marker) => {
      marker.openPopup();
    });
  }
  // create a function to get position
  _getPosition() {
    if (navigator.geolocation) {
      // load map if geolocation present else display message
      navigator.geolocation.getCurrentPosition(this._loadmap.bind(this), () => {
        // set accesslocation false
        this.#accessLocation = false;
        this._displayMessage(
          "Please ensure that you have allowed location access in your browser."
        );
      });
    } else {
      this._displayMessage("⚠️ geolocation not supported by this browser.");
    }
  }
  _loadmap(position) {
    // set access location true
    this.#accessLocation = true;
    // check if there is personal info
    this._isTherePersonalInfo();

    // get latitude and longitude and setview
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];
    this.#map = L.map("map").setView(coords, this.#mapZoomLevel);

    L.tileLayer("https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.#map);
    //show form on click
    this.#map.on("click", this._showForm.bind(this));
    this.#workouts.forEach((work) => {
      this._renderWorkoutMarker(work);
    });
    this._isMapLoaded = true;
  }
  _showForm(mapE) {
    // scroll to form for smaller screen
    form.scrollIntoView({ behavior: "smooth" });
    // if personal data present display form and remove bikegif ,if not show personal form
    if (this.#age && this.#gender && this.#weight) {
      this.#mapEvent = mapE;
      form.classList.remove("hidden");
      this._hideBike();
      inputType.focus();
    } else this._showPersonalForm();
  }
  _hideForm() {
    // clear form input values
    inputDistance.value =
      inputDuration.value =
      inputCustomDate.value =
      inputNote.value =
        "";
    // hide form
    form.style.display = "none";
    form.classList.add("hidden");
    // remove display none
    setTimeout(() => (form.style.display = "grid"), 1000);
  }
  _showPersonalForm() {
    // this code is necessary to make screen scrollable once user presses deleteall btn
    document.documentElement.style.overflowY = "scroll";
    // remove hide-menu-overflow from html
    htmlElement.classList.toggle("hide-menu-overflow");
    // check if nav-open present on nav-container
    let currentNavigationContainer = document.querySelector(".nav-container");
    if (currentNavigationContainer.classList.contains("nav-open"))
      navigationContainer.classList.remove("nav-open");

    // display personal form
    personalInfo.dataset.active = "true";
    personalInfo.classList.remove("hide");
    messageBox.classList.remove("hide");
    // add focus state on gender
    inputGender.focus();
  }
  _getAndSetPersonalInfo() {
    // acquire personal info from personal form
    let personAge = inputAge.value;
    let personGender = inputGender.value;
    let personWeight = inputWeight.value;
    // set personal info attribute
    this.#gender = personGender;
    this.#age = personAge;
    this.#weight = personWeight;
    this.#personalInfoList = [this.#gender, this.#age, this.#weight];
    // strore to local storage
    localStorage.setItem(
      "personalinfo",
      JSON.stringify(this.#personalInfoList)
    );
    // hide personalform
    messageBox.classList.add("hide");
    personalInfo.classList.add("hide");
    personalInfo.dataset.active = false;
    // listen for outside click
    this._listenForClose();
  }
  _displayMessage(message) {
    // acquire and display message
    messageEl.dataset.active = "true";
    messageEl.classList.remove("hide");
    messageBox.classList.remove("hide");
    messageContent.textContent = message;
    // listen for outside click
    this._listenForClose();
  }
  _listenForClose() {
    // find current active parent message
    let currentParent = document.querySelector('[data-active="true"]');
    document.addEventListener("mousedown", (e) => {
      // if user click outside current parent message close message
      if (!currentParent.contains(e.target)) {
        this._closeMessage();
      }
    });
  }
  _closeMessage() {
    // hide message box
    messageBox.classList.add("hide");
    // hide all parent messages
    allParents.forEach((parent) => {
      parent.classList.add("hide");
      parent.dataset.active = "false";
    });
  }
  _renderWorkout(workout) {
    // create workout data
    let workoutData = {
      id: workout.id,
      calBurnt: workout.caloriesBurnt,
      distance: workout.distance,
      duration: workout.duration,
      swimmingSpeed:
        workout.type === "swimming" ? workout.speed.toFixed(1) : "",
      cyclingSpeed: workout.type === "cycling" ? workout.speed.toFixed(1) : "",
      pace: workout.type === "running" ? workout.pace.toFixed(1) : "",
    };
    // prevent same workout from rendering again after sorting
    //i cannot compare similar object created as diff instances as js identifies it differently
    const isWorkoutDataInArray = this.#workoutIdAndData.some((existingData) => {
      return existingData.id === workoutData.id;
    });
    if (!isWorkoutDataInArray) {
      this.#workoutIdAndData.push(workoutData);
    }

    // correct date format
    let modifiedDate = workout.customDate.split("T")[0];
    // add calories burnt data to calories burnt object for graph chart
    this.#caloriesBurnt[`${modifiedDate}`] = workout.caloriesBurnt;
    // create svg for data
    const svgCycling =
      '<svg xmlns="http://www.w3.org/2000/svg" class="workout-svg" viewBox="0 0 24 24"><path fill="none" stroke="#ececec" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14 7a2 2 0 1 0 0-4a2 2 0 0 0 0 4Zm4 14a3 3 0 1 0 0-6a3 3 0 0 0 0 6ZM6 21a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm5.5-3l1.5-4l-4.882-2l3-3.5l3 2.5h3.5"/></svg>';
    const svgRunning =
      '<svg xmlns="http://www.w3.org/2000/svg" class="workout-svg" viewBox="0 0 24 24"><path fill="#ececec" d="M20.75 4.5a2.5 2.5 0 1 1-5 0a2.5 2.5 0 0 1 5 0Z"/><path fill="#ececec" fill-rule="evenodd" d="M9.802 5.93a3.97 3.97 0 0 1 .721-.043c.08.004.17.01.273.02c2.383.248 4.15 2.036 5.328 3.802l.063.094a3.25 3.25 0 0 0 2.704 1.447h1.859a.75.75 0 0 1 0 1.5h-1.86a4.75 4.75 0 0 1-3.952-2.115l-.062-.094A10.95 10.95 0 0 0 14 9.39l-1.884 2.355c-.428.534-.714.894-.907 1.19c-.188.286-.241.445-.255.566c-.024.2.002.403.073.591c.044.114.135.256.386.487c.26.24.626.518 1.172.93l.095.073c.72.546 1.22.924 1.565 1.428c.197.287.352.6.463.93c.193.58.193 1.206.193 2.11V22a.75.75 0 0 1-1.5 0v-1.83c0-1.07-.01-1.435-.116-1.755a2.25 2.25 0 0 0-.277-.558c-.19-.278-.476-.505-1.33-1.152l-.028-.021c-.51-.386-.933-.707-1.252-1.001c-.334-.307-.611-.635-.772-1.056a2.75 2.75 0 0 1-.162-1.3c.052-.448.241-.835.49-1.214c.237-.362.569-.778.968-1.277l1.984-2.479c-.687-.523-1.444-.871-2.264-.956a3.156 3.156 0 0 0-.184-.014a2.513 2.513 0 0 0-.45.03c-1.065.148-2.132.74-4.45 2.057l-1.436.815a.75.75 0 1 1-.742-1.304l1.436-.815l.152-.087c2.12-1.204 3.449-1.96 4.835-2.151ZM9.23 16.425a.75.75 0 0 1 .096 1.056l-1 1.201l-.097.116c-.642.771-1.113 1.338-1.771 1.646c-.658.308-1.395.308-2.4.307H2.75a.75.75 0 0 1 0-1.5h1.158c1.222 0 1.596-.017 1.913-.165c.318-.149.57-.426 1.352-1.364l1-1.201a.75.75 0 0 1 1.057-.096Z" clip-rule="evenodd"/></svg>';
    const svgSwimming =
      '<svg xmlns="http://www.w3.org/2000/svg" class="workout-svg" viewBox="0 0 32 32"><path fill="#ececec" d="M23.5 11a3.514 3.514 0 0 0-3.5 3.5c0 1.922 1.578 3.5 3.5 3.5s3.5-1.578 3.5-3.5s-1.578-3.5-3.5-3.5zm-9.781.031a1.945 1.945 0 0 0-1.031.375l-5.282 3.781l1.188 1.626l5.25-3.782l2.281 2.625l-7.406 6.281c.406.036.84.063 1.281.063c.676 0 1.324-.07 1.969-.188l5.437-4.656l2.032 2.344a15.492 15.492 0 0 1 2.28-.438l-6.374-7.343a1.949 1.949 0 0 0-1.625-.688zM23.5 13c.84 0 1.5.66 1.5 1.5c0 .844-.66 1.5-1.5 1.5a1.48 1.48 0 0 1-1.5-1.5c0-.84.656-1.5 1.5-1.5zm-.5 7c-2.438 0-4.574.816-6.656 1.563C14.262 22.308 12.234 23 10 23c-5.496 0-8.313-2.719-8.313-2.719L.313 21.72S3.817 25 10 25c2.645 0 4.906-.809 7-1.563C19.094 22.684 21.016 22 23 22c3.969 0 7.344 2.781 7.344 2.781l1.312-1.562S27.875 20 23 20z"/></svg>';
    const svgDuration =
      '<svg xmlns="http://www.w3.org/2000/svg" class="workout-svg" viewBox="0 0 512 512"><path fill="none" stroke="#ececec" stroke-miterlimit="10" stroke-width="32" d="M256 64C150 64 64 150 64 256s86 192 192 192s192-86 192-192S362 64 256 64Z"/><path fill="none" stroke="#ececec" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M256 128v144h96"/></svg>';
    const svgSpeed =
      '<svg xmlns="http://www.w3.org/2000/svg" class="workout-svg" viewBox="0 0 24 24"><path fill="#ececec" d="m20.39 8.56l-1.24 1.86a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.86-1.24A10 10 0 0 0 4 20h16a10 10 0 0 0 .38-11.44z"/><path fill="#ececec" d="M10.59 15.41a2 2 0 0 0 2.83 0l5.66-8.49l-8.49 5.66a2 2 0 0 0 0 2.83z"/></svg>';
    const svgCalories =
      '<svg xmlns="http://www.w3.org/2000/svg" class="workout-svg" viewBox="0 0 16 16"><path fill="#ececec" d="M8.17 2.382a3.74 3.74 0 0 1 .792-.3c.024.54.192 1.074.42 1.584c.324.721.8 1.457 1.264 2.17l.054.082c.455.697.9 1.378 1.238 2.062c.35.709.565 1.379.565 2.02c0 1.153-.345 2.147-.992 2.848c-.64.695-1.624 1.152-3.008 1.152c-1.397 0-2.368-.404-3.046-1.025c-.687-.628-1.122-1.523-1.358-2.584c-.222-.998-.026-1.893.235-2.55c.042-.107.086-.207.13-.3l.125.251a1.541 1.541 0 0 0 2.068.69c.846-.423 1.08-1.46.722-2.236c-.372-.807-.662-1.81-.403-2.588c.195-.584.658-1 1.193-1.276ZM4.11 6.189v.001l-.002.003l-.005.006l-.016.02l-.051.071c-.043.06-.102.147-.17.256a6.006 6.006 0 0 0-.462.926c-.31.78-.56 1.885-.281 3.137c.265 1.19.775 2.294 1.659 3.104C5.674 14.529 6.899 15 8.503 15c1.618 0 2.884-.543 3.743-1.473c.853-.924 1.257-2.18 1.257-3.527c0-.859-.285-1.689-.669-2.464c-.365-.738-.84-1.464-1.285-2.147a89.582 89.582 0 0 1-.065-.1c-.473-.725-.904-1.395-1.19-2.033c-.285-.637-.397-1.18-.302-1.658A.5.5 0 0 0 9.502 1c-.422 0-1.125.148-1.792.493c-.673.349-1.377.933-1.682 1.849c-.39 1.17.059 2.49.443 3.323c.171.37.022.78-.261.922a.541.541 0 0 1-.726-.242l-.535-1.069a.5.5 0 0 0-.839-.087Z"/></svg>';
    // create html for insertion
    const html = `
          <li class="workout workout-${workout.type} ${
      workout.type
    }-tag" data-id=${workout.id} data-isMarked=${false}>
            <div class="workout-info-container">
              <h2 class="workout-title">${workout.description}</h2>
              <div class="workout-details workout-type">
                <span class="workout-icon">${
                  workout.type === "running"
                    ? svgRunning
                    : workout.type === "cycling"
                    ? svgCycling
                    : svgSwimming
                }</span>
                <span class="workout-value">${workout.distance}</span>
                <span class="workout-unit">Km</span>
              </div>
              <div class="workout-details workout-duration">
                <span class="workout-icon">${svgDuration}</span>
                <span class="workout-value">${workout.duration}</span>
                <span class="workout-unit">Min</span>
              </div>
              <div class="workout-details workout-speed">
                <span class="workout-icon">${svgSpeed}</span>
                <span class="workout-value">${
                  workout.type === "running"
                    ? workout.pace.toFixed(1)
                    : workout.speed.toFixed(1)
                }</span>
                <span class="workout-unit">${
                  workout.type === "running"
                    ? "Min/Km"
                    : workout.type === "cycling"
                    ? "Km/h"
                    : "M/s"
                }</span>
              </div>
              <div class="workout-details workout-calories">
                <span class="workout-icon">${svgCalories}</span>
                <span class="workout-value">${workout.caloriesBurnt}</span>
                <span class="workout-unit">Kcal</span>
              </div>
              <div class="workout-note workout-note">
                <p>${workout.note}</p>
              </div>
            </div>
            <div class="workout-btn-container">
              <button class="workout-btn workout-delete"
                ><ion-icon name="trash"></ion-icon
              ></button>
              <button class="workout-btn workout-mark"
                ><ion-icon name="bookmark"></ion-icon
              ></button>
            </div>
          </li>
          `;
    // insert html after form
    form.insertAdjacentHTML("afterend", html);
    // add event listener to delete and mark btn
    const workoutDeleteBtn = document
      .querySelector(`[data-id='${workout.id}']`)
      .querySelector(".workout-delete");
    const workoutMarkedBtn = document
      .querySelector(`[data-id='${workout.id}']`)
      .querySelector(".workout-mark");
    workoutDeleteBtn.addEventListener("click", this._deleteWorkout.bind(this));
    workoutMarkedBtn.addEventListener("click", this._markWorkout.bind(this));
  }
  _renderWorkoutMarker(workout) {
    // create and render marker
    let marker = L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(workout.description)
      .openPopup();
    // push marker to markers array
    this.#markers.push(marker);
  }
  _deleteWorkout(e) {
    // stop propagation after event is triggered
    e.stopPropagation();
    // find the workout to delete
    let workoutToDelete = e.target.closest(".workout");
    if (!workoutToDelete) return;
    // check if workout to delete is marked
    if (workoutToDelete.dataset.isMarked)
      workoutToDelete.dataset.isMarked = "false";
    // find edited workout after deletion
    let editedWorkouts = this.#workouts.filter(
      (work) => work.id !== workoutToDelete.dataset.id
    );
    // resetall
    this._resetAll();
    // show bike gif if no workouts
    this._showBike();
    // update workouts
    this.#workouts = editedWorkouts;
    // clear caloriesburnt array
    this.#caloriesBurnt = [];
    // add workout to marked workouts
    this.#marked = [];
    this.#workouts.forEach((work) => {
      if (work.isMarked) {
        this.#marked.push(work);
      }
    });
    // update localstorage
    this._setLocalStorage();
    // get localstorage
    this._getLocalStorage();
  }
  _markWorkout(e) {
    // stop propagation after event is triggered
    e.stopPropagation();
    // find the workout to mark
    let workoutToMark = e.target.closest(".workout");
    let markedWorkoutIndex = this.#workouts.findIndex(
      (work) => work.id === workoutToMark.dataset.id
    );
    // check if current workout is marked
    let isCurrentWorkoutMarked = this.#workouts[markedWorkoutIndex].isMarked;
    // add and remove color accordingly
    if (!isCurrentWorkoutMarked) {
      this.#workouts[markedWorkoutIndex].isMarked = true;
      workoutToMark.dataset.isMarked = "true";
      this._addMarkColor(this.#workouts[markedWorkoutIndex]);
    } else {
      workoutToMark.dataset.isMarked = "false";
      this.#workouts[markedWorkoutIndex].isMarked = false;
      this._addMarkColor(this.#workouts[markedWorkoutIndex]);
    }
    // add workout to marked workouts
    this.#marked = [];
    this.#workouts.forEach((work) => {
      if (work.isMarked) {
        this.#marked.push(work);
      }
    });
    // update local storage
    this._setLocalStorage();
  }
  _resetAll() {
    // remove hide-menu-overflow from html
    htmlElement.classList.toggle("hide-menu-overflow");
    // check if nav-open present on nav-container
    let currentNavigationContainer = document.querySelector(".nav-container");
    if (currentNavigationContainer.classList.contains("nav-open"))
      navigationContainer.classList.remove("nav-open");
    // remove all inserted workouts
    const allWorkouts = document.querySelectorAll(".workout");
    allWorkouts.forEach((work) => work.remove());
    // clear local storage
    localStorage.removeItem("workout");
    localStorage.removeItem("marked");
    // remove marker from markers list
    this.#markers.forEach((marker) => marker.remove());
    // empty marker coordinates
    this.#markerCoordinates = [];
  }
  _setLocalStorage() {
    // set workout and marked item to localstorage
    localStorage.setItem("workout", JSON.stringify(this.#workouts));
    localStorage.setItem("marked", JSON.stringify(this.#marked));
  }
  _getLocalStorage() {
    // retrieve data from local storage
    const data = JSON.parse(localStorage.getItem("workout"));
    const marked = JSON.parse(localStorage.getItem("marked"));
    const personalData = JSON.parse(localStorage.getItem("personalinfo"));

    // set personal data attributes if present
    if (personalData) {
      this.#personalInfoList = personalData;
      this.#gender = this.#personalInfoList[0];
      this.#age = this.#personalInfoList[1];
      this.#weight = this.#personalInfoList[2];
    }

    // if no workout data present return back
    if (!data) return;
    // set workout and marked data
    this.#workouts = data;
    this.#marked = marked;

    // push workout coordinates to markercoordinates
    this.#workouts.forEach((work) => {
      this.#markerCoordinates.push(work.coords);
      // render workoutmarker only if map is loaded
      if (this._isMapLoaded) this._renderWorkoutMarker(work);
      // render workout
      this._renderWorkout(work);
      // add markcolor to marked workouts
      this._addMarkColor(work);
    });
  }
  _isTherePersonalInfo() {
    // check if personal info is persent in localstorage
    if (this.#age && this.#gender && this.#weight) {
      // set personal info attributes
      inputAge.value = this.#age;
      inputWeight.value = this.#weight;
      inputGender.value = this.#gender;
    } else {
      // show personal form only if location access enabled
      if (this.#accessLocation) this._showPersonalForm();
    }
  }
  _showBike() {
    // check for any workouts and show bikegif accordingly
    if (this.#workouts.length === 0) {
      bikeGif.classList.remove("hide");
    }
  }
  _hideBike() {
    bikeGif.classList.add("hide");
  }
  _showSortForm() {
    // this code is necessary to make screen scrollable once user presses deleteall btn
    document.documentElement.style.overflowY = "scroll";
    // open eye again
    eyeopenBtn.classList.remove("hide");
    eyecloseBtn.classList.add("hide");
    // remove hide-menu-overflow from html
    htmlElement.classList.toggle("hide-menu-overflow");
    // check if nav-open present on nav-container
    let currentNavigationContainer = document.querySelector(".nav-container");
    if (currentNavigationContainer.classList.contains("nav-open"))
      navigationContainer.classList.remove("nav-open");

    // check if any workout present
    if (this.#workouts.length === 0) {
      this._displayMessage("No workouts present, add one first.");
    } else {
      // show sort form
      messageBox.classList.remove("hide");
      sortInfo.classList.remove("hide");
      sortInfo.dataset.active = true;
      inputSortType.focus();
      // listen for outsideclick
      this._listenForClose();
    }
  }
  _displaySortedWorkout(e) {
    // prevent default behaviour of form
    e.preventDefault();
    // scroll window to sorted workouts
    mainSidebarContainer.scrollIntoView({ behavior: "smooth" });
    // get sort input values
    let sortType = inputSortType.value;
    let sortOrder = inputSortOrder.value;
    // find sorted workouts
    let sortedWorkouts = [];
    sortedWorkouts = this._sortWorkouts(sortType, sortOrder);
    // check if sorted workout present

    // store old workouts
    let oldWorkouts = this.#workouts;
    let allWorkouts = document.querySelectorAll(".workout");
    // remove all workouts
    allWorkouts.forEach(function (element) {
      element.parentNode.removeChild(element);
    });
    // remove all markers
    this.#markers.forEach((marker) => marker.remove());
    this.#markers = [];
    // show sorted workouts
    sortedWorkouts.forEach((sortedwork) => {
      this.#workouts.forEach((workout) => {
        if (workout.id === sortedwork.id) {
          this._renderWorkout(workout);
          this._addMarkColor(workout);
          this._renderWorkoutMarker(workout);
        }
      });
    });
    // reset oldworkouts
    this.#workouts = oldWorkouts;
    // hide sortinfoform
    messageBox.classList.add("hide");
    sortInfo.classList.add("hide");
    sortInfo.dataset.active = false;
  }
  _sortWorkouts(type, order) {
    let sortWorkouts;
    sortWorkouts = this.#workoutIdAndData.filter((work) => {
      if (work[type]) return work;
    });
    if (order === "hightolow")
      return sortWorkouts.sort(function (a, b) {
        return b[type] - a[type];
      });
    else {
      return sortWorkouts.sort(function (a, b) {
        return a[type] - b[type];
      });
    }
  }
  _showMarked() {
    // this code is necessary to make screen scrollable once user presses deleteall btn
    document.documentElement.style.overflowY = "scroll";
    // open eye again
    eyeopenBtn.classList.remove("hide");
    eyecloseBtn.classList.add("hide");
    // remove hide-menu-overflow from html
    htmlElement.classList.toggle("hide-menu-overflow");
    // check if nav-open present on nav-container
    let currentNavigationContainer = document.querySelector(".nav-container");
    if (currentNavigationContainer.classList.contains("nav-open"))
      navigationContainer.classList.remove("nav-open");

    // check if any marked workout present
    if (this.#marked.length === 0) this._displayMessage("No marked workouts");
    else {
      // scroll window to workouts
      mainSidebarContainer.scrollIntoView({ behavior: "smooth" });
      // remove all workouts and markers
      let allWorkouts = document.querySelectorAll(".workout");
      allWorkouts.forEach((work) => work.remove());
      this.#markers.forEach((marker) => marker.remove());
      this.#markers = [];
      // show all workouts and markers
      this.#marked.forEach((work) => {
        this._renderWorkout(work);
        this._addMarkColor(work);
        this._renderWorkoutMarker(work);
      });
    }
  }
  _newWorkout(e) {
    // prevent default behaviour of form
    e.preventDefault();
    // hide bike
    this._hideBike();
    // check if inputs are valid
    const validInputs = (...inputs) =>
      inputs.every((inp) => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every((inp) => inp > 0);

    let workout;
    // acquire form values
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const customDate = inputCustomDate.value;
    const note = inputNote.value;
    const { lat, lng } = this.#mapEvent.latlng;

    // case1-if type of workout is running
    if (type === "running") {
      if (
        // if iputs are invalid display message else create workout instance
        !validInputs(distance, duration) ||
        !allPositive(distance, duration) ||
        !customDate
      )
        return this._displayMessage("Please enter the correct input.");
      workout = new Running([lat, lng], distance, duration, note, customDate);
    }
    // case2-if type of workout is cycling
    if (type === "cycling") {
      // if iputs are invalid display message else create workout instance
      if (
        !validInputs(distance, duration) ||
        !allPositive(distance, duration) ||
        !customDate
      )
        return this._displayMessage("Please enter the correct input.");
      workout = new Cycling([lat, lng], distance, duration, note, customDate);
    }
    // case3-if type of workout is swimming
    if (type === "swimming") {
      if (
        // if iputs are invalid display message else create workout instance
        !validInputs(distance, duration) ||
        !allPositive(distance, duration) ||
        !customDate
      )
        return this._displayMessage("Please enter the correct input.");
      workout = new Swimming([lat, lng], distance, duration, note, customDate);
    }

    // find MET for workout
    let MET =
      workout.type === "running" ? 8 : workout.type === "cycling" ? 8 : 7;
    // find gender modifier
    let genderModifier = this.#gender === "male" ? 1 : 0.95;
    // find age modifier
    let ageModifier = this.#age < 30 ? 1 : this.#age > 50 ? 0.9 : 0.95;
    // find calories burnt
    let caloriesBurnt = Math.ceil(
      this.#weight *
        MET *
        genderModifier *
        ageModifier *
        (workout.duration / 60)
    );
    workout.caloriesBurnt = caloriesBurnt;
    // push workout to workouts array
    this.#workouts.push(workout);
    // push coordinates to marker coordinates array
    this.#markerCoordinates.push(workout.coords);
    // render workout and marker
    this._renderWorkoutMarker(workout);
    this._renderWorkout(workout);
    // hide form and update local storage
    this._hideForm();
    this._setLocalStorage();
  }

  _moveToPopup(e) {
    // find the workout clicked
    const workoutEl = e.target.closest(".workout");
    if (!workoutEl) return;
    const workout = this.#workouts.find(
      (work) => work.id === workoutEl.dataset.id
    );
    // move map view to clicked workout
    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: { duration: 1 },
    });
    // move to map on click
    document.body.scrollTo({ top: 0, behavior: "smooth" });
    document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
  }

  _fitMarkers() {
    // this code is necessary to make screen scrollable once user presses deleteall btn
    document.documentElement.style.overflowY = "scroll";
    // remove hide-menu-overflow from html
    htmlElement.classList.toggle("hide-menu-overflow");
    // check if nav-open present on nav-container
    let currentNavigationContainer = document.querySelector(".nav-container");
    if (currentNavigationContainer.classList.contains("nav-open"))
      navigationContainer.classList.remove("nav-open");
    // if no markers return
    if (this.#markerCoordinates.length == 0) return;
    // create bound of all marker coordinates and fitbounds
    let bounds = L.latLngBounds(this.#markerCoordinates);
    this.#map.fitBounds(bounds, { animate: true });
  }
  _showGraph() {
    // this code is necessary to make screen scrollable once user presses deleteall btn
    document.documentElement.style.overflowY = "scroll";
    // remove hide-menu-overflow from html
    htmlElement.classList.toggle("hide-menu-overflow");
    // check if nav-open present on nav-container
    let currentNavigationContainer = document.querySelector(".nav-container");
    if (currentNavigationContainer.classList.contains("nav-open"))
      navigationContainer.classList.remove("nav-open");

    // create months array
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    // get current day,year and month
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();
    // create x-axis(dateData) and y-axis(monthData)
    let dateData = [];
    const monthData = Array.from({ length: currentDay }, (_, index) => {
      const day = index + 1;
      const dateKey = `${currentYear}-${(currentMonth + 1)
        .toString()
        .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
      dateData.push(dateKey);
      return this.#caloriesBurnt[dateKey] || 0;
    });

    // data for ploting graph and modifying graph styles
    const data = {
      labels: dateData,
      datasets: [
        {
          data: monthData,
          fill: false,
          borderColor: "black",
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: "black",
        },
      ],
    };
    const options = {
      scales: {
        x: {
          title: {
            display: true,
          },
          grid: {
            display: false,
          },
        },
        y: {
          title: {
            display: true,
            text: "cal",
          },
          grid: {
            display: false,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
      elements: {
        line: {
          tension: 0.4,
        },
      },
    };
    const config = {
      type: "line",
      data: data,
      options: options,
    };

    // show graph
    messageBox.classList.remove("hide");
    graphChart.classList.remove("hide");
    graphChart.dataset.active = true;
    const ctx = document.getElementById("myChart").getContext("2d");
    if (this.myChart) this.myChart.destroy();
    this.myChart = new Chart(ctx, config);
    // listen for close
    this._listenForClose();
  }

  _addMarkColor(work) {
    // add marker-color is workout is not marked
    if (work.isMarked)
      document
        .querySelector(`[data-id='${work.id}']`)
        .querySelector(".workout-mark")
        .classList.add("marked");
    else
      document
        .querySelector(`[data-id='${work.id}']`)
        .querySelector(".workout-mark")
        .classList.remove("marked");
  }
}

// create app instance
const app = new App();
