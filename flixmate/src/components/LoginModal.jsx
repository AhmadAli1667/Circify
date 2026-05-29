import { AnimatePresence, motion } from 'framer-motion'
// AnimatePresence: allows the modal to animate out when it unmounts from the DOM
// motion: gives HTML elements animation props (initial, animate, exit)

import { X } from 'lucide-react'
// X icon — used for the modal close button

import { useState } from 'react'
// useState — manages the active tab, form field values, and feedback messages

const TABS = ['login', 'signup', 'forgot', 'settings']
// Array of the four tab names; used to render the tab switcher dynamically

function LoginModal({ isOpen, onClose, onLogin, onSignup, onForgot, user, settings, onUpdateSettings, emailLog, onUpdateProfilePicture }) {
  // A multi-tab modal for user account management
  // NOTE: This component is currently not rendered anywhere in the app — it is unused dead code
  //
  // isOpen: boolean — controls whether the modal is visible
  // onClose: callback to close the modal
  // onLogin(email, password) — called when the login form is submitted
  // onSignup({ name, email, password, confirmPassword, profilePicture }) — called on signup
  // onForgot(email) — called when password reset is requested
  // user: the currently logged-in user object (null if not logged in)
  // settings: object with { autoplayHero, matureContent, emailAlerts, language }
  // onUpdateSettings(partial) — updates one or more settings fields
  // emailLog: array of simulated sent emails for display in the settings tab
  // onUpdateProfilePicture(dataUrl) — updates profile picture if a user is logged in

  const [tab, setTab] = useState('login')
  // tab: which of the four tabs is currently active; starts on 'login'

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', profilePicture: '' })
  // form: all the controlled input values for all tabs stored in one state object

  const [message, setMessage] = useState('')
  // message: feedback text shown below the form after submission (success or error)

  const uploadProfilePicture = (event) => {
    // Handles the profile picture file input change event

    const file = event.target.files?.[0]
    // Gets the first selected file; optional chaining handles the case of no file selected

    if (!file) return
    // If no file was selected, do nothing and exit early

    const reader = new FileReader()
    // FileReader is a browser API that reads file contents asynchronously

    reader.onload = () => {
      // Called when the file has been fully read by FileReader

      const value = typeof reader.result === 'string' ? reader.result : ''
      // reader.result contains the file as a base64 data URL string; fallback to empty string if not

      setForm((prev) => ({ ...prev, profilePicture: value }))
      // Updates the profilePicture field in the form state with the base64 data URL

      if (user) {
        // If the user is already logged in, immediately save the new profile picture

        onUpdateProfilePicture(value)
        // Calls the parent callback to persist the new profile picture
      }
    }
    reader.readAsDataURL(file)
    // Starts reading the file — converts the image to a base64 data URL and fires the onload callback
  }

  const submit = (event) => {
    // Handles form submission for all four tabs

    event.preventDefault()
    // Prevents the browser's default form submission (which would reload the page)

    if (tab === 'login') {
      // Login tab: pass email + password to the parent's login handler

      const result = onLogin(form.email, form.password)
      // result should be { message: string } indicating success or failure

      setMessage(result.message)
      // Shows the result message below the form

      return
      // Exit early — no need to check other tabs
    }

    if (tab === 'signup') {
      // Signup tab: pass all registration fields to the parent's signup handler

      const result = onSignup({
        name: form.name,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        // Sent so the parent can validate the two passwords match
        profilePicture: form.profilePicture
        // Base64 data URL of the uploaded profile image (empty string if none)
      })
      setMessage(result.message)
      // Shows the result message (e.g. "Account created!" or "Passwords don't match")

      return
    }

    if (tab === 'forgot') {
      // Forgot password tab: pass just the email address to the parent

      const result = onForgot(form.email)
      // result should contain a message like "Reset link sent to your email"

      setMessage(result.message)
      return
    }

    setMessage('Settings saved automatically.')
    // Settings tab doesn't have a real submit — settings update via individual checkboxes/selects
  }

  return (
    <AnimatePresence>
      {/* AnimatePresence enables the exit animation when isOpen becomes false */}

      {isOpen ? (
        // Only render the modal DOM when isOpen is true

        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4"
          // Full-screen dark overlay behind the modal; z-[70] is above all other elements
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // Fades the backdrop in and out
          onClick={onClose}
          // Clicking the dark backdrop closes the modal
        >
          <motion.div
            onClick={(event) => event.stopPropagation()}
            // Prevents clicks inside the modal card from bubbling to the backdrop close handler
            initial={{ y: 18, opacity: 0 }}
            // Starts slightly below its final position and invisible
            animate={{ y: 0, opacity: 1 }}
            // Slides up to its natural position while fading in
            exit={{ y: 18, opacity: 0 }}
            // Slides back down and fades out on close
            className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0F172A]/90 p-6 shadow-2xl backdrop-blur-2xl"
            // Fixed max width, rounded corners, dark navy background, frosted glass blur
          >
            <div className="mb-4 flex items-center justify-between">
              {/* Modal header: title on the left, close button on the right */}

              <h2 className="text-3xl text-white" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                {/* Inline style applies a stylized display font — not loaded via Tailwind */}
                Account Access
              </h2>
              <button onClick={onClose} className="text-white/70 hover:text-white">
                {/* Close button in the top-right corner of the modal */}
                <X />
              </button>
            </div>

            <div className="mb-4 flex rounded-lg border border-white/15 bg-black/30 p-1">
              {/* Tab switcher bar: a pill-shaped row of 4 tab buttons */}

              {TABS.map((name) => (
                // Renders one button for each tab name in the TABS array
                <button
                  key={name}
                  // Unique key for React's reconciliation
                  onClick={() => {
                    setTab(name)
                    // Switches to the clicked tab
                    setMessage('')
                    // Clears any previous feedback message when switching tabs
                  }}
                  className={`flex-1 rounded-md px-2 py-2 text-xs uppercase tracking-wide ${
                    tab === name ? 'bg-[#F59E0B] text-black' : 'text-white/80'
                    // Active tab: amber/gold background with black text
                    // Inactive tabs: transparent with semi-white text
                  }`}
                >
                  {name}
                  {/* Tab label — one of: login, signup, forgot, settings */}
                </button>
              ))}
            </div>

            <form className="space-y-3" onSubmit={submit}>
              {/* The form that handles all tabs; onSubmit routes to the correct handler based on active tab */}

              {tab === 'signup' && (
                // These fields only appear when the signup tab is active
                <>
                  <input
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    // Updates only the 'name' field in the form state on each keystroke
                    placeholder="Name"
                    className="w-full rounded-md border border-white/15 bg-black/35 px-3 py-2 text-sm text-white"
                  />
                  <label className="block rounded-md border border-white/15 bg-black/30 px-3 py-2 text-xs text-white/80">
                    Upload profile picture
                    <input type="file" accept="image/*" onChange={uploadProfilePicture} className="mt-2 block w-full text-xs" />
                    {/* File picker restricted to image files; triggers uploadProfilePicture on change */}
                  </label>
                </>
              )}

              {(tab === 'login' || tab === 'signup' || tab === 'forgot') && (
                // Email field shown on login, signup, and forgot-password tabs (not settings)
                <input
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  // Updates only the 'email' field in form state
                  placeholder="Email"
                  className="w-full rounded-md border border-white/15 bg-black/35 px-3 py-2 text-sm text-white"
                />
              )}

              {(tab === 'login' || tab === 'signup') && (
                // Password field shown only on login and signup tabs
                <input
                  type="password"
                  // type="password" hides the typed characters with dots
                  value={form.password}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  placeholder="Password"
                  className="w-full rounded-md border border-white/15 bg-black/35 px-3 py-2 text-sm text-white"
                />
              )}

              {tab === 'signup' && (
                // Confirm password only appears on signup tab to verify the user typed it correctly
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                  placeholder="Confirm password"
                  className="w-full rounded-md border border-white/15 bg-black/35 px-3 py-2 text-sm text-white"
                />
              )}

              {tab === 'settings' && (
                // Settings panel — shown only when the settings tab is active
                <div className="space-y-3 rounded-lg border border-white/15 bg-black/25 p-3 text-xs text-white">
                  <label className="flex items-center justify-between">
                    Autoplay hero
                    <input
                      type="checkbox"
                      checked={settings.autoplayHero}
                      // Controlled checkbox — reflects the current settings value
                      onChange={(event) => onUpdateSettings({ autoplayHero: event.target.checked })}
                      // Calls parent to update just the autoplayHero setting
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    Mature content
                    <input
                      type="checkbox"
                      checked={settings.matureContent}
                      onChange={(event) => onUpdateSettings({ matureContent: event.target.checked })}
                      // Toggles the mature content filter setting
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    Email alerts
                    <input
                      type="checkbox"
                      checked={settings.emailAlerts}
                      onChange={(event) => onUpdateSettings({ emailAlerts: event.target.checked })}
                      // Toggles simulated email alert notifications
                    />
                  </label>
                  <label className="block">
                    Language
                    <select
                      value={settings.language}
                      onChange={(event) => onUpdateSettings({ language: event.target.value })}
                      // Updates the selected language when user picks a new one
                      className="mt-1 w-full rounded-md border border-white/15 bg-black/35 px-2 py-2"
                    >
                      <option>English</option>
                      <option>Arabic</option>
                      <option>French</option>
                      <option>Spanish</option>
                      {/* Four language options — currently only cosmetic, no i18n implemented */}
                    </select>
                  </label>
                  <div>
                    <p className="mb-1 text-[11px] text-white/70">Latest sent emails (simulated)</p>
                    {/* Label clarifying these are fake/simulated emails */}
                    <div className="max-h-24 overflow-y-auto rounded border border-white/10 p-2 text-[10px] text-white/80">
                      {/* Scrollable log box capped at 96px height */}
                      {emailLog.length === 0 ? 'No emails sent yet.' : emailLog.slice(0, 4).map((item) => `${item.to} - ${item.subject}`).join('\n')}
                      {/* Shows "No emails sent yet." if log is empty; otherwise shows up to 4 most recent entries */}
                    </div>
                  </div>
                </div>
              )}

              {message && <p className="text-xs text-[#F59E0B]">{message}</p>}
              {/* Renders the feedback message in amber/gold if there is one — shown after form submission */}

              {tab !== 'settings' && (
                // Submit button only shows on non-settings tabs (login, signup, forgot)
                <button className="w-full rounded-md bg-[#0F172A] py-2 text-sm font-semibold text-white ring-1 ring-[#F59E0B]/50 hover:bg-[#111f3f]">
                  {/* Full-width dark navy button with a subtle amber ring */}
                  {tab === 'login' ? 'Login' : tab === 'signup' ? 'Create Account' : 'Send Reset Link'}
                  {/* Label changes based on the active tab */}
                </button>
              )}
            </form>
          </motion.div>
        </motion.div>
      ) : null}
      {/* null when isOpen is false — AnimatePresence plays exit animation before removing from DOM */}
    </AnimatePresence>
  )
}

export default LoginModal
// Makes LoginModal available for import — currently unused but built for future user auth features
