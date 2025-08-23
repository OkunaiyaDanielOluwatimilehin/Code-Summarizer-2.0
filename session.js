import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://obqmgqzjtvdzmcfvteyn.supabase.co',
  'ssb_publishable_Jjxl5hlVxOj1IeucdHKeXw_noPg319G'
);

document.addEventListener('DOMContentLoaded', async () => {
  const loginSection = document.getElementById("user-guest-actions"); // Logged out UI (ID)
  const userSection = document.getElementById("user-auth-actions"); // Logged in UI (Class)
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const usernameLabel = document.getElementById("usernameLabel");
  const avatarButton = document.getElementById("avatarButton");
  const userDropdown = document.getElementById("userDropdown");
  const logoutBtn = document.getElementById("logoutBtn");

  // Session check
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("Session fetch error:", sessionError);
  }

  const user = session?.user || null;

  if (user) {
    // Show user UI, hide login/signup
    loginSection?.classList.add("hidden");
    userSection?.classList.remove("hidden");

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.warn("Profile fetch error:", profileError);
      }

      const username = profile?.username || user.email?.split("@")[0] || "User";
      if (usernameLabel) {
        usernameLabel.textContent = `Hi, ${username}`;
      }

    } catch (err) {
      console.error("Unexpected profile error:", err);
    }

    // Logout handler (Desktop and Mobile)
    logoutBtn?.addEventListener("click", async (e) => {
      e.preventDefault();
      await supabase.auth.signOut();
      window.location.href = "/index.html";
    });

    // Avatar button logic (toggle dropdown or logout on mobile)
    let dropdownOpen = false;

    avatarButton?.addEventListener("click", async () => {
      if (window.innerWidth <= 768) {
        await supabase.auth.signOut();
        window.location.href = "/index.html";
        return;
      }

      dropdownOpen = !dropdownOpen;
      if (dropdownOpen) {
        userDropdown?.classList.remove("hidden");
        requestAnimationFrame(() => userDropdown?.classList.add("show"));
      } else {
        userDropdown?.classList.remove("show");
        setTimeout(() => userDropdown?.classList.add("hidden"), 200);
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!avatarButton?.contains(e.target) && !userDropdown?.contains(e.target)) {
        userDropdown?.classList.remove("show");
        setTimeout(() => userDropdown?.classList.add("hidden"), 200);
        dropdownOpen = false;
      }
    });

  } else {
    // Not logged in: show login/signup, hide user section
    loginSection?.classList.remove("hidden");
    userSection?.classList.add("hidden");
    if (usernameLabel) {
      usernameLabel.textContent = "Hi, Guest";
    }
  }
});
