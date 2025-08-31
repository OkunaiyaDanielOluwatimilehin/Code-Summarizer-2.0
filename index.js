import { Counter } from './counter.js';
import './supabase.js';

// --- Global helper function for file downloads ---
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --- Main application logic ---
document.addEventListener("DOMContentLoaded", async () => {
  // --- Initialize Services ---
  await Counter.init();

  // --- Element References ---
  const elements = {
    typewriterText: document.getElementById("typewriter-text"),
    getStartedButton: document.getElementById("getStartedButton"),
    uploadBox: document.getElementById("uploadBox"),
    codeFile: document.getElementById("codeFile"),
    uploadButton: document.getElementById("uploadButton"),
    closeUploadBox: document.getElementById("closeUploadBox"),
    resultBox: document.getElementById("resultBox"),
    urlInput: document.getElementById("urlInput"),
    urlButton: document.getElementById("urlButton"),
    companiesCounter: document.getElementById('companies-counter'),
    counterSection: document.querySelector('.counter-section'),
    faqItems: document.querySelectorAll('.faq-item'),
    mobileMenu: document.querySelector(".mobile-menu"),
    avatarButton: document.getElementById('avatarButton'),
  };

  // --- Utility Functions ---
  function showResult(text, isError = false) {
    const message = isError ? `<p style="color: red;">${text}</p>` : `<p>${text}</p>`;
    elements.resultBox.innerHTML = `
      <div class="summary-output">
        ${message}
        ${isError ? '' : `
          <div class="export-buttons">
            <button id="exportTxtBtn" class="export-btn">Export as .txt</button>
            <button id="exportReadmeBtn" class="export-btn">Export as README</button>
          </div>
        `}
      </div>
    `;
    elements.resultBox.style.display = "block";
    elements.resultBox.scrollIntoView({ behavior: "smooth" });
  }

  function setupExportButtons(summaryText) {
    const exportTxtBtn = document.getElementById("exportTxtBtn");
    const exportReadmeBtn = document.getElementById("exportReadmeBtn");

    if (exportTxtBtn) {
      exportTxtBtn.addEventListener("click", () => downloadFile(summaryText, "summary.txt", "text/plain"));
    }

    if (exportReadmeBtn) {
      exportReadmeBtn.addEventListener("click", () => {
        const readmeContent = `# Code Summary\n\n${summaryText}`;
        downloadFile(readmeContent, "README.md", "text/markdown");
      });
    }
  }

  // --- Function to handle all file-related logic ---
  async function handleFileUpload() {
    if (!Counter.canUpload()) return;

    const file = elements.codeFile.files[0];
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const originalButtonText = elements.uploadButton.textContent;
    elements.uploadButton.textContent = "Processing...";
    elements.uploadButton.disabled = true;

    try {
      const fileContent = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.readAsText(file);
      });

      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileContent })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Server error.');

      showResult(data.summary);
      setupExportButtons(data.summary); // Pass summaryText to setup function

    } catch (error) {
      console.error("Error summarizing code:", error);
      showResult("❌ Failed to get summary. Please try again.", true);
    } finally {
      elements.uploadButton.textContent = originalButtonText;
      elements.uploadButton.disabled = false;
      elements.codeFile.value = "";
    }
  }

  // --- Function to handle all URL-related logic ---
  async function handleUrlSummary() {
    const url = elements.urlInput.value.trim();
    if (!url) {
      showResult("⚠️ Please enter a valid link.", true);
      return;
    }

    const originalButtonText = elements.urlButton.textContent;
    elements.urlButton.textContent = "Processing...";
    elements.urlButton.disabled = true;
    showResult("⏳ Summarizing link...");

    try {
      const response = await fetch('/api/summarize-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Server error.');

      showResult(data.summary);
      setupExportButtons(data.summary); // Pass summaryText to setup function

    } catch (error) {
      console.error("Error summarizing link:", error);
      showResult("❌ Failed to get summary. Please try again.", true);
    } finally {
      elements.urlButton.textContent = originalButtonText;
      elements.urlButton.disabled = false;
    }
  }

  // --- Event Listeners ---
  elements.getStartedButton.addEventListener("click", () => {
    elements.getStartedButton.style.display = "none";
    elements.uploadBox.classList.add("show");
  });

  elements.uploadButton.addEventListener("click", handleFileUpload);
  elements.codeFile.addEventListener("change", () => {
    elements.uploadButton.textContent = elements.codeFile.files.length
      ? `Upload & Process (${elements.codeFile.files[0].name})`
      : "Upload & Process";
  });

  elements.closeUploadBox.addEventListener("click", () => {
    elements.uploadBox.classList.remove("show");
    elements.getStartedButton.style.display = "inline-block";
    elements.resultBox.textContent = "";
    elements.resultBox.style.display = "none";
  });

  if (elements.urlButton) {
    elements.urlButton.addEventListener("click", handleUrlSummary);
  }

  if (elements.avatarButton) {
    elements.avatarButton.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('authToken');
      window.location.href = '/';
    });
  }

  // --- Typewriter Effect Logic ---
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
    elements.typewriterText.textContent = isDeleting ?
      currentPhrase.substring(0, charIndex--) :
      currentPhrase.substring(0, ++charIndex);

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
  if (elements.typewriterText) typeWriterEffect();

  // --- FAQ toggle ---
  elements.faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      elements.faqItems.forEach(i => { if (i !== item) i.classList.remove('active'); });
      item.classList.toggle('active');
    });
  });

// --- Company counter animation outside DOMContentLoaded ---
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
});