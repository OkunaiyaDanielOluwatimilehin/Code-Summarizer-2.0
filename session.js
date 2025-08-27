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

  // Utility to update UI
  async function handleSession(session) {
    const user = session?.user || null;

    if (user) {
      loginSection?.classList.add("hidden");
      userSection?.classList.remove("hidden");

      // Fetch the username from the profiles table
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

  // Initial session check
  const { data } = await supabase.auth.getSession();
  handleSession(data.session);

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

document.addEventListener('DOMContentLoaded', () => {
  // This is a placeholder. In a real app, this should check for a token or session.
  // For this example, let's assume this function returns true if the user is logged in.
  function isLoggedIn() {
      return sessionStorage.getItem('isLoggedIn') === 'true';
  }

  const navGuestActions = document.getElementById('user-guest-actions');
  const navUserActions = document.getElementById('user-auth-actions');
  const heroGuestActionsMobile = document.getElementById('user-guest-actions-mobile');
  const getStartedButton = document.getElementById('getStartedButton');

  function updateUI() {
      if (isLoggedIn()) {
          // Logged-in state:
          // Hide all guest-related buttons
          if (navGuestActions) navGuestActions.style.display = 'none';
          if (heroGuestActionsMobile) heroGuestActionsMobile.style.display = 'none';

          // Show user-specific actions and the "Get Started" button
          if (navUserActions) navUserActions.style.display = 'flex';
          if (getStartedButton) getStartedButton.style.display = 'block';

          // You can also update the username here if needed
          const usernameLabel = document.getElementById('usernameLabel');
          if (usernameLabel) {
              const storedUsername = sessionStorage.getItem('username') || 'User';
              usernameLabel.textContent = `Hi, ${storedUsername}`;
          }

      } else {
          // Guest (not logged in) state:
          // Hide the user-specific actions and the "Get Started" button
          if (navUserActions) navUserActions.style.display = 'none';
          if (getStartedButton) getStartedButton.style.display = 'none';
          
          // Show the guest login/signup buttons based on screen size
          // The CSS media queries will handle which of these two is visible.
          if (navGuestActions) navGuestActions.style.display = 'flex'; // On desktop, CSS will show this
          if (heroGuestActionsMobile) heroGuestActionsMobile.style.display = 'flex'; // On mobile, CSS will show this
      }
  }

  // Call the function to set the initial UI state on page load
  updateUI();

  // Event listener for a hypothetical login action
  // You would call this function after a successful login.
  // Example: 
  // const successfulLogin = () => {
  //     sessionStorage.setItem('isLoggedIn', 'true');
  //     sessionStorage.setItem('username', 'Alex'); // Store username
  //     updateUI();
  // };

  // Event listener for the logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
          sessionStorage.removeItem('isLoggedIn');
          sessionStorage.removeItem('username');
          // Redirect to home page or update UI
          window.location.href = '/'; 
          updateUI();
      });
  }
});