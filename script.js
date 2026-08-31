  const navToggle = document.getElementById('navToggle');
  const navLinks = document.querySelector('.nav-links');
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.style.display === 'flex';
    navLinks.style.display = isOpen ? 'none' : 'flex';
    navLinks.style.flexDirection = 'column';
    navLinks.style.position = 'absolute';
    navLinks.style.top = '58px';
    navLinks.style.right = '20px';
    navLinks.style.background = 'var(--panel)';
    navLinks.style.border = '1px solid var(--border)';
    navLinks.style.borderRadius = '8px';
    navLinks.style.padding = '14px 20px';
    navLinks.style.gap = '14px';
  });

  // ---------- cursor-reactive spotlight ----------
  window.addEventListener('mousemove', (e) => {
    document.documentElement.style.setProperty('--mx', e.clientX + 'px');
    document.documentElement.style.setProperty('--my', e.clientY + 'px');
  });

  // ---------- scrollspy nav ----------
  const sections = document.querySelectorAll('section[id], footer[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  // ---------- project filtering ----------
  const filterTags = document.querySelectorAll('.filter-tag');
  const projectCards = document.querySelectorAll('#projectsGrid .file-card');
  filterTags.forEach(tag => {
    tag.addEventListener('click', () => {
      filterTags.forEach(t => t.classList.remove('active'));
      tag.classList.add('active');
      const filter = tag.dataset.tag;
      projectCards.forEach(card => {
        const show = filter === 'all' || card.dataset.tags.split(' ').includes(filter);
        card.classList.toggle('hidden', !show);
      });
    });
  });
  // clicking a stack pill inside a card applies that filter too
  document.querySelectorAll('.stack span[data-tag]').forEach(pill => {
    pill.addEventListener('click', () => {
      const match = document.querySelector('.filter-tag[data-tag="' + pill.dataset.tag + '"]');
      if (match) match.click();
      document.getElementById('work').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ---------- copy email ----------
  const copyBtn = document.getElementById('copyEmail');
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(copyBtn.dataset.email);
    } catch (err) {
      /* clipboard API unavailable — fail silently, link is still readable */
    }
    copyBtn.classList.add('copied');
    setTimeout(() => copyBtn.classList.remove('copied'), 1600);
  });

  // ---------- command palette ----------
  const cmdkBackdrop = document.getElementById('cmdkBackdrop');
  const cmdkInput = document.getElementById('cmdkInput');
  const cmdkList = document.getElementById('cmdkList');
  const cmdkHint = document.getElementById('cmdkHint');

  const commands = [
    { label: 'Go to Work', hint: 'section', action: () => scrollToId('work') },
    { label: 'Go to Skills', hint: 'section', action: () => scrollToId('skills') },
    { label: 'Go to Experience', hint: 'section', action: () => scrollToId('experience') },
    { label: 'Go to Contact', hint: 'section', action: () => scrollToId('contact') },
    { label: 'Copy email address', hint: 'action', action: () => copyBtn.click() },
    { label: 'Open GitHub', hint: 'link', action: () => window.open('#', '_blank') },
    { label: 'Open LinkedIn', hint: 'link', action: () => window.open('#', '_blank') },
    { label: 'Download resume', hint: 'link', action: () => window.open('#', '_blank') },
  ];

  function scrollToId(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  let selectedIndex = 0;
  let filteredCommands = commands;

  function renderCmdkList() {
    cmdkList.innerHTML = '';
    if (filteredCommands.length === 0) {
      cmdkList.innerHTML = '<div class="cmdk-empty">No matching commands</div>';
      return;
    }
    filteredCommands.forEach((cmd, i) => {
      const item = document.createElement('div');
      item.className = 'cmdk-item' + (i === selectedIndex ? ' selected' : '');
      item.innerHTML = '<span class="label">' + cmd.label + '</span><span class="hint">' + cmd.hint + '</span>';
      item.addEventListener('click', () => runCommand(cmd));
      cmdkList.appendChild(item);
    });
  }

  function runCommand(cmd) {
    cmd.action();
    closeCmdk();
  }

  function openCmdk() {
    cmdkBackdrop.classList.add('open');
    cmdkInput.value = '';
    filteredCommands = commands;
    selectedIndex = 0;
    renderCmdkList();
    setTimeout(() => cmdkInput.focus(), 10);
  }

  function closeCmdk() {
    cmdkBackdrop.classList.remove('open');
  }

  cmdkHint.addEventListener('click', openCmdk);

  document.addEventListener('keydown', (e) => {
    const isTyping = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
    if (e.key === '/' && !isTyping) {
      e.preventDefault();
      openCmdk();
    } else if (e.key === 'Escape' && cmdkBackdrop.classList.contains('open')) {
      closeCmdk();
    }
  });

  cmdkBackdrop.addEventListener('click', (e) => {
    if (e.target === cmdkBackdrop) closeCmdk();
  });

  cmdkInput.addEventListener('input', () => {
    const q = cmdkInput.value.toLowerCase();
    filteredCommands = commands.filter(c => c.label.toLowerCase().includes(q));
    selectedIndex = 0;
    renderCmdkList();
  });

  cmdkInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, filteredCommands.length - 1);
      renderCmdkList();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      renderCmdkList();
    } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
      runCommand(filteredCommands[selectedIndex]);
    }
  });
