import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://obqmgqzjtvdzmcfvteyn.supabase.co',
  'sb_publishable_Jjxl5hlVxOj1IeucdHKeXw_noPg319G'
);

document.addEventListener('DOMContentLoaded', async () => {
  const usernameLabel = document.getElementById('usernameLabel');
  const avatarButton = document.getElementById('avatarButton');
  
  // Desktop Selectors
  const navActions = document.querySelector('.nav-actions');

  // Mobile Selector (the container for the mobile buttons)
  const mobileAuthButtons = document.querySelector('.mobile-auth-buttons');

  async function updateUI(session) {
    const user = session?.user || null;

    if (user) {
      // Logic for when the user is LOGGED IN

      // Desktop logic
      if (navActions) {
        navActions.style.display = 'none'; // Hides desktop login/signup
      }
      if (avatarButton) {
        avatarButton.style.display = 'flex'; // Shows desktop logout
      }

      // Mobile logic
      if (mobileAuthButtons) {
        mobileAuthButtons.style.display = 'none'; // Hides mobile login/signup
      }

      // Update username label
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
        const username = profile?.username || user.email?.split('@')[0] || 'User';
        if (usernameLabel) usernameLabel.textContent = `Hi, ${username}`;
      } catch {
        if (usernameLabel) usernameLabel.textContent = 'Hi, User';
      }

    } else {
      // Logic for when the user is LOGGED OUT (Guest)

      // Desktop logic
      if (navActions) {
        navActions.style.display = 'flex'; // Shows desktop login/signup
      }
      if (avatarButton) {
        avatarButton.style.display = 'none'; // Hides desktop logout
      }
      
      // Mobile logic
      if (mobileAuthButtons) {
        // You can use 'block', 'flex', etc. depending on your CSS
        mobileAuthButtons.style.display = 'block'; 
      }
      
      if (usernameLabel) usernameLabel.textContent = 'Hi, Guest';
    }
  }

  // Initial load
  const { data: { session } } = await supabase.auth.getSession();
  await updateUI(session);

  // Listen for auth changes
  supabase.auth.onAuthStateChange((_event, session) => updateUI(session));

  // Logout on click
  if (avatarButton) {
      avatarButton.addEventListener('click', async () => {
          await supabase.auth.signOut();
          await updateUI(null); // Immediately show guest view
      });
  }
});