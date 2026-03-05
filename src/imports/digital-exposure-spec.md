Build a fully functional dark cyberpunk security awareness web app called 
"DIGITAL EXPOSURE" — deployable on GitHub Pages as pure HTML + CSS + JS 
(no backend, no build tools, no frameworks required).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ CRITICAL REQUIREMENT — READ FIRST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

After generating the design, you MUST output a complete technical spec 
containing:

1. LIST OF ALL DATA COLLECTION METHODS used in the JS layer:
   - Browser APIs used (Navigator, WebGL, Canvas, WebRTC, AudioContext, etc.)
   - For each: the exact property or method call (e.g. navigator.hardwareConcurrency)
   - What data it returns and what it exposes

2. LIST OF ALL EXTERNAL API ENDPOINTS called:
   - Full URL pattern (e.g. https://api.ipify.org?format=json)
   - HTTP method (GET/POST)
   - What data it returns
   - Whether it requires an API key
   - CORS compatibility for GitHub Pages (must be CORS-safe)

3. COMPLETE JS DATA COLLECTION MODULE as a code block:
   - One async function collectAllData() that returns a structured object
   - Must include: IP geolocation, WebRTC local IP leak, Canvas fingerprint, 
     WebGL renderer/vendor, Audio fingerprint hash, navigator properties 
     (60+ fields), screen metrics, battery, sensors, media devices, storage 
     availability, timezone, language, do-not-track, connection info
   - Final field: deviceHash (SHA-256 of all collected data combined)

4. ATTACK SIMULATION LOGIC as a code block:
   - Function analyzeExposure(userInputs) that receives { name, email, phone, 
     username, city, company } and returns a structured risk object per field
   - Each risk entry: { field, icon, riskLevel: "HIGH|MEDIUM|LOW", 
     vectors: string[] }

This technical output is MANDATORY — the design alone is useless without it.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 DESIGN SYSTEM — TOKENS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Colors (CSS variables):
  --bg-void:        #080B0F   ← main background
  --bg-surface:     #0D1117   ← card backgrounds
  --bg-elevated:    #161B22   ← hover states, inputs
  --border-dim:     #21262D   ← inactive borders
  --border-glow:    #00FF41   ← active/focus borders
  --text-primary:   #E6EDF3   ← main text
  --text-secondary: #8B949E   ← labels, subtext
  --text-muted:     #484F58   ← disabled, placeholders
  --accent-green:   #00FF41   ← primary accent (success, active)
  --accent-red:     #FF2D2D   ← high risk, danger
  --accent-amber:   #F0A500   ← medium risk, warning
  --accent-cyan:    #58A6FF   ← info, links
  --glow-green:     0 0 12px #00FF4155, 0 0 30px #00FF4120
  --glow-red:       0 0 12px #FF2D2D55, 0 0 30px #FF2D2D20

Typography:
  --font-mono:   'Share Tech Mono', 'Fira Code', monospace  ← ALL UI text
  --font-display: 'Orbitron', sans-serif  ← headers only
  Import both from Google Fonts.

  Scale:
    --text-xs:   0.65rem / 1.4
    --text-sm:   0.75rem / 1.5
    --text-base: 0.875rem / 1.6
    --text-lg:   1rem / 1.5
    --text-xl:   1.25rem / 1.4
    --text-2xl:  1.75rem / 1.2
    --text-3xl:  2.5rem / 1.1

Spacing: 4px base unit. Use multiples: 4, 8, 12, 16, 24, 32, 48, 64, 96px

Border radius:
  --radius-sm: 2px   ← inputs, badges
  --radius-md: 4px   ← cards
  --radius-lg: 8px   ← panels
  --radius-pill: 100px

Transitions:
  --transition-fast: 120ms ease
  --transition-base: 220ms ease
  --transition-slow: 400ms cubic-bezier(0.16, 1, 0.3, 1)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🖥️ GLOBAL LAYOUT & EFFECTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Canvas background:
  - Animated particle grid: green dots (#00FF41 at 15% opacity) connected 
    by lines when within 120px, all slowly drifting
  - Overlay: repeating-linear-gradient scanlines 
    (2px black at 50% opacity, every 4px) — fixed position, pointer-events none
  - Vignette: radial-gradient from transparent center to #000 at edges

Custom cursor:
  - Replace default cursor with a crosshair made of 4 short green lines 
    that leave a brief motion trail

Scrollbar:
  - Track: #0D1117
  - Thumb: #00FF41 at 40% opacity, hover at 80%
  - Width: 4px

Header (sticky, always visible):
  - Height: 48px
  - Background: rgba(8,11,15,0.85) with backdrop-filter blur(12px)
  - Left: "▸ DIGITAL_EXPOSURE" in --font-mono --accent-green, letter-spacing 4px
  - Right: Step indicator "01 / 03" that updates per screen
  - Bottom border: 1px solid --border-dim
  - On scroll: border becomes --border-glow with box-shadow --glow-green

Step navigation:
  - 3 dots at bottom center of viewport, fixed position
  - Active: filled green circle with pulse ring animation
  - Inactive: hollow circle, --border-dim
  - Completed: checkmark icon in --accent-green

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📺 SCREEN 1 — DEVICE SCANNER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Full viewport height, content centered vertically and horizontally.

TOP LABEL:
  Text: "// INITIALIZING THREAT ASSESSMENT PROTOCOL"
  Style: --text-xs, --text-muted, letter-spacing 3px
  Animation: fade in at 0s

MAIN TERMINAL BLOCK:
  Width: min(680px, 90vw)
  Background: --bg-surface
  Border: 1px solid --border-dim
  Border-radius: --radius-md
  Box-shadow: 0 0 0 1px #00FF4110, 0 24px 64px rgba(0,0,0,0.6)
  
  TERMINAL TITLEBAR:
    Height: 32px
    Background: --bg-elevated
    Border-bottom: 1px solid --border-dim
    Left: 3 dots (red #FF5F57, yellow #FFBD2E, green #28C840) — 10px each
    Center: "digital_exposure_v1.0 — /dev/scanner" in --text-xs --text-muted
  
  TERMINAL BODY: padding 24px
  
    Line 1 (appears at 0.3s): 
      "> sudo ./scan --device --network --fingerprint --deep"
      Color: --accent-green, cursor ▊ blinks after
    
    Blank line
    
    Line 2 (1.0s): "[  OK  ] Scanner module loaded" — --text-secondary
    Line 3 (1.4s): "[  OK  ] WebRTC probe active" — --text-secondary
    Line 4 (1.8s): "[ WARN ] DNT header ignored by 94% of trackers" — --accent-amber
    
    Blank line
    
    PROGRESS BAR SECTION (appears at 2.2s):
      Label: "ANALYZING DEVICE..." in --text-xs --accent-green letter-spacing 2px
      Bar container: full width, height 6px, bg --bg-elevated, radius 3px
      Bar fill: gradient left-to-right #00FF41 → #58A6FF, animates from 0→100% 
        over 4 seconds with easing, has flickering glow box-shadow
      Percentage counter: right-aligned, updates in real-time "0% ... 100%"
    
    Blank line
    
    SCAN RESULTS (each line types in one by one, starting at 2.5s, 300ms apart):
    
      "✓ IP ADDRESS .............. [EXPOSED]"          — red badge
      "✓ OPERATING SYSTEM ........ [IDENTIFIED]"       — red badge
      "✓ GPU RENDERER ............ [CAPTURED]"         — red badge
      "✓ AUDIO FINGERPRINT ....... [UNIQUE HASH]"      — red badge
      "✓ CANVAS FINGERPRINT ...... [GENERATED]"        — red badge
      "✓ WEBRTC LOCAL IP ......... [LEAKED]"           — red badge
      "✓ BATTERY STATUS .......... [READABLE]"         — amber badge
      "✓ MEDIA DEVICES ........... [ENUMERATED]"       — amber badge
      "✓ TIMEZONE & LOCALE ....... [EXPOSED]"          — amber badge
      "✓ DEVICE FINGERPRINT ...... [CREATED]"          — red badge
    
      Badge style: 
        - Red: bg rgba(255,45,45,0.15), border 1px solid --accent-red, 
          color --accent-red, --text-xs, padding 1px 6px, --radius-sm
        - Amber: same pattern with --accent-amber
    
    Blank line
    
    FINAL LINE (appears when progress hits 100%):
      "» FINGERPRINT_ID: [GENERATING...]"
      After 500ms, replace with actual hash:
      "» FINGERPRINT_ID: 9F3A-1C72-AD91-77F4"
      Color: --accent-cyan, --text-lg, letter-spacing 2px
      Has subtle cyan glow

BOTTOM CTA (appears 500ms after last scan line):
  Button: "VIEW FULL EXPOSURE REPORT  →"
  Style: 
    - Border: 1px solid --accent-green
    - Background: transparent
    - Color: --accent-green
    - Font: --font-mono --text-sm letter-spacing 3px
    - Padding: 14px 32px
    - Hover: background --accent-green, color --bg-void, 
      box-shadow --glow-green, transform translateY(-2px)
    - Active: transform translateY(0)
    - Transition: --transition-base
  Below button: "--text-xs --text-muted center" 
    "⚠ No data leaves your browser. All processing is local."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 SCREEN 2 — EXPOSURE DASHBOARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Layout: max-width 1100px, centered, padding 48px 24px

ALERT BANNER (top):
  Background: rgba(255,45,45,0.08)
  Border: 1px solid rgba(255,45,45,0.3)
  Border-left: 4px solid --accent-red
  Padding: 16px 20px
  Content: "⚠  YOUR BROWSER EXPOSED 63 DATA POINTS TO THIS PAGE"
  Sub: "A real tracker would have already built your profile."
  Animate: slide down from top + fade in

SCORE SECTION (centered, below banner, margin-top 48px):
  
  CIRCULAR GAUGE:
    Size: 200px × 200px
    SVG circle with stroke-dasharray animation
    Track circle: stroke --bg-elevated, stroke-width 12
    Progress arc: stroke gradient red→amber, stroke-width 12,
      animates from 0 to 78% over 1.5s with easeOutCubic,
      stroke-linecap round
    Center text: "78" in --font-display 3rem --accent-red
    Below center: "/ 100" in --text-sm --text-secondary
    Label below gauge: "DIGITAL EXPOSURE SCORE" 
      --text-xs letter-spacing 4px --text-muted
  
  CLASSIFICATION BADGE (below gauge):
    "● HIGH EXPOSURE RISK"
    Background: rgba(255,45,45,0.12)
    Border: 1px solid --accent-red
    Color: --accent-red
    --font-mono --text-sm letter-spacing 2px
    Padding: 8px 20px --radius-pill

METRIC CARDS ROW (3 cards, CSS grid, gap 16px, margin-top 48px):
  
  Each card:
    Background: --bg-surface
    Border: 1px solid --border-dim
    Border-top: 2px solid [card accent color]
    Padding: 20px
    Border-radius: --radius-md
    Hover: border-color [accent at 60%], box-shadow [glow variant], 
      transform translateY(-3px)
    Transition: --transition-slow
  
  Card 1 — TRACKING RISK:
    Accent: --accent-red
    Icon: 🎯 (or SVG target icon in red)
    Label: "TRACKING RISK" --text-xs letter-spacing 3px --text-muted
    Value: "HIGH" --font-display --text-2xl --accent-red
    Footer: "Unique across 99.7% of users"
  
  Card 2 — FINGERPRINT:
    Accent: --accent-red
    Icon: 👁 (or SVG eye icon)
    Label: "BROWSER FINGERPRINT" --text-xs letter-spacing 3px --text-muted
    Value: "UNIQUE" --font-display --text-2xl --accent-red
    Footer: "Identifiable without cookies"
  
  Card 3 — NETWORK:
    Accent: --accent-amber
    Icon: 📡
    Label: "NETWORK EXPOSURE" --text-xs letter-spacing 3px --text-muted
    Value: "EXPOSED" --font-display --text-2xl --accent-amber
    Footer: "ISP + location visible"

DATA CATEGORIES SECTION (margin-top 48px):
  
  Section title: "COLLECTED DATA BREAKDOWN" 
    --text-xs letter-spacing 4px --text-muted, margin-bottom 16px
  
  Each category row (expandable accordion):
    Container: --bg-surface border --border-dim --radius-md margin-bottom 8px
    
    HEADER (always visible, clickable):
      Padding: 16px 20px
      Left: [emoji icon] + [category name in --font-mono --text-base --text-primary]
      Center: [count badge] — e.g. "10 data points"
        Badge: bg rgba(0,255,65,0.1), border 1px solid rgba(0,255,65,0.3),
          color --accent-green, --text-xs padding 2px 10px --radius-pill
      Right: chevron icon, rotates 180° when expanded
      Hover: background --bg-elevated
    
    EXPANDED CONTENT (hidden by default, animates height):
      Padding: 0 20px 16px
      Top border: 1px solid --border-dim
      Grid: 2 columns on desktop, 1 on mobile
      
      Each data item row:
        "property_name ........ value"
        Color: --text-muted for name, --text-secondary for value
        --text-sm --font-mono
        On hover: --accent-green for value
    
    Categories to include:
    ┌ 🌐 NETWORK (10 items)
    │   ip_public, ip_local_webrtc, isp_name, asn, country, region, 
    │   city_approx, connection_type, latency_ms, effective_bandwidth
    ├ 💻 SYSTEM (7 items)  
    │   os_name, os_version, cpu_architecture, cpu_cores, ram_estimate_gb,
    │   platform, device_type
    ├ 🌍 BROWSER (9 items)
    │   browser_name, browser_version, user_agent, language_primary,
    │   language_list, cookies_enabled, do_not_track, webassembly, 
    │   service_workers
    ├ 🖥️ DISPLAY (6 items)
    │   screen_resolution, viewport_width, viewport_height, 
    │   device_pixel_ratio, color_depth, screen_orientation
    ├ 🎮 HARDWARE (4 items)
    │   gpu_renderer, gpu_vendor, webgl_version, webgl2_supported
    ├ 🎨 FINGERPRINTS (4 items)
    │   canvas_hash, webgl_hash, audio_hash, font_list_hash
    ├ 🔋 DEVICE STATUS (3 items)
    │   battery_level, charging_status, time_to_full
    ├ 📡 SENSORS (3 items)
    │   accelerometer, gyroscope, orientation_sensor
    ├ 📷 MEDIA DEVICES (3 items)
    │   cameras_count, microphones_count, speakers_count
    ├ 📂 STORAGE (3 items)
    │   localstorage, sessionstorage, indexeddb
    ├ ⏰ ENVIRONMENT (4 items)
    │   timezone_name, utc_offset, local_date, unix_timestamp
    └ 🔐 SECURITY (3 items)
        https_active, mixed_content, webrtc_enabled

FINAL FINGERPRINT DISPLAY (margin-top 48px, centered):
  Label: "YOUR UNIQUE DEVICE FINGERPRINT" --text-xs letter-spacing 4px --text-muted
  Hash display box:
    Background: --bg-surface
    Border: 1px solid rgba(0,255,65,0.3)
    Box-shadow: --glow-green (subtle)
    Padding: 20px 32px
    Text: "9F3A · 1C72 · AD91 · 77F4 · B2E8 · 4D3C"
    Font: --font-display --text-xl --accent-green letter-spacing 6px
  
  Below: copy button (icon + "COPY HASH") — on click shows "✓ COPIED"

CTA BUTTON (margin-top 48px, centered):
  Text: "SIMULATE ATTACKER VIEW  →"
  Same style as Screen 1 CTA button

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚔️ SCREEN 3 — ATTACK SIMULATOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Layout: max-width 800px centered, padding 48px 24px

HEADER:
  "ATTACKER SIMULATION MODE" 
  --font-display --text-2xl --accent-red, letter-spacing 4px
  
  Below: warning strip
    Background: rgba(240,165,0,0.08)
    Border: 1px solid rgba(240,165,0,0.3)
    Border-left: 4px solid --accent-amber
    Content: 
      "⚠ EDUCATIONAL SIMULATION ONLY"
      "This tool demonstrates what an attacker could infer from data 
       you share publicly. No information is stored, sent, or used 
       beyond this simulation."
    --text-sm --text-secondary

INPUT FORM (margin-top 40px):
  
  Form title: "Enter data you typically share online:"
    --text-xs letter-spacing 3px --text-muted
  
  Grid: 2 columns desktop, 1 column mobile, gap 16px, margin-top 20px
  
  Each input field:
    Container: position relative
    
    Input element:
      Background: --bg-surface
      Border: 1px solid --border-dim
      Border-radius: --radius-sm
      Padding: 12px 16px 12px 44px  ← space for icon
      Color: --text-primary
      Font: --font-mono --text-sm
      Width: 100%
      
      Placeholder: --text-muted
      
      Focus:
        Border-color: --accent-green
        Box-shadow: 0 0 0 3px rgba(0,255,65,0.1), --glow-green (subtle)
        Outline: none
      
      :not(:placeholder-shown) (has content):
        Border-color: rgba(0,255,65,0.4)
    
    Icon (left side, position absolute):
      Size: 16px, color --text-muted
      Focus-within parent: color --accent-green
    
    Label (above input):
      --text-xs letter-spacing 2px --text-muted
      Margin-bottom: 6px
    
    Risk indicator (right side, appears when field has content):
      Small dot: red for high-risk fields, amber for medium
      Tooltip on hover: "High risk data point"
  
  Fields:
    📛 NAME          placeholder: "john_doe"          risk: medium
    📧 EMAIL         placeholder: "you@domain.com"    risk: high
    📱 PHONE         placeholder: "+55 11 99999-9999" risk: high
    🔖 USERNAME      placeholder: "@yourhandle"       risk: high
    📍 CITY          placeholder: "São Paulo"          risk: medium
    🏢 COMPANY       placeholder: "Acme Corp"          risk: medium
  
  SUBMIT BUTTON (full width, margin-top 24px):
    Text: "▶  RUN ATTACK SIMULATION"
    Background: transparent
    Border: 1px solid --accent-red
    Color: --accent-red
    Font: --font-mono --text-sm letter-spacing 4px
    Padding: 16px
    Border-radius: --radius-sm
    
    Hover: 
      Background: --accent-red
      Color: --bg-void
      Box-shadow: --glow-red
      Transform: translateY(-2px)
    
    Loading state (after click, 1.5s):
      Text changes to "► ANALYZING... [███░░░░░░░]"
      Progress fills left to right
      Button disabled, opacity 0.8

RESULTS SECTION (appears after simulation, animate in):
  
  Results header:
    "ATTACK VECTORS IDENTIFIED" 
    --text-xs letter-spacing 4px --text-muted, margin-bottom 20px
    Left decoration: short horizontal line in --accent-red
  
  For each field that has content, show a RISK BLOCK:
    
    Card container:
      Background: --bg-surface
      Border: 1px solid rgba(255,45,45,0.25)
      Border-left: 3px solid --accent-red (HIGH) or --accent-amber (MEDIUM)
      Border-radius: --radius-md
      Padding: 20px
      Margin-bottom: 12px
      Animate: slide up + fade in, staggered 100ms per card
    
    Card header:
      Left: [field icon] + [FIELD_NAME in --font-mono --text-base --text-primary]
      Right: risk badge
        HIGH: bg rgba(255,45,45,0.12) border --accent-red color --accent-red
        MEDIUM: bg rgba(240,165,0,0.12) border --accent-amber color --accent-amber
        Text: "HIGH RISK" or "MEDIUM RISK", --text-xs letter-spacing 2px
    
    Divider: 1px solid --border-dim, margin 12px 0
    
    Vectors list:
      Each item: "✗  [attack vector description]"
      Color: --text-secondary, --text-sm --font-mono
      "✗" in --accent-red
      Padding: 4px 0
    
    Content per field:
    
    EMAIL → HIGH RISK:
      ✗ Account enumeration across 200+ platforms
      ✗ Credential stuffing if in breach databases
      ✗ Targeted phishing campaign entry point
      ✗ Password reset hijacking vector
      ✗ Cross-platform identity correlation
    
    PHONE → HIGH RISK:
      ✗ SIM swapping attack surface
      ✗ WhatsApp/Telegram social engineering
      ✗ SMS phishing (smishing) campaigns
      ✗ Account recovery bypass
      ✗ Reverse lookup reveals full name + address
    
    USERNAME → HIGH RISK:
      ✗ Cross-platform profile aggregation
      ✗ Found on: Instagram · Twitter · GitHub · Reddit · TikTok · LinkedIn
      ✗ Post history reveals location, employer, relationships
      ✗ Password pattern inference from old profiles
    
    NAME → MEDIUM RISK:
      ✗ Combined with city: LinkedIn profile found
      ✗ Combined with email: full identity profile built
      ✗ Social engineering pretexting material
    
    CITY → MEDIUM RISK:
      ✗ Narrows physical location for targeted attacks
      ✗ Local event/business data used for pretexting
      ✗ Combined with name: address lookup possible
    
    COMPANY → MEDIUM RISK:
      ✗ Corporate email pattern inference (name@company.com)
      ✗ LinkedIn coworker mapping
      ✗ Spear phishing with company context

  COMBINED RISK SCORE (bottom of results):
    Full-width card with border --accent-red
    "COMBINED ATTACK SURFACE SCORE: 84 / 100"
    --font-display --text-xl --accent-red, centered
    Below: "With this data, an attacker has enough to launch a targeted 
             spear phishing or account takeover campaign."
    --text-sm --text-secondary --font-mono, centered, max-width 500px

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 RESPONSIVE BREAKPOINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mobile (< 640px):
  - All grids collapse to 1 column
  - Terminal block: padding 16px
  - Metric cards: stacked vertically
  - Data category rows: single column expanded items
  - Score gauge: 160px
  - Typography: scale down 1 step

Tablet (640–1024px):
  - Metric cards: 2 columns
  - Form: 2 columns (existing)

Desktop (> 1024px):
  - Full layout as described above
  - Metric cards: 3 columns
  - Data items in accordion: 2 columns

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ ANIMATIONS SPEC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@keyframes typewriter:
  from { width: 0 } to { width: 100% }
  overflow: hidden, white-space: nowrap

@keyframes blink-cursor:
  0%, 100% { opacity: 1 } 50% { opacity: 0 }
  Duration: 800ms, infinite

@keyframes scanline-sweep:
  0% { transform: translateY(-100%) } 100% { transform: translateY(100vh) }
  A single brighter green line sweeping top to bottom every 4s

@keyframes flicker:
  0%, 100% { opacity: 1 } 
  92% { opacity: 1 } 93% { opacity: 0.6 } 95% { opacity: 1 } 97% { opacity: 0.8 }
  Apply to logo text occasionally

@keyframes pulse-ring:
  0% { transform: scale(1); opacity: 0.8 }
  100% { transform: scale(2.2); opacity: 0 }
  Duration: 1.5s infinite — used on step indicator active dot

@keyframes slide-up-fade:
  from { transform: translateY(16px); opacity: 0 }
  to { transform: translateY(0); opacity: 1 }
  Used on result cards

@keyframes glow-pulse:
  0%, 100% { box-shadow: 0 0 8px #00FF4130 }
  50% { box-shadow: 0 0 20px #00FF4160, 0 0 40px #00FF4120 }
  Duration: 2s infinite — used on fingerprint hash display

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 TECHNICAL CONSTRAINTS FOR GITHUB PAGES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Single index.html file (all CSS in <style>, all JS in <script>)
- Zero npm dependencies, zero build step
- Fonts loaded via Google Fonts CDN only
- External API calls only to CORS-enabled public endpoints:
    https://api.ipify.org?format=json  (public IP)
    https://ipapi.co/{ip}/json/         (geolocation)
    These must be called with fetch() and have no API key requirement
- No localStorage writes (privacy principle)
- Must work on Chrome, Firefox, Safari, Edge latest versions
- All data collection uses only standard browser APIs with graceful fallbacks
  (if API unavailable, show "N/A — API not supported")
- Page must be fully functional with JavaScript disabled except for animations 
  (show a <noscript> message: "Enable JavaScript to run the scanner")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 MANDATORY FINAL OUTPUT CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

After the design, you MUST provide ALL of the following as separate code blocks:

[ ] 1. Full list of browser APIs used with exact property paths
[ ] 2. Full list of external endpoints (URL, method, response schema, CORS status)
[ ] 3. Complete collectAllData() async function
[ ] 4. Complete analyzeExposure(inputs) function  
[ ] 5. generateDeviceHash(dataObject) function using SubtleCrypto API
[ ] 6. renderDashboard(data) function that populates Screen 2 with real values
[ ] 7. CSS custom properties block (all --variables defined above)
[ ] 8. Complete index.html combining all of the above

Without these code outputs the prompt is not complete.