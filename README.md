# Welshare Questionnaire Demo

Demonstrates two methods for submitting FHIR questionnaire responses to Welshare user profiles.

## Two Submission Methods

### Method A: External Wallet (`@welshare/react`)

User connects their existing Welshare wallet. The wallet handles signing and submission.

**When to use:** Users who already have Welshare wallets.

**Key files:**
- `src/components/ExternalWalletSubmission.tsx`
- `src/hooks/use-external-wallet-submission.ts`

### Method B: Embedded Wallet (Privy + `@welshare/sdk`)

App creates an embedded wallet for the user via Privy. App manages wallet and uses SDK for direct API submission.

**When to use:** Onboarding users who don't have Welshare wallets yet.

**Key files:**
- `src/components/EmbeddedWalletSubmission.tsx`
- `src/hooks/use-seattle-angina-submission.ts`
- `src/hooks/use-storage-key.ts`


## Quick Start

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Copy `.env.example` to `.env` and configure:
   ```
   NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
   NEXT_PUBLIC_WELSHARE_APP_ID=your-welshare-app-id
   NEXT_PUBLIC_WELSHARE_QUESTIONNAIRE_ID=your-questionnaire-id
   NEXT_PUBLIC_WELSHARE_ENVIRONMENT=staging
   ```

3. Run the development server:
   ```bash
   pnpm dev
   ```

## Key Concepts

### FHIR Questionnaire → Form

`QuestionnaireRenderer.tsx` takes a FHIR Questionnaire JSON and renders form fields:
- `choice` type → `<select>` dropdown
- `group` type → nested container
- Response codes from `answerOption` become option values

### Form Data → QuestionnaireResponse

`build-questionnaire-response.ts` converts form state into a FHIR QuestionnaireResponse:
- Maps user selections back to FHIR `valueCoding` format
- Includes calculated scores as `valueDecimal` items

### Calculated Scores

`use-seattle-angina-scores.ts` shows how to include computed values in submissions. This is questionnaire-specific logic—adapt for your use case.

## Extending This Demo

1. **Use your own questionnaire:** Replace `seattle_angina.json` with your FHIR Questionnaire
2. **Customize form rendering:** Modify `QuestionnaireRenderer.tsx` for your question types
3. **Add/remove scores:** Adjust `use-seattle-angina-scores.ts` or remove if not needed
4. **Choose one method:** If you only need one submission method, remove the other

## Dependencies

- `@welshare/react` - External wallet connection
- `@welshare/sdk` - Direct API submission
- `@privy-io/react-auth` - Embedded wallet authentication
