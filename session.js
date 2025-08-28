import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://obqmgqzjtvdzmcfvteyn.supabase.co',
  'sb_publishable_Jjxl5hlVxOj1IeucdHKeXw_noPg319G'
);

document.addEventListener('DOMContentLoaded', async () => {
  const usernameLabel = document.getElementById('usernameLabel');
  const avatarButton = document.getElementById('avatarButton');
  const navActions = document.querySelector('.nav-actions'); // desktop login/signup
  const mobileLogin = document.querySelector('.mobile-menu .btn-login');
  const mobileSignup = document.querySelector('.mobile-menu .btn-primary');

  async function updateUI(session) {
    const user = session?.user || null;

    if (user) {
      // Show logout button
      avatarButton.style.display = 'flex';

      // Hide guest buttons
      navActions.style.display = 'none';
      if (mobileLogin) mobileLogin.style.display = 'none';
      if (mobileSignup) mobileSignup.style.display = 'none';

      // Show username
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
        const username = profile?.username || user.email?.split('@')[0] || 'User';
        usernameLabel.textContent = `Hi, ${username}`;
      } catch {
        usernameLabel.textContent = 'Hi, User';
      }

    } else {
      // Guest view: show signup/login
      avatarButton.style.display = 'none';
      navActions.style.display = 'flex';
      if (mobileLogin) mobileLogin.style.display = 'block';
      if (mobileSignup) mobileSignup.style.display = 'block';
      usernameLabel.textContent = 'Hi, Guest';
    }
  }

  // Initial load
  const { data: { session } } = await supabase.auth.getSession();
  await updateUI(session);

  // Listen for auth changes
  supabase.auth.onAuthStateChange((_event, session) => updateUI(session));

  // Logout on click
  avatarButton.addEventListener('click', async () => {
    await supabase.auth.signOut();
    await updateUI(null); // show guest view immediately
  });
});
