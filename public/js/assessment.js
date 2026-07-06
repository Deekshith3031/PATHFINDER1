// Page 3: 3D Assessment Engine Logic
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logout-btn');
  const userDisplayName = document.getElementById('user-display-name');

  // Quiz elements
  const qIndexActive = document.getElementById('q-index-active');
  const qPercentComplete = document.getElementById('q-percent-complete');
  const qProgressBar = document.getElementById('q-progress-bar');
  const quizFlipper = document.getElementById('quiz-flipper');
  const quizWorkspace = document.getElementById('quiz-workspace');
  const quizResultsScreen = document.getElementById('quiz-results-screen');

  // Front card components
  const qTitleFront = document.getElementById('q-title-front');
  const qOptionsFront = document.getElementById('q-options-front');
  const prevBtnFront = document.getElementById('prev-btn-holder-front');

  // Back card components
  const qTitleBack = document.getElementById('q-title-back');
  const qOptionsBack = document.getElementById('q-options-back');
  const prevBtnBack = document.getElementById('prev-btn-holder-back');

  // Results display elements
  const resultsRec = document.getElementById('results-recommendation');
  const scoreInterPct = document.getElementById('score-inter-pct');
  const scoreDiplomaPct = document.getElementById('score-diploma-pct');
  const scoreItiPct = document.getElementById('score-iti-pct');
  const barInter = document.getElementById('bar-inter');
  const barDiploma = document.getElementById('bar-diploma');
  const barIti = document.getElementById('bar-iti');

  // Questions Database
  const questions = [
    {
      text: "When you inspect a new technology or gadget, what interests you most?",
      options: [
        { text: "The scientific theory, mathematical concepts, and core physics equations behind it.", path: "inter" },
        { text: "How the electrical components, software algorithms, and circuits interact together.", path: "diploma" },
        { text: "How to open it up, fix faulty wires, or operate it physically inside a workshop.", path: "iti" }
      ]
    },
    {
      text: "Which environment do you find most exciting and productive?",
      options: [
        { text: "A quiet classroom solving complex analytical math, physics, or commerce problems.", path: "inter" },
        { text: "An applied laboratory testing circuit boards, computer compilers, or mechanical models.", path: "diploma" },
        { text: "A hands-on workshop welding metals, fitting heavy engines, or repairing machines.", path: "iti" }
      ]
    },
    {
      text: "How many years are you willing to study before entering the workforce?",
      options: [
        { text: "5 to 7 years (completed through a full B.Tech engineering or medical degree program).", path: "inter" },
        { text: "3 to 5 years (gain a direct engineering diploma, then work or lateral entry to B.Tech).", path: "diploma" },
        { text: "1 to 2 years (receive a quick technical certificate and secure immediate employment).", path: "iti" }
      ]
    },
    {
      text: "Which entrance and admission framework do you prefer?",
      options: [
        { text: "Competitive national exams (JEE/NEET) or state exams (TG EAPCET) based on theory.", path: "inter" },
        { text: "State-level polytechnic exam (TS POLYCET) focusing on 10th science and mathematics.", path: "diploma" },
        { text: "Direct merit-based counseling matching my 10th class board GPA with no entrance exam.", path: "iti" }
      ]
    },
    {
      text: "If you had a weekend project, what would you choose to build?",
      options: [
        { text: "Write a research report on clean energy or solve complex math challenge puzzles.", path: "inter" },
        { text: "Design a solar-powered mobile phone charger or code a basic micro-controller.", path: "diploma" },
        { text: "Assemble a functional house extension cord, solder wires, or fix a household motor.", path: "iti" }
      ]
    },
    {
      text: "Which job sector and initial career step is your target?",
      options: [
        { text: "Corporate scientist, doctor, academic professor, or software consultant.", path: "inter" },
        { text: "Technical supervisor or Junior Engineer in state divisions (TGSPDCL, Transco) or private firms.", path: "diploma" },
        { text: "Immediate technician in Indian Railways (ALP), plant operator, or contractor.", path: "iti" }
      ]
    },
    {
      text: "What is your comfort level with abstract mathematical derivations?",
      options: [
        { text: "Very high; I enjoy proving formulas, trigonometry, and calculus theories.", path: "inter" },
        { text: "Moderate; I like applying mathematics directly to physical engineering formulas.", path: "diploma" },
        { text: "Low; I prefer basic arithmetic calculations for measurements, lengths, and wiring.", path: "iti" }
      ]
    },
    {
      text: "How do you plan to handle the financial cost of your education?",
      options: [
        { text: "Open to investing in corporate coaching institutes and full 4-year degree programs.", path: "inter" },
        { text: "Prefer highly subsidized, state-capped fees with excellent budget options.", path: "diploma" },
        { text: "Require the absolute lowest fees, combined with immediate monthly stipend rewards.", path: "iti" }
      ]
    },
    {
      text: "What is your dream working role and daily environment?",
      options: [
        { text: "Office cabin coding systems, researching medical labs, or managing corporate clients.", path: "inter" },
        { text: "A mix of field supervision, testing machines, and drafting schematics on CAD tools.", path: "diploma" },
        { text: "Active workshop floor repairing diesel engines, operating lathes, or wiring plants.", path: "iti" }
      ]
    },
    {
      text: "If your engineering path hits a roadblock, what is your backup strategy?",
      options: [
        { text: "Drop a year, re-study intermediate concepts, or pay higher fees for private colleges.", path: "inter" },
        { text: "Leverage my Diploma to skip B.Tech 1st year via TS ECET lateral entry directly.", path: "diploma" },
        { text: "Secure an ITI placement, gather industry experience, and study further part-time.", path: "iti" }
      ]
    }
  ];

  // Game state
  let currentIdx = 0;
  let answers = []; // Stores path choice ('inter', 'diploma', 'iti') for each question
  let isFlipped = false; // false = front card is active, true = back card is active

  // Initialize
  renderQuestion();

  // Handle Logouts
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

  // Render question inside the 3D flipping container
  function renderQuestion() {
    const q = questions[currentIdx];
    const isFirst = currentIdx === 0;

    // Update Progress Bar
    const progressPct = ((currentIdx + 1) / questions.length) * 100;
    if (qIndexActive) qIndexActive.innerText = currentIdx + 1;
    if (qPercentComplete) qPercentComplete.innerText = `${Math.round(progressPct)}% Complete`;
    if (qProgressBar) qProgressBar.style.width = `${progressPct}%`;

    // Render contents to the inactive side, then perform 3D flip rotation
    if (!isFlipped) {
      // FRONT is active, so we prepare BACK and flip to back
      qTitleFront.innerText = q.text;
      qOptionsFront.innerHTML = '';

      q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = "w-full text-left p-4 bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-950/20 text-sm md:text-base rounded-2xl transition duration-200 transform hover:scale-[1.01]";
        btn.innerText = opt.text;
        btn.addEventListener('click', () => selectAnswer(opt.path));
        qOptionsFront.appendChild(btn);
      });

      // Previous button
      if (!isFirst) {
        prevBtnFront.innerHTML = `<button class="hover:underline text-indigo-300">← Back</button>`;
        prevBtnFront.querySelector('button').addEventListener('click', goBack);
      } else {
        prevBtnFront.innerHTML = '';
      }
    } else {
      // BACK is active, so we prepare FRONT and flip back to front
      qTitleBack.innerText = q.text;
      qOptionsBack.innerHTML = '';

      q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = "w-full text-left p-4 bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-950/20 text-sm md:text-base rounded-2xl transition duration-200 transform hover:scale-[1.01]";
        btn.innerText = opt.text;
        btn.addEventListener('click', () => selectAnswer(opt.path));
        qOptionsBack.appendChild(btn);
      });

      // Previous button
      if (!isFirst) {
        prevBtnBack.innerHTML = `<button class="hover:underline text-cyan-300">← Back</button>`;
        prevBtnBack.querySelector('button').addEventListener('click', goBack);
      } else {
        prevBtnBack.innerHTML = '';
      }
    }
  }

  function selectAnswer(path) {
    // Record answer
    answers[currentIdx] = path;

    if (currentIdx < questions.length - 1) {
      // Next Question
      currentIdx++;
      // Toggle card flip state and trigger animation
      isFlipped = !isFlipped;
      if (isFlipped) {
        quizFlipper.style.transform = 'rotateY(180deg)';
      } else {
        quizFlipper.style.transform = 'rotateY(0deg)';
      }
      renderQuestion();
    } else {
      // Quiz Finished!
      evaluateResults();
    }
  }

  function goBack() {
    if (currentIdx > 0) {
      currentIdx--;
      isFlipped = !isFlipped;
      if (isFlipped) {
        quizFlipper.style.transform = 'rotateY(180deg)';
      } else {
        quizFlipper.style.transform = 'rotateY(0deg)';
      }
      renderQuestion();
    }
  }

  // Calculate scores and trigger effects
  async function evaluateResults() {
    const scores = { inter: 0, diploma: 0, iti: 0 };
    answers.forEach(ans => scores[ans]++);

    const total = answers.length;
    const interPct = Math.round((scores.inter / total) * 100);
    const diplomaPct = Math.round((scores.diploma / total) * 100);
    const itiPct = Math.round((scores.iti / total) * 100);

    // Determine highest score path
    let recommended = 'Intermediate';
    let maxVal = scores.inter;

    if (scores.diploma > maxVal) {
      recommended = 'Diploma';
      maxVal = scores.diploma;
    }
    if (scores.iti > maxVal) {
      recommended = 'ITI';
      maxVal = scores.iti;
    }

    // Save database records
    const resultPayload = {
      scores: { inter: interPct, diploma: diplomaPct, iti: itiPct },
      recommendedPath: recommended
    };
    await window.pfDb.saveQuizResults(resultPayload);

    // Update frontend results card
    let recLabel = "";
    if (recommended === 'Intermediate') {
      recLabel = "Intermediate (MPC/BiPC/CEC)";
      resultsRec.className = "text-xl font-black text-indigo-400 tracking-wide";
    } else if (recommended === 'Diploma') {
      recLabel = "Polytechnic Diploma (TS POLYCET)";
      resultsRec.className = "text-xl font-black text-cyan-400 tracking-wide";
    } else {
      recLabel = "ITI Trades (Electrician / Fitter)";
      resultsRec.className = "text-xl font-black text-emerald-400 tracking-wide";
    }

    resultsRec.innerText = recLabel;
    scoreInterPct.innerText = `${interPct}%`;
    scoreDiplomaPct.innerText = `${diplomaPct}%`;
    scoreItiPct.innerText = `${itiPct}%`;

    barInter.style.width = `${interPct}%`;
    barDiploma.style.width = `${diplomaPct}%`;
    barIti.style.width = `${itiPct}%`;

    // Hide workspace and show completion card
    quizWorkspace.classList.add('hidden');
    quizResultsScreen.classList.remove('hidden');

    // Trigger Canvas Confetti Storm
    triggerConfettiStorm();

    // Trigger 3D Trophy Showcase
    initTrophyCanvas();
  }

  // ==========================================
  // CANVAS-CONFETTI STORM TRIGGER
  // ==========================================
  function triggerConfettiStorm() {
    const duration = 4 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: ['#6366f1', '#10b981', '#06b2d2']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: ['#6366f1', '#10b981', '#06b2d2']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }

  // ==========================================
  // THREE.JS INTERACTIVE 3D TROPHY
  // ==========================================
  function initTrophyCanvas() {
    const canvas = document.getElementById('trophy-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    
    // Camera
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 4.5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(2, 4, 3);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa5f3fc, 0.5); // Cyan highlights
    dirLight2.position.set(-2, -1, 2);
    scene.add(dirLight2);

    // Group to hold trophy pieces
    const trophyGroup = new THREE.Group();

    // Materials
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xfbbf24, // Gold Color
      metalness: 0.85,
      roughness: 0.15,
      shadowSide: THREE.DoubleSide
    });

    const bronzeMaterial = new THREE.MeshStandardMaterial({
      color: 0x475569, // Dark Grey Slate
      metalness: 0.5,
      roughness: 0.4
    });

    // 1. Base (Cylinder)
    const baseGeo = new THREE.CylinderGeometry(0.6, 0.7, 0.35, 24);
    const baseMesh = new THREE.Mesh(baseGeo, bronzeMaterial);
    baseMesh.position.y = -1;
    trophyGroup.add(baseMesh);

    // 2. Connector stem
    const stemGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.5, 16);
    const stemMesh = new THREE.Mesh(stemGeo, goldMaterial);
    stemMesh.position.y = -0.58;
    trophyGroup.add(stemMesh);

    // 3. Cup Bowl
    const bowlGeo = new THREE.CylinderGeometry(0.65, 0.25, 0.9, 24);
    const bowlMesh = new THREE.Mesh(bowlGeo, goldMaterial);
    bowlMesh.position.y = 0.1;
    trophyGroup.add(bowlMesh);

    // 4. Handles (Torus)
    const handleGeo = new THREE.TorusGeometry(0.25, 0.07, 12, 24, Math.PI);
    
    const leftHandle = new THREE.Mesh(handleGeo, goldMaterial);
    leftHandle.position.set(-0.55, 0.25, 0);
    leftHandle.rotation.z = Math.PI / 2;
    trophyGroup.add(leftHandle);

    const rightHandle = new THREE.Mesh(handleGeo, goldMaterial);
    rightHandle.position.set(0.55, 0.25, 0);
    rightHandle.rotation.z = -Math.PI / 2;
    trophyGroup.add(rightHandle);

    // 5. Star on top (Double cone shape for mesh simplicity)
    const starGeo = new THREE.OctahedronGeometry(0.28, 0);
    const starMaterial = new THREE.MeshStandardMaterial({
      metalness: 0.9,
      roughness: 0.1,
      color: 0xfbbf24
    });
    const starMesh = new THREE.Mesh(starGeo, starMaterial);
    starMesh.position.y = 0.9;
    trophyGroup.add(starMesh);

    scene.add(trophyGroup);

    // Rotation Drag interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };

      trophyGroup.rotation.y += deltaMove.x * 0.007;
      trophyGroup.rotation.x += deltaMove.y * 0.007;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Touch support
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    });

    canvas.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;

      const deltaMove = {
        x: e.touches[0].clientX - previousMousePosition.x,
        y: e.touches[0].clientY - previousMousePosition.y
      };

      trophyGroup.rotation.y += deltaMove.x * 0.01;
      trophyGroup.rotation.x += deltaMove.y * 0.01;

      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });

    canvas.addEventListener('touchend', () => {
      isDragging = false;
    });

    // Resize watch
    const resizeObserver = new ResizeObserver(() => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });
    resizeObserver.observe(canvas);

    // Clock for timing color shifts
    const trophyClock = new THREE.Clock();

    // Animation Loop
    function renderTrophy() {
      requestAnimationFrame(renderTrophy);

      const time = trophyClock.getElapsedTime();

      // Rainbow color shift the star on top
      starMesh.material.color.setHSL((time * 0.15) % 1.0, 0.95, 0.55);

      // Auto-rotate slowly when not dragging
      if (!isDragging) {
        trophyGroup.rotation.y += 0.012;
      }

      renderer.render(scene, camera);
    }
    renderTrophy();
  }
});
