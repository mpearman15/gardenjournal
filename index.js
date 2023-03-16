// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { html, render } from "lit-html";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAIS7tpssHcPojfXAoGtEUDlpQfrAUaTMM",
  authDomain: "garden-journal-146bd.firebaseapp.com",
  projectId: "garden-journal-146bd",
  storageBucket: "garden-journal-146bd.appspot.com",
  messagingSenderId: "827802375183",
  appId: "1:827802375183:web:fbbf6497532ad8a8427f7a",
  measurementId: "G-FC93M6D38R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let entries = [];
const entryRef = collection(db, "entries");

let canvas;
var stemHeight = 40;
window.setup = () => {
  canvas = createCanvas(windowWidth, windowHeight);
}
async function drawAllEntries() {

  entries = [];

  const querySnapshot = await getDocs(
    query(entryRef, orderBy("time", "desc"))
  );

  if (!canvas) {
    canvas = createCanvas(windowWidth, windowHeight);
    const container = document.getElementById("canvas-container");
    canvas.parent(container);
  }
  background(255);
  let locX = windowWidth/2;
  let locY = windowHeight-200;
  let currDate;


  // to get the current local time
  Date.prototype.timeNow = function() {
    return ((this.getHours() < 10)?"0":"") + ((this.getHours()>12)?(this.getHours()-12):this.getHours())
    +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() + ((this.getHours()>12)?(' PM'):' AM');
  };

  let entriesByDate = new Map();

  querySnapshot.forEach((doc) => {
    let entryData = doc.data();
    let date = new Date(entryData.time);
    let dateString = date.toLocaleDateString();
    if (!entriesByDate.has(dateString)) {
      entriesByDate.set(dateString, []);
    }
    entriesByDate.get(dateString).push(entryData);

    // let today = new Date(entryData.time);

    // let date = today.getDate();

    // console.log(today.toLocaleString());
    // console.log(today.getDate());
    // console.log(today.timeNow());





    // let dateTimeElement = document.createElement("p");
    // dateTimeElement.innerHTML = today.getDate();
    // document.body.appendChild(dateTimeElement);



    // locY-= stemHeight;
    // leaf(locX, locY);
    // let size = random(50,150);
      // fill(0);
      // text("activity: " + entryData.activity, locX, locY);
      // text("mood: " + entryData.mood, locX, locY+10);
      // text("note: " + entryData.note, locX, locY+20);

  });

  render(view(), document.body);
}
for (let [dateString, entries] of entriesByDate) {
  let date = new Date(dateString);
  let month = date.toLocaleString("default", { month: "long" });
  let day = date.getDate();
  let dateText = `${month} ${day}`;
  if (dateText !== currDate) {
    console.log(dateText);
    textSize(32);
    fill(0);
    text(dateText, locX, locY);
    currDate = dateText;
    locY -= 40;
  }

  textSize(16);
  fill(0);
  entries.forEach((entryData) => {
    text(`Activity: ${entryData.activity}`, locX, locY-20);
    text(`Mood: ${entryData.mood}`, locX, locY -40);
    text(`Note: ${entryData.note}`, locX, locY -60);
    locY += 60;
  });
  locY -= 20;
}

function leafRight(x, y){

  //draw the stem
  stroke(45,90,90);
  fill(45,90,90);
  strokeWeight(3);
  line(x,y, x, y+stemHeight);

  var leafSize = 30;
  var leafWidth = leafSize/2;
  //draw leaves
  noStroke();
  ellipse(x+leafWidth,y, leafSize, leafWidth);
}

function leafLeft(x,y) {
    //draw the stem
    stroke(45,90,90);
    fill(45,90,90);
    strokeWeight(3);
    line(x,y, x, y+stemHeight);

    var leafSize = 30;
    var leafWidth = leafSize/2;
    //draw leaves
    noStroke();
    ellipse(x+leafWidth,y, leafSize, leafWidth);
}

drawAllEntries();

onSnapshot(
  collection(db, "entries"),
  (snapshot) => {
    console.log("snap", snapshot);
    drawAllEntries();
  },
  (error) => {
    console.error(error);
  }
);

async function addEntry(data) {
  console.log("adding entry to database");
  try {
    const docRef = await addDoc(collection(db, "entries"), data);
    await drawAllEntries();
    render(view(), document.body);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

function popup() {
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
      activity: formData.get('activity'),
      mood: formData.get('mood'),
      note: document.getElementById("text-note").value,
      time: Date.now()
    };
    console.log(data);
    addEntry(data);
  };
  return html`
    <div class="popup-overlay">
      <div class="popup-container">
        <form @submit=${handleSubmit}>
          <p>Type of activity</p>
          <input type="radio" id="work" name="activity" value="work">
          <label for="work">work</label><br>
          <input type="radio" id="leisure" name="activity" value="leisure">
          <label for="leisure">leisure</label><br>
          <input type="radio" id="school" name="activity" value="school">
          <label for="school">school</label><br>

          <p>Mood</p>
          <input type="radio" id="happy" name="mood" value="happy">
          <label for="happy">happy</label><br>
          <input type="radio" id="sad" name="mood" value="sad">
          <label for="sad">sad</label><br>
          <input type="radio" id="okay" name="mood" value="okay">
          <label for="okay">okay</label><br>
          <input type="radio" id="excited" name="mood" value="excited">
          <label for="excited">excited</label><br>
          <label for="text-note">notes</label><br>
          <input type="text" id="text-note">
          <input type="submit" value="save!">
        </form>
      </div>
    </div>
  `;
}

function logEntry() {
  render(popup(), document.body);
}

function view() {
  return html`
    <h1>garden journal</h1>
    <p> welcome! add in your entry :) </p>
    <button class="button" @click=${logEntry}> Log Entry! </button>
    <div id=canvas-container> </div>

  `;
}

render(view(), document.body);

