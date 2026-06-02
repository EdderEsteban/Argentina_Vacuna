document.addEventListener('DOMContentLoaded', function() {

  // ── Auto-resize textareas ────────────────────────────────────────────────────
  document.querySelectorAll('textarea').forEach(function(t) {
    t.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = this.scrollHeight + 'px';
    });
  });

  // ── Sidebar toggle ───────────────────────────────────────────────────────────
  var btnSidebar = document.getElementById('btnSidebar');
  var sidebar    = document.getElementById('sidebar');
  var backdrop   = document.getElementById('sidebarBackdrop');

  if (btnSidebar && sidebar) {
    btnSidebar.addEventListener('click', function() {
      if (window.innerWidth < 768) {
        sidebar.classList.toggle('sidebar-show');
        if (backdrop) backdrop.classList.toggle('show');
      } else {
        sidebar.classList.toggle('sidebar-collapsed');
      }
    });

    if (backdrop) {
      backdrop.addEventListener('click', function() {
        sidebar.classList.remove('sidebar-show');
        backdrop.classList.remove('show');
      });
    }

    // Cerrar sidebar mobile al cambiar a desktop
    window.addEventListener('resize', function() {
      if (window.innerWidth >= 768) {
        sidebar.classList.remove('sidebar-show');
        if (backdrop) backdrop.classList.remove('show');
      }
    });
  }

  // ── Active link en sidebar ───────────────────────────────────────────────────
  var currentPath = window.location.pathname;
  document.querySelectorAll('.sidebar-link').forEach(function(link) {
    var href = link.getAttribute('href');
    if (href && href === currentPath) {
      link.classList.add('active');
    }
  });

});
