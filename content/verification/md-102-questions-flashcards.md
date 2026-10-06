# MD-102 questions & flashcards verification log

Verified 2026-10-06 against Microsoft Learn (Microsoft Learn MCP only). 'rewritten' on f46/f47 = new items added for open items.

Counts: fixed: 29, ok: 53, rewritten: 5

## Open items

| Item | Resolution | Evidence |
|---|---|---|
| Intune Suite / Plan 2 in M365 E3/E5 from July 2026 | Confirmed: from July 2026 M365 E3 includes Plan 2, Remote Help, Advanced Analytics; E5/E7 add EPM, Cloud PKI, Enterprise App Management (f22) | https://learn.microsoft.com/intune/fundamentals/planning-guide |
| Bulk device action limit 100 | Confirmed: up to 100 devices per bulk action (new f47) | https://learn.microsoft.com/intune/device-management/actions/ |
| Remediations licensing | Confirmed: Windows Enterprise E3/E5, Education A3/A5, VDA per user (q38, f41) | https://learn.microsoft.com/intune/device-management/tools/deploy-remediations |
| LAPS password read roles | Confirmed: Cloud Device Administrator and Intune Administrator (q07, new f46). Note: the Intune deploy-policy page lists only Cloud Device Administrator; Entra and Intune LAPS overview FAQ list both | https://learn.microsoft.com/entra/identity/devices/howto-manage-local-admin-passwords |

## Items

| Item id | Verdict | What changed | Evidence URL |
|---|---|---|---|
| md102-q01 | ok | - | https://learn.microsoft.com/entra/identity/devices/concept-device-registration |
| md102-q02 | fixed | Rewrote distractor d: removed unverified claim that enrollmentProfileName is only populated after enrollment; stated what the attribute holds. | https://learn.microsoft.com/entra/identity/users/groups-dynamic-membership |
| md102-q03 | ok | - | https://learn.microsoft.com/intune/device-enrollment/apple/overview-automated-enrollment-apple |
| md102-q04 | fixed | Reference changed to the dedicated-devices enrollment article (more specific). | https://learn.microsoft.com/intune/device-enrollment/android/setup-dedicated |
| md102-q05 | ok | - | https://learn.microsoft.com/intune/device-security/compliance/overview |
| md102-q06 | fixed | Reworded statement d rationale to the Learn wording (device identity is a prerequisite for device-based Conditional Access). Error-state 7 days and compliance-over-configuration precedence confirmed. | https://learn.microsoft.com/entra/identity/devices/overview |
| md102-q07 | fixed | Explanation now names the roles that can read the password (Cloud Device Administrator, Intune Administrator) and the permission; distractor d reworded to the CSP values. | https://learn.microsoft.com/entra/identity/devices/howto-manage-local-admin-passwords |
| md102-q08 | fixed | Distractor d aligned with Learn statement that Intune RBAC does not apply to Microsoft Entra roles. | https://learn.microsoft.com/intune/fundamentals/role-based-access-control/scope-tags |
| md102-q09 | fixed | Reference changed to the Windows Hello for Business page that states the tenant-wide policy only applies at enrollment time. | https://learn.microsoft.com/windows/security/identity-protection/hello-for-business/configure |
| md102-q10 | fixed | Removed unverified "Securing your hardware" ESP step and unverified advice to use user-driven mode on VMs; aligned wording with the Learn statement on 0x800705B4. | https://learn.microsoft.com/autopilot/self-deploying |
| md102-q11 | ok | - | https://learn.microsoft.com/autopilot/tutorial/user-driven/azure-ad-join-autopilot-profile |
| md102-q12 | fixed | Stem now says "order used by Microsoft's step-by-step tutorial" because Learn notes some steps are interchangeable in production. | https://learn.microsoft.com/autopilot/tutorial/user-driven/azure-ad-join-workflow |
| md102-q13 | ok | - | https://learn.microsoft.com/autopilot/pre-provision |
| md102-q14 | fixed | Reference changed to the comparison page that lists 25 apps / 10 scripts and "no requirement to pre-stage devices". | https://learn.microsoft.com/autopilot/device-preparation/compare |
| md102-q15 | ok | - | https://learn.microsoft.com/windows-365/enterprise/create-provisioning-policy |
| md102-q16 | ok | - | https://learn.microsoft.com/intune/device-configuration/migrate-group-policy |
| md102-q17 | fixed | Reference changed to the filters overview (evaluated at enrollment/check-in; used with apps, compliance policies and configuration profiles). | https://learn.microsoft.com/intune/fundamentals/filters/overview |
| md102-q18 | fixed | Reference changed to the specific Retire device action article. | https://learn.microsoft.com/intune/device-management/actions/retire |
| md102-q19 | fixed | Removed unverified "protected file path" advice; kept documented user-confirmed validation options. | https://learn.microsoft.com/intune/epm/create-elevation-rules |
| md102-q20 | ok | - | https://learn.microsoft.com/intune/cloud-pki/configure-ca |
| md102-q21 | ok | - | https://learn.microsoft.com/intune/remote-help/plan |
| md102-q22 | ok | - | https://learn.microsoft.com/intune/device-configuration/endpoint-security/encrypt-bitlocker-windows |
| md102-q23 | ok | - | https://learn.microsoft.com/intune/device-security/microsoft-defender/configure-integration |
| md102-q24 | fixed | Correct option softened to Learn wording ("might fail to apply and be flagged as conflicted"); distractor c cites equal priority. | https://learn.microsoft.com/intune/device-security/endpoint-security-policies |
| md102-q25 | ok | - | https://learn.microsoft.com/intune/device-configuration/endpoint-security/deploy-edr |
| md102-q26 | fixed | Distractor c corrected: the ring option applies to Windows 10 devices only. | https://learn.microsoft.com/intune/device-updates/windows/ref-update-ring-settings |
| md102-q27 | ok | - | https://learn.microsoft.com/windows/deployment/windows-autopatch/manage/windows-autopatch-hotpatch-updates |
| md102-q28 | ok | - | https://learn.microsoft.com/intune/device-updates/apple/ |
| md102-q29 | ok | - | https://learn.microsoft.com/intune/app-management/deployment/create-win32-package |
| md102-q30 | fixed | Option b updated: Require approved client app grant is retired (read-only since 30 June 2026); new policies use only Require app protection policy. Reference updated. | https://learn.microsoft.com/entra/identity/conditional-access/migrate-approved-client-app |
| md102-q31 | fixed | Distractor c softened to Learn wording ("might fail"). | https://learn.microsoft.com/intune/app-management/deployment/add-microsoft-365-windows |
| md102-q32 | ok | - | https://learn.microsoft.com/intune/app-management/protection/overview |
| md102-q33 | ok | - | https://learn.microsoft.com/intune/app-management/configuration/configure-managed-ios |
| md102-q34 | fixed | Reference changed to the Add Win32 app article (Apps > All Apps > Create > Windows app (Win32), detection rules, assignments). | https://learn.microsoft.com/intune/app-management/deployment/add-win32 |
| md102-q35 | ok | - | https://learn.microsoft.com/intune/app-management/protection/create-policy |
| md102-q36 | ok | - | https://learn.microsoft.com/intune/device-management/tools/deploy-remediations |
| md102-q37 | ok | - | https://learn.microsoft.com/intune/endpoint-analytics/configure |
| md102-q38 | fixed | Explanation aligned to Learn list (added A3/A5 inclusion; Business Premium stated as "not in the list"); distractor reworded. | https://learn.microsoft.com/intune/device-management/tools/deploy-remediations |
| md102-q39 | rewritten | Statement d replaced (unverified "certificate auth best practice") with a confirmable statement about application permissions; reference set to List managedDevices (view= kept, page is versioned). | https://learn.microsoft.com/graph/api/intune-devices-manageddevice-list?view=graph-rest-1.0 |
| md102-q40 | fixed | Noted public preview; distractors c/d updated for PCA/CRA retirement on 31 Aug 2026. | https://learn.microsoft.com/intune/copilot/agents/change-review-agent |
| md102-f01 | ok | - | - |
| md102-f02 | fixed | Added current Intune admin center path. | https://learn.microsoft.com/intune/device-enrollment/windows/enable-automatic-mdm |
| md102-f03 | ok | - | - |
| md102-f04 | fixed | Clarified .pem public key vs .p7m token flow. | https://learn.microsoft.com/intune/device-enrollment/apple/setup-apple-token |
| md102-f05 | ok | - | - |
| md102-f06 | ok | - | - |
| md102-f07 | ok | - | - |
| md102-f08 | fixed | Removed unverified "no deny" claim; wording aligned with Learn. | https://learn.microsoft.com/intune/fundamentals/role-based-access-control/overview |
| md102-f09 | fixed | Path made exact. | https://learn.microsoft.com/intune/device-security/laps/deploy-policy |
| md102-f10 | fixed | Portal path updated to current Entra admin center navigation. | https://learn.microsoft.com/entra/identity/devices/howto-manage-local-admin-passwords |
| md102-f11 | rewritten | Original claim "user-driven works on Hyper-V VMs" not confirmable on Learn; rewritten around the documented VM limitation. | https://learn.microsoft.com/autopilot/self-deploying |
| md102-f12 | ok | - | - |
| md102-f13 | fixed | Option names aligned with Learn technician flow. | https://learn.microsoft.com/autopilot/pre-provision |
| md102-f14 | ok | - | - |
| md102-f15 | ok | - | - |
| md102-f16 | ok | - | - |
| md102-f17 | ok | - | - |
| md102-f18 | ok | - | - |
| md102-f19 | ok | - | - |
| md102-f20 | ok | - | - |
| md102-f21 | ok | - | - |
| md102-f22 | fixed | Licensing statement made precise per planning guide (E3 gets Plan 2, Remote Help, Advanced Analytics from July 2026). | https://learn.microsoft.com/intune/fundamentals/planning-guide |
| md102-f23 | ok | - | - |
| md102-f24 | ok | - | - |
| md102-f25 | ok | - | - |
| md102-f26 | ok | - | - |
| md102-f27 | ok | - | - |
| md102-f28 | ok | - | - |
| md102-f29 | ok | - | - |
| md102-f30 | fixed | Licence names made exact. | https://learn.microsoft.com/windows/deployment/windows-autopatch/manage/windows-autopatch-hotpatch-updates |
| md102-f31 | ok | - | - |
| md102-f32 | ok | - | - |
| md102-f33 | ok | - | - |
| md102-f34 | ok | - | - |
| md102-f35 | ok | - | - |
| md102-f36 | ok | - | - |
| md102-f37 | fixed | Updated for retirement of Require approved client app grant. | https://learn.microsoft.com/entra/identity/conditional-access/migrate-approved-client-app |
| md102-f38 | ok | - | - |
| md102-f39 | ok | - | - |
| md102-f40 | ok | - | - |
| md102-f41 | fixed | Added A3/A5 inclusion detail. | https://learn.microsoft.com/intune/device-management/tools/deploy-remediations |
| md102-f42 | ok | - | - |
| md102-f43 | ok | - | - |
| md102-f44 | rewritten | PCA and CRA retired 31 Aug 2026 per Learn; card rewritten. | https://learn.microsoft.com/intune/copilot/agents/policy-configuration-agent |
| md102-f45 | ok | - | - |
| md102-f46 | rewritten | New card (open item: LAPS password roles). | https://learn.microsoft.com/entra/identity/devices/howto-manage-local-admin-passwords |
| md102-f47 | rewritten | New card (open item: bulk action limit of 100). | https://learn.microsoft.com/intune/device-management/actions/ |
