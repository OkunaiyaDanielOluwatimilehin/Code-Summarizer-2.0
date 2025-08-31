import { Counter } from './counter.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://obqmgqzjtvdzmcfvteyn.supabase.co',
  'sb_publishable_Jjxl5hlVxOj1IeucdHKeXw_noPg319G'
);

document.addEventListener("DOMContentLoaded", async () => {
  // --- Initialize counter logic ---
  await Counter.init();

  // --- Elements ---
  const typewriterTextElement = document.getElementById("typewriter-text");
  const getStartedButton = document.getElementById("getStartedButton");
  const uploadBox = document.getElementById("uploadBox");
  const codeFile = document.getElementById("codeFile");
  const uploadButton = document.getElementById("uploadButton");
  const closeUploadBox = document.getElementById("closeUploadBox");
  const resultBox = document.getElementById("resultBox");

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
    getStartedButton.style.display = "none";
    uploadBox.classList.add("show");
  });

  // --- File Upload Handling ---
  uploadButton.addEventListener("click", async () => {
    if (!Counter.canUpload()) return; // Prevent if guest/user limit reached

    const file = codeFile.files[0];
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const originalButtonText = uploadButton.textContent;
    uploadButton.textContent = "Processing...";
    uploadButton.disabled = true;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const fileContent = e.target.result;

      try {
        const response = await fetch('/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileContent })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.message || 'Server error.');

        const summaryText = data.summary;

        resultBox.innerHTML = `
          <div class="summary-output">
            <p>${summaryText}</p>
            <button id="copySummaryBtn" class="copy-btn">Copy</button>
            <button id="exportTxtBtn" class="copy-btn">Export TXT</button>
            <button id="exportMdBtn" class="copy-btn">Export MD</button>
          </div>
        `;
        resultBox.style.display = "block";
        resultBox.scrollIntoView({ behavior: "smooth" });

        // Copy button
        const copyBtn = document.getElementById("copySummaryBtn");
        if (copyBtn) {
          copyBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(summaryText)
              .then(() => {
                copyBtn.textContent = "Copied!";
                setTimeout(() => copyBtn.textContent = "Copy", 2000);
              })
              .catch(() => alert("Failed to copy text."));
          });
        }

      } catch (error) {
        console.error("Error summarizing code:", error);
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

  // Export TXT button
const exportTxtBtn = document.createElement("button");
exportTxtBtn.textContent = "Export TXT";
exportTxtBtn.className = "copy-btn";
exportTxtBtn.addEventListener("click", () => {
  const blob = new Blob([summaryText], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "summary.txt";
  link.click();
  URL.revokeObjectURL(link.href);
});

// Export MD button
const exportMdBtn = document.createElement("button");
exportMdBtn.textContent = "Export MD";
exportMdBtn.className = "copy-btn";
exportMdBtn.addEventListener("click", () => {
  const blob = new Blob([summaryText], { type: "text/markdown" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "summary.md";
  link.click();
  URL.revokeObjectURL(link.href);
});

// Append both buttons to the summary-output container
const summaryContainer = resultBox.querySelector(".summary-output");
if (summaryContainer) {
  summaryContainer.appendChild(exportTxtBtn);
  summaryContainer.appendChild(exportMdBtn);
}


  // --- Show file name on selection ---
  codeFile.addEventListener("change", () => {
    uploadButton.textContent = codeFile.files.length
      ? `Upload & Process (${codeFile.files[0].name})`
      : "Upload & Process";
  });

  // --- Close Upload Box ---
  closeUploadBox.addEventListener("click", () => {
    uploadBox.classList.remove("show");
    getStartedButton.style.display = "inline-block";
    resultBox.textContent = "";
    resultBox.style.display = "none";
  });

  // --- FAQ toggle ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      faqItems.forEach(i => { if (i !== item) i.classList.remove('active'); });
      item.classList.toggle('active');
    });
  });

  // --- Mobile Menu ---
  const navToggle = document.querySelector(".nav-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  navToggle.addEventListener("click", () => mobileMenu.classList.toggle("show"));
});
// --- Company counter animation ---
  const companiesCounterElement = document.getElementById('companies-counter');
  const targetCount = 100;
  const duration = 2000;

  function animateCounter(element, target, duration) {
    let start = 0;
    const increment = target / (duration / 16);
    const animate = () => {
      start += increment;
      element.textContent = start < target ? Math.ceil(start) : target;
      if (start < target) requestAnimationFrame(animate);
    };
    animate();
  }

  const counterSection = document.querySelector('.counter-section');
  if (counterSection && companiesCounterElement) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(companiesCounterElement, targetCount, duration);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counterObserver.observe(counterSection);
  }

    // --- URL Summarization Handling ---
const urlInput = document.getElementById("urlInput");

if (uploadButton) {
  uploadButton.addEventListener("click", async () => {
    const url = urlInput.value.trim();
    if (!url) {
      resultBox.innerHTML = "<p style='color:red;'>⚠️ Please enter a valid link.</p>";
      resultBox.style.display = "block";
      return;
    }

    const originalButtonText = uploadButton.textContent;
    uploadButton.textContent = "Processing...";
    uploadButton.disabled = true;
    resultBox.innerHTML = "<p>⏳ Summarizing link...</p>";
    resultBox.style.display = "block";

    try {
      const response = await fetch('/api/summarize-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Server error.');

      const summaryText = data.summary;

      resultBox.innerHTML = `
        <div class="summary-output">
          <p>${summaryText}</p>
          <button id="copySummaryBtn" class="copy-btn">Copy</button>
            <button id="exportTxtBtn" class="copy-btn">Export TXT</button>
            <button id="exportMdBtn" class="copy-btn">Export MD</button>
        </div>
      `;
      resultBox.scrollIntoView({ behavior: "smooth" });

      // Copy button
      const copyBtn = document.getElementById("copySummaryBtn");
      if (copyBtn) {
        copyBtn.addEventListener("click", () => {
          navigator.clipboard.writeText(summaryText)
            .then(() => {
              copyBtn.textContent = "Copied!";
              setTimeout(() => copyBtn.textContent = "Copy", 2000);
            })
            .catch(() => alert("Failed to copy text."));
        });
      }

    } catch (error) {
      console.error("Error summarizing link:", error);
      resultBox.innerHTML = `<p style="color:red;">❌ Failed to get summary. Please try again.</p>`;
    } finally {
      uploadButton.textContent = originalButtonText;
      uploadButton.disabled = false;
    }
  });

  // Export TXT button
const exportTxtBtn = document.createElement("button");
exportTxtBtn.textContent = "Export TXT";
exportTxtBtn.className = "copy-btn";
exportTxtBtn.addEventListener("click", () => {
  const blob = new Blob([summaryText], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "summary.txt";
  link.click();
  URL.revokeObjectURL(link.href);
});

// Export MD button
const exportMdBtn = document.createElement("button");
exportMdBtn.textContent = "Export MD";
exportMdBtn.className = "copy-btn";
exportMdBtn.addEventListener("click", () => {
  const blob = new Blob([summaryText], { type: "text/markdown" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "summary.md";
  link.click();
  URL.revokeObjectURL(link.href);
});

// Append both buttons to the summary-output container
const summaryContainer = resultBox.querySelector(".summary-output");
if (summaryContainer) {
  summaryContainer.appendChild(exportTxtBtn);
  summaryContainer.appendChild(exportMdBtn);
}

}
