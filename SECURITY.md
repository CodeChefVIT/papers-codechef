# Security Policy

Papers is an open-source project maintained by student developers at CodeChef-VIT to help students prepare for their CATs, FATs.

Keeping the platform secure, reliable, and online for students is important to us. If you discover a security vulnerability, we appreciate your help in disclosing it responsibly.

---

## Supported Branches

We actively maintain and accept security patches for the following branches:

| Branch | Description | Supported |
| --- | --- | --- |
| `prod` | Production branch (Live site) | Yes |
| `staging` | Development branch (Active development and testing) | Yes |
| Other branches | Feature branches / forks | No |

---

## Ground Rules for Researchers

We welcome students reviewing the codebase and reporting security issues. Please follow these guidelines:

- **Do not disrupt the live service**: Avoid denial-of-service attempts or automated vulnerability scanning tools that could exhaust API quotas or disrupt student access during exam periods.
- **Do not access or alter real data**: Do not view, modify, or delete question papers or records belonging to other users.
- **Test in development**: Test against a local setup (`pnpm dev`) or against test fixtures whenever possible.
- **Coordinate disclosure**: Give our team reasonable time to review and deploy a fix before publicly sharing details of the vulnerability.

---

## Reporting a Vulnerability

Please do not open public GitHub issues for security vulnerabilities.

To report an issue privately:

1. **GitHub Security Advisory (Recommended)**:  
   Navigate to the [Security Advisories](https://github.com/CodeChefVIT/papers-codechef/security/advisories) tab and click **Report a vulnerability**.
2. **Email**:  
   Send an email to our core technical team at **codechefvit@gmail.com** with the subject line `[Security] Vulnerability Report - Papers`.

### What to include in your report:
- A clear description of the issue.
- Step-by-step reproduction instructions, a proof-of-concept, or a sample payload.
- Potential impact and affected endpoints or components.

---

## Response Timeline

We are full-time students balancing academics, but we treat security reports as a priority:
- **Initial acknowledgment**: Typically within 24 to 48 hours.
- **Triage and remediation**: Once verified, we will work on deploying a patch to `staging` and merging it into `prod`.

---

## Attribution

If you responsibly disclose a valid security issue, we will gladly credit you in the official GitHub Security Advisory and release notes.
