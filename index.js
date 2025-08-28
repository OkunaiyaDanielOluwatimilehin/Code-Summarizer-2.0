document.addEventListener("DOMContentLoaded", () => {
  const typewriterTextElement = document.getElementById("typewriter-text");
  const getStartedButton = document.getElementById("getStartedButton");
  const uploadBox = document.getElementById("uploadBox");
  const codeFile = document.getElementById("codeFile");
  const uploadButton = document.getElementById("uploadButton");
  const resultBox = document.getElementById("resultBox");

  // --- Upload Limits Constants ---
  const MAX_GUEST_UPLOADS = 1;
  const MAX_AUTHENTICATED_UPLOADS = 10;

  // --- Auth State & Usage Count ---
  let isAuthenticated = false; // Update this based on your login check
  let uploadCount = 0;
  if (!isAuthenticated) {
    uploadCount = parseInt(localStorage.getItem("guestUploadCount")) || 0;
  }

  function canUpload() {
    if (isAuthenticated) {
      return uploadCount < MAX_AUTHENTICATED_UPLOADS;
    } else {
      return uploadCount < MAX_GUEST_UPLOADS;
    }
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

  // --- File Upload Handling with Limits ---
  uploadButton.addEventListener("click", async () => {
    if (!canUpload()) {
      alert(isAuthenticated
        ? `You have reached your ${MAX_AUTHENTICATED_UPLOADS} uploads limit.`
        : `Guests can only upload ${MAX_GUEST_UPLOADS} file(s). Please sign up to continue.`);
      return;
    }

    const file = codeFile.files[0];
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    // Loading state
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
          body: JSON.stringify({ fileContent }),
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

        // Copy button
        const copyBtn = document.getElementById("copySummaryBtn");
        copyBtn?.addEventListener("click", () => {
          navigator.clipboard.writeText(summaryText).then(() => {
            copyBtn.textContent = "Copied!";
            setTimeout(() => copyBtn.textContent = "Copy", 2000);
          });
        });

        // Increment usage count
        uploadCount++;
        if (!isAuthenticated) localStorage.setItem('guestUploadCount', uploadCount);

      } catch (error) {
        console.error("Error summarizing code:", error);
        resultBox.innerHTML = `<p style="color:red;">Failed to get summary. Please try again.</p>`;
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

  function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('show');
  }

  // --- Counter Animation ---
  const companiesCounterElement = document.getElementById('companies-counter');
  const targetCount = 100; 
  const duration = 2000; 

  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(companiesCounterElement, targetCount, duration);
        observer.unobserve(entry.target); 
      }
    });
  }, { threshold: 0.5 }); 

  const counterSection = document.querySelector('.counter-section');
  if (counterSection) counterObserver.observe(counterSection);

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

  // --- Upload box scroll function ---
  function openUploadBox() {
    uploadBox.classList.remove("hidden");
    uploadBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  const navToggle = document.querySelector(".nav-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  navToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("show");
  });
});
