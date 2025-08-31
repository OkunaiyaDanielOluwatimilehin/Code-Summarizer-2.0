import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
    'https://obqmgqzjtvdzmcfvteyn.supabase.co',
    'sb_publishable_Jjxl5hlVxOj1IeucdHKeXw_noPg319G'
);

document.addEventListener('DOMContentLoaded', async () => {
    const usernameLabel = document.getElementById('usernameLabel');
    const avatarButton = document.getElementById('avatarButton');
    const navBar = document.getElementById('navBar');
    
    // Desktop Selectors
    const navActions = document.querySelector('.nav-actions');

    // Mobile Selector (the container for the mobile buttons)
    const mobileAuthButtons = document.querySelector('.mobile-auth-buttons');
    const authContainer = document.querySelector('.auth-button');

    /**
     * Dynamically inserts or removes mobile authentication buttons based on
     * screen size and user login status. This is called by the updateUI function.
     */
    function manageMobileAuthButtons(isLoggedIn) {
        const isMobile = window.innerWidth < 1024;
        const existingButtons = document.querySelector('.mobile-auth-buttons');
        
        if (isMobile && !isLoggedIn) {
            // On mobile and not logged in, insert the buttons if they don't exist.
            if (!existingButtons) {
                const div = document.createElement('div');
                div.className = 'mobile-auth-buttons';
                div.innerHTML = `
                    <ul>
                        <a href="./auth/login.html" class="btn-login-mobile">Login</a>
                        <a href="./auth/signup.html" class="btn-primary-mobile">Sign Up</a>
                    </ul>
                `;
                if (authContainer) {
                    authContainer.appendChild(div);
                }
            }
        } else {
            // On desktop, or if the user is logged in, remove the buttons.
            if (existingButtons) {
                existingButtons.remove();
            }
        }
    }

    async function updateUI(session) {
        const user = session?.user || null;
        const isLoggedIn = !!user; // Check if user exists

        // Call the function to manage mobile buttons
        manageMobileAuthButtons(isLoggedIn);

        if (user) {
            // Logic for when the user is LOGGED IN
            if (navActions) {
                navActions.style.display = 'none'; // Hides desktop login/signup
            }
            if (avatarButton) {
                avatarButton.style.display = 'flex'; // Shows desktop logout
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
            } catch (error) {
                console.error("Error fetching profile:", error);
                if (usernameLabel) usernameLabel.textContent = 'Hi, User';
            }
        } else {
            // Logic for when the user is LOGGED OUT (Guest)
            if (navActions) {
                navActions.style.display = 'flex'; // Shows desktop login/signup
            }
            if (avatarButton) {
                avatarButton.style.display = 'none'; // Hides desktop logout
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

    // Also listen for window resize to manage buttons on dimension change
    window.addEventListener('resize', () => {
      const { data: { session } } = supabase.auth.getSession();
      updateUI(session);
    });
});
