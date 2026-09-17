# Verification · Refined Wagezapp demo

Verified locally on 17 September 2026 with Chromium through Playwright. This covers the design preview, not the production API or a native iOS implementation.

## Interaction checks

- Onboarding selection gates progression and survives theme changes.
- Both phone previews share navigation, sample balances and form state.
- Advance input rejects amounts below ₦1,000 and above availability. Quick amounts and the slider update the review state.
- Returning from review retains the amount. Consent and a partially entered PIN survive theme changes.
- Incorrect PIN shows an error. Demo PIN 1234 completes the simulated advance.
- Completed advances reduce availability in both themes, add activity and allow a sample receipt download.
- Drawing the exact remaining amount leaves no further advance available.
- Savings deposits reject invalid amounts, update goal totals and debit the sample source balance. New goals and activity filters work.
- Savings form drafts persist across theme changes.
- Reward vouchers are clearly marked as sample vouchers; the sample download works.
- Profile appearance controls, information panels, Escape dismissal and reset work.

## Layout and presentation

- All 13 screens checked at viewport widths 360, 390, 620, 768, 1024 and 1440 pixels in the comparison view. No horizontal document or app-content overflow remained.
- A narrow tablet overflow found during testing was fixed by stacking the phone previews below 761 pixels.
- Light and dark boards contain 13 screens each; comparison boards contain 26. No duplicate HTML IDs were found in those views.
- Main screens, onboarding, account views, overlays and transaction confirmation reviewed visually in both themes.
- Floating navigation uses a computed blur and translucent tint, with an opaque fallback and reduced-transparency support.
- JavaScript syntax checks passed. No page errors were observed during the interaction, layout and export runs.
- All presentation images use the bundled fonts. The package runs from a local `index.html` without a server.

## Limits

Browser rendering and scrolling have been verified in Chromium. Native Safari/iOS rendering, VoiceOver and device-level Liquid Glass behaviour still require testing during implementation. Long app screens intentionally scroll behind the floating navigation, with bottom padding so their final controls remain reachable.
