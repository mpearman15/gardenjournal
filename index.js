// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { html, render } from "lit-html";
import {
  doc,
  getDoc,
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

// creating canvas and initializing things in it
let canvas;
let stemHeight = 30;
let startPos = 30;
let isRight = false;
window.setup = () => {
  canvas = createCanvas(windowWidth, windowHeight);
}

window.draw = () => {
  drawAllEntries();

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

  let currDate = null;

  // formatting time
  Date.prototype.timeNow = function() {
    return ((this.getHours() < 10)?"0":"") + ((this.getHours()>12)?(this.getHours()-12):this.getHours())
    +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() + ((this.getHours()>12)?(' PM'):' AM');
  };

  let entriesByDate = new Map();

  querySnapshot.forEach((doc) => {
    let entryData = doc.data();
    entryData.id = doc.id;
    let date = new Date(entryData.time);
    let dateString = date.toLocaleDateString();
    if (!entriesByDate.has(dateString)) {
      entriesByDate.set(dateString, []);
    }
    entriesByDate.get(dateString).push(entryData);
  });

  for (let [dateString, entries] of entriesByDate) {
    // retrieving date information and setting canvas based on month days
    let date = new Date(dateString);
    let month = date.toLocaleString("default", { month: "long" });
    let day = date.getDate();
    let dateText = `${month} ${day}`;
    let daysInMonth = new Date(date.getFullYear(), date.getMonth()+1, 0).getDate();
    let datePos = startPos + (windowWidth - (startPos*2)) * (day - 1) / (daysInMonth-1);

    let locX = datePos;
    let locY = windowHeight-200;
    if (dateText !== currDate) {
      textSize();
      fill(0);
      text(dateText, locX-25, locY);
      currDate = dateText;
      locY -= 40;
    }
    textSize(16);
    fill(0);

    entries.forEach((entryData) => {
      let id = entryData.id;
      leaf(locX, locY, id);
      // isRight ? leafLeft(locX, locY, id) : leafRight(locX, locY, id);
      locY -= 30;
    });
    locY -= 20;
  }
  render(view(), document.body);
}

async function leaf(x, y, id) {
  const entryRef = doc(db, "entries", id);
  const docSnap = await getDoc(entryRef);
  let entryData = docSnap.data();

  var leafSize = 30;
  var leafWidth = leafSize/2;
  var leafRadius = leafSize/2;
  var d = dist(x+leafWidth, y, mouseX, mouseY);
  if (d < leafRadius) {
    textSize(16);
    fill(0);
    text("activity: " + entryData.activity, windowHeight/2, windowWidth/2);
    text("mood: " + entryData.mood, windowHeight/2, windowWidth/2 - 40);
    text(entryData.note, windowHeight/2, windowWidth/2 - 80);
    fill(255, 204, 0);
  } else {
    fill(45,90,90);
  }
  //draw leaves
  noStroke();
  if (isRight) {
    ellipse(x+leafWidth,y, leafSize, leafWidth);
    isRight = false;
  } else {
    ellipse(x-leafWidth,y, leafSize, leafWidth);
    isRight = true;
  }
  //draw the stem
  stroke(45,90,90);
  fill(45,90,90);
  strokeWeight(3);
  line(x,y, x, y+stemHeight);
}

// async function leafLeft(x,y, id) {
//   isRight = false;

//   //draw the stem
//   stroke(45,90,90);
//   fill(45,90,90);
//   strokeWeight(3);
//   line(x,y, x, y+stemHeight);

//   var leafSize = 30;
//   var leafWidth = leafSize/2;
//   //draw leaves
//   noStroke();
//   ellipse(x-leafWidth,y, leafSize, leafWidth);
// }

// drawAllEntries();

async function addEntry(data) {
  console.log("adding entry to database");
  try {
    const docRef = await addDoc(collection(db, "entries"), data);
    const entryId = docRef.id;
    data.id = entryId;
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

