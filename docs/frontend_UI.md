NotifyHub – UI Animation & Color Palette Guide
Version 1.0 · Tailwind CSS (class strategy) · Light + Dark theme
Live preview: https://claude.ai/artifact/9RxfiMJGe3CfKtGsx476QQ
1. Overview
Yeh document NotifyHub dashboard ke colors (light aur dark), typography aur saari animations ki details deta hai. Colors CSS variables mein rakhe gaye hain, aur Tailwind unhe bg-surface, text-ink, bg-brand jaise token names se use karta hai. Theme switch karne par sirf <html class="dark"> badalti hai, baaki sab automatically update hota hai.
2. Color Palette
2.1 Neutral tokens (surfaces aur text)
Token
Light
Dark
Usage
bg
#FFFFFF
#000000
Page background
surface
#FAF8F3
#0A0A0A
Cards, header, sidebar, toasts
elev
#F2EFE7
#171717
Hover states, skeleton base, table headers
line
#E8E3D8
#262626
Borders, dividers
ink
#2D2B27
#F5F5F5
Headings, primary text
sub
#6B665B
#A3A3A3
Descriptions, sub-labels
mute
#8A8579
#737373
Timestamps, placeholders
2.2 Brand aur semantic colors
Token
Light
Dark
Usage
brand
#5F8F9C
#7FB0BD
Active sidebar pill, primary buttons, links
ok (Sent, Active)
#4F9A73
#6CC08F
Success text, icons
ok soft background
#E6F1EA
#0F2A1D
Success badge fill
bad (Failed, Blocked)
#D0645A
#E5827A
Error text, failed line on chart
bad soft background
#F8E6E3
#3A1A17
Failed badge fill
warn (Draft, Inactive)
#E9A67A
#E9A67A
Warning, draft badge
2.3 CSS variables (copy karne ke liye)
:root {
  --bg:#FFFFFF; --surface:#FAF8F3; --elev:#F2EFE7; --line:#E8E3D8;
  --ink:#2D2B27; --sub:#6B665B; --mute:#8A8579;
  --brand:#5F8F9C; --ok:#4F9A73; --bad:#D0645A; --warn:#E9A67A;
  --okbg:#E6F1EA; --badbg:#F8E6E3;
}
.dark {
  --bg:#000000; --surface:#0A0A0A; --elev:#171717; --line:#262626;
  --ink:#F5F5F5; --sub:#A3A3A3; --mute:#737373;
  --brand:#7FB0BD; --ok:#6CC08F; --bad:#E5827A; --warn:#E9A67A;
  --okbg:#0F2A1D; --badbg:#3A1A17;
}
2.4 Tailwind config
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: { extend: {
    fontFamily: { sans: ['Inter','system-ui','sans-serif'], mono: ['JetBrains Mono','ui-monospace','monospace'] },
    colors: {
      bg:'var(--bg)', surface:'var(--surface)', elev:'var(--elev)', line:'var(--line)',
      ink:'var(--ink)', sub:'var(--sub)', mute:'var(--mute)',
      brand:'var(--brand)', ok:'var(--ok)', bad:'var(--bad)', warn:'var(--warn)'
    }
  }}
}
Dhyan rakho: var() colors ke saath Tailwind ka opacity modifier (jaise bg-ok/80) kaam nahi karta. Uski jagah opacity-90 use karo, ya variables ko R G B format mein rakhkar rgb(var(--ok) / <alpha-value>) use karo.
3. Typography
Style
Size
Weight
Tailwind
Page title
24px
600
text-2xl font-semibold
Card number
30px
700
text-3xl font-bold
Section title
18px
500
text-lg font-medium
Body
14px
400
text-sm
Caption
12px
500
text-xs font-medium
Fonts: Inter (UI) aur JetBrains Mono (API keys, template variables).
4. Animations
#
Animation
Trigger
Duration
Easing
1
Number counter
Data load hone par
1400ms
ease-out cubic
2
Chart line draw
Data load hone par
1500ms (250ms delay)
ease-out
3
Sidebar pill slide
Menu click
350ms
cubic-bezier(.4,0,.2,1)
4
Card hover lift
Hover
200ms
ease
5
Skeleton shimmer
Data load hone tak
1300ms loop
linear
6
Toast slide-in
User action
350ms in, 4s auto-dismiss
cubic-bezier(.2,.8,.2,1)
7
Theme transition
Theme toggle
350ms
ease
4.1 Dashboard number counter
Total, Delivered, Failed aur Success rate dashboard khulte hi 0 se final value tak count up hote hain. Success rate mein 1 decimal dikhta hai (jaise 99.1%).
function count(el){
  const to=+el.dataset.to, d=+(el.dataset.d||0), t0=performance.now(), dur=1400;
  (function f(t){
    const p=Math.min((t-t0)/dur,1), e=1-Math.pow(1-p,3);
    el.textContent=(to*e).toLocaleString(undefined,{minimumFractionDigits:d,maximumFractionDigits:d});
    if(p<1) requestAnimationFrame(f);
  })(t0);
}
4.2 Chart animation
Failed line left-to-right draw hoti hai (stroke-dashoffset 1 se 0, pathLength="1" ke saath). Chart par hover karne par us din ka vertical guide, line par dot aur tooltip (Day, Sent, Failed) dikhta hai. Bars chahiye to unhe scaleY(0) se scaleY(1) tak grow karwao, har bar par 70ms ka stagger.
.ln{stroke-dasharray:1;stroke-dashoffset:1}
.go .ln{animation:draw 1.5s ease-out .25s forwards}
@keyframes draw{to{stroke-dashoffset:0}}
.bar{transform-origin:bottom;transform:scaleY(0)}
.go .bar{animation:grow .8s cubic-bezier(.2,.8,.2,1) forwards;animation-delay:calc(var(--i)*70ms)}
@keyframes grow{to{transform:scaleY(1)}}
4.3 Sidebar transitions
Active menu ka background ek alag pill element hai jo translateY(index * 44px) se smoothly slide karta hai (item height 40px + gap 4px). Icons par hover karne par halka translateX(2px) scale(1.12) effect aata hai.
.pill{transition:transform .35s cubic-bezier(.4,0,.2,1)}
.nav a svg{transition:transform .2s ease}
.nav a:hover svg{transform:translateX(2px) scale(1.12)}
4.4 Card hover effect
Metric, project aur template cards hover par 3px upar uthte hain aur halka shadow aata hai.
.lift{transition:transform .2s ease,box-shadow .2s ease}
.lift:hover{transform:translateY(-3px);box-shadow:0 10px 24px -10px rgba(15,23,42,.25)}
4.5 Skeleton loading
Data aane tak shimmer placeholders dikhte hain, blank screen kabhi nahi. Demo mein 1.4 second ka fake delay hai. Real app mein isLoading state par skeleton dikhao aur API response aate hi real content se replace karo.
.sk{border-radius:10px;
  background:linear-gradient(90deg,var(--elev) 25%,var(--line) 50%,var(--elev) 75%);
  background-size:200% 100%;animation:sh 1.3s linear infinite}
@keyframes sh{to{background-position:-200% 0}}
4.6 Toast notifications
Email sent, API key generated aur Template saved jaise actions par top-right mein toast slide-in hota hai. 4 second baad auto-dismiss hota hai, aur cross button se manually bhi band ho sakta hai.
Variant
Dot color
Success
ok
Info
brand
Error
bad
Warning
warn
4.7 Theme transition
Light aur Dark switch par background, border, text, fill aur stroke 350ms mein smoothly change hote hain. Theme localStorage mein theme key se save hoti hai.
*{transition:background-color .35s ease,border-color .35s ease,color .35s ease,fill .35s ease,stroke .35s ease}
5. React + Recharts mein implement karna
• Counter: upar wale logic ko useCountUp(target, duration) custom hook bana lo.
• Chart: Recharts mein isAnimationActive aur animationDuration={1500} se line/bar animation milti hai, aur <Tooltip /> se hover numbers.
• Theme: ThemeContext mein toggleTheme() document.documentElement.classList.toggle('dark') chalaye aur choice localStorage mein save kare.
• Skeleton: ProjectContext ya API hook ki isLoading flag se control karo.
• Toast: ek global ToastProvider banao, jisme toast.success(title, message) jaisa helper ho.
6. Accessibility
• Saari animations prefers-reduced-motion: reduce par band ho jati hain.
• Chart tooltip keyboard focus (tabindex="0") par bhi khulta hai.
• Buttons aur links par :focus-visible outline brand color mein hai.
• Toast mein role="status" hai, aur dismiss button ka aria-label hai.