document.addEventListener("DOMContentLoaded", async () => {
  const typewriterTextElement = document.getElementById("typewriter-text");
  const getStartedButton = document.getElementById("getStartedButton");
  const uploadBox = document.getElementById("uploadBox");
  const codeFile = document.getElementById("codeFile");
  const uploadButton = document.getElementById("uploadButton");

  let isAuthenticated = false;
  let user = null;

  // --- Check session and setup UI ---
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      isAuthenticated = true;
      user = data.session.user;

      // Setup logged-in avatar
      const avatarButton = document.getElementById("avatarButton");
      if (avatarButton) {
        avatarButton.style.display = "block";
        avatarButton.textContent = `Hi, ${user.email.split("@")[0]}`;
      }

      // Remove guest nav actions
      const navActions = document.querySelector(".nav-actions");
      if (navActions) navActions.remove();
    }
  } catch (err) {
    console.error("Error fetching session:", err);
    isAuthenticated = false; // fallback guest
  }

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
      const resultBox = document.getElementById("resultBox");

      try {
        const response = await fetch('/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileContent: fileContent }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Server error');

        const summaryText = data.summary;

        resultBox.innerHTML = `
          <div class="summary-output">
            <p>${summaryText}</p>
            <button id="copySummaryBtn" class="copy-btn">Copy</button>
          </div>
        `;
        resultBox.style.display = "block";
        resultBox.scrollIntoView({ behavior: "smooth" });

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

  // --- Show file name on selection ---
  codeFile.addEventListener("change", () => {
    if (codeFile.files.length) {
      uploadButton.textContent = "Upload & Process (" + codeFile.files[0].name + ")";
    } else {
      uploadButton.textContent = "Upload & Process";
    }
  });

  // --- Close upload box ---
  const closeUploadBox = document.getElementById("closeUploadBox");
  closeUploadBox.addEventListener("click", () => {
    uploadBox.classList.remove("show");
    getStartedButton.style.display = "inline-block";
    const resultBox = document.getElementById("resultBox");
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
});
