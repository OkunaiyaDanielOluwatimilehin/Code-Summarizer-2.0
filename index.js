document.addEventListener("DOMContentLoaded", () => {
  const typewriterTextElement = document.getElementById("typewriter-text");
  const getStartedButton = document.getElementById("getStartedButton");
  const uploadBox = document.getElementById("uploadBox");
  const codeFile = document.getElementById("codeFile");
  const uploadButton = document.getElementById("uploadButton");

  // --- Typewriter Effect ---
  const phrases = [
    "Powered by cutting-edge AI.",
    "Making code accessible to everyone.",
    "Your ultimate code understanding companion.",
    "Efficient, accurate, and instant."
  ];
  let phraseIndex = 0, charIndex = 0, isDeleting = false;
  const typingSpeed = 100, deletingSpeed = 50, delayBetweenPhrases = 1500;

  function typeWriterEffect() {
    const currentPhrase = phrases[phraseIndex];
    typewriterTextElement.textContent = isDeleting
      ? currentPhrase.substring(0, charIndex--)
      : currentPhrase.substring(0, ++charIndex);

    if (!isDeleting && charIndex === currentPhrase.length) {
      isDeleting = true;
      setTimeout(typeWriterEffect, delayBetweenPhrases);
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      setTimeout(typeWriterEffect, 500);
    } else {
      setTimeout(typeWriterEffect, isDeleting ? deletingSpeed : typingSpeed);
    }
  }
  if (typewriterTextElement) typeWriterEffect();

  // --- Upload Box Toggle ---
  getStartedButton.addEventListener("click", () => {
    getStartedButton.style.display = "none"; // hide button
    uploadBox.classList.add("show");        // show expanded upload box
  });

  // --- File Upload Handling ---
// Reset button after upload
uploadButton.addEventListener("click", () => {
  const file = codeFile.files[0];
  if (!file) {
    alert("Please select a file first.");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const fileContent = e.target.result;

    const resultBox = document.getElementById("resultBox");
    resultBox.textContent = fileContent;
    resultBox.style.display = "block";
    resultBox.scrollIntoView({ behavior: "smooth" });

    // ✅ reset upload button text after showing result
    uploadButton.textContent = "Upload & Process";
    codeFile.value = ""; // clear file input so same file can be reselected
  };
  reader.readAsText(file);
});

// Show file name on selection
codeFile.addEventListener("change", () => {
  if (codeFile.files.length) {
    uploadButton.textContent = "Upload & Process (" + codeFile.files[0].name + ")";
  } else {
    uploadButton.textContent = "Upload & Process";
  }
});

// Close upload box
const closeUploadBox = document.getElementById("closeUploadBox");
closeUploadBox.addEventListener("click", () => {
  uploadBox.classList.remove("show"); // hide upload box
  getStartedButton.style.display = "inline-block"; // bring back "Get Started"
});
closeUploadBox.addEventListener("click", () => {
  uploadBox.classList.remove("show");
  getStartedButton.style.display = "inline-block";
  resultBox.textContent = "";          // clear old output
  resultBox.style.display = "none";    // hide again
});

});
