<<<<<<< HEAD
// === Sidebar: Load Projects + Dashboard ===
async function loadProjectsSidebarAndDashboard() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
  
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, name')
      .eq('user_id', user.id);
  
    const sidebarContainer = document.getElementById('projectsContainer');
    const dashboardContainer = document.getElementById('dashboardProjects');
  
    sidebarContainer.innerHTML = '';
    dashboardContainer.innerHTML = '';
  
    if (error || !projects.length) {
      sidebarContainer.innerHTML = '<p>No projects</p>';
      dashboardContainer.innerHTML = '<p>No projects created yet.</p>';
      return;
    }
  
    projects.forEach(async (project) => {
      // Sidebar project item
      const projSidebarItem = document.createElement('div');
      projSidebarItem.className = 'project-item';
      projSidebarItem.textContent = project.name;
      sidebarContainer.appendChild(projSidebarItem);
  
      // Dashboard section
      const projSection = document.createElement('div');
      projSection.innerHTML = `<h3>${project.name}</h3>`;
      dashboardContainer.appendChild(projSection);
  
      await loadSummariesForProject(project.id, projSection);
    });
  }
  
  // === Load Summaries under a Project ===
  async function loadSummariesForProject(projectId, containerEl) {
    const { data: summaries } = await supabase
      .from('summaries')
      .select('title, summary')
      .eq('project_id', projectId);
  
    summaries.forEach(summary => {
      const summaryEl = document.createElement('p');
      summaryEl.textContent = summary.title;
      containerEl.appendChild(summaryEl);
    });
  }
  
  // === Create Project Modal ===
  document.getElementById('createProjectBtn')?.addEventListener('click', () => {
    showModal('createProjectModal');
  });
  
  document.getElementById('saveProjectBtn')?.addEventListener('click', async () => {
    const name = document.getElementById('projectName').value.trim();
    if (!name) return alert('Project name required.');
  
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('projects').insert([{ name, user_id: user.id }]);
  
    if (error) {
      console.error('Create project failed:', error);
      return;
    }
  
    hideModal('createProjectModal');
    document.getElementById('projectName').value = '';
    await loadProjectsSidebarAndDashboard();
  });
  
  // === Edit Profile Modal ===
  document.getElementById('editProfileBtn')?.addEventListener('click', async () => {
    showModal('editProfileModal');
  
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
  
    document.getElementById('displayName').value = profile?.display_name || '';
    document.getElementById('bio').value = profile?.bio || '';
  });
  
  document.getElementById('saveProfileBtn')?.addEventListener('click', async () => {
    const displayName = document.getElementById('displayName').value;
    const bio = document.getElementById('bio').value;
    const { data: { user } } = await supabase.auth.getUser();
  
    const { error } = await supabase.from('profiles').update({
      display_name: displayName,
      bio
    }).eq('id', user.id);
  
    if (error) {
      console.error('Profile update error:', error);
      return;
    }
  
    hideModal('editProfileModal');
    alert('Profile updated.');
  });
  
  // === Logout Button ===
  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = '../auth/login.html'; // Update path if needed
  });
  
  // === Modal Helpers ===
  function showModal(id) {
    document.getElementById(id).classList.remove('hidden');
  }
  
  function hideModal(id) {
    document.getElementById(id).classList.add('hidden');
  }
  
  document.querySelectorAll('.closeBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-close');
      hideModal(id);
    });
  });
  
  // === Init Projects & Dashboard Load ===
  loadProjectsSidebarAndDashboard();

  function showModal(id) {
    document.getElementById(id).classList.remove('hidden');
    document.body.classList.add('modal-active');
  }
  
  function hideModal(id) {
    document.getElementById(id).classList.add('hidden');
    document.body.classList.remove('modal-active');
  }
  
=======
// === Sidebar: Load Projects + Dashboard ===
async function loadProjectsSidebarAndDashboard() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
  
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, name')
      .eq('user_id', user.id);
  
    const sidebarContainer = document.getElementById('projectsContainer');
    const dashboardContainer = document.getElementById('dashboardProjects');
  
    sidebarContainer.innerHTML = '';
    dashboardContainer.innerHTML = '';
  
    if (error || !projects.length) {
      sidebarContainer.innerHTML = '<p>No projects</p>';
      dashboardContainer.innerHTML = '<p>No projects created yet.</p>';
      return;
    }
  
    projects.forEach(async (project) => {
      // Sidebar project item
      const projSidebarItem = document.createElement('div');
      projSidebarItem.className = 'project-item';
      projSidebarItem.textContent = project.name;
      sidebarContainer.appendChild(projSidebarItem);
  
      // Dashboard section
      const projSection = document.createElement('div');
      projSection.innerHTML = `<h3>${project.name}</h3>`;
      dashboardContainer.appendChild(projSection);
  
      await loadSummariesForProject(project.id, projSection);
    });
  }
  
  // === Load Summaries under a Project ===
  async function loadSummariesForProject(projectId, containerEl) {
    const { data: summaries } = await supabase
      .from('summaries')
      .select('title, summary')
      .eq('project_id', projectId);
  
    summaries.forEach(summary => {
      const summaryEl = document.createElement('p');
      summaryEl.textContent = summary.title;
      containerEl.appendChild(summaryEl);
    });
  }
  
  // === Create Project Modal ===
  document.getElementById('createProjectBtn')?.addEventListener('click', () => {
    showModal('createProjectModal');
  });
  
  document.getElementById('saveProjectBtn')?.addEventListener('click', async () => {
    const name = document.getElementById('projectName').value.trim();
    if (!name) return alert('Project name required.');
  
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('projects').insert([{ name, user_id: user.id }]);
  
    if (error) {
      console.error('Create project failed:', error);
      return;
    }
  
    hideModal('createProjectModal');
    document.getElementById('projectName').value = '';
    await loadProjectsSidebarAndDashboard();
  });
  
  // === Edit Profile Modal ===
  document.getElementById('editProfileBtn')?.addEventListener('click', async () => {
    showModal('editProfileModal');
  
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
  
    document.getElementById('displayName').value = profile?.display_name || '';
    document.getElementById('bio').value = profile?.bio || '';
  });
  
  document.getElementById('saveProfileBtn')?.addEventListener('click', async () => {
    const displayName = document.getElementById('displayName').value;
    const bio = document.getElementById('bio').value;
    const { data: { user } } = await supabase.auth.getUser();
  
    const { error } = await supabase.from('profiles').update({
      display_name: displayName,
      bio
    }).eq('id', user.id);
  
    if (error) {
      console.error('Profile update error:', error);
      return;
    }
  
    hideModal('editProfileModal');
    alert('Profile updated.');
  });
  
  // === Logout Button ===
  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = '../auth/login.html'; // Update path if needed
  });
  
  // === Modal Helpers ===
  function showModal(id) {
    document.getElementById(id).classList.remove('hidden');
  }
  
  function hideModal(id) {
    document.getElementById(id).classList.add('hidden');
  }
  
  document.querySelectorAll('.closeBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-close');
      hideModal(id);
    });
  });
  
  // === Init Projects & Dashboard Load ===
  loadProjectsSidebarAndDashboard();

  function showModal(id) {
    document.getElementById(id).classList.remove('hidden');
    document.body.classList.add('modal-active');
  }
  
  function hideModal(id) {
    document.getElementById(id).classList.add('hidden');
    document.body.classList.remove('modal-active');
  }
  
>>>>>>> dc1e8b6455dd4db1032652eaba6c43fcb8938e1b
  