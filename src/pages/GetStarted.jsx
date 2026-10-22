import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { Users, QrCode, BarChart3, CheckCircle, Shield, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Button component (kept for potential use elsewhere)
const Button = React.forwardRef(({ className = "", variant = "default", size = "default", asChild = false, onClick, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  const variantClass = variant === "outline" ? "btn-outline" : variant === "ghost" ? "btn-ghost" : "btn-default";
  const sizeClass = size === "lg" ? "btn-lg" : size === "sm" ? "btn-sm" : "";
  return (
    <Comp className={`btn ${variantClass} ${sizeClass} ${className}`} ref={ref} onClick={onClick} {...props} />
  )
})
Button.displayName = "Button"

const Card = React.forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`card ${className}`} {...props} />
))
Card.displayName = "Card"

const CardContent = React.forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={className} {...props} />
))
CardContent.displayName = "CardContent"

// Deep blue gradient from login page button
const BUTTON_GRAD = `linear-gradient(135deg, #1E5A87 0%, #0A3A4F 100%)`;

export default function GetStarted() {
  const navigate = useNavigate();

  const infotessLogo = "/infotess logo.jpg";
  const infoLab = "/info lab.webp";

  const handleNavigate = (path) => {
    navigate(path);
  };

  const styles = {
    btnBase: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      fontWeight: '500',
      fontSize: '14px',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      fontFamily: 'inherit',
    },
    btnDefault: {
      backgroundColor: '#22046eff',
      color: '#ffffffff',
      padding: '10px 20px',
      border: 'none',
    },
    btnOutline: {
      backgroundColor: 'transparent',
      color: '#ffffff',
      border: '1px solid rgba(255, 255, 255, 0.86)',
      padding: '10px 20px',
    },
    btnGhost: {
      backgroundColor: 'solid',
      color: '#0926e3ff',
      padding: '10px 20px',
      border: 'none',
    },
    btnLg: {
      padding: '12px 32px',
      fontSize: '16px',
    },
    btnSm: {
      padding: '6px 16px',
      fontSize: '12px',
    },
    // Sign In button – deep blue gradient + white outline + animation
    signInBtn: {
      background: BUTTON_GRAD,
      color: '#ffffff',
      padding: '12px 32px',
      fontSize: '16px',
      border: '2px solid white',
      borderRadius: '40px',   // more rounded, friendly look
      transition: 'all 0.3s ease',
      animation: 'pulseBorder 1.5s infinite',
    },
    landingContainer: {
      minHeight: '100vh',
      backgroundColor: '#3e85e2ff',
    },
    heroSection: {
      position: 'relative',
      height: '100vh',
      overflow: 'hidden',
    },
    heroBgContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 0,
    },
    heroBgImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      animation: 'zoomIn 20s ease-in-out infinite',
    },
    heroOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(44, 142, 216, 0.4)',
    },
    navbar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      padding: '20px 0',
    },
    navbarContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    navbarLogoLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',         // reduced gap – text sits right next to logo
      cursor: 'pointer',
    },
    navbarLogoBox: {
      // No fixed width/height – container shrinks to fit the image
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
    },
    navbarLogo: {
      width: '30px',
      height: '30px',
      objectFit: 'contain',
      borderRadius: '12px',
    },
    navbarTitle: {
      color: '#ffffff',
      fontSize: '14px',
      fontWeight: '600',
      letterSpacing: '1px',
      whiteSpace: 'normal', fontSize: 'clamp(11px, 2.5vw, 14px)',
    },
    heroContentArea: {
      position: 'relative',
      zIndex: 2,
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '0 20px',
    },
    heroTextContainer: {
      maxWidth: '800px',
      color: '#ffffff',
    },
    heroLogoBox: {
      width: 'clamp(70px, 16vw, 120px)',
      height: 'clamp(70px, 16vw, 120px)',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 20px',
    },
    heroLogo: {
      width: 'clamp(64px, 15vw, 110px)',
      height: 'clamp(64px, 15vw, 110px)',
      objectFit: 'contain',
      borderRadius: '16px',
    },
    heroTitle: {
      fontSize: 'clamp(32px, 8.5vw, 84px)',
      fontWeight: '830',
      marginBottom: '5px',
      letterSpacing: '2px',
    },
    heroSubtitle: {
      fontSize: 'clamp(15px, 4vw, 28px)',
      fontWeight: '550',
      marginBottom: '10px',
      opacity: 0.9,
    },
    heroTagline: {
      fontSize: 'clamp(13px, 3.2vw, 18px)',
      marginBottom: '20px',
      opacity: 0.8,
    },
    heroDesc: {
      fontSize: 'clamp(13px, 3.2vw, 18px)',
      lineHeight: '1.6',
      marginBottom: '30px',
      opacity: 0.9,
      maxWidth: '600px',
      margin: '0 auto 30px',
    },
    heroButtons: {
      display: 'flex',
      gap: '16px',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    featuresSection: {
      padding: 'clamp(40px, 6vw, 70px) 16px',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      boxSizing: 'border-box',
      overflow: 'hidden',
    },
    featuresTitle: {
      textAlign: 'center',
      fontSize: 'clamp(24px, 5vw, 36px)',
      fontWeight: '700',
      marginBottom: '12px',
      color: '#1a1a1a',
    },
    featuresSubtitle: {
      textAlign: 'center',
      fontSize: 'clamp(14px, 3.2vw, 18px)',
      color: '#666',
      marginBottom: 'clamp(20px, 4vw, 40px)',
      maxWidth: '700px',
      margin: '0 auto clamp(20px, 4vw, 40px)',
      padding: '0 12px',
    },
    featuresGrid: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '30px',
      padding: '0 20px',
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'pointer',
    },
    cardContent: {
      padding: '30px',
      textAlign: 'center',
    },
    featuresIconBox: {
      width: '60px',
      height: '60px',
      backgroundColor: '#f0e6ff',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 20px',
      color: '#040610ff',
    },
    featuresCardTitle: {
      fontSize: 'clamp(13px, 3.2vw, 18px)',
      fontWeight: '600',
      marginBottom: '12px',
      color: '#040610ff',
    },
    featuresCardDesc: {
      fontSize: '14px',
      color: '#040610ff',
      lineHeight: '1.5',
    },
    whySection: {
      padding: '80px 20px',
      backgroundColor: '#ffffff',
    },
    whyContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
    },
    whyGrid: {
      maxWidth: '900px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '30px',
    },
    whyItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '20px',
      padding: '20px',
      borderRadius: '12px',
      backgroundColor: '#f8f9fa',
    },
    whyIconBox: {
      width: '50px',
      height: '50px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    whyIconBoxGreen: {
      backgroundColor: '#d4edda',
      color: '#24099eff',
    },
    whyIconBoxBlue: {
      backgroundColor: '#d1ecf1',
      color: '#24099eff',
    },
    whyIconBoxAmber: {
      backgroundColor: '#fff3cd',
      color: '#24099eff',
    },
    whyItemTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '8px',
      color: '#1a1a1a',
    },
    whyItemDesc: {
      fontSize: '14px',
      color: '#666',
      lineHeight: '1.5',
    },
    footer: {
      background: BUTTON_GRAD,    // now uses the same gradient as the button
      color: '#ffffff',
      textAlign: 'center',
      padding: '20px',
      fontSize: '14px',
      overflow: 'hidden',
      whiteSpace: 'normal', fontSize: 'clamp(11px, 2.5vw, 14px)',
    },
    marquee: {
      display: 'inline-block',
      animation: 'scrollText 20s linear infinite',
    },
  };

  return (
    <div style={styles.landingContainer}>
      <style>
        {`
          @keyframes zoomIn {
            0% { transform: scale(1); }
            100% { transform: scale(1.1); }
          }
          .animate-fade-in {
            animation: fadeIn 1s ease-in;
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
          }
          @keyframes scrollText {
            0% {
              transform: translateX(100%);
            }
            100% {
              transform: translateX(-100%);
            }
          }
          /* Pulsing border animation for Sign In button */
          @keyframes pulseBorder {
            0% {
              box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
              transform: scale(1);
            }
            50% {
              box-shadow: 0 0 0 12px rgba(255, 255, 255, 0);
              transform: scale(1.02);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
              transform: scale(1);
            }
          }
          .sign-in-pulse {
            animation: pulseBorder 1.5s infinite;
          }

          .features-slider-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 24px;
            padding: 10px 0;
            width: 100%;
            box-sizing: border-box;
          }

          .features-slider-card {
            width: 100%;
            box-sizing: border-box;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 4px 14px rgba(0,0,0,0.06);
            border: 1px solid rgba(0,0,0,0.05);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }

          .features-slider-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 22px rgba(30, 90, 135, 0.12);
          }

          .features-mobile-swipe-hint {
            display: none;
          }

          @media (max-width: 768px) {
            .features-slider-container {
              display: flex !important;
              flex-direction: row !important;
              flex-wrap: nowrap !important;
              overflow-x: auto !important;
              overflow-y: hidden !important;
              scroll-snap-type: x mandatory !important;
              -webkit-overflow-scrolling: touch !important;
              gap: 16px !important;
              padding: 12px 16px 24px 16px !important;
              scrollbar-width: thin !important;
              scrollbar-color: #2A6B9E #e2e8f0 !important;
            }

            .features-slider-container::-webkit-scrollbar {
              height: 6px;
            }
            .features-slider-container::-webkit-scrollbar-track {
              background: #e2e8f0;
              border-radius: 10px;
            }
            .features-slider-container::-webkit-scrollbar-thumb {
              background: #2A6B9E;
              border-radius: 10px;
            }

            .features-slider-card {
              flex: 0 0 82% !important;
              max-width: 320px !important;
              min-width: 260px !important;
              scroll-snap-align: center !important;
              scroll-snap-stop: always !important;
            }

            .features-mobile-swipe-hint {
              display: flex !important;
              align-items: center;
              justify-content: center;
              gap: 8px;
              color: #2A6B9E;
              font-size: 13px;
              font-weight: 500;
              margin-top: 12px;
              text-align: center;
            }
          }

        `}
      </style>

      {/* Fullscreen Hero Background */}
      <div style={styles.heroSection}>
        <div style={styles.heroBgContainer}>
          <img
            src={infoLab}
            alt="INFOTESS Lab"
            style={styles.heroBgImg}
          />
          <div style={styles.heroOverlay} />
        </div>

        {/* Navbar - without top-right buttons, text tightly next to logo */}
        <header style={styles.navbar}>
          <div style={styles.navbarContainer}>
            <div style={styles.navbarLogoLink} onClick={() => handleNavigate('/')}>
              <div style={styles.navbarLogoBox}>
                <img src={infotessLogo} alt="INFOTESS Logo" style={styles.navbarLogo} />
              </div>
              <span style={styles.navbarTitle}>INFOCTESS CLASS SMART ATTENDANCE</span>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div style={styles.heroContentArea}>
          <div style={styles.heroTextContainer} className="animate-fade-in">
            <div style={styles.heroLogoBox}>
              <img src={infotessLogo} alt="INFOTESS Logo" style={styles.heroLogo} />
            </div>
            <h1 style={styles.heroTitle}>INFOCTESS</h1>
            {/* Exact text from screenshot */}
            <p style={styles.heroSubtitle}>CLASS SMART ATTENDANCE</p>
            <p style={styles.heroTagline}>Technology For Development</p>
            <p style={styles.heroDesc}>
              Redefining student attendance across all groups for each course with QR codes, session codes, and real-time dashboards.
            </p>
            <div style={styles.heroButtons}>
              {/* Sign In button with white outline + pulse animation */}
              <button
                onClick={() => handleNavigate('/login')}
                style={{ ...styles.btnBase, ...styles.signInBtn }}
                className="sign-in-pulse"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features section unchanged */}
      <section style={styles.featuresSection}>
        <h2 style={styles.featuresTitle}>How It Works</h2>
        <p style={styles.featuresSubtitle}>Simple, fast, and reliable attendance tracking for your university courses</p>
                <div style={styles.featuresGrid}>
          <div className="features-slider-container">
            <div className="features-slider-card">
              <div style={styles.cardContent}>
                <div style={styles.featuresIconBox}><QrCode size={30} /></div>
                <h3 style={styles.featuresCardTitle}>QR Code & Session Codes</h3>
                <p style={styles.featuresCardDesc}>Course reps generate QR codes and session codes. Students scan or type to check in instantly.</p>
              </div>
            </div>
            <div className="features-slider-card">
              <div style={styles.cardContent}>
                <div style={styles.featuresIconBox}><Users size={30} /></div>
                <h3 style={styles.featuresCardTitle}>Group-Based Management</h3>
                <p style={styles.featuresCardDesc}>Custom student groups, each with a course representative managing attendance for all registered courses.</p>
              </div>
            </div>
            <div className="features-slider-card">
              <div style={styles.cardContent}>
                <div style={styles.featuresIconBox}><BarChart3 size={30} /></div>
                <h3 style={styles.featuresCardTitle}>Real-Time Reports</h3>
                <p style={styles.featuresCardDesc}>Lecturers view live attendance data. Students below 75% are automatically flagged.</p>
              </div>
            </div>
          </div>
          <div className="features-mobile-swipe-hint">
            <span>Swipe left & right to view more</span>
            <span>&rarr;</span>
          </div>
        </div>
      </section>

      {/* Scrolling footer marquee with gradient background */}
      <footer style={styles.footer}>
        <div style={styles.marquee}>
          © 2026 INFOCTESS CLASS SMART ATTENDANCE. Developed by Oduro and Heis &nbsp;&nbsp;&nbsp;
          © 2026 INFOCTESS CLASS SMART ATTENDANCE. Developed by Oduro and Heis &nbsp;&nbsp;&nbsp;
          © 2026 INFOCTESS CLASS SMART ATTENDANCE. Developed by Oduro and Heis
        </div>
      </footer>
    </div>
  );
}