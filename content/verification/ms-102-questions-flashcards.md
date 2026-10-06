# MS-102 questions & flashcards - fact-check log (2026-10-06)

Source of truth: Microsoft Learn (Microsoft Learn MCP search/fetch). Result: 40 questions, 49 flashcards (45 original + 4 new). JSON validated with `JSON.parse`; correct/whyOthersWrong ids and module ids checked.

## Questions

| Item | Verdict | What changed | Evidence URL |
|---|---|---|---|
| ms102-q01 | ok | - | https://learn.microsoft.com/microsoft-365/admin/setup/add-domain?view=o365-worldwide |
| ms102-q02 | ok | - | https://learn.microsoft.com/microsoft-365/enterprise/view-service-health?view=o365-worldwide |
| ms102-q03 | ok | - | https://learn.microsoft.com/microsoft-365/admin/manage/manage-group-licenses?view=o365-worldwide |
| ms102-q04 | ok | - | https://learn.microsoft.com/entra/identity/role-based-access-control/administrative-units |
| ms102-q05 | ok | - | https://learn.microsoft.com/entra/id-governance/privileged-identity-management/pim-how-to-change-default-settings |
| ms102-q06 | fixed | Removed optional "remove verification TXT" step (could validly occur any time after verification, so the order was not unique); sequence now a,b,c,d; removal mentioned in explanation; reference changed to add-domain page | https://learn.microsoft.com/microsoft-365/admin/setup/add-domain?view=o365-worldwide |
| ms102-q07 | fixed | Explanation made precise (50 GB without licence; EXO P2 or P1+EOA for >50 GB, archive, litigation hold); reference was a training path, now Learn doc | https://learn.microsoft.com/microsoft-365/admin/email/about-shared-mailboxes?view=o365-worldwide |
| ms102-q08 | ok | - | https://learn.microsoft.com/microsoft-365/backup/backup-overview?view=o365-worldwide |
| ms102-q09 | fixed | Reference changed to page that states the onmicrosoft.com domain can't be removed; explanation mentions fallback domain | https://learn.microsoft.com/microsoft-365/admin/setup/domains-faq?view=o365-worldwide |
| ms102-q10 | fixed | Stem scoped to existing tenant (unified RBAC is default for new MDO P2 orgs since July 2026); "within minutes" -> "after a few minutes" | https://learn.microsoft.com/defender-xdr/activate-defender-rbac |
| ms102-q11 | ok | - | https://learn.microsoft.com/microsoft-365/enterprise/office-365-network-mac-perf-overview?view=o365-worldwide |
| ms102-q12 | fixed | Reference changed to a page that actually names IdFix | https://learn.microsoft.com/microsoft-365/admin/setup/manage-domain-users?view=o365-worldwide |
| ms102-q13 | fixed | whyOthersWrong b reworded to documented facts (no disconnected forests, no multiple active instances) | https://learn.microsoft.com/entra/identity/hybrid/cloud-sync/connect-to-cloud-sync-decision-guide |
| ms102-q14 | ok | - | https://learn.microsoft.com/entra/identity/hybrid/connect/choose-ad-authn |
| ms102-q15 | fixed | Reference changed to non-routable-domain page; explanation tightened | https://learn.microsoft.com/microsoft-365/enterprise/prepare-a-non-routable-domain-for-directory-synchronization?view=o365-worldwide |
| ms102-q16 | ok | - | https://learn.microsoft.com/entra/identity/hybrid/connect/how-to-connect-sync-feature-scheduler |
| ms102-q17 | ok | - | https://learn.microsoft.com/entra/identity/authentication/concept-password-ban-bad-on-premises |
| ms102-q18 | ok | - | https://learn.microsoft.com/entra/identity/authentication/tutorial-enable-sspr-writeback |
| ms102-q19 | ok | - | https://learn.microsoft.com/entra/fundamentals/security-defaults |
| ms102-q20 | ok | - | https://learn.microsoft.com/entra/identity/conditional-access/plan-conditional-access |
| ms102-q21 | ok | - | https://learn.microsoft.com/entra/id-protection/howto-identity-protection-configure-risk-policies |
| ms102-q22 | ok | - | https://learn.microsoft.com/entra/identity/role-based-access-control/security-emergency-access |
| ms102-q23 | ok | - | https://learn.microsoft.com/defender-xdr/microsoft-secure-score-improvement-actions |
| ms102-q24 | ok | - | https://learn.microsoft.com/defender-xdr/advanced-hunting-overview |
| ms102-q25 | ok | - | https://learn.microsoft.com/defender-office-365/preset-security-policies |
| ms102-q26 | ok | - | https://learn.microsoft.com/defender-office-365/preset-security-policies |
| ms102-q27 | ok | - | https://learn.microsoft.com/defender-office-365/safe-attachments-about |
| ms102-q28 | ok | - | https://learn.microsoft.com/defender-office-365/outbound-spam-restore-restricted-users |
| ms102-q29 | ok | - | https://learn.microsoft.com/defender-office-365/attack-simulation-training-get-started |
| ms102-q30 | ok | - | https://learn.microsoft.com/intune/device-security/microsoft-defender/configure-integration |
| ms102-q31 | ok | - | https://learn.microsoft.com/defender-cloud-apps/mde-integration |
| ms102-q32 | fixed | Explanation adds the other documented prerequisites (Enforce app access, Custom network indicators) | https://learn.microsoft.com/defender-cloud-apps/mde-govern |
| ms102-q33 | ok | - | https://learn.microsoft.com/defender-cloud-apps/protect-office-365 |
| ms102-q34 | ok | - | https://learn.microsoft.com/defender-vulnerability-management/tvm-remediation |
| ms102-q35 | fixed | Reference replaced with a page seen on Learn that lists Business Premium contents (MDO P1) and the Defender Suite add-on | https://learn.microsoft.com/microsoft-365/admin/security-and-compliance/add-defender-suite-business-premium?view=o365-worldwide |
| ms102-q36 | ok | - | https://learn.microsoft.com/purview/create-sensitivity-labels |
| ms102-q37 | ok | - | https://learn.microsoft.com/purview/retention |
| ms102-q38 | fixed | Statement c reworded: MDE-onboarded devices appear automatically, but device monitoring must still be turned on; explanation updated | https://learn.microsoft.com/purview/endpoint-dlp-learn-about |
| ms102-q39 | ok | - | https://learn.microsoft.com/purview/sit-create-a-custom-sensitive-information-type |
| ms102-q40 | fixed | Reference title updated to current page name "Get started with Content Explorer (classic)" | https://learn.microsoft.com/purview/data-classification-content-explorer |

## Flashcards

| Item | Verdict | What changed | Evidence URL |
|---|---|---|---|
| ms102-f01 | ok | TXT / MX / text file confirmed | https://learn.microsoft.com/microsoft-365/admin/setup/add-domain?view=o365-worldwide |
| ms102-f02 | fixed | "<domain-with-dashes>" replaced by documented "<MX token>" value copied from the admin center | https://learn.microsoft.com/microsoft-365/enterprise/external-domain-name-system-records?view=o365-worldwide |
| ms102-f03 | ok | - | https://learn.microsoft.com/microsoft-365/enterprise/view-service-health?view=o365-worldwide |
| ms102-f04 | fixed | Precise thresholds: free up to 50 GB; EXO P2 for >50 GB; P2 or P1+EOA for archive/litigation hold | https://learn.microsoft.com/microsoft-365/admin/email/about-shared-mailboxes?view=o365-worldwide |
| ms102-f05 | ok | - | https://learn.microsoft.com/microsoft-365/admin/manage/manage-group-licenses?view=o365-worldwide |
| ms102-f06 | ok | - | https://learn.microsoft.com/microsoft-365-apps/deploy/manage-software-download-settings-office-365 |
| ms102-f07 | ok | - | https://learn.microsoft.com/microsoft-365/backup/backup-pricing?view=o365-worldwide |
| ms102-f08 | ok | - | https://learn.microsoft.com/microsoft-365/enterprise/office-365-network-mac-perf-overview?view=o365-worldwide |
| ms102-f09 | ok | - | https://learn.microsoft.com/entra/identity/role-based-access-control/best-practices |
| ms102-f10 | ok | - | https://learn.microsoft.com/entra/identity/role-based-access-control/administrative-units |
| ms102-f11 | ok | - | https://learn.microsoft.com/entra/id-governance/licensing-fundamentals |
| ms102-f12 | ok | - | https://learn.microsoft.com/entra/id-governance/privileged-identity-management/pim-approval-workflow |
| ms102-f13 | ok | - | https://learn.microsoft.com/microsoft-365/enterprise/prepare-for-directory-synchronization?view=o365-worldwide |
| ms102-f14 | ok | - | https://learn.microsoft.com/entra/identity/hybrid/connect/how-to-connect-sync-feature-scheduler |
| ms102-f15 | ok | - | https://learn.microsoft.com/entra/identity/hybrid/cloud-sync/what-is-cloud-sync |
| ms102-f16 | ok | - | https://learn.microsoft.com/entra/identity/hybrid/cloud-sync/connect-to-cloud-sync-decision-guide |
| ms102-f17 | ok | - | https://learn.microsoft.com/entra/identity/hybrid/connect/how-to-connect-pta-faq |
| ms102-f18 | ok | - | https://learn.microsoft.com/entra/identity/hybrid/connect/choose-ad-authn |
| ms102-f19 | ok | 500 default confirmed (Connect Sync and Cloud Sync); Connect Health alert confirmed | https://learn.microsoft.com/entra/identity/hybrid/connect/how-to-connect-sync-feature-prevent-accidental-deletes |
| ms102-f20 | ok | - | https://learn.microsoft.com/entra/identity/authentication/tutorial-enable-sspr-writeback |
| ms102-f21 | ok | - | https://learn.microsoft.com/entra/identity/authentication/tutorial-configure-custom-password-protection |
| ms102-f22 | ok | - | https://learn.microsoft.com/entra/fundamentals/security-defaults |
| ms102-f23 | fixed | User-risk control updated to current recommendation "Require risk remediation" | https://learn.microsoft.com/entra/id-protection/howto-identity-protection-configure-risk-policies |
| ms102-f24 | fixed | "Directory Synchronization Accounts role" replaced by documented guidance (service accounts such as the Entra Connect Sync account; workload identities) | https://learn.microsoft.com/entra/identity/conditional-access/plan-conditional-access |
| ms102-f25 | ok | - | https://learn.microsoft.com/defender-xdr/incidents-overview |
| ms102-f26 | ok | - | https://learn.microsoft.com/defender-xdr/advanced-hunting-overview |
| ms102-f27 | ok | - | https://learn.microsoft.com/defender-xdr/microsoft-secure-score-improvement-actions |
| ms102-f28 | ok | - | https://learn.microsoft.com/defender-xdr/microsoft-secure-score |
| ms102-f29 | ok | - | https://learn.microsoft.com/defender-office-365/preset-security-policies |
| ms102-f30 | ok | - | https://learn.microsoft.com/defender-office-365/preset-security-policies |
| ms102-f31 | ok | - | https://learn.microsoft.com/defender-office-365/safe-attachments-about |
| ms102-f32 | ok | - | https://learn.microsoft.com/defender-office-365/safe-links-about |
| ms102-f33 | ok | - | https://learn.microsoft.com/defender-office-365/outbound-spam-restore-restricted-users |
| ms102-f34 | ok | - | https://learn.microsoft.com/defender-office-365/attack-simulation-training-get-started |
| ms102-f35 | ok | - | https://learn.microsoft.com/intune/device-security/microsoft-defender/configure-integration |
| ms102-f36 | ok | - | https://learn.microsoft.com/defender-cloud-apps/mde-govern |
| ms102-f37 | ok | - | https://learn.microsoft.com/defender-vulnerability-management/tvm-exposure-score |
| ms102-f38 | fixed | Removed unverified "MDE P1 + some P2 features"; now lists documented Business Premium security components | https://learn.microsoft.com/microsoft-365/admin/security-and-compliance/add-defender-suite-business-premium?view=o365-worldwide |
| ms102-f39 | ok | - | https://learn.microsoft.com/purview/create-sensitivity-labels |
| ms102-f40 | ok | - | https://learn.microsoft.com/purview/retention |
| ms102-f41 | ok | - | https://learn.microsoft.com/purview/retention |
| ms102-f42 | ok | - | https://learn.microsoft.com/purview/sit-create-a-custom-sensitive-information-type |
| ms102-f43 | ok | - | https://learn.microsoft.com/purview/dlp-create-deploy-policy |
| ms102-f44 | fixed | Added that device monitoring must still be turned on | https://learn.microsoft.com/purview/endpoint-dlp-learn-about |
| ms102-f45 | ok | - | https://learn.microsoft.com/purview/data-classification-content-explorer |
| ms102-f46 | new | Connect Health licensing (P1/P2: 1 + 25 per extra agent) | https://learn.microsoft.com/entra/identity/hybrid/connect/reference-connect-health-faq |
| ms102-f47 | new | Endpoint DLP + auto-labelling licensing (E5-tier; not Business Premium/E3) | https://learn.microsoft.com/office365/servicedescriptions/microsoft-365-service-descriptions/microsoft-365-tenantlevel-services-licensing-guidance/microsoft-purview-service-description |
| ms102-f48 | new | DMARC record syntax and rollout | https://learn.microsoft.com/defender-office-365/email-authentication-dmarc-configure |
| ms102-f49 | new | DKIM CNAME selector hostnames | https://learn.microsoft.com/defender-office-365/email-authentication-dkim-configure |

## Known open items - resolution

| Item | Finding | Evidence URL |
|---|---|---|
| Entra Connect Health licensing | Entra ID P1/P2; first agent 1 licence, each additional agent 25 licences; not user-assigned | https://learn.microsoft.com/entra/identity/hybrid/connect/reference-connect-health-faq |
| Endpoint DLP licensing | M365 E5/A5/G5, Purview Suite, E5 Information Protection & Governance | https://learn.microsoft.com/office365/servicedescriptions/microsoft-365-service-descriptions/microsoft-365-tenantlevel-services-licensing-guidance/microsoft-purview-service-description |
| Auto-labelling licensing | Client- and service-side auto-labelling need E5 / E5 Compliance / E5 IP&G / AIP P2; not E3 or Business Premium | https://learn.microsoft.com/purview/apply-sensitivity-label-automatically |
| Accidental-delete default | 500 objects (Connect Sync and Cloud Sync); change with Enable-ADSyncExportDeletionThreshold | https://learn.microsoft.com/entra/identity/hybrid/accidental-deletes |
| Shared mailbox licensing | No licence up to 50 GB; EXO P2 for >50 GB (100 GB); P2 or P1+EOA for archive / litigation hold | https://learn.microsoft.com/microsoft-365/admin/email/about-shared-mailboxes?view=o365-worldwide |
| SPF value | v=spf1 include:spf.protection.outlook.com -all (merge into a single existing SPF record) | https://learn.microsoft.com/microsoft-365/admin/get-help-with-domains/create-dns-records-at-any-dns-hosting-provider?view=o365-worldwide |
| DKIM | CNAMEs selector1._domainkey / selector2._domainkey; target values from Defender portal/PowerShell (…dkim.mail.microsoft format) | https://learn.microsoft.com/defender-office-365/email-authentication-dkim-configure |
| DMARC | _dmarc TXT v=DMARC1; p=none -> quarantine -> reject | https://learn.microsoft.com/defender-office-365/email-authentication-dmarc-configure |
| Domain verification methods | TXT record, MX record (high priority number), or text file on the website | https://learn.microsoft.com/microsoft-365/admin/setup/add-domain?view=o365-worldwide |
