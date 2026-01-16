## 2024-05-22 - Missing Disabled State on Buttons
**Learning:** The global `.btn` class includes disabled styles (`bg-green-700 cursor-not-allowed`), but the Login form button wasn't utilizing the `disabled` attribute, leading to a lack of visual feedback and potential double-submission issues.
**Action:** When auditing forms, check if the submit button actually binds the loading/disabled state to the `disabled` HTML attribute, not just logically blocking the function.
