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
uploadButton.addEventListener("click", async () => {
  const file = codeFile.files[0];
  if (!file) {
    alert("Please select a file first.");
    return;
  }

  // Show a loading state
  const originalButtonText = uploadButton.textContent;
  uploadButton.textContent = "Processing...";
  uploadButton.disabled = true;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const fileContent = e.target.result;
    const resultBox = document.getElementById("resultBox");

    try {
      // Send the file content to your Vercel serverless function
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileContent: fileContent }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong on the server.');
      }

      const summaryText = data.summary;

        // ✅ Add copy button and apply styling
        resultBox.innerHTML = `
          <div class="summary-output">
            <p>${summaryText}</p>
            <button id="copySummaryBtn" class="copy-btn">Copy</button>
          </div>
        `;

        resultBox.style.display = "block";
        resultBox.scrollIntoView({ behavior: "smooth" });

        // ✅ Add event listener for the new copy button
        const copyBtn = document.getElementById("copySummaryBtn");
        if (copyBtn) {
          copyBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(summaryText)
              .then(() => {
                copyBtn.textContent = "Copied!";
                setTimeout(() => {
                  copyBtn.textContent = "Copy";
                }, 2000);
              })
              .catch(err => {
                console.error('Failed to copy text: ', err);
                alert("Failed to copy text.");
              });
          });
        }
      } catch (error) {
        console.error("Error summarizing code:", error);
        alert("Error: " + error.message);
        resultBox.innerHTML = `<p style="color: red;">Failed to get summary. Please try again.</p>`;
        resultBox.style.display = "block";
      } finally {
        uploadButton.textContent = originalButtonText;
        uploadButton.disabled = false;
        codeFile.value = "";
      }
    };
    reader.readAsText(file);
});

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
// FAQ toggle functionality
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');

    question.addEventListener('click', () => {
        // Close other open items
        faqItems.forEach(i => {
            if (i !== item) {
                i.classList.remove('active');
            }
        });

        // Toggle current item
        item.classList.toggle('active');
    });
});

function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('show');
}

// --- Counter Animation for Companies ---
const companiesCounterElement = document.getElementById('companies-counter');
const targetCount = 100; // The '100+' in "100+ companies"
const duration = 2000; // milliseconds

const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(companiesCounterElement, targetCount, duration);
            observer.unobserve(entry.target); // Stop observing once animated
        }
    });
}, { threshold: 0.5 }); // Trigger when 50% of the counter section is visible

// Observe the counter section
const counterSection = document.querySelector('.counter-section');
if (counterSection) {
    counterObserver.observe(counterSection);
}

function animateCounter(element, target, duration) {
    let start = 0;
    const increment = target / (duration / 16); // ~60 frames per second

    const animate = () => {
        start += increment;
        if (start < target) {
            element.textContent = Math.ceil(start);
            requestAnimationFrame(animate);
        } else {
            element.textContent = target; // Ensure it ends exactly on target
        }
    };
    animate();
}
// Function that opens the box
function openUploadBox() {
  // Your existing code to make the box visible
  uploadBox.classList.remove("hidden");
  
  // This is the specific line you need to add to scroll
  uploadBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
