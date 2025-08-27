import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://obqmgqzjtvdzmcfvteyn.supabase.co',
  'sb_publishable_Jjxl5hlVxOj1IeucdHKeXw_noPg319G'
);

document.addEventListener('DOMContentLoaded', async () => {
  const loginSection = document.getElementById("user-guest-actions");
  const userSection = document.getElementById("user-auth-actions");
  const usernameLabel = document.getElementById("usernameLabel");
  const avatarButton = document.getElementById("avatarButton");
  const userDropdown = document.getElementById("userDropdown");
  const logoutBtn = document.getElementById("logoutBtn");
  const getStartedButton = document.getElementById('getStartedButton');

  // New element references for the mobile hero buttons
  const heroGuestActionsMobile = document.getElementById('user-guest-actions-mobile');

  // Utility to update UI
  async function handleSession(session) {
    const user = session?.user || null;

    if (user) {
      // User is logged in:
      // Hide login/signup buttons on nav and hero
      if (loginSection) loginSection.style.display = 'none';
      if (heroGuestActionsMobile) heroGuestActionsMobile.style.display = 'none';

      // Show the user menu and 'Get Started' button
      if (userSection) userSection.style.display = 'flex';
      if (getStartedButton) getStartedButton.style.display = 'block';

      // Fetch the username from the profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      const username = profile?.username || user.email?.split("@")[0] || "User";
      if (usernameLabel) usernameLabel.textContent = `Hi, ${username}`;

    } else {
      // User is not logged in:
      // Hide the user menu and 'Get Started' button
      if (userSection) userSection.style.display = 'none';
      if (getStartedButton) getStartedButton.style.display = 'none';

      // Show login/signup buttons based on screen size (handled by your CSS)
      if (loginSection) loginSection.style.display = 'flex'; // Nav buttons for desktop
      if (heroGuestActionsMobile) heroGuestActionsMobile.style.display = 'flex'; // Hero buttons for mobile
      if (usernameLabel) usernameLabel.textContent = "Hi, Guest";
    }
  }

  // Initial session check
  const { data } = await supabase.auth.getSession();
  await handleSession(data.session);

  // Watch for changes
  supabase.auth.onAuthStateChange((event, session) => {
    handleSession(session);
  });

  // Logout
  logoutBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    await supabase.auth.signOut();
    window.location.href = "/index.html";
  });

  // Dropdown toggle
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

  // Close dropdown on outside click
  document.addEventListener("click", (e) => {
    if (!avatarButton?.contains(e.target) && !userDropdown?.contains(e.target)) {
      userDropdown?.classList.remove("show");
      setTimeout(() => userDropdown?.classList.add("hidden"), 200);
      dropdownOpen = false;
    }
  });
});