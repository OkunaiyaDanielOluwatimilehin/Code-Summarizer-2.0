// --- Module import (works in the browser) ---
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---- CONFIG ----
const SUPABASE_URL = "https://obqmgqzjtvdzmcfvteyn.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Jjxl5hlVxOj1IeucdHKeXw_noPg319G";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---- UTIL: Toast + Debug ----
const DBG = true;
const log = (...a) => DBG && console.log("[auth]", ...a);
function showToast(msg, isError = false) {
  const el = document.getElementById("toast");
  if (!el) return console.error("Toast element missing");
  el.textContent = msg;
  el.style.background = isError ? "#e74c3c" : "#2ecc71";
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 3000);
}

// ---- PAGE DETECTION (no HTML edits needed) ----
const PATH = location.pathname.toLowerCase();
const IS_SIGNUP = PATH.includes("signup");
const IS_LOGIN = PATH.includes("login");
const IS_RESET = PATH.includes("forgot") || PATH.includes("reset");

// Grab the first <form> on the page (your pages each have one main form)
const form = document.querySelector("form");

// Common inputs (kept flexible to avoid requiring IDs)
const emailInput = form?.querySelector('input[type="email"]') || null;
// For signup page you may have 2 password inputs (password + confirm). We use the first.
const passwordInput = form?.querySelector('input[type="password"]') || null;

// ---- CORE FLOWS ----
async function signUpEmail() {
  if (!emailInput || !passwordInput) return showToast("Missing form inputs", true);

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  log("signUpEmail", email);
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    log("signUp error", error);
    return showToast(error.message, true);
  }

  // Most projects require email confirmation: no session yet.
  showToast("Check your email to confirm your account.");
  // After confirm the user will return and log in, so send them to login page.
  setTimeout(() => (window.location.href = "/auth/login.html"), 600);
}

async function loginEmail() {
  if (!emailInput || !passwordInput) return showToast("Missing form inputs", true);

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  log("loginEmail", email);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    log("login error", error);
    return showToast(error.message, true);
  }

  showToast("Login successful");
  await redirectAfterAuth();
}

async function resetPassword() {
  if (!emailInput) return showToast("Enter your email", true);
  const email = emailInput.value.trim();

  log("resetPassword", email);
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_ORIGIN}/update-password.html`, // page that sets the new password
  });
  if (error) return showToast(error.message, true);
  showToast("Reset link sent. Check your email.");
}

async function oauth(provider) {
  log("oauth", provider);
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: OAUTH_REDIRECT }, // optional: onboard directly after OAuth
  });
  if (error) showToast(error.message, true);
}

// ---- POST-AUTH ROUTING using profiles.onboarded ----
async function redirectAfterAuth() {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session) {
    // No session (e.g., email confirmation required). Go to login.
    log("No session after auth; redirecting to login");
    window.location.href = "/auth/login.html"; // or /login.html
    return;
  }

  const uid = session.session.user.id;

  // You MUST have a row-level policy that allows a user to select their own profile.
  // If you see "permission denied", fix your RLS policy for profiles.
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("onboarded")
    .eq("id", uid)
    .single();

  if (error) {
    log("profiles select error", error);
    // Fail-safe: send them to onboarding if we can't read the flag.
    window.location.href = "/onboarding/onboarding.html";
    return;
  }

  if (!profile?.onboarded) {
    window.location.href = "/index.html";
  } else {
    window.location.href = "/onboarding/onboarding.html";
  }
}

// ---- WIRE UP (no HTML changes required) ----
window.addEventListener("DOMContentLoaded", () => {
  log("auth.js loaded", { IS_SIGNUP, IS_LOGIN, IS_RESET, PATH });

  // Form submit binding based on page
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (IS_SIGNUP) return signUpEmail();
      if (IS_LOGIN) return loginEmail();
      if (IS_RESET) return resetPassword();
      showToast("Unknown page context", true);
    });
  } else {
    log("No <form> found on this page.");
  }

  // Social buttons (optional presence)
  document.querySelector(".btn.google")?.addEventListener("click", () => oauth("google"));
  document.querySelector(".btn.github")?.addEventListener("click", () => oauth("github"));
});
