// Page 1: Auth Vortex & Immersive 3D Hero Scene Controller
document.addEventListener('DOMContentLoaded', () => {
  const authCard = document.getElementById('auth-card');
  const authForm = document.getElementById('auth-form');
  const alertBox = document.getElementById('alert-box');
  const nameFieldGroup = document.getElementById('name-field-group');
  const regNameInput = document.getElementById('reg-name');
  const emailInput = document.getElementById('auth-email');
  const passwordInput = document.getElementById('auth-password');
  const submitBtn = document.getElementById('submit-btn');
  const toggleAuthMode = document.getElementById('toggle-auth-mode');
  const toggleText = document.getElementById('toggle-text');
  const guestBtn = document.getElementById('guest-btn');

  let isLoginMode = true;

  // ==========================================
  // 1. ACTIVE CURSOR 3D CARD TILT
  // ==========================================
  if (authCard) {
    window.pf3D.applyTilt(authCard, 10);
  }

  // ==========================================
  // 2. THREE.JS 3D HERO WORLD CREATOR
  // ==========================================
  init3DHeroScene();

  function init3DHeroScene() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    // Create Scene, Camera, and Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.5, 6);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Optimized screen fill

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(0xffffff, 1.2, 30);
    mainLight.position.set(0, 4, 3);
    scene.add(mainLight);

    // Colored spot lights to wash the 3D meshes with nice tones
    const indigoLight = new THREE.DirectionalLight(0x6366f1, 0.85);
    indigoLight.position.set(-3, 2, -2);
    scene.add(indigoLight);

    const cyanLight = new THREE.DirectionalLight(0x06b2d2, 0.65);
    cyanLight.position.set(3, -1, 2);
    scene.add(cyanLight);

    // ------------------------------------------
    // A. STYLIZED MODERN SCHOOL BUILDING
    // ------------------------------------------
    const schoolGroup = new THREE.Group();
    schoolGroup.position.set(1.6, -0.6, -0.8); // Offset to the right

    // Main classroom block (Stone textured beige box)
    const buildingGeo = new THREE.BoxGeometry(1.8, 0.9, 1.1);
    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0xf5efe6, // Cream Alabaster
      metalness: 0.1,
      roughness: 0.7
    });
    const buildingMesh = new THREE.Mesh(buildingGeo, buildingMat);
    schoolGroup.add(buildingMesh);

    // Roof (Triangular dark slate shape modeled using a 4-sided cylinder)
    const roofGeo = new THREE.CylinderGeometry(0, 1.3, 0.6, 4);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Deep Charcoal Slate
      metalness: 0.3,
      roughness: 0.5
    });
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.position.y = 0.72;
    roofMesh.rotation.y = Math.PI / 4; // Align roof coordinates
    schoolGroup.add(roofMesh);

    // Pillars (White cylinders)
    const pillarGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.45, 8);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const pillarLeft = new THREE.Mesh(pillarGeo, pillarMat);
    pillarLeft.position.set(-0.35, -0.225, 0.57);
    const pillarRight = pillarLeft.clone();
    pillarRight.position.x = 0.35;
    schoolGroup.add(pillarLeft);
    schoolGroup.add(pillarRight);

    // Entry Step
    const stepGeo = new THREE.BoxGeometry(0.9, 0.08, 0.25);
    const stepMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0 });
    const stepMesh = new THREE.Mesh(stepGeo, stepMat);
    stepMesh.position.set(0, -0.41, 0.6);
    schoolGroup.add(stepMesh);

    // Glass Windows
    const windowGeo = new THREE.BoxGeometry(0.22, 0.32, 0.03);
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0x06b2d2,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.6
    });
    const w1 = new THREE.Mesh(windowGeo, windowMat);
    w1.position.set(-0.6, 0.15, 0.56);
    const w2 = w1.clone();
    w2.position.x = 0.6;
    schoolGroup.add(w1);
    schoolGroup.add(w2);

    scene.add(schoolGroup);

    // ------------------------------------------
    // B. ANIMATED STUDENTS (At the school steps)
    // ------------------------------------------
    const studentsGroup = new THREE.Group();
    studentsGroup.position.copy(schoolGroup.position); // Align to school coordinates

    function makeStudentMesh(shirtColor, posX, posZ) {
      const student = new THREE.Group();
      student.position.set(posX, -0.32, posZ);

      // Torso
      const torsoGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.22, 8);
      const torso = new THREE.Mesh(torsoGeo, new THREE.MeshStandardMaterial({ color: shirtColor }));
      student.add(torso);

      // Head
      const headGeo = new THREE.SphereGeometry(0.055, 12, 12);
      const head = new THREE.Mesh(headGeo, new THREE.MeshStandardMaterial({ color: 0xfecdd3 })); // flesh pink
      head.position.y = 0.165;
      student.add(head);

      // Mini cap
      const capCap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 0.02, 10),
        new THREE.MeshBasicMaterial({ color: 0x000000 })
      );
      capCap.position.y = 0.21;
      student.add(capCap);

      const capBoard = new THREE.Mesh(
        new THREE.BoxGeometry(0.09, 0.005, 0.09),
        new THREE.MeshBasicMaterial({ color: 0x000000 })
      );
      capBoard.position.y = 0.22;
      student.add(capBoard);

      return student;
    }

    const stud1 = makeStudentMesh(0x4f46e5, -0.15, 0.72); // Indigo student
    const stud2 = makeStudentMesh(0x10b981, 0.15, 0.72);  // Green student
    studentsGroup.add(stud1);
    studentsGroup.add(stud2);
    scene.add(studentsGroup);

    // ------------------------------------------
    // C. ROTATING 3D NEURAL BRAIN
    // ------------------------------------------
    const brainGroup = new THREE.Group();
    brainGroup.position.set(-1.8, 0.8, 0); // Positioned left of the screen

    // Brain wireframe outline shell
    const brainShell = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 12, 12),
      new THREE.MeshBasicMaterial({
        color: 0x4f46e5,
        wireframe: true,
        transparent: true,
        opacity: 0.3
      })
    );
    brainGroup.add(brainShell);

    // Left hemisphere node clusters
    const leftGlobe = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x06b2d2, wireframe: true, transparent: true, opacity: 0.45 })
    );
    leftGlobe.position.x = -0.18;
    brainGroup.add(leftGlobe);

    // Right hemisphere node clusters
    const rightGlobe = leftGlobe.clone();
    rightGlobe.position.x = 0.18;
    brainGroup.add(rightGlobe);

    scene.add(brainGroup);

    // ------------------------------------------
    // D. FLOATING GRADUATION CAPS & BOOKS
    // ------------------------------------------
    const books = [];
    const caps = [];

    // Spawn 4 floating books
    const bookColors = [0xef4444, 0x10b981, 0x06b2d2, 0xf59e0b];
    for (let i = 0; i < 4; i++) {
      const book = new THREE.Group();
      
      const cover = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.04, 0.3),
        new THREE.MeshStandardMaterial({ color: bookColors[i], roughness: 0.4 })
      );
      book.add(cover);

      const pages = new THREE.Mesh(
        new THREE.BoxGeometry(0.225, 0.03, 0.285),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 })
      );
      pages.position.x = 0.008;
      book.add(pages);

      // Position scattered around space
      book.position.set(
        (Math.random() - 0.5) * 3.5,
        0.3 + Math.random() * 1.5,
        (Math.random() - 0.5) * 2.5
      );
      scene.add(book);
      books.push(book);
    }

    // Spawn 3 floating graduation caps
    for (let i = 0; i < 3; i++) {
      const cap = new THREE.Group();
      
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.08, 12),
        new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.8 })
      );
      cap.add(base);

      const board = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.012, 0.28),
        new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.8 })
      );
      board.position.y = 0.045;
      cap.add(board);

      cap.position.set(
        (Math.random() - 0.5) * 3.5,
        0.5 + Math.random() * 1.5,
        (Math.random() - 0.5) * 2.5
      );
      scene.add(cap);
      caps.push(cap);
    }

    // ------------------------------------------
    // E. GLOWING SPACE DUST (Particles)
    // ------------------------------------------
    const starCount = 300;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const palette = [new THREE.Color('#4f46e5'), new THREE.Color('#06b2d2'), new THREE.Color('#10b981')];

    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 12;
      starPos[i + 1] = (Math.random() - 0.5) * 12;
      starPos[i + 2] = (Math.random() - 0.5) * 8;

      const clr = palette[Math.floor(Math.random() * palette.length)];
      starColors[i] = clr.r;
      starColors[i + 1] = clr.g;
      starColors[i + 2] = clr.b;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.06,
      transparent: true,
      blending: THREE.NormalBlending,
      vertexColors: true,
      depthWrite: false
    });
    const starSystem = new THREE.Points(starGeo, starMaterial);
    scene.add(starSystem);

    // ------------------------------------------
    // F. ANIMATION & SMOOTH CAMERA ORBIT LOOP
    // ------------------------------------------
    const clock = new THREE.Clock();

    function animateHeroScene() {
      requestAnimationFrame(animateHeroScene);

      const time = clock.getElapsedTime();

      // Brain spin & breathing pulse scale
      brainGroup.rotation.y = time * 0.16;
      brainGroup.rotation.z = Math.sin(time * 0.15) * 0.1;
      const bScale = 1.0 + Math.sin(time * 1.8) * 0.06;
      brainGroup.scale.setScalar(bScale);

      // Student idle bobbing
      stud1.position.y = -0.32 + Math.sin(time * 2.2) * 0.015;
      stud2.position.y = -0.32 + Math.sin(time * 1.8 + 0.6) * 0.015;

      // Floating books
      books.forEach((book, idx) => {
        book.position.y += Math.sin(time * 1.2 + idx * 2.0) * 0.0022;
        book.rotation.x = time * 0.15 + idx;
        book.rotation.y = time * 0.08 + idx * 0.4;
      });

      // Floating graduation caps
      caps.forEach((cap, idx) => {
        cap.position.y += Math.sin(time * 1.0 + idx * 1.8) * 0.0022;
        cap.rotation.y = time * 0.1 + idx;
        cap.rotation.z = Math.sin(time * 0.4 + idx) * 0.08;
      });

      // Slow drift stars
      starSystem.rotation.y = time * 0.015;

      // Smooth cinematic camera orbit path
      const orbitRadius = 6.4;
      camera.position.x = Math.sin(time * 0.05) * orbitRadius;
      camera.position.z = Math.cos(time * 0.05) * orbitRadius;
      camera.position.y = 1.2 + Math.sin(time * 0.03) * 0.45;
      camera.lookAt(new THREE.Vector3(0, 0.1, 0));

      renderer.render(scene, camera);
    }

    animateHeroScene();

    // Responsive Resize Handler
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  // ==========================================
  // 3. AUTH FORM INTERACTIVE LOGIC
  // ==========================================
  toggleAuthMode.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    clearAlerts();

    if (isLoginMode) {
      nameFieldGroup.classList.add('hidden');
      regNameInput.removeAttribute('required');
      submitBtn.innerText = 'Sign In';
      toggleText.innerText = "Don't have an account?";
      toggleAuthMode.innerText = 'Register here';
      authCard.classList.remove('glow-emerald');
      authCard.classList.add('glow-indigo');
    } else {
      nameFieldGroup.classList.remove('hidden');
      regNameInput.setAttribute('required', 'true');
      submitBtn.innerText = 'Create Account';
      toggleText.innerText = 'Already have an account?';
      toggleAuthMode.innerText = 'Sign in instead';
      authCard.classList.remove('glow-indigo');
      authCard.classList.add('glow-emerald');
    }
  });

  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlerts();

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const name = regNameInput.value.trim();

    submitBtn.disabled = true;
    submitBtn.innerText = isLoginMode ? 'Signing In...' : 'Registering...';

    try {
      if (isLoginMode) {
        await window.pfAuth.login(email, password);
      } else {
        await window.pfAuth.register(name, email, password);
      }
      window.location.href = 'dashboard.html';
    } catch (err) {
      showAlert(err.message || 'Authentication failed. Please check your credentials.');
      submitBtn.disabled = false;
      submitBtn.innerText = isLoginMode ? 'Sign In' : 'Create Account';
    }
  });

  guestBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.pfAuth.continueAsGuest();
    window.location.href = 'dashboard.html';
  });

  function showAlert(msg) {
    alertBox.innerText = msg;
    alertBox.classList.remove('hidden');
  }

  function clearAlerts() {
    alertBox.classList.add('hidden');
    alertBox.innerText = '';
  }

  document.addEventListener('authReady', (e) => {
    const user = e.detail;
    if (user) {
      window.location.href = 'dashboard.html';
    }
  });
});
