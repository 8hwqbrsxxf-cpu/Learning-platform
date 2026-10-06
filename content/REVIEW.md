# Content review log

Exam content is grounded in Microsoft Learn (study guides fetched on 2026-10-06). The items below were **not** confirmed against
documentation during authoring and should be checked by a team member before the content is used for customer-facing training.

## MD-102 (`md-102.json`)

Syllabus: study guide "Skills measured as of October 27, 2026" (domains unchanged; "Manage applications" → "Manage and secure applications").

- [ ] Intune Suite licensing: the Intune planning guide states that from July 2026 Microsoft 365 E3 includes Intune Plan 2, Remote Help and Advanced Analytics, and E5 adds EPM, Cloud PKI and Enterprise App Management. "Business Premium customers buy the Suite add-on" is an inference.
- [ ] Bulk device actions limited to 100 devices.
- [ ] Managed-apps filter syntax `app.deviceManagementType -eq "Unmanaged"` (app protection lab).
- [ ] Edge app configuration key `com.microsoft.intune.mam.managedbrowser.homepage` (app protection lab).
- [ ] Exam duration of 100 minutes (not in the study guide).
- [ ] Belgian right-to-disconnect example (20+ employees) in a real-world scenario.
- [x] Remediations licensing: Windows Enterprise E3/E5, Education A3/A5 or VDA. Business Premium alone isn't listed (verified on Learn).
- [x] Cloud Device Administrator and Intune Administrator can read LAPS passwords (verified on Learn).

## MS-102 (`ms-102.json`)

Syllabus: study guide "Skills measured as of April 28, 2026".

- [x] **MS-102 retires on 30 November 2026.** Successor: AB-650 "Administering Microsoft 365 and AI Services" (verified on Learn). The app shows a retirement banner, and the study planner warns when the target date falls after retirement.
- [ ] DKIM portal path in the custom-domain lab.
- [ ] Entra Connect Health requiring Entra ID P1.
- [ ] Endpoint DLP and service-side auto-labelling requiring E5-level licensing.
- [ ] Accidental-delete prevention default threshold of 500 objects.
- [ ] Shared mailboxes not needing a licence (up to 50 GB, no archive or litigation hold).
- [ ] SPF and DMARC example record values.
- [ ] Exam duration of 100 minutes (not in the study guide).
- [ ] Prerequisites follow the current study guide (MD-102, MS-700 or SC-300); older Microsoft pages list more qualifying certifications.
- [ ] Defender for Identity is covered only lightly, because it isn't in the current skills outline.
