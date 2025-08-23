import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://obqmgqzjtvdzmcfvteyn.supabase.co',
  'sb_publishable_Jjxl5hlVxOj1IeucdHKeXw_noPg319G'
);

document.addEventListener('DOMContentLoaded', () => {
  // === Signup form ===
  document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value.trim();

    if (!email || !password) {
      showToast("Email and password are required.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      showToast("Error: " + error.message);
      return;
    }

    showToast("Signup successful! Redirecting...");
    setTimeout(() => {
      window.location.href = "/onboarding/onboarding.html";
    }, 1500);
  });

  // === Login form ===
  document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!email || !password) {
      showToast("Email and password are required.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      showToast("Login failed: " + error.message);
      return;
    }

    showToast("Login successful! Redirecting...");
    setTimeout(() => {
      window.location.href = "/summary/summary.html";
    }, 1500);
  });

  // === Google OAuth ===
  document.getElementById('googleSignIn')?.addEventListener('click', async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}./index.html`
      }
    });
  });

  // === GitHub OAuth ===
  document.getElementById('github-login')?.addEventListener('click', async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}./index.html`
      }
    });
  });

  // === Toast utility ===
  function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }

  // === Auto-login redirect (used only on login/signup pages) ===
  (async () => {
    const currentPath = window.location.pathname;
    const isAuthPage = currentPath.includes("login") || currentPath.includes("signup");

    const { data: { user } } = await supabase.auth.getUser();

    if (user && isAuthPage) {
      // Already signed in and on login/signup → redirect to dashboard
      window.location.href = "/summary/summary.html";
    }
  })();

  function setupPasswordToggle(passwordInputId, toggleIconId) {
    const passwordInput = document.getElementById(passwordInputId);
    const toggleIcon = document.getElementById(toggleIconId);

    toggleIcon.addEventListener('click', () => {
      const isPasswordVisible = passwordInput.type === 'text';
      passwordInput.type = isPasswordVisible ? 'password' : 'text';
      toggleIcon.classList.toggle('fa-eye');
      toggleIcon.classList.toggle('fa-eye-slash');
    });
  }

  // Initialize toggles for both forms
  setupPasswordToggle('login-password', 'toggle-login-password');
  setupPasswordToggle('signup-password', 'toggle-signup-password');
});
