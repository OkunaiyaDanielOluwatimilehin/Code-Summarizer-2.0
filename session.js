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
  const getStartedButtonDesktop = document.getElementById('getStartedButton'); // Assuming this is for desktop
  const getStartedButtonMobile = document.getElementById('getStartedButton-mobile'); // For mobile

  const heroGuestActionsMobile = document.getElementById('user-guest-actions-mobile');

  async function handleSession(session) {
    const user = session?.user || null;

    if (user) {
      // User is logged in:
      // Hide all guest-related buttons
      if (loginSection) loginSection.style.display = 'none';
      if (heroGuestActionsMobile) heroGuestActionsMobile.style.display = 'none';

      // Show the user menu and 'Get Started' buttons
      if (userSection) userSection.style.display = 'flex';
      if (getStartedButtonDesktop) getStartedButtonDesktop.style.display = 'block'; // Or 'flex'
      if (getStartedButtonMobile) getStartedButtonMobile.style.display = 'block'; // Or 'flex'

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
      // Hide the user menu and 'Get Started' buttons
      if (userSection) userSection.style.display = 'none';
      if (getStartedButtonDesktop) getStartedButtonDesktop.style.display = 'none';
      if (getStartedButtonMobile) getStartedButtonMobile.style.display = 'none';

      // Show login/signup buttons based on screen size (handled by your CSS)
      if (loginSection) loginSection.style.display = 'flex';
      if (heroGuestActionsMobile) heroGuestActionsMobile.style.display = 'flex';
      if (usernameLabel) usernameLabel.textContent = "Hi, Guest";
    }
  }

  const { data } = await supabase.auth.getSession();
  await handleSession(data.session);

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