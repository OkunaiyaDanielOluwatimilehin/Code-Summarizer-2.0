window.addEventListener("DOMContentLoaded", async () => {
  const supabase = window.supabase.createClient(
    "https://obqmgqzjtvdzmcfvteyn.supabase.co",
    "sb_publishable_Jjxl5hlVxOj1IeucdHKeXw_noPg319G"
  );

  const steps = document.querySelectorAll(".onboarding-step");
  let currentStep = 0;

  const usernameInput = document.getElementById("fullName");
  const generatedUsernameDisplay = document.getElementById("generated-username-display");
  const onboardingContainer = document.getElementById("onboarding-container");

  // 1. Get logged-in user and show a loading state
  // You can add a simple loading spinner here if you want.
  onboardingContainer.style.display = 'none';

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    alert("Please log in first.");
    window.location.href = "/auth/login.html";
    return;
  }

  // 2. Check if user is already onboarded
  const { data: existingProfile, error: profileFetchError } = await supabase
    .from("profiles")
    .select("onboarded")
    .eq("id", user.id)
    .single();

  if (profileFetchError) {
    console.error("Error fetching profile:", profileFetchError);
  }

  // 3. Conditional Redirection & Reveal
  if (existingProfile && existingProfile.onboarded === true) {
    window.location.href = "/index.html";
    return;
  }



  // Generate username based on email or random fallback
  function generateUsername(email) {
    if (!email) return "user" + Math.floor(Math.random() * 10000);
    const namePart = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
    return namePart || "user" + Math.floor(Math.random() * 10000);
  }

  // Initialize username field with generated username or from localStorage
  const savedUsername = localStorage.getItem("fullName");
  const generatedUsername = generateUsername(user.email);

  usernameInput.value = savedUsername || generatedUsername;
  generatedUsernameDisplay.textContent = `Suggested: ${generatedUsername}`;

  // Save username on input to localStorage
  usernameInput.addEventListener("input", () => {
    localStorage.setItem("fullName", usernameInput.value);
  });

  // Map fields per step for localStorage draft saving
  const fieldMap = {
    0: () => usernameInput,
    1: () => document.getElementById("role"),
    2: () => document.getElementById("language"),
  };

  // Restore other fields from localStorage
  Object.entries(fieldMap).forEach(([step, getField]) => {
    if (step == "0") return; // already handled username
    const field = getField();
    const saved = localStorage.getItem(field.id);
    if (saved) field.value = saved;
  });

  // Save draft for all fields
  Object.values(fieldMap).forEach((getField) => {
    const field = getField();
    field.addEventListener("input", () => {
      localStorage.setItem(field.id, field.value);
    });
  });

  // Navigation buttons event listeners
  document.querySelectorAll(".next-btn").forEach((btn) =>
    btn.addEventListener("click", nextStep)
  );

  document.querySelectorAll(".skip-btn").forEach((btn) =>
    btn.addEventListener("click", skipStep)
  );

  document.querySelectorAll(".back-btn").forEach((btn) =>
    btn.addEventListener("click", prevStep)
  );

  // ✅ Attach Finish button
  const finishBtn = document.getElementById("finish-onboarding");
  if (finishBtn) {
    finishBtn.addEventListener("click", submitOnboarding);
  }

  // Progress update
  function updateProgress() {
    const totalSteps = steps.length;
    const percentage = ((currentStep + 1) / totalSteps) * 100;
    document.getElementById("progress-fill").style.width = percentage + "%";
    document.getElementById("progress-text").textContent = `Step ${
      currentStep + 1
    } of ${totalSteps}`;
    document.querySelectorAll(".back-btn").forEach((btn) => {
      btn.style.display = currentStep === 0 ? "none" : "inline-block";
    });
  }

  // Navigation functions
  function goToStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= steps.length) return;
    steps[currentStep].classList.remove("active");
    currentStep = stepIndex;
    steps[currentStep].classList.add("active");
    updateProgress();
  }

  function nextStep() {
    const field = fieldMap[currentStep]?.();
    if (field && field.value.trim() === "") {
      alert("Please complete this step or press Skip.");
      return;
    }
    if (currentStep === steps.length - 1) {
      submitOnboarding();
    } else {
      goToStep(currentStep + 1);
    }
  }

  function skipStep() {
    if (currentStep === steps.length - 1) {
      submitOnboarding();
    } else {
      goToStep(currentStep + 1);
    }
  }

  function prevStep() {
    goToStep(currentStep - 1);
  }

  // ✅ Submit onboarding data into profiles table
  async function submitOnboarding() {
    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser();
    if (sessionError || !user) {
      alert("User not logged in. Please log in before submitting.");
      window.location.href = "/auth/login.html";
      return;
    }

    const profileData = {
      id: user.id,
      full_name: document.getElementById("fullName").value || null,
      role: document.getElementById("role").value || null,
      language: document.getElementById("language").value || null,
      username: document.getElementById("fullName").value || null,
      avatar_url: null,
      onboarded: true, // ✅ mark completed
    };

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(profileData, { onConflict: "id" });

    if (profileError) {
      alert("Error saving profile: " + profileError.message);
      return;
    }

    alert("Onboarding complete!");
  localStorage.clear();
  window.location.href = "/index.html"; // ✅ go home after finishing
  }
});
