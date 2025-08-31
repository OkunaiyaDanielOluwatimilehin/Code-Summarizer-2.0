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

// --- Mobile Auth Buttons ---
function insertMobileAuthButtons() {
  const authContainer = document.querySelector('.auth-button');
  if (!authContainer) return;

  let existing = authContainer.querySelector('.mobile-auth-buttons');
  if (window.innerWidth < 1024) {
    if (!existing) {
      const div = document.createElement('div');
      div.className = 'mobile-auth-buttons';
      div.innerHTML = `
        <ul>
          <a href="./auth/login.html" class="btn-login-mobile">Login</a>
          <a href="./auth/signup.html" class="btn-primary-mobile">Sign Up</a>
        </ul>`;
      authContainer.appendChild(div);
    }
  } else if (existing) {
    existing.remove();
  }
}

// --- Main App ---
document.addEventListener("DOMContentLoaded", async () => {
  await Counter.init();

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
    avatarButton: document.getElementById('avatarButton'),
  };

  insertMobileAuthButtons();
  window.addEventListener("resize", insertMobileAuthButtons);

  // --- Result Display ---
  function showResult(text, isError = false) {
    const message = isError ? `<p style="color:red;">${text}</p>` : `<p>${text}</p>`;
    elements.resultBox.innerHTML = `
      <div class="summary-output">
        ${message}
        ${!isError ? `
          <div class="export-buttons">
            <button id="exportTxtBtn" class="export-btn">Export as .txt</button>
            <button id="exportReadmeBtn" class="export-btn">Export as README</button>
          </div>
          <button id="copySummaryBtn" class="copy-btn">Copy</button>
        ` : ''}
      </div>`;
    elements.resultBox.style.display = "block";
    elements.resultBox.scrollIntoView({ behavior: "smooth" });

    if (!isError) {
      const summaryText = text;
      document.getElementById("exportTxtBtn")?.addEventListener("click", () =>
        downloadFile(summaryText, "summary.txt", "text/plain")
      );
      document.getElementById("exportReadmeBtn")?.addEventListener("click", () =>
        downloadFile(`# Code Summary\n\n${summaryText}`, "README.md", "text/markdown")
      );
      const copyBtn = document.getElementById("copySummaryBtn");
      copyBtn?.addEventListener("click", () => {
        navigator.clipboard.writeText(summaryText);
        copyBtn.textContent = "Copied!";
        setTimeout(() => copyBtn.textContent = "Copy", 2000);
      });
    }
  }

  // --- Summarize (File or URL) ---
  async function summarize({ fileContent, url }) {
    if (fileContent && !Counter.canUpload()) return;

    const button = fileContent ? elements.uploadButton : elements.urlButton;
    const originalText = button.textContent;
    button.textContent = "Processing...";
    button.disabled = true;
    showResult(fileContent ? "⏳ Summarizing file..." : "⏳ Summarizing link...");

    try {
      const response = await fetch(fileContent ? '/api/summarize' : '/api/summarize-link.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fileContent ? { fileContent } : { url })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Server error.");

      showResult(data.summary);
    } catch (err) {
      console.error(err);
      showResult("❌ Failed to get summary. Please try again.", true);
    } finally {
      button.textContent = originalText;
      button.disabled = false;
      if (fileContent) elements.codeFile.value = "";
    }
  }

  elements.uploadButton?.addEventListener("click", () => {
    const file = elements.codeFile.files[0];
    if (!file) return alert("Please select a file first.");
    const reader = new FileReader();
    reader.onload = e => summarize({ fileContent: e.target.result });
    reader.readAsText(file);
  });

  elements.urlButton?.addEventListener("click", () => {
    const url = elements.urlInput.value.trim();
    if (!url) return showResult("⚠️ Please enter a valid link.", true);
    summarize({ url });
  });

  elements.codeFile?.addEventListener("change", () => {
    elements.uploadButton.textContent = elements.codeFile.files.length
      ? `Upload & Process (${elements.codeFile.files[0].name})`
      : "Upload & Process";
  });

  elements.closeUploadBox?.addEventListener("click", () => {
    elements.uploadBox.classList.remove("show");
    elements.getStartedButton.style.display = "inline-block";
    elements.resultBox.textContent = "";
    elements.resultBox.style.display = "none";
  });

  elements.getStartedButton?.addEventListener("click", () => {
    elements.getStartedButton.style.display = "none";
    elements.uploadBox.classList.add("show");
  });

  elements.avatarButton?.addEventListener('click', e => {
    e.preventDefault();
    localStorage.removeItem('authToken');
    window.location.href = '/';
  });

  // --- Typewriter Effect ---
  if (elements.typewriterText) {
    const phrases = [
      "Powered by cutting-edge AI.",
      "Making code accessible to everyone.",
      "Your ultimate code understanding companion.",
      "Efficient, accurate, and instant."
    ];
    let phraseIndex = 0, charIndex = 0, isDeleting = false;
    const typingSpeed = 100, deletingSpeed = 50, delayBetweenPhrases = 1500;

    const typeWriter = () => {
      const current = phrases[phraseIndex];
      elements.typewriterText.textContent = isDeleting
        ? current.substring(0, charIndex--)
        : current.substring(0, ++charIndex);

      if (!isDeleting && charIndex === current.length) {
        isDeleting = true;
        setTimeout(typeWriter, delayBetweenPhrases);
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(typeWriter, 500);
      } else {
        setTimeout(typeWriter, isDeleting ? deletingSpeed : typingSpeed);
      }
    };
    typeWriter();
  }

  // --- FAQ Toggle ---
  elements.faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question?.addEventListener('click', () => {
      elements.faqItems.forEach(i => i !== item && i.classList.remove('active'));
      item.classList.toggle('active');
    });
  });

  // --- Company Counter ---
  const target = 100;
  const duration = 2000;
  if (elements.companiesCounter) {
    let start = 0;
    const increment = target / (duration / 16);
    const animate = () => {
      start += increment;
      elements.companiesCounter.textContent = Math.min(Math.floor(start), target);
      if (start < target) requestAnimationFrame(animate);
    };
    animate();
  }
});
