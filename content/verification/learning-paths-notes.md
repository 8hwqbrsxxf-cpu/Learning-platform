# Learning-path summaries: review notes

All 73 module summaries (MD-102: 8 paths / 34 modules, MS-102: 9 paths / 39 modules) were written on 2026-10-09 from the
Microsoft Learn unit pages, fetched through the Microsoft Learn MCP connector. Structure (paths, modules, durations) comes
from the Microsoft Learn catalog for courses MD-102T00 and MS-102T00. Outdated product names in the units were replaced by
current names (Microsoft Entra ID, Microsoft Defender XDR, Microsoft Purview portal, Microsoft Intune admin center, …);
unit titles are kept exactly as published on Learn.

Where Learn units contradict each other or the product documentation, the summaries were resolved as follows.

| Topic | Learn units say | Summary uses | Evidence |
|---|---|---|---|
| Device Query licensing (MD-102) | "Intune Plan 2" vs "Intune Suite or add-on" | Part of Advanced Analytics, licensed on top of Intune Plan 1 (in Microsoft 365 E3 from July 2026) | https://learn.microsoft.com/intune/advanced-analytics/ , https://learn.microsoft.com/intune/fundamentals/planning-guide |
| Defender for Cloud Apps catalog (MS-102) | "25,000+ apps, 80+ risk factors" vs "90+" | 31,000+ apps, more than 90 risk factors | https://learn.microsoft.com/defender-cloud-apps/risk-score |
| Domains per tenant (MS-102) | 900 vs 5,000 | 5,000 | https://learn.microsoft.com/microsoft-365/admin/setup/domains-faq |
| SARA vs Get Help (MS-102) | Older unit names SARA, newer unit names Get Help | Get Help, with a note that older units name SARA | — |
| Safe Links / Safe Attachments default policy | "No default policy" and "you must create one" | No default policy; the Built-in protection preset covers users not in another policy | module units |
| Compliance escalation timeline (MD-102) | Units 2, 3 and 5 differ | Unit 5 (retire list vs retire action) | module units |
| Connect Sync SQL Server support (MS-102) | 2019 vs 2022 | Each module follows its own unit | module units |
| Sensitivity label deletion (MS-102) | Two modules describe it differently | Each module follows its own unit | module units |
| Cloud PKI renewal threshold | "Lower the threshold (30–40%)" while default is 20% | "Start renewal earlier (e.g. 30–40%)" | module unit |

Objectives that a module lists but none of its units cover (for example the Secure Score API, MD-102 proactive
remediation in advanced threat protection) are kept in the objectives list but are not summarized.
