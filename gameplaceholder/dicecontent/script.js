function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar.classList.contains('hidden')) {
    sidebar.classList.toggle('slim');
  }
}

function adjustLayout() {
  const sidebar = document.getElementById('sidebar');
  const bottomNav = document.getElementById('bottomNav');

  if (window.innerWidth <= 768) {
    sidebar.classList.add('hidden');
    bottomNav.style.display = 'flex';
  } else {
    sidebar.classList.remove('hidden');
    bottomNav.style.display = 'none';
  }
}

function resetSidebarState() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar.classList.contains('slim') && window.innerWidth <= 768) {
    sidebar.classList.remove('slim');
  }
}

window.addEventListener('load', () => {
  adjustLayout();
  resetSidebarState();
});

window.addEventListener('resize', () => {
  adjustLayout();
  resetSidebarState();
});
