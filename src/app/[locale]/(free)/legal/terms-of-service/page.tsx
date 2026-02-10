import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getDomain } from "@/config/domain";

const text = `
Welcome to AI Video Generator. By using this service, you agree to these terms.

## 1. Eligibility
You must be legally allowed to use this service in your jurisdiction.

## 2. Service Scope
We provide AI image/video generation tools. Output quality depends on prompts, assets and model behavior.

## 3. Acceptable Use
You must not use the service for unlawful or abusive purposes, including infringement, fraud or harmful content distribution.

## 4. Intellectual Property
- You keep ownership of content you upload.
- We own the platform and service software.
- You grant us a limited license to process your inputs for generation.

## 5. Billing
Paid features may require subscription or one-time payments. Prices can change over time. Contact **support@${getDomain().replace(
  "https://",
  ""
)}** for billing support.

## 6. Disclaimer
Service is provided "as is" without warranties of uninterrupted availability or specific output quality.

## 7. Liability
To the extent allowed by law, we are not liable for indirect or consequential damages from service usage.

## 8. Termination
We may suspend or terminate access for violations of these terms.

## 9. Updates
We may update these terms from time to time. Continued usage indicates acceptance of the latest terms.

## 10. Contact
**Email**: support@${getDomain().replace("https://", "")}
`;

export default function TermsOfServicePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-14">
      <div className="rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-lg md:p-10">
        <h1 className="text-center text-4xl font-extrabold text-slate-900">Terms of Service</h1>
        <p className="mb-10 mt-3 text-center text-sm text-slate-500">Effective Date: 2026-02-09</p>
        <ReactMarkdown className="markdown text-slate-700 leading-8" remarkPlugins={[remarkGfm]}>
          {text}
        </ReactMarkdown>
      </div>
    </main>
  );
}
