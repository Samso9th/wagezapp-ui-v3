# Wagezapp · The refined direction

One connected demo, combining the parts selected in the client review. Open **index.html** in a browser. Everything runs locally, including fonts and icons; no installation or sign-in is needed.

## What changed

- Greenland supplies the main layout, rounded cards, savings goals, rewards and WageScore screens.
- The home balance now follows the approved ₦64,500 savings card. It shows available salary advance clearly, with a small lightning detail in place of the giant naira illustration.
- Cashnova's Welcome, Your priorities and Identity introduction form the three-screen onboarding journey.
- Dark Accentuate supplies the floating bottom navigation, with a translucent surface and circular purple selection.
- Light and dark are two appearances of the same experience. Orion is not part of this direction.

The brand palette remains purple **#C084FC**, accent **#9D4EDD**, lavender **#F3E8FF**, navy **#0F172A**, white and pale gray. Dark mode adds navy surface shades for contrast. The **w.** wordmark is a placeholder.

## Explore the demo

1. Use **Light**, **Dark** or **Side by side** above the preview.
2. Pick a screen from the journey menu, or choose **Start from the welcome**.
3. Follow Welcome → Your priorities → Identity introduction → Home.
4. From Home, try an advance, review the repayment, give consent and enter demo PIN **1234**. A completed advance updates the sample balance and activity in both themes.
5. Try savings deposits, a new savings goal, activity filters, reward vouchers and profile settings.
6. Use **Reset the demo** to restore the starting account. Refreshing the page also resets the sample session.

Switching themes preserves the current screen, amounts, selections and unfinished form inputs. In Side by side, either phone controls the same account. Scroll inside each phone to see the rest of a long screen.

**Screen boards** shows all 13 screens in the selected appearance. These are static presentation snapshots; return to **Try the app** to interact.

## Images for client review

The `exports` folder contains 11 PNG boards:

- `home-comparison.png`, `savings-comparison.png`, `welcome-comparison.png`: light and dark together.
- `onboarding-light.png` and `onboarding-dark.png`: the first three screens.
- `daily-light.png` and `daily-dark.png`: Home, Savings, Rewards and WageScore.
- `advance-light.png` and `advance-dark.png`: amount, review, PIN and confirmation.
- `account-light.png` and `account-dark.png`: Activity and Profile.

The `exports/screens` folder contains 26 individual PNGs, one for every screen in each theme. Images show a phone viewport; the interactive version includes scrollable content below it.

## Scope

This is an HTML/CSS design demo using fictional account data and simulated actions. It does not call the Wagezapp API or move money. The glass navigation is a browser approximation using blur, tint and reflections; native iOS Liquid Glass is a later implementation step.

Fonts and icon license files are included under `assets`. The earlier concept demos remain separately in `design-preview/v2` in the project.
