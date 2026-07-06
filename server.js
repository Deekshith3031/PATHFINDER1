require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Fallback config route so the client knows if keys are present or mock mode is active
app.get('/api/config', (req, res) => {
  res.json({
    hasGeminiKey: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here',
    firebaseConfig: {
      apiKey: process.env.FIREBASE_API_KEY || '',
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.FIREBASE_APP_ID || '',
      measurementId: process.env.FIREBASE_MEASUREMENT_ID || ''
    }
  });
});

// Gemini AI Chat Proxy
app.post('/api/advisor', async (req, res) => {
  const { messages, quizResults } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request: "messages" array is required.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const isMockMode = !apiKey || apiKey === 'your_gemini_api_key_here';

  const systemInstruction = 
    "You are a friendly, highly detailed, and exhaustive career advisor for 10th-grade students in Telangana, India. " +
    "Whenever a student asks about any career path, competitive exam (e.g. UPSC, JEE, NEET, TS POLYCET, TS ECET), or subject stream: " +
    "1. Structure your answers with clear bold headings and bullet points. " +
    "2. Provide an exhaustive Overview. " +
    "3. List specific ELIGIBILITY CRITERIA (including qualification, subjects, and age limits). " +
    "4. Outline the complete SYLLABUS & EXAM PATTERN (subjects, stages, marking scheme). " +
    "5. Highlight TOP COLLEGES / UNIVERSITIES in Telangana and India. " +
    "6. Suggest a PREPARATION STRATEGY and study timeline starting from class 11. " +
    "7. Detail immediate CAREER OUTCOMES (salaries, public vs private sector job roles, and long-term path). " +
    "Provide very large, extensive, and detailed descriptions. Tailor all advice to Telangana State Board configurations (MPC, BiPC, CEC, HEC), local intermediate campuses, and local government recruitment bodies (like TGSPDCL, Transco, and Singareni).";

  // Formulate a helpful mock response if key is missing
  if (isMockMode) {
    const lastUserMessage = messages[messages.length - 1]?.text || '';
    let responseText = `👋 Hello! I am your PathFinder 10 Career Advisor. 
    
⚠️ *Note: The server is currently running in **Demo Mode** because the \`GEMINI_API_KEY\` is not set in the server's environment (.env file).*

Based on your question: "${lastUserMessage}", here is some guidance for 10th class students in Telangana:

1. **Intermediate (MPC/BiPC/CEC/HEC)**:
   - If you want a traditional degree, choose **MPC** for Engineering (JEE, TG EAPCET) or **BiPC** for Medical/Agricultural courses (NEET, BSc Agriculture).
   - Choose **CEC** or **HEC** for Commerce, CA (Chartered Accountancy), Economics, or Civil Services preparation.

2. **Polytechnic Diploma (3 Years via TS POLYCET)**:
   - Offers excellent technical training in Computer Science, Mechanical, Civil, ECE, or EEE (at top colleges like Masab Tank or GIOE).
   - **Key Advantage**: You can join the 2nd year of B.Tech directly via **TS ECET** lateral entry, skipping the first year!
   - Qualifies you directly for Junior Engineer (JE) jobs in government divisions like TGSPDCL (Discom), Transco, or Indian Railways.

3. **ITI Trades (1-2 Years Vocational)**:
   - High hands-on practice (80% workshop) in fields like Electrician, Fitter, Diesel Mechanic, COPA.
   - Quickest entry into the job market, qualifying you for Assistant Loco Pilot (ALP) in Railways, state technicians, or private manufacturing plants.

**To unlock full interactive AI features, please configure a real GEMINI_API_KEY in your \`.env\` file!**`;

    // Customize the mock responses based on keywords in user message
    const msgLower = lastUserMessage.toLowerCase();
    if (msgLower.includes('upsc') || msgLower.includes('civil') || msgLower.includes('ias') || msgLower.includes('ips')) {
      responseText = `🏛️ **UPSC Civil Services Examination (CSE) Career Path Guide**
      
*Note: This is an exhaustive outline prepared by PathFinder 10. To prepare for IAS, IPS, or IFS, follow this detailed roadmap starting right after your 10th class in Telangana:*

### 1. Overview
The Union Public Service Commission (UPSC) conducts the Civil Services Examination annually to recruit officers for the Indian Administrative Service (IAS), Indian Police Service (IPS), Indian Foreign Service (IFS), and other prestigious Group A central services. It is considered one of the most elite and challenging examinations in India.

### 2. Eligibility Criteria
- **Educational Qualification**: You must hold a graduation degree in any discipline (B.A., B.Sc, B.Com, B.Tech, MBBS, etc.) from a recognized university. (Students in their final year of college can also apply).
- **Age Limit**: Minimum **21 years** and Maximum **32 years** as of August 1st of the exam year. Upper age relaxation exists: +3 years for OBC, +5 years for SC/ST, and +10 years for candidates with physical disabilities.
- **Number of Attempts**: 6 attempts for General category, 9 attempts for OBC, and unlimited attempts for SC/ST candidates up to the age limit.

### 3. Intermediate Stream Recommendation (Telangana)
- **Traditional Route (CEC / HEC)**: Choosing Civics, Economics, History (HEC) or Commerce, Economics, Civics (CEC) in Intermediate gives you a massive advantage because 60% of the UPSC General Studies syllabus directly overlaps with History, Polity, Geography, and Economics.
- **Science Route (MPC)**: Choosing MPC is also highly common. Many candidates pursue a 4-year B.Tech first, which offers a backup career in software/engineering, and then write the UPSC exam using technical subjects or humanities as their optional paper.

### 4. UPSC Exam Structure & Syllabus
The exam consists of three distinct stages:

#### **Stage A: Preliminary Examination (Objective Type)**
- **Paper I: General Studies (200 Marks)** - Covers History, Geography, Indian Polity, Economy, General Science, Environmental Ecology, and national/international Current Affairs.
- **Paper II: Civil Services Aptitude Test (CSAT - 200 Marks)** - Qualifying paper (requires 33% marks). Covers Basic Numeracy, Data Interpretation, Logical Reasoning, and Reading Comprehension.

#### **Stage B: Mains Examination (Written Descriptive - 1750 Marks)**
Contains 9 subjective papers:
- **Paper A & B (300 Marks each - Qualifying)**: One Indian Language paper (e.g. Telugu) + English.
- **Paper I: Essay (250 Marks)** - Write two structured essays.
- **Paper II: General Studies I (250 Marks)** - Indian Heritage, Culture, History, and Geography.
- **Paper III: General Studies II (250 Marks)** - Governance, Constitution, Polity, Social Justice, and International Relations.
- **Paper IV: General Studies III (250 Marks)** - Science & Technology, Economic Development, Biodiversity, Environment, Security, and Disaster Management.
- **Paper V: General Studies IV (250 Marks)** - Ethics, Integrity, and Aptitude (deals with case studies).
- **Paper VI & VII: Optional Subject (250 Marks each)** - Choose 1 subject (e.g. History, Telugu Literature, Public Administration, Geography, etc.) and write two comprehensive papers.

#### **Stage C: Personality Test (Interview - 275 Marks)**
An in-person board interview in New Delhi evaluating your analytical ability, mental alertness, moral integrity, and leadership capabilities.

### 5. Top Preparation & Degree Institutes in Telangana
- **Integrated Academies**: Several residential junior colleges in Hyderabad (like Narayana IAS Academy, Chaitanya IAS Academy, Pragnya IAS Academy) offer integrated Intermediate + IAS foundation training.
- **Degree Hubs**: E.g. Nizam College, Osmania University campuses, or private universities offering BA/B.Sc.
- **Coaching Hotspots**: Ashok Nagar (Hyderabad) is the hub of Civil Services coaching in Telangana, housing institutes like La Excellence, R.C. Reddy, Brain Tree, and Analog IAS.

### 6. Preparation Strategy for 10th-grade Students
- **Step 1 (Daily Habit)**: Start reading a national newspaper every single day. We highly recommend *The Hindu* or *The Indian Express*. Focus on editorials.
- **Step 2 (NCERT Foundation)**: Download and read school NCERT books (Classes 6th to 12th) for Social Sciences, History, Geography, and Indian Polity.
- **Step 3 (Strong Academics)**: Secure a high GPA in your Intermediate course. Consistent academic focus builds the analytical writing skills needed for the Mains exam.`;
    } else if (msgLower.includes('mpc') || msgLower.includes('engineering') || msgLower.includes('math')) {
      responseText = `📐 **Telangana Intermediate MPC (Maths, Physics, Chemistry)**:
      - This is a 2-year course under the Telangana Board of Intermediate Education (TSBIE).
      - **Best For**: Students aspiring for a B.Tech / B.E. degree.
      - **Entrance Exams**: TG EAPCET (formerly TS EAMCET) for state colleges, JEE Main/Advanced for IITs and NITs.
      - **Top College Hubs**: Narayana, Chaitanya, or Government Junior Colleges (very low cost).
      - **Alternative**: A 3-year Polytechnic Diploma in Engineering (via TS POLYCET) is a stellar option if you prefer practical engineering labs over theoretical intermediate studies, allowing lateral entry to B.Tech 2nd year via TS ECET!`;
    } else if (msgLower.includes('bipc') || msgLower.includes('medical') || msgLower.includes('doctor') || msgLower.includes('biology')) {
      responseText = `🧪 **Telangana Intermediate BiPC (Biology, Physics, Chemistry)**:
      - This is a 2-year academic program.
      - **Best For**: Careers in medicine, pharmacy, veterinary sciences, and biotechnology.
      - **Entrance Exams**: NEET (for MBBS/BDS), TG EAPCET (for B.Pharmacy, BSc Agriculture, Horticulture).
      - **Outlook**: Path is long and demands high dedication. If you want quicker medical-allied careers, you can also look into short-term medical lab technician vocational courses.`;
    } else if (msgLower.includes('polytechnic') || msgLower.includes('diploma') || msgLower.includes('polycet')) {
      responseText = `⚙️ **Polytechnic Diploma in Telangana (TS POLYCET)**:
      - Admission is based on the state-level TS POLYCET exam.
      - **Duration**: 3 Years.
      - **Top Colleges**: Government Polytechnic Masab Tank (Hyderabad), Government Institute of Electronics (GIOE Secunderabad), SG Government Polytechnic (Adilabad), etc.
      - **Curriculum**: 50% Theory, 50% Practical.
      - **B.Tech Lateral Entry**: After Diploma, write the TS ECET exam to gain direct admission into the 2nd year (3rd semester) of B.Tech. This saves you 1 year!
      - **Jobs**: Eligible for Junior Engineer (JE) posts in TGSPDCL, TSTRANSCO, and TSGENCO, as well as Indian Railways.`;
    } else if (msgLower.includes('iti') || msgLower.includes('trade') || msgLower.includes('fitter') || msgLower.includes('electrician')) {
      responseText = `🔧 **ITI Trades in Telangana**:
      - **Duration**: 1 to 2 Years depending on the trade.
      - **Admission**: Merit-based directly using 10th class marks, followed by state counseling.
      - **Top Trades**: Electrician, Fitter, Turner, Welder, Machinist, COPA (Computer Operator & Programming Assistant).
      - **Focus**: 80% practical workshop work.
      - **Jobs**: Immediate hiring as technicians in public sectors (Indian Railways, TGSPDCL, Singareni Collieries SCCL) and private factories. You can also write the ITI-to-Diploma bridge exams for lateral entry into 2nd year of Polytechnic Diploma!`;
    } else if (quizResults) {
      responseText = `🎯 **Your Assessment Recommendation Analysis**:
      - Your quiz profile shows interest in **${quizResults.recommendedPath || 'Polytechnic Diploma'}**!
      - If your interest is practical engineering, writing TS POLYCET is highly recommended. If you want direct job placement within 1-2 years, exploring ITI trades like Fitter or Electrician is perfect. If you prefer high analytical studies to prepare for JEE/NEET, choose Intermediate MPC/BiPC.
      
      What specific details about fees, entrance tests, or college campuses in Telangana would you like to know?`;
    }

    // Artificial delay to simulate thinking state
    await new Promise(resolve => setTimeout(resolve, 800));
    return res.json({ text: responseText });
  }

  // Real Gemini API Calling
  try {
    // Format messages array for Gemini
    const contents = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Inject quiz results into context for Gemini's awareness if provided
    if (quizResults && contents.length === 1) {
      const resultsText = `[Context: The student just took a career assessment. Results show: ${JSON.stringify(quizResults)}. Please incorporate this recommendation context naturally into your first greeting/advice.]`;
      contents[0].parts[0].text = `${resultsText}\n\nUser Question: ${contents[0].parts[0].text}`;
    }

    const requestBody = {
      contents: contents,
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000
      }
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API Error details:', errText);
      return res.status(response.status).json({ error: 'Gemini API Error', details: errText });
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response. Please try again.";
    
    res.json({ text: replyText });
  } catch (error) {
    console.error('Error proxying to Gemini API:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Fallback: Redirect all other requests to index.html (or handle SPA routes if any)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`PathFinder 10 Server running on http://localhost:${PORT}`);
  console.log(`Mode: ${process.env.GEMINI_API_KEY ? 'Secure AI (Connected)' : 'Demo Mode (Local Mock Advisor)'}`);
  console.log(`=================================================`);
});
