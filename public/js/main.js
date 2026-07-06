// PathFinder 10 Shared Javascript Framework
// Handles 3D Particle Background & Firebase / Guest Auth State

let db = null;
let auth = null;
let appConfig = null;
let currentUser = null;

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', async () => {
  initParticleBackground();
  await loadConfigAndInitialize();
});

// ==========================================
// 1. THREE.JS 3D PARTICLE BACKGROUND
// ==========================================
function initParticleBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  // Scene Setup
  const scene = new THREE.Scene();
  
  // Camera Setup
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // Renderer Setup
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Spiral Galaxy Generation (Optimized to 1000 particles for performance)
  const particleCount = 1000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const particleDistances = new Float32Array(particleCount); // Pre-computed distances

  const branches = 3;  // 3-armed spiral
  const spin = 1.4;    // Twist intensity
  const radius = 6.0;  // Core radius

  for (let i = 0; i < particleCount; i++) {
    const idx = i * 3;
    const r = Math.random() * radius;
    const spinAngle = r * spin;
    const branchAngle = ((i % branches) / branches) * Math.PI * 2;

    // Dispersion curves
    const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.4;
    const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.4;
    const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.4;

    positions[idx] = Math.cos(branchAngle + spinAngle) * r + randomX;
    positions[idx + 1] = randomY;
    positions[idx + 2] = Math.sin(branchAngle + spinAngle) * r + randomZ;

    // Pre-calculate distance from core for wave physics (removes Math.sqrt from frame loops)
    particleDistances[i] = Math.sqrt(positions[idx] * positions[idx] + positions[idx + 2] * positions[idx + 2]);

    // Rainbow HSL color mapping based on spiral branch angle and radial distance
    const hue = ((branchAngle + spinAngle) / (Math.PI * 2) + (r / radius) * 0.25) % 1.0;
    const mixedColor = new THREE.Color().setHSL(hue, 0.95, 0.55);

    colors[idx] = mixedColor.r;
    colors[idx + 1] = mixedColor.g;
    colors[idx + 2] = mixedColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Particle Point Texture Loader
  const pCanvas = document.createElement('canvas');
  pCanvas.width = 16;
  pCanvas.height = 16;
  const pCtx = pCanvas.getContext('2d');
  const grad = pCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  pCtx.fillStyle = grad;
  pCtx.fillRect(0, 0, 16, 16);
  const pTexture = new THREE.CanvasTexture(pCanvas);

  const material = new THREE.PointsMaterial({
    size: 0.07,
    map: pTexture,
    transparent: true,
    blending: THREE.NormalBlending,
    depthWrite: false,
    vertexColors: true
  });

  const particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);

  // Store original positions for relative offsets
  const originalPositions = new Float32Array(positions);

  // Mouse Interaction (Parallax)
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - window.innerWidth / 2) / 100;
    mouseY = (event.clientY - window.innerHeight / 2) / 100;
  });

  // Animation Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // 3D undulating waves (Using pre-calculated distances for lightning-fast speeds)
    const positionsAttr = geometry.attributes.position;
    for (let i = 0; i < particleCount; i++) {
      const dist = particleDistances[i];
      const wave = Math.sin(dist * 1.6 - elapsedTime * 2.0) * 0.16;
      positionsAttr.setY(i, originalPositions[i * 3 + 1] + wave);
    }
    positionsAttr.needsUpdate = true;

    // Slow spin
    particleSystem.rotation.y = elapsedTime * 0.04;
    particleSystem.rotation.x = Math.sin(elapsedTime * 0.1) * 0.05;

    // Smooth cursor follow camera shift (parallax)
    targetX = mouseX * 0.5;
    targetY = mouseY * 0.5;
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (-targetY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();

  // Resize listener
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// ==========================================
// 2. FIREBASE & CONFIG SETUP
// ==========================================
async function loadConfigAndInitialize() {
  try {
    const response = await fetch('/api/config');
    appConfig = await response.json();
    
    const isFirebaseSetup = appConfig.firebaseConfig && appConfig.firebaseConfig.apiKey;

    if (isFirebaseSetup && typeof firebase !== 'undefined') {
      // Initialize Firebase via standard CDN SDK
      firebase.initializeApp(appConfig.firebaseConfig);
      auth = firebase.auth();
      db = firebase.firestore();
      console.log("Firebase initialized successfully.");

      // Setup auth state observer
      auth.onAuthStateChanged(user => {
        if (user) {
          currentUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            isGuest: false
          };
        } else {
          // Check for active guest session
          checkGuestSession();
        }
        // Fire custom event for individual pages to hook into
        document.dispatchEvent(new CustomEvent('authReady', { detail: currentUser }));
      });
    } else {
      console.log("Running in LOCAL GUEST MODE (Firebase credentials not configured or script unreached).");
      checkGuestSession();
      document.dispatchEvent(new CustomEvent('authReady', { detail: currentUser }));
    }
  } catch (error) {
    console.error("Config fetch failed, fallback to local storage guest modes:", error);
    checkGuestSession();
    document.dispatchEvent(new CustomEvent('authReady', { detail: currentUser }));
  }
}

function checkGuestSession() {
  const localGuest = localStorage.getItem('p10_guest_user');
  if (localGuest) {
    currentUser = JSON.parse(localGuest);
  } else {
    currentUser = null;
  }
}

// ==========================================
// 3. AUTHENTICATION WRAPPER INTERFACE
// ==========================================
window.pfAuth = {
  // Login method
  login: async (email, password) => {
    if (auth) {
      const cred = await auth.signInWithEmailAndPassword(email, password);
      return { uid: cred.user.uid, email: cred.user.email };
    } else {
      // Check local guest database (simulate validation)
      const users = JSON.parse(localStorage.getItem('p10_local_users') || '[]');
      const match = users.find(u => u.email === email && u.password === password);
      if (match) {
        const guestData = { uid: 'guest_' + Date.now(), email: email, displayName: match.name || email.split('@')[0], isGuest: true };
        localStorage.setItem('p10_guest_user', JSON.stringify(guestData));
        currentUser = guestData;
        return guestData;
      }
      throw new Error("Invalid credentials in local storage database. (Or connect Firebase)");
    }
  },

  // Register method
  register: async (name, email, password) => {
    if (auth) {
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      await cred.user.updateProfile({ displayName: name });
      return { uid: cred.user.uid, email: cred.user.email, displayName: name };
    } else {
      // Store in local storage simulator
      const users = JSON.parse(localStorage.getItem('p10_local_users') || '[]');
      if (users.some(u => u.email === email)) {
        throw new Error("Email already registered in local database.");
      }
      users.push({ name, email, password });
      localStorage.setItem('p10_local_users', JSON.stringify(users));

      // Auto login guest
      const guestData = { uid: 'guest_' + Date.now(), email: email, displayName: name, isGuest: true };
      localStorage.setItem('p10_guest_user', JSON.stringify(guestData));
      currentUser = guestData;
      return guestData;
    }
  },

  // Guest Bypass
  continueAsGuest: () => {
    const guestData = {
      uid: 'guest_bypass_' + Date.now(),
      email: 'guest@pathfinder10.in',
      displayName: 'Guest Student',
      isGuest: true
    };
    localStorage.setItem('p10_guest_user', JSON.stringify(guestData));
    currentUser = guestData;
    return guestData;
  },

  // Logout method
  logout: async () => {
    if (auth) {
      await auth.signOut();
    }
    localStorage.removeItem('p10_guest_user');
    currentUser = null;
    window.location.href = 'index.html';
  },

  // Helper to get active session user
  getUser: () => currentUser
};

// ==========================================
// 4. DATABASE / PERSISTENCE WRAPPER
// ==========================================
window.pfDb = {
  saveQuizResults: async (results) => {
    const user = window.pfAuth.getUser();
    if (!user) return;

    const payload = {
      uid: user.uid,
      scores: results.scores,
      recommendedPath: results.recommendedPath,
      timestamp: new Date().toISOString()
    };

    if (db && !user.isGuest) {
      try {
        await db.collection('assessment_results').doc(user.uid).set(payload);
        console.log("Quiz saved to Firestore.");
      } catch (err) {
        console.error("Firestore save failed, saving to localStorage:", err);
        localStorage.setItem(`p10_quiz_${user.uid}`, JSON.stringify(payload));
      }
    } else {
      localStorage.setItem(`p10_quiz_${user.uid}`, JSON.stringify(payload));
      console.log("Quiz saved to localStorage (Guest).");
    }
  },

  getQuizResults: async () => {
    const user = window.pfAuth.getUser();
    if (!user) return null;

    if (db && !user.isGuest) {
      try {
        const doc = await db.collection('assessment_results').doc(user.uid).get();
        if (doc.exists) {
          return doc.data();
        }
      } catch (err) {
        console.error("Firestore get failed, checking localStorage:", err);
      }
    }
    const localData = localStorage.getItem(`p10_quiz_${user.uid}`);
    return localData ? JSON.parse(localData) : null;
  }
};

// ==========================================
// 5. 3D CARD TILT CONTROLLER
// ==========================================
window.pf3D = {
  applyTilt: (element, maxTilt = 15) => {
    if (!element) return;

    element.style.transformStyle = 'preserve-3d';
    element.style.transition = 'transform 0.1s ease-out, box-shadow 0.3s ease';

    element.addEventListener('mousemove', (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left; //x position within the element.
      const y = e.clientY - rect.top;  //y position within the element.
      
      const width = rect.width;
      const height = rect.height;

      const tiltX = ((y / height) - 0.5) * -maxTilt * 2; // tilt around X axis based on Y position
      const tiltY = ((x / width) - 0.5) * maxTilt * 2;   // tilt around Y axis based on X position

      element.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.03, 1.03, 1.03)`;
    });

    element.addEventListener('mouseleave', () => {
      element.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  }
};
