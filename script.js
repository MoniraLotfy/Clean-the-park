
const trashTypes = ["🍟","🍔","🥑","🍬","🤡"];
let level = 1;
let trashCount = 3;
let collectedTrash = 0;
let gameStarted = false;

const bin = document.getElementById("bin");
const message = document.getElementById("message");
const levelDisplay = document.getElementById("level");
const startScreen = document.getElementById("startScreen");
const paw = document.getElementById("paw");

const catchSound = new Audio("Audio/Catch.mp3");
const bgMusic = new Audio("Audio/Bgsound.mp3");
bgMusic.loop = true;

// Update HUD
function updateHUD(){
  levelDisplay.textContent = `Level ${level}`;
  message.textContent = `Trash: ${collectedTrash} / ${trashCount}`;
}

// Create trash items
function createTrash(num){
  for(let i=0;i<num;i++){
    const trash = document.createElement("div");
    trash.className = "trash";
    trash.textContent = trashTypes[Math.floor(Math.random()*trashTypes.length)];
    trash.style.left = Math.random()*80+"%";
    trash.style.top = Math.random()*60+20+"%";

    // Desktop drag
    trash.draggable = true;
    trash.addEventListener("dragstart", e=>{
      e.dataTransfer.setData("text", "trash");
      trash.classList.add("wiggle");
    });
    trash.addEventListener("dragend", ()=>{
      trash.classList.remove("wiggle");
    });

    // Mobile drag
    trash.addEventListener("touchstart", function(e){
      trash.classList.add("wiggle");
      const parentRect = document.querySelector(".game-wrap").getBoundingClientRect();
      trash.initialX = e.touches[0].clientX - trash.offsetLeft - parentRect.left;
      trash.initialY = e.touches[0].clientY - trash.offsetTop - parentRect.top;
    });
    trash.addEventListener("touchmove", function(e){
      e.preventDefault();
      const parentRect = document.querySelector(".game-wrap").getBoundingClientRect();
      let newLeft = e.touches[0].clientX - trash.initialX - parentRect.left;
      let newTop = e.touches[0].clientY - trash.initialY - parentRect.top;

      newLeft = Math.max(0, Math.min(newLeft, parentRect.width - trash.offsetWidth));
      newTop = Math.max(0, Math.min(newTop, parentRect.height - trash.offsetHeight));

      trash.style.left = newLeft + "px";
      trash.style.top = newTop + "px";
    });
    trash.addEventListener("touchend", function(){
      trash.classList.remove("wiggle");
      checkTouchDrop(trash);
    });

    document.querySelector(".game-wrap").appendChild(trash);
  }
}

// Desktop drop
bin.addEventListener("dragover", e=>e.preventDefault());
bin.addEventListener("drop", e=>{
  const dragged = document.querySelector(".trash.wiggle");
  if(dragged) handleCatch(dragged);
});

// Touch drop
function checkTouchDrop(trash){
  const binRect = bin.getBoundingClientRect();
  const trashRect = trash.getBoundingClientRect();
  if(
    trashRect.left + trashRect.width/2 > binRect.left &&
    trashRect.left + trashRect.width/2 < binRect.right &&
    trashRect.top + trashRect.height/2 > binRect.top &&
    trashRect.top + trashRect.height/2 < binRect.bottom
  ){
    handleCatch(trash);
  }
}

// Handle caught trash
function handleCatch(trash){
  catchSound.currentTime = 0;
  catchSound.play();
  trash.remove();
  collectedTrash++;
  updateHUD();
  bin.classList.add("pulse");
  setTimeout(()=>bin.classList.remove("pulse"),200);

  if(collectedTrash === trashCount){
    message.textContent = "New trash is coming...";
    setTimeout(()=>{
      level++;
      trashCount += 2;
      collectedTrash = 0;
      createTrash(trashCount);
      updateHUD();
    }, 1000);
  }
}

// Random paw animation
function randomChaos(){
  if(!gameStarted) return;
  if(Math.random()<0.005){
    const gameWrap = document.querySelector(".game-wrap");
    const wrapRect = gameWrap.getBoundingClientRect();

    // Random paw position
    paw.style.left = Math.random()*(wrapRect.width-40) + "px";
    paw.style.top = Math.random()*(wrapRect.height-40) + "px";
    paw.classList.add("show");

    // Shuffle trash positions
    document.querySelectorAll(".trash").forEach(t=>{
      t.style.left = Math.random()*(wrapRect.width - t.offsetWidth) + "px";
      t.style.top = Math.random()*(wrapRect.height - t.offsetHeight) + "px";
    });

    setTimeout(()=> paw.classList.remove("show"), 800);
  }
  requestAnimationFrame(randomChaos);
}

// Start game
window.addEventListener("click",()=>{
  if(!gameStarted){
    gameStarted = true;
    startScreen.style.display = "none";
    bgMusic.play();
    createTrash(trashCount);
    updateHUD();
    randomChaos();
  }
});
