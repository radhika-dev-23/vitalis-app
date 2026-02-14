import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { jsPDF } from "jspdf";
import { motion } from "framer-motion";
import { 
  Mic, MicOff, MapPin, Download, Home as HomeIcon, 
  Activity, Phone, Clock, AlertCircle, CheckCircle, 
  ChevronRight, BarChart3, Users, TrendingUp
} from "lucide-react";
import logo from "./assets/logo.jpeg";
import "./App.css";

function Home({ language, setLanguage }) {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-large"
      >
        <div className="logo-container">
          <img src={logo} alt="VITALIS Logo" className="logo-image" />
        </div>
        
        <h1 className="title">VITALIS</h1>
        <p className="subtitle">
          {language === "en" ? "Vital Signs. Any Voice." : "जीवन संकेत। हर आवाज़।"}
        </p>
        <p className="tagline">
          {language === "en" 
            ? "When Every Second Counts, Language Shouldn't Be a Barrier" 
            : "जब हर पल गिना जाता है, भाषा बाधा नहीं होनी चाहिए"}
        </p>

        <div className="language-selector">
          <button 
            onClick={() => setLanguage("en")} 
            className={`lang-btn ${language === "en" ? "active" : ""}`}
          >
            English
          </button>
          <button 
            onClick={() => setLanguage("hi")} 
            className={`lang-btn ${language === "hi" ? "active" : ""}`}
          >
            हिंदी
          </button>
        </div>

        <div className="feature-grid">
          <div className="feature-item">
            <Activity size={24} />
            <span>{language === "en" ? "FAST Protocol" : "FAST प्रोटोकॉल"}</span>
          </div>
          <div className="feature-item">
            <Mic size={24} />
            <span>{language === "en" ? "Voice Input" : "आवाज इनपुट"}</span>
          </div>
          <div className="feature-item">
            <Clock size={24} />
            <span>{language === "en" ? "Under 2 Min" : "2 मिनट से कम"}</span>
          </div>
        </div>

        <button 
          className="btn-primary" 
          onClick={() => navigate("/screening")}
        >
          <Activity size={20} />
          {language === "en" ? "Start Screening" : "जांच शुरू करें"}
          <ChevronRight size={20} />
        </button>

        <button 
          className="btn-secondary" 
          onClick={() => navigate("/dashboard")}
        >
          <BarChart3 size={20} />
          {language === "en" ? "Admin Dashboard" : "एडमिन डैशबोर्ड"}
        </button>

        <div className="warning-banner">
          <AlertCircle size={18} />
          <p>
            {language === "en"
              ? "This is a screening tool, not a diagnosis. In emergency, call 108."
              : "यह एक स्क्रीनिंग टूल है, निदान नहीं। आपात स्थिति में 108 पर कॉल करें।"}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function Screening({ language }) {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({
    face: null,
    arm: null,
    speech: null,
    time: null
  });
  const [startTime] = useState(Date.now());

  const questions = [
    {
      key: "face",
      en: "Is one side of the face drooping or numb?",
      hi: "क्या चेहरे का एक हिस्सा झुका हुआ है या सुन्न है?"
    },
    {
      key: "arm",
      en: "Is there weakness or numbness in one arm?",
      hi: "क्या एक हाथ में कमजोरी या सुन्नपन है?"
    },
    {
      key: "speech",
      en: "Is speech slurred or difficult to understand?",
      hi: "क्या बोलने में दिक्कत है या बोली अस्पष्ट है?"
    },
    {
      key: "time",
      en: "Did symptoms start within the last 3 hours?",
      hi: "क्या लक्षण पिछले 3 घंटे के अंदर शुरू हुए?"
    }
  ];

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    if (!transcript) return;

    const lower = transcript.toLowerCase();

    if (lower.includes("yes") || lower.includes("haan") || lower.includes("हां")) {
      handleAnswer("yes");
      resetTranscript();
    }

    if (lower.includes("no") || lower.includes("nahi") || lower.includes("नहीं")) {
      handleAnswer("no");
      resetTranscript();
    }
  }, [transcript]);

  const handleAnswer = (value) => {
    const key = questions[stepIndex].key;
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);

    if (stepIndex < questions.length - 1) {
      setTimeout(() => setStepIndex(stepIndex + 1), 300);
    } else {
      const duration = Math.round((Date.now() - startTime) / 1000);
      
      // Save to history
      const history = JSON.parse(localStorage.getItem("vitalis_history")) || [];
      history.push({
        timestamp: new Date().toISOString(),
        answers: newAnswers,
        duration: duration,
        language: language
      });
      localStorage.setItem("vitalis_history", JSON.stringify(history));

      navigate("/result", { state: { answers: newAnswers, duration } });
    }
  };

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.startListening({ 
        continuous: true,
        language: language === "hi" ? "hi-IN" : "en-US"
      });
    }
  };

  const progress = ((stepIndex + 1) / questions.length) * 100;

  return (
    <div className="page-container">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-large"
      >
        <div className="progress-header">
          <h2 className="section-title">
            {language === "en" ? "FAST Protocol Screening" : "FAST प्रोटोकॉल जांच"}
          </h2>
          <span className="progress-text">
            {stepIndex + 1} / {questions.length}
          </span>
        </div>

        <div className="progress-bar-container">
          <motion.div 
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <motion.div 
          key={stepIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="question-container"
        >
          <div className="question-badge">
            {stepIndex === 0 && "F - Face"}
            {stepIndex === 1 && "A - Arms"}
            {stepIndex === 2 && "S - Speech"}
            {stepIndex === 3 && "T - Time"}
          </div>
          
          <p className="question-text">
            {language === "en" ? questions[stepIndex].en : questions[stepIndex].hi}
          </p>
        </motion.div>

        <div className="answer-buttons">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-yes" 
            onClick={() => handleAnswer("yes")}
          >
            <CheckCircle size={20} />
            {language === "en" ? "Yes" : "हाँ"}
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-no" 
            onClick={() => handleAnswer("no")}
          >
            <AlertCircle size={20} />
            {language === "en" ? "No" : "नहीं"}
          </motion.button>
        </div>

        {browserSupportsSpeechRecognition && (
          <div className="voice-section">
            <button
              className={`btn-voice ${listening ? "listening" : ""}`}
              onClick={toggleListening}
            >
              {listening ? <MicOff size={24} /> : <Mic size={24} />}
              {listening 
                ? (language === "en" ? "Listening..." : "सुन रहा हूं...") 
                : (language === "en" ? "Tap to Speak" : "बोलने के लिए टैप करें")}
            </button>
            
            {transcript && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="transcript"
              >
                "{transcript}"
              </motion.div>
            )}
          </div>
        )}

        <button 
          className="btn-back" 
          onClick={() => navigate("/")}
        >
          {language === "en" ? "← Cancel" : "← रद्द करें"}
        </button>
      </motion.div>
    </div>
  );
}

function Result({ language }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { answers = {}, duration = 0 } = location.state || {};

  const yesCount = Object.values(answers).filter(a => a === "yes").length;

  let risk = "LOW";
  let riskColor = "#10B981";
  
  if (yesCount >= 2 && answers.time === "yes") {
    risk = "HIGH";
    riskColor = "#DC2626";
  } else if (yesCount >= 1) {
    risk = "MEDIUM";
    riskColor = "#F59E0B";
  }

  const riskMessages = {
    HIGH: {
      en: {
        title: "🔴 HIGH CONCERN - Urgent Action Needed",
        desc: "Multiple stroke symptoms detected. Seek immediate medical attention.",
        action: "Call 108 or go to nearest hospital NOW"
      },
      hi: {
        title: "🔴 उच्च चिंता - तत्काल कार्रवाई आवश्यक",
        desc: "कई स्ट्रोक लक्षण पाए गए। तुरंत चिकित्सा सहायता लें।",
        action: "अभी 108 पर कॉल करें या निकटतम अस्पताल जाएं"
      }
    },
    MEDIUM: {
      en: {
        title: "🟡 MODERATE CONCERN - Consult Doctor",
        desc: "Some symptoms detected. Medical consultation recommended within 24 hours.",
        action: "Schedule doctor appointment soon"
      },
      hi: {
        title: "🟡 मध्यम चिंता - डॉक्टर से परामर्श करें",
        desc: "कुछ लक्षण पाए गए। 24 घंटे के भीतर डॉक्टर से सलाह लें।",
        action: "जल्द ही डॉक्टर की नियुक्ति करें"
      }
    },
    LOW: {
      en: {
        title: "🟢 LOW CONCERN - Monitor Symptoms",
        desc: "No significant stroke symptoms detected at this time.",
        action: "Continue monitoring and seek help if symptoms develop"
      },
      hi: {
        title: "🟢 कम चिंता - लक्षणों की निगरानी करें",
        desc: "इस समय कोई महत्वपूर्ण स्ट्रोक लक्षण नहीं मिले।",
        action: "निगरानी जारी रखें और लक्षण विकसित होने पर सहायता लें"
      }
    }
  };

  const message = riskMessages[risk][language];

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("VITALIS - Stroke Screening Report", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleString()}`, 20, 35);
    doc.text(`Duration: ${duration} seconds`, 20, 42);
    doc.text(`Risk Level: ${risk}`, 20, 49);
    
    doc.setFontSize(14);
    doc.text("FAST Protocol Responses:", 20, 60);
    
    doc.setFontSize(11);
    let y = 70;
    Object.entries(answers).forEach(([key, value]) => {
      const labels = { face: "Face Drooping", arm: "Arm Weakness", speech: "Speech Difficulty", time: "Time (<3 hours)" };
      doc.text(`${labels[key]}: ${value.toUpperCase()}`, 25, y);
      y += 7;
    });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("This is a screening tool, not a medical diagnosis.", 20, 280);
    doc.text("Consult a healthcare professional for medical advice.", 20, 287);
    
    doc.save(`vitalis_report_${Date.now()}.pdf`);
  };

  const shareResults = () => {
    if (navigator.share) {
      navigator.share({
        title: 'VITALIS Screening Results',
        text: `My stroke screening result: ${risk} risk level`,
      });
    }
  };

  return (
    <div className="page-container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-large"
      >
        <div className="result-header" style={{ borderColor: riskColor }}>
          <h2 className="section-title">
            {language === "en" ? "Screening Results" : "जांच परिणाम"}
          </h2>
          <div className="risk-badge" style={{ backgroundColor: riskColor }}>
            {risk} RISK
          </div>
        </div>

        <motion.div 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="result-card"
          style={{ borderLeft: `4px solid ${riskColor}` }}
        >
          <h3 className="result-title">{message.title}</h3>
          <p className="result-desc">{message.desc}</p>
          <div className="action-box" style={{ backgroundColor: `${riskColor}15` }}>
            <AlertCircle size={20} color={riskColor} />
            <strong>{message.action}</strong>
          </div>
        </motion.div>

        <div className="summary-grid">
          <div className="summary-item">
            <Clock size={18} />
            <div>
              <span className="summary-label">Duration</span>
              <span className="summary-value">{duration}s</span>
            </div>
          </div>
          <div className="summary-item">
            <Activity size={18} />
            <div>
              <span className="summary-label">Symptoms</span>
              <span className="summary-value">{yesCount}/4</span>
            </div>
          </div>
        </div>

        <div className="answers-section">
          <h4>{language === "en" ? "Your Responses:" : "आपके उत्तर:"}</h4>
          <div className="answers-list">
            {Object.entries(answers).map(([key, value]) => {
              const labels = {
                face: language === "en" ? "Face Drooping" : "चेहरा झुका",
                arm: language === "en" ? "Arm Weakness" : "हाथ कमजोर",
                speech: language === "en" ? "Speech Difficulty" : "बोलने में दिक्कत",
                time: language === "en" ? "Recent (<3hrs)" : "हाल का (<3 घंटे)"
              };
              
              return (
                <div key={key} className="answer-row">
                  <span>{labels[key]}</span>
                  <span className={`answer-value ${value}`}>
                    {value === "yes" ? (language === "en" ? "Yes" : "हाँ") : (language === "en" ? "No" : "नहीं")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {risk === "HIGH" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="emergency-section"
          >
            <button 
              className="btn-emergency" 
              onClick={() => navigate("/map")}
            >
              <MapPin size={20} />
              {language === "en" ? "Find Nearest Hospital" : "निकटतम अस्पताल खोजें"}
            </button>
            
            <button 
              className="btn-call"
              onClick={() => window.location.href = "tel:108"}
            >
              <Phone size={20} />
              {language === "en" ? "Call 108 Emergency" : "108 आपातकाल कॉल करें"}
            </button>
          </motion.div>
        )}

        <div className="action-buttons">
          <button className="btn-secondary" onClick={downloadPDF}>
            <Download size={18} />
            {language === "en" ? "Download PDF" : "PDF डाउनलोड करें"}
          </button>
          
          <button className="btn-secondary" onClick={shareResults}>
            <ChevronRight size={18} />
            {language === "en" ? "Share Results" : "परिणाम साझा करें"}
          </button>
        </div>

        <button 
          className="btn-primary" 
          onClick={() => navigate("/")}
        >
          <HomeIcon size={18} />
          {language === "en" ? "New Screening" : "नई जांच"}
        </button>

        <p className="disclaimer">
          {language === "en"
            ? "This is a screening tool. Consult a doctor for medical advice."
            : "यह एक स्क्रीनिंग टूल है। चिकित्सा सलाह के लिए डॉक्टर से परामर्श करें।"}
        </p>
      </motion.div>
    </div>
  );
}

function Dashboard({ language }) {
  const navigate = useNavigate();
  const history = JSON.parse(localStorage.getItem("vitalis_history")) || [];
  
  const stats = {
    total: history.length,
    high: history.filter(h => {
      const yesCount = Object.values(h.answers).filter(a => a === "yes").length;
      return yesCount >= 2 && h.answers.time === "yes";
    }).length,
    medium: history.filter(h => {
      const yesCount = Object.values(h.answers).filter(a => a === "yes").length;
      return yesCount === 1 || (yesCount >= 2 && h.answers.time !== "yes");
    }).length,
    low: history.filter(h => {
      const yesCount = Object.values(h.answers).filter(a => a === "yes").length;
      return yesCount === 0;
    }).length,
    avgDuration: history.length > 0 
      ? Math.round(history.reduce((sum, h) => sum + (h.duration || 0), 0) / history.length)
      : 0
  };

  const clearHistory = () => {
    if (window.confirm("Clear all screening history?")) {
      localStorage.removeItem("vitalis_history");
      window.location.reload();
    }
  };

  return (
    <div className="page-container">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card-large"
      >
        <h2 className="section-title">
          <BarChart3 size={28} />
          Admin Dashboard
        </h2>

        <div className="stats-grid">
          <div className="stat-card">
            <Users size={24} color="#3B82F6" />
            <div>
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Screenings</span>
            </div>
          </div>

          <div className="stat-card">
            <TrendingUp size={24} color="#10B981" />
            <div>
              <span className="stat-value">{stats.avgDuration}s</span>
              <span className="stat-label">Avg Duration</span>
            </div>
          </div>

          <div className="stat-card risk-high">
            <AlertCircle size={24} color="#DC2626" />
            <div>
              <span className="stat-value">{stats.high}</span>
              <span className="stat-label">High Risk</span>
            </div>
          </div>

          <div className="stat-card risk-medium">
            <AlertCircle size={24} color="#F59E0B" />
            <div>
              <span className="stat-value">{stats.medium}</span>
              <span className="stat-label">Medium Risk</span>
            </div>
          </div>

          <div className="stat-card risk-low">
            <CheckCircle size={24} color="#10B981" />
            <div>
              <span className="stat-value">{stats.low}</span>
              <span className="stat-label">Low Risk</span>
            </div>
          </div>
        </div>

        <div className="history-section">
          <h3>Recent Screenings</h3>
          <div className="history-list">
            {history.slice(-5).reverse().map((item, index) => {
              const yesCount = Object.values(item.answers).filter(a => a === "yes").length;
              let risk = "LOW";
              if (yesCount >= 2 && item.answers.time === "yes") risk = "HIGH";
              else if (yesCount >= 1) risk = "MEDIUM";

              return (
                <div key={index} className="history-item">
                  <div className="history-info">
                    <span className="history-date">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                    <span className={`history-risk ${risk.toLowerCase()}`}>
                      {risk}
                    </span>
                  </div>
                  <span className="history-duration">{item.duration}s</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="dashboard-actions">
          <button className="btn-secondary" onClick={clearHistory}>
            Clear History
          </button>
          <button className="btn-primary" onClick={() => navigate("/")}>
            <HomeIcon size={18} />
            Back Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function MapPage({ language }) {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          findNearbyHospitals(location);
        },
        (error) => {
          console.error("Location error:", error);
          setLoading(false);
          const defaultLocation = { lat: 28.6139, lng: 77.2090 };
          setUserLocation(defaultLocation);
          findNearbyHospitals(defaultLocation);
        }
      );
    } else {
      setLoading(false);
    }
  }, []);

  const findNearbyHospitals = (location) => {
    const mockHospitals = [
      {
        name: "City General Hospital",
        address: "123 Main Street",
        distance: "2.3 km",
        phone: "011-12345678",
        emergency: true
      },
      {
        name: "Apollo Hospital",
        address: "456 Park Avenue",
        distance: "3.5 km",
        phone: "011-87654321",
        emergency: true
      },
      {
        name: "AIIMS Emergency",
        address: "789 Medical Complex",
        distance: "4.2 km",
        phone: "011-26588500",
        emergency: true
      },
      {
        name: "Max Healthcare",
        address: "321 Hospital Road",
        distance: "5.1 km",
        phone: "011-26925858",
        emergency: true
      }
    ];

    setTimeout(() => {
      setHospitals(mockHospitals);
      setLoading(false);
    }, 1000);
  };

  const openInMaps = (hospital) => {
    if (userLocation) {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${encodeURIComponent(hospital.name + " " + hospital.address)}`;
      window.open(mapsUrl, '_blank');
    }
  };

  return (
    <div className="page-container">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card-large"
      >
        <h2 className="section-title">
          <MapPin size={28} />
          {language === "en" ? "Nearby Hospitals" : "निकटतम अस्पताल"}
        </h2>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>{language === "en" ? "Finding hospitals near you..." : "आपके पास अस्पताल खोज रहे हैं..."}</p>
          </div>
        ) : (
          <>
            <div className="location-info">
              <MapPin size={18} />
              <p>{language === "en" ? "Showing hospitals within 10km" : "10 किमी के भीतर अस्पताल दिखा रहे हैं"}</p>
            </div>

            <div className="hospital-list">
              {hospitals.map((hospital, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="hospital-card"
                >
                  <div className="hospital-header">
                    <h3>{hospital.name}</h3>
                    {hospital.emergency && (
                      <span className="emergency-badge">
                        {language === "en" ? "24/7 Emergency" : "24/7 आपातकाल"}
                      </span>
                    )}
                  </div>
                  
                  <p className="hospital-address">{hospital.address}</p>
                  
                  <div className="hospital-details">
                    <div className="hospital-info">
                      <MapPin size={16} />
                      <span>{hospital.distance}</span>
                    </div>
                    <div className="hospital-info">
                      <Phone size={16} />
                      <span>{hospital.phone}</span>
                    </div>
                  </div>

                  <div className="hospital-actions">
                    <button 
                      className="btn-direction"
                      onClick={() => openInMaps(hospital)}
                    >
                      <MapPin size={18} />
                      {language === "en" ? "Get Directions" : "दिशा-निर्देश पाएं"}
                    </button>
                    <button 
                      className="btn-call"
                      onClick={() => window.location.href = `tel:${hospital.phone}`}
                    >
                      <Phone size={18} />
                      {language === "en" ? "Call" : "कॉल करें"}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="emergency-banner">
              <AlertCircle size={20} />
              <div>
                <strong>{language === "en" ? "Critical Emergency?" : "गंभीर आपातकाल?"}</strong>
                <p>{language === "en" ? "Call 108 immediately" : "तुरंत 108 पर कॉल करें"}</p>
              </div>
              <button 
                className="btn-emergency-small"
                onClick={() => window.location.href = "tel:108"}
              >
                <Phone size={18} />
                108
              </button>
            </div>
          </>
        )}

        <button 
          className="btn-back" 
          onClick={() => navigate(-1)}
        >
          {language === "en" ? "← Back" : "← वापस"}
        </button>
      </motion.div>
    </div>
  );
}

function App() {
  const [language, setLanguage] = useState("en");

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home language={language} setLanguage={setLanguage} />} />
        <Route path="/screening" element={<Screening language={language} />} />
        <Route path="/result" element={<Result language={language} />} />
        <Route path="/dashboard" element={<Dashboard language={language} />} />
        <Route path="/map" element={<MapPage language={language} />} />
      </Routes>
    </Router>
  );
}

export default App;