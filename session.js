import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://obqmgqzjtvdzmcfvteyn.supabase.co',
  'sb_publishable_Jjxl5hlVxOj1IeucdHKeXw_noPg319G'
);

// This function now runs as soon as the script is loaded,
// preventing the onboarding page from flashing.
async function checkAndRedirectOnboarding() {
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarded')
      .eq('id', user.id)
      .single();

    if (profile && profile.onboarded === false) {
      if (window.location.pathname !== "/onboarding.html") {
        window.location.href = "/onboarding.html";
        return;
      }
    }
  }

  // Rest of the DOMContentLoaded logic now runs after this initial check
  document.addEventListener('DOMContentLoaded', async () => {
    const loginSection = document.getElementById("user-guest-actions");
    const userSection = document.getElementById("user-auth-actions");
    const usernameLabel = document.getElementById("usernameLabel");
    const avatarButton = document.getElementById("avatarButton");
    const userDropdown = document.getElementById("userDropdown");
    const logoutBtn = document.getElementById("logoutBtn");

    async function handleSession(session) {
      const user = session?.user || null;
      if (user) {
        loginSection?.classList.add("hidden");
        userSection?.classList.remove("hidden");
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
        const username = profile?.username || user.email?.split("@")[0] || "User";
        if (usernameLabel) usernameLabel.textContent = `Hi, ${username}`;
      } else {
        loginSection?.classList.remove("hidden");
        userSection?.classList.add("hidden");
        if (usernameLabel) usernameLabel.textContent = "Hi, Guest";
      }
    }

    const { data } = await supabase.auth.getSession();
    handleSession(data.session);

    supabase.auth.onAuthStateChange((event, session) => {
      handleSession(session);
    });

    logoutBtn?.addEventListener("click", async (e) => {
      e.preventDefault();
      await supabase.auth.signOut();
      window.location.href = "/index.html";
    });

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

    document.addEventListener("click", (e) => {
      if (!avatarButton?.contains(e.target) && !userDropdown?.contains(e.target)) {
        userDropdown?.classList.remove("show");
        setTimeout(() => userDropdown?.classList.add("hidden"), 200);
        dropdownOpen = false;
      }
    });
  });
}

checkAndRedirectOnboarding();