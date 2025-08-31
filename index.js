import { Counter } from '/counter.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://obqmgqzjtvdzmcfvteyn.supabase.co',
  'sb_publishable_Jjxl5hlVxOj1IeucdHKeXw_noPg319G'
);

document.addEventListener("DOMContentLoaded", async () => {
  await Counter.init();

  // --- Elements ---
  const typewriterTextElement = document.getElementById("typewriter-text");
  const getStartedButton = document.getElementById("getStartedButton");
  const uploadBox = document.getElementById("uploadBox");
  const codeFile = document.getElementById("codeFile");
  const uploadButton = document.getElementById("uploadButton");
  const closeUploadBox = document.getElementById("closeUploadBox");
  const resultBox = document.getElementById("resultBox");
  const urlInput = document.getElementById("urlInput");

  // --- Typewriter ---
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

  // --- Render summary + buttons ---
  function renderSummary(summaryText) {
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

    // Copy
    document.getElementById("copySummaryBtn").addEventListener("click", () => {
      navigator.clipboard.writeText(summaryText)
        .then(() => alert("Copied!"))
        .catch(() => alert("Failed to copy text."));
    });

    // Export TXT
    document.getElementById("exportTxtBtn").addEventListener("click", () => {
      const blob = new Blob([summaryText], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "summary.txt";
      link.click();
      URL.revokeObjectURL(link.href);
    });

    // Export MD
    document.getElementById("exportMdBtn").addEventListener("click", () => {
      const blob = new Blob([summaryText], { type: "text/markdown" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "summary.md";
      link.click();
      URL.revokeObjectURL(link.href);
    });
  }

  // --- File Upload Handling ---
  uploadButton.addEventListener("click", async () => {
    if (!Counter.canUpload()) return;

    const file = codeFile.files[0];
    const url = urlInput.value.trim();
    const originalButtonText = uploadButton.textContent;
    uploadButton.textContent = "Processing...";
    uploadButton.disabled = true;

    try {
      let summaryText;

      if (file) {
        const fileContent = await new Promise((res, rej) => {
          const reader = new FileReader();
          reader.onload = e => res(e.target.result);
          reader.onerror = () => rej("File read error");
          reader.readAsText(file);
        });

        const response = await fetch('/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileContent })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Server error");
        summaryText = data.summary;
      } else if (url) {
        const response = await fetch('/api/summarize-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Server error");
        summaryText = data.summary;
      } else {
        alert("Select a file or paste a URL first.");
        return;
      }

      renderSummary(summaryText);

    } catch (err) {
      console.error(err);
      resultBox.innerHTML = `<p style="color:red;">❌ Failed to summarize. Try again.</p>`;
      resultBox.style.display = "block";
    } finally {
      uploadButton.textContent = originalButtonText;
      uploadButton.disabled = false;
      codeFile.value = "";
    }
  });

  // --- Show file name ---
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
  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-question').addEventListener('click', () => {
      document.querySelectorAll('.faq-item').forEach(i => { if(i !== item) i.classList.remove('active'); });
      item.classList.toggle('active');
    });
  });

  // --- Mobile Menu ---
  document.querySelector(".nav-toggle").addEventListener("click", () => {
    document.querySelector(".mobile-menu").classList.toggle("show");
  });
});
