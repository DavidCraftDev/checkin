## 2024-05-22 - Missing Disabled State on Buttons 🎯🚫
### *The Case of the Clickable Button* 🕵️‍♂️🔍

**Learning:** 📚 The global `.btn` class includes disabled styles (`bg-green-700 cursor-not-allowed`) 🎨, but the Login form button wasn't utilizing the `disabled` attribute 😱, leading to a lack of visual feedback 👁️ and potential double-submission issues 🖱️🖱️ (because who doesn't love submitting forms twice? 😅 Said no one ever! 🙅).

**Action:** ✅ When auditing forms 📋, check if the submit button actually binds the loading/disabled state to the `disabled` HTML attribute 🏷️, not just logically blocking the function 🧠 (logic is great, but HTML attributes are better! 💪). 

**Bonus Wisdom:** 💡 Always give your users visual feedback! 👀 A disabled button should LOOK disabled, not just ACT disabled! 🎭 It's like wearing an "Out of Order" sign instead of just standing there silently broken 🚧.

**Emoji Summary:** 🎯 Button + 🚫 Disabled = ✅ Happy Users! 🎉
