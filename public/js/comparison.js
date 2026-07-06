// Page 4: Comparison Matrix Logic
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logout-btn');
  const userDisplayName = document.getElementById('user-display-name');
  const matrixSearch = document.getElementById('matrix-search');
  const matrixRowsContainer = document.getElementById('matrix-rows-container');

  // Handle Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      window.pfAuth.logout();
    });
  }

  // Handle Auth States
  document.addEventListener('authReady', (e) => {
    const user = e.detail;
    if (!user) {
      window.location.href = 'index.html';
      return;
    }
    if (userDisplayName) userDisplayName.innerText = `${user.displayName} (${user.isGuest ? 'Guest' : 'Student'})`;
  });

  // ==========================================
  // 1. 3D CASCADE SCROLL REVEAL
  // ==========================================
  const cascadeItems = document.querySelectorAll('.cascade-item');
  
  const observerOptions = {
    root: null,
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Stagger children triggers if it is a row
        if (entry.target.classList.contains('matrix-row')) {
          const columns = entry.target.children;
          Array.from(columns).forEach((col, idx) => {
            setTimeout(() => {
              col.classList.add('visible');
              col.style.opacity = '1';
              col.style.transform = 'translateY(0) rotateX(0deg)';
            }, idx * 120); // 120ms staggered delay
          });
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.add('visible');
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0) rotateX(0deg)';
        }
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  cascadeItems.forEach(item => {
    // Set initial custom inline transition styling
    item.style.transition = 'opacity 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
    observer.observe(item);
  });

  // ==========================================
  // 2. INTERACTIVE CELL 3D TILTS & ROW HOVERS
  // ==========================================
  const rows = document.querySelectorAll('.matrix-row');

  rows.forEach(row => {
    // Highlight active row & fade out non-active rows on hover
    row.addEventListener('mouseenter', () => {
      rows.forEach(otherRow => {
        if (otherRow !== row) {
          otherRow.style.opacity = '0.3';
          otherRow.style.transform = 'scale(0.98)';
        }
      });
      row.style.transform = 'scale(1.01) translateZ(10px)';
      row.style.zIndex = '5';
    });

    row.addEventListener('mouseleave', () => {
      rows.forEach(otherRow => {
        otherRow.style.opacity = '1';
        otherRow.style.transform = 'scale(1) translateZ(0px)';
      });
      row.style.transform = 'scale(1) translateZ(0px)';
      row.style.zIndex = '1';
    });

    // Apply interactive 3D tilts to each individual column cell within the row
    const cells = row.querySelectorAll('.glass-card');
    cells.forEach(cell => {
      if (!cell.classList.contains('col-item-header')) {
        window.pf3D.applyTilt(cell, 8); // Subtler 3D tilt inside comparison grid
      }
    });
  });

  // ==========================================
  // 3. GRID CELL SEARCH FILTERS
  // ==========================================
  if (matrixSearch) {
    matrixSearch.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      
      rows.forEach(row => {
        const keywords = row.getAttribute('data-search-keys') || '';
        const content = row.innerText.toLowerCase();
        
        if (keywords.includes(query) || content.includes(query)) {
          row.style.display = 'grid';
          // Ensure they are visible (observer might not have fired if hidden)
          const columns = row.children;
          Array.from(columns).forEach(col => {
            col.style.opacity = '1';
            col.style.transform = 'translateY(0) rotateX(0deg)';
          });
        } else {
          row.style.display = 'none';
        }
      });
    });
  }

  // ==========================================
  // 4. ANCHOR ROUTING HIGHLIGHT
  // ==========================================
  const handleAnchorLink = () => {
    const hash = window.location.hash;
    if (hash) {
      const targetHeaderId = `col-header-${hash.substring(1)}`; // col-header-intermediate, col-header-diploma, col-header-iti
      const targetHeader = document.getElementById(targetHeaderId);
      if (targetHeader) {
        setTimeout(() => {
          targetHeader.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetHeader.classList.add('glow-cyan');
          
          // Flash animation
          let count = 0;
          const flashInterval = setInterval(() => {
            targetHeader.classList.toggle('glow-cyan');
            count++;
            if (count > 5) {
              clearInterval(flashInterval);
              targetHeader.classList.add('glow-cyan');
            }
          }, 350);
        }, 600);
      }
    }
  };

  window.addEventListener('hashchange', handleAnchorLink);
  handleAnchorLink();
});
