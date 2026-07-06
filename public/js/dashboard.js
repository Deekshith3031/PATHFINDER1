// Page 2: Personalized Dashboard Hub Logic
document.addEventListener('DOMContentLoaded', () => {
  const welcomeName = document.getElementById('welcome-name');
  const userDisplayName = document.getElementById('user-display-name');
  const logoutBtn = document.getElementById('logout-btn');
  const quizAlertBanner = document.getElementById('quiz-alert-banner');
  const quizAlertText = document.getElementById('quiz-alert-text');

  // Bind 3D card tilts
  const cards = [
    { id: 'path-card-inter', max: 12 },
    { id: 'path-card-diploma', max: 12 },
    { id: 'path-card-iti', max: 12 }
  ];

  cards.forEach(cardData => {
    const el = document.getElementById(cardData.id);
    if (el) {
      window.pf3D.applyTilt(el, cardData.max);
      
      // Navigate to matrix sections when clicked
      el.addEventListener('click', (e) => {
        // Prevent click bubble from button
        if (e.target.tagName !== 'BUTTON') {
          const stream = cardData.id.split('-')[2]; // 'inter', 'diploma', 'iti'
          const anchor = stream === 'inter' ? 'intermediate' : stream;
          window.location.href = `comparison.html#${anchor}`;
        }
      });
    }
  });

  // Handle logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      window.pfAuth.logout();
    });
  }

  // Handle Auth Ready event
  document.addEventListener('authReady', async (e) => {
    const user = e.detail;
    if (!user) {
      console.log("No active user session, redirecting to login...");
      window.location.href = 'index.html';
      return;
    }

    // Populate user profile info
    if (welcomeName) welcomeName.innerText = user.displayName;
    if (userDisplayName) userDisplayName.innerText = `${user.displayName} (${user.isGuest ? 'Guest' : 'Student'})`;

    // Query and render saved assessment recommendations
    const results = await window.pfDb.getQuizResults();
    if (results && quizAlertBanner && quizAlertText) {
      let recText = "";
      if (results.recommendedPath === 'Intermediate') {
        recText = "Intermediate Academic (MPC/BiPC/CEC/HEC)";
      } else if (results.recommendedPath === 'Diploma') {
        recText = "Polytechnic Diploma (TS POLYCET)";
      } else if (results.recommendedPath === 'ITI') {
        recText = "ITI Technical Trades (Electrician, Fitter, etc.)";
      }

      quizAlertText.innerHTML = `You completed the Career Assessment! Recommended route: <strong>${recText}</strong>`;
      quizAlertBanner.classList.remove('hidden');
    }
  });

  // ==========================================================
  // 1. TELANGANA INSTITUTE & COLLEGE FINDER MODULE LOGIC
  // ==========================================================
  const collegesDb = [
    { name: "Government Polytechnic Masab Tank", location: "Hyderabad", streamType: "Polytechnic", offeredBranches: ["CSE", "ECE", "AIML"], capacity: 180, spotSeats: 4 },
    { name: "Government Institute of Electronics (GIOE)", location: "Secunderabad", streamType: "Polytechnic", offeredBranches: ["ECE", "AIML"], capacity: 120, spotSeats: 2 },
    { name: "S.G. Government Junior College", location: "Warangal", streamType: "Intermediate", offeredBranches: ["MPC", "BiPC"], capacity: 240, spotSeats: 12 },
    { name: "Government ITI Mallepally", location: "Hyderabad", streamType: "ITI", offeredBranches: ["Electrician", "Fitter"], capacity: 80, spotSeats: 3 },
    { name: "Government Junior College (Girls)", location: "Nalgonda", streamType: "Intermediate", offeredBranches: ["MPC", "BiPC", "CEC"], capacity: 180, spotSeats: 8 },
    { name: "Singareni Collieries Polytechnic", location: "Warangal", streamType: "Polytechnic", offeredBranches: ["CSE", "ECE"], capacity: 120, spotSeats: 5 },
    { name: "Government ITI Warangal", location: "Warangal", streamType: "ITI", offeredBranches: ["Electrician", "Fitter"], capacity: 100, spotSeats: 6 },
    { name: "Government Polytechnic Nalgonda", location: "Nalgonda", streamType: "Polytechnic", offeredBranches: ["CSE", "ECE"], capacity: 120, spotSeats: 3 }
  ];

  const filterDistrict = document.getElementById('filter-district');
  const filterStream = document.getElementById('filter-stream');
  const filterBranch = document.getElementById('filter-branch');
  const searchCollegeBtn = document.getElementById('search-college-btn');
  const collegeResultsTbody = document.getElementById('college-results-tbody');

  if (searchCollegeBtn) {
    searchCollegeBtn.addEventListener('click', () => {
      const districtVal = filterDistrict.value;
      const streamVal = filterStream.value;
      const branchVal = filterBranch.value;

      const filtered = collegesDb.filter(college => {
        const matchesDistrict = !districtVal || college.location === districtVal;
        const matchesStream = !streamVal || college.streamType === streamVal;
        const matchesBranch = !branchVal || college.offeredBranches.includes(branchVal);
        return matchesDistrict && matchesStream && matchesBranch;
      });

      renderCollegeResults(filtered);
    });
  }

  function renderCollegeResults(colleges) {
    if (!collegeResultsTbody) return;
    collegeResultsTbody.innerHTML = '';

    if (colleges.length === 0) {
      collegeResultsTbody.innerHTML = `
        <tr>
          <td colspan="6" class="py-4 text-center text-slate-400 font-medium">No matching institutions found. Try adjusting filters!</td>
        </tr>
      `;
      return;
    }

    colleges.forEach(col => {
      const row = document.createElement('tr');
      row.className = "border-b border-slate-100 hover:bg-slate-50/50 transition";
      row.innerHTML = `
        <td class="py-3 px-2 font-semibold text-slate-900">${col.name}</td>
        <td class="py-3 px-2 text-slate-600">${col.location}</td>
        <td class="py-3 px-2 text-slate-600"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${
          col.streamType === 'Intermediate' ? 'bg-indigo-100 text-indigo-700' :
          col.streamType === 'Polytechnic' ? 'bg-cyan-100 text-cyan-700' : 'bg-emerald-100 text-emerald-700'
        }">${col.streamType}</span></td>
        <td class="py-3 px-2 text-slate-600">${col.offeredBranches.join(', ')}</td>
        <td class="py-3 px-2 text-center text-slate-600 font-bold">${col.capacity}</td>
        <td class="py-3 px-2 text-center font-bold ${col.spotSeats > 3 ? 'text-emerald-600' : 'text-red-500'}">${col.spotSeats}</td>
      `;
      collegeResultsTbody.appendChild(row);
    });
  }

  // ==========================================================
  // 2. COUNSELING ROADMAP TRACKER & DOCUMENT CHECKLIST LOGIC
  // ==========================================================
  const docChecks = document.querySelectorAll('.doc-check');
  const readinessScore = document.getElementById('readiness-score');
  const readinessBar = document.getElementById('readiness-bar');
  const readinessWarning = document.getElementById('readiness-warning');
  const webOptionBtn = document.getElementById('web-option-simulation-btn');

  docChecks.forEach(check => {
    check.addEventListener('change', updateChecklistReadiness);
  });

  function updateChecklistReadiness() {
    const isMemo = document.getElementById('doc-memo').checked;
    const isTc = document.getElementById('doc-tc').checked;
    const isBonafide = document.getElementById('doc-bonafide').checked;

    // Check mandatory items
    const mandatoryCount = 3;
    const checkedMandatory = (isMemo ? 1 : 0) + (isTc ? 1 : 0) + (isBonafide ? 1 : 0);
    const scorePct = Math.round((checkedMandatory / mandatoryCount) * 100);

    if (readinessScore) readinessScore.innerText = `${scorePct}%`;
    if (readinessBar) {
      readinessBar.style.width = `${scorePct}%`;
      if (scorePct === 100) {
        readinessBar.className = "h-full bg-emerald-500 rounded-full transition-all duration-300";
      } else {
        readinessBar.className = "h-full bg-cyan-500 rounded-full transition-all duration-300";
      }
    }

    if (scorePct === 100) {
      if (readinessWarning) {
        readinessWarning.innerHTML = `✅ All mandatory documents verified! Simulation unlocked.`;
        readinessWarning.className = "text-[10px] text-emerald-600 font-bold leading-normal";
      }
      if (webOptionBtn) {
        webOptionBtn.removeAttribute('disabled');
        webOptionBtn.className = "w-full py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl cursor-pointer transition shadow-lg";
      }
    } else {
      if (readinessWarning) {
        readinessWarning.innerHTML = `⚠️ Check all 3 mandatory (*) documents to unlock Web Option entry simulation!`;
        readinessWarning.className = "text-[10px] text-red-500 font-semibold leading-normal";
      }
      if (webOptionBtn) {
        webOptionBtn.setAttribute('disabled', 'true');
        webOptionBtn.className = "w-full py-3 bg-slate-300 text-slate-500 font-bold text-sm rounded-xl cursor-not-allowed transition";
      }
    }
  }

  // Option Entry Simulation Modal Trigger
  if (webOptionBtn) {
    webOptionBtn.addEventListener('click', showWebOptionSimulation);
  }

  function showWebOptionSimulation() {
    const modal = document.createElement('div');
    modal.className = "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4";
    modal.id = "simulation-modal";
    modal.innerHTML = `
      <div class="glass-card glow-cyan rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-6 relative animate-fade-in text-slate-800">
        <button id="close-modal-btn" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
        <div>
          <h4 class="text-xl font-bold text-indigo-950">🌐 TS Web Option Entry Simulation</h4>
          <p class="text-xs text-slate-500 mt-1">Select your preferred colleges. The system will simulate mock seat allotment based on counseling parameters.</p>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Option Choice 1 (First Preference)</label>
            <select id="sim-opt-1" class="w-full glass-input p-2.5 rounded-xl text-xs">
              <option value="Government Polytechnic Masab Tank - CSE (Computer Science)">Government Polytechnic Masab Tank - CSE (Computer Science)</option>
              <option value="Government Institute of Electronics GIOE - ECE (Electronics)">Government Institute of Electronics GIOE - ECE (Electronics)</option>
              <option value="Government ITI Mallepally - Electrician Trade">Government ITI Mallepally - Electrician Trade</option>
              <option value="S.G. Government Junior College - MPC (Intermediate)">S.G. Government Junior College - MPC (Intermediate)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Option Choice 2 (Second Preference)</label>
            <select id="sim-opt-2" class="w-full glass-input p-2.5 rounded-xl text-xs">
              <option value="Government Institute of Electronics GIOE - AIML (Artificial Intelligence)">Government Institute of Electronics GIOE - AIML (Artificial Intelligence)</option>
              <option value="Government Polytechnic Masab Tank - ECE (Electronics)">Government Polytechnic Masab Tank - ECE (Electronics)</option>
              <option value="Government ITI Mallepally - Fitter Trade">Government ITI Mallepally - Fitter Trade</option>
              <option value="Government Junior College Nalgonda - BiPC (Intermediate)">Government Junior College Nalgonda - BiPC (Intermediate)</option>
            </select>
          </div>
        </div>

        <button id="submit-sim-btn" class="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm rounded-xl transition">
          Simulate Mock Seat Allocation ⚡
        </button>
        <div id="sim-allocation-result" class="hidden p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-700">
          <!-- Allocation results -->
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('close-modal-btn').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    document.getElementById('submit-sim-btn').addEventListener('click', () => {
      const opt1 = document.getElementById('sim-opt-1').value;
      const resultCard = document.getElementById('sim-allocation-result');
      resultCard.innerHTML = `
        <span class="text-emerald-500 font-bold block mb-1">🎉 Mock Allotment Successful!</span>
        Based on Local Rank merits, you have been allotted a seat in:<br>
        <strong class="text-slate-900 font-extrabold block my-1">${opt1}</strong>
        Verification completed at Helpline Center slot. Print this receipt for admission reporting!
      `;
      resultCard.classList.remove('hidden');
    });
  }

  // ==========================================================
  // 3. SCHOLARSHIP ELIGIBILITY & RULES ENGINE LOGIC
  // ==========================================================
  const calcReimbBtn = document.getElementById('calc-reimb-btn');
  const reimbIncome = document.getElementById('reimb-income');
  const reimbCategory = document.getElementById('reimb-category');
  const reimbCourse = document.getElementById('reimb-course');
  const reimbResultsCard = document.getElementById('reimb-results-card');

  if (calcReimbBtn) {
    calcReimbBtn.addEventListener('click', calculateScholarshipEligibility);
  }

  function calculateScholarshipEligibility() {
    const income = parseFloat(reimbIncome.value);
    const cat = reimbCategory.value;
    const course = reimbCourse.value;

    if (isNaN(income) || income < 0) {
      if (reimbResultsCard) {
        reimbResultsCard.innerHTML = `<span class="text-red-500 font-bold">⚠️ Please enter a valid annual income value.</span>`;
      }
      return;
    }

    let isEligible = false;
    let schemeName = "";
    let coverage = "";
    let outOfPocket = "";
    let stipend = "";

    // Rules Engine logic based on Telangana State RTF guidelines
    if (cat === 'SC' || cat === 'ST') {
      if (income <= 200000) {
        isEligible = true;
        schemeName = "TS RTF (Reimbursement of Tuition Fee) - SC/ST Post-Matric Scholarship";
      }
    } else if (cat === 'BC' || cat === 'Minority') {
      if (income <= 100000) {
        isEligible = true;
        schemeName = "TS RTF - Post-Matric Scholarship for BC & Minorities";
      }
    } else if (cat === 'OC') {
      // OC requires EWS criteria (generally 1L cap for scholarship)
      if (income <= 100000) {
        isEligible = true;
        schemeName = "TS EWS Scholarship / Economically Backward Classes (EBC) Waiver";
      }
    }

    // Set course specific data
    if (isEligible) {
      if (course === 'ITI') {
        coverage = "100% Full Tuition Fee Exemption";
        outOfPocket = "₹0 (Fully Exempted)";
        stipend = "✅ Government Monthly Stipend of **₹500** + Free Tools Kit eligible.";
      } else if (course === 'Polytechnic') {
        coverage = "Full government seat fees reimbursed (up to ₹4,700/yr in Gov, up to ₹25,000/yr in Private)";
        outOfPocket = "₹0 in Govt | ~₹5,000/yr in Private (towards utility/miscellaneous fees)";
        stipend = "Eligible for standard SC/ST/BC Post-Matric Hostel mess subsidies.";
      } else if (course === 'Intermediate') {
        coverage = "Full Tuition Waiver in Government Junior Colleges";
        outOfPocket = "₹0 in Govt Junior Colleges | Out-of-pocket tuition in private corporate colleges (no private inter reimbursement)";
        stipend = "No extra stipend.";
      }
    } else {
      coverage = "None (Does not meet income/caste caps)";
      stipend = "No stipend.";
      if (course === 'ITI') {
        outOfPocket = "~₹3,000 - ₹5,000 total course fee";
      } else if (course === 'Polytechnic') {
        outOfPocket = "Capped at standard government rate: ₹4,700/year (Govt) or ₹25,000/year (Private)";
      } else if (course === 'Intermediate') {
        outOfPocket = "₹0 (Govt Junior Colleges) or ₹40,000 - ₹1,50,000/year (Private Corporate Junior Colleges)";
      }
    }

    // Render output card
    if (reimbResultsCard) {
      reimbResultsCard.className = "p-6 bg-slate-50 border rounded-2xl text-left space-y-4 flex-grow flex flex-col justify-center border-slate-200 animate-fade-in";
      reimbResultsCard.innerHTML = isEligible 
        ? `
          <div class="flex items-center space-x-2 text-emerald-600 font-bold text-sm uppercase">
            <span>🎉 Eligibility:</span>
            <span>FULLY ELIGIBLE</span>
          </div>
          <div>
            <strong class="text-slate-900 block text-base">${schemeName}</strong>
            <p class="text-xs text-slate-500 mt-1 leading-normal">
              <strong>Fee Coverage:</strong> ${coverage}<br>
              <strong>Estimated Out-of-Pocket:</strong> ${outOfPocket}<br>
              <strong>Stipend Details:</strong> ${stipend}
            </p>
          </div>
        `
        : `
          <div class="flex items-center space-x-2 text-amber-600 font-bold text-sm uppercase">
            <span>⚠️ Eligibility:</span>
            <span>NOT ELIGIBLE FOR REIMBURSEMENT</span>
          </div>
          <div>
            <strong class="text-slate-900 block text-base">Standard Capped Fee Structure Applies</strong>
            <p class="text-xs text-slate-500 mt-1 leading-normal">
              <strong>Reason:</strong> Income exceeds the official cap for your category, or course lies outside reimbursement terms.<br>
              <strong>Estimated Out-of-Pocket Cost:</strong> ${outOfPocket}<br>
              <strong>Welfare Schemes:</strong> You can still apply for national schemes (like NMMS) if eligible.
            </p>
          </div>
        `;
    }
  }
});
