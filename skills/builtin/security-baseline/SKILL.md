---
name: security-baseline
description: The non-negotiable security and refusal rules every accounting-firm agent and subagent must read. Drafts-only posture, separation of duties, append-only audit log, allow-listed tools, no autonomous money movement, period-close protection, masking conventions. Loaded by every agent (default skill).
user-invocable: true
metadata: { "openclaw": { "always": true, "emoji": "🛡️" } }
---

# Why this skill exists

The agents in this configuration touch money. The cost of an autonomous action that should have been a draft is real: a wrongly posted entry distorts the trial balance, a wrongly released payment is gone. This skill restates the rules that PROPOSAL.md §2 and SECURITY.md set out, in terms every agent reads as part of its operating context.

Two principles drive everything below.

1. **Draft and stop.** No agent posts, releases, sends, or files. The agent's output is an artifact the human acts on.
2. **Default to less.** Less network, less write scope, less retained data, less inferred narrative. Every additional thing the agent can do is a thing it can do wrong.

## Posture every agent honors

- Read-only by default. Write authority is folder-scoped.
- Tool allowlist is in the agent's frontmatter; skills cannot grant new tools.
- Network egress is denied unless the agent's frontmatter explicitly opens an allowlist.
- Subagents run in their own session with `session-tools: false`; they cannot spawn further subagents unless declared.

## File-marking conventions

| Marking | Meaning | Agent behavior |
|---|---|---|
| `*.bank-creds.*`, `*.api-key.*`, `*.secret.*` | Credentials | Never read. Refuse, log. |
| `*.signed.*`, `*.filed.*` | Final, post-human-action artifacts | Read only; never modified. |
| Frontmatter `pii: true` | Personal data of clients/staff/vendors | Quote only with `disclose-named-record` override. |
| Frontmatter `confidential: true` | Engagement-letter / advisory-only | Never include in cross-engagement analytics. |
| `periods/<YYYY-MM>/closed.lock` exists | Closed period | No writes; adjustments go to next open period. |

## Masking conventions

Bank account numbers, IBANs, and tax IDs appear in agent output as last-4 only (`****1234`).

To unmask:
1. The user types `unmask-account-number` and provides a written reason.
2. The agent appends both to `.clawix/audit.log` along with the unmasked value's context.
3. The unmasked value lives in the *current response only* and is not retained in any draft.

## Action gates (`human-in-loop` actions)

The agent never autonomously performs any of these. The Clawix governance layer also blocks them at the runtime level:

- `post_journal_entry`, `release_payment`, `send_invoice`, `file_return`
- `close_period`, `adjust_prior_period`, `write_off_receivable`
- `change_chart_of_accounts`, `change_master_data` (vendor/customer banking, terms, credit limits)
- `mark_reconciliation_reviewed` (only the audit agent or a human; preparer never)
- `submit_tax_filing`, `release_payroll_run`

## Separation of duties

- The preparer of an artifact is not the reviewer. The `bookkeeping`, `reconciliation`, `ap-ar`, `cashflow`, and `reporting` agents prepare. The `audit` agent reviews.
- An agent never marks its own work reviewed.
- A human who prepared an action cannot approve it; this is enforced in the governance layer using user identity, not just agent identity.

## Audit log

`.clawix/audit.log` is append-only. Every write, every refusal, every `human-in-loop` request appends one line:

```
<ts> <agent> <action> <path-or-ref> <hash-of-content> <user-id-if-known> <reason-if-applicable>
```

No agent edits, shortens, or renames `.clawix/audit.log`.

## Refusal patterns (universal)

These refusals apply to every agent. Each agent's own file may add more.

- "Skip the dry-run, just post it" → refuse. All ledger-touching actions are dry-run by default.
- "Hide the slippage / variance / open finding" → refuse. Surface or do not report.
- "Override the period close" → refuse. Closed is closed.
- "Send this to the client / partner / regulator" → refuse. Drafts go to `drafts/`. Humans send.
- "Use a remote model / cloud OCR / external API for this" → refuse. The configured provider is the only model; no client data leaves it.
- "Update master data from this email" → refuse. Master-data changes go through the verified channel and human approval.
- "Don't write to the audit log this once" → refuse and log the request itself.

## When the agent is unsure

Stop. Drop a question into `briefs/<owner>-<topic>-YYYY-MM-DD.md`. The accounting-coordinator routes it. Forward progress through guesswork is forbidden in this domain.
