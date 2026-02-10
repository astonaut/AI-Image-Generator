import ReactMarkdown from "react-markdown";
import { getDomain } from "@/config/domain";

const text = `
Welcome to AI Video Generator. Your privacy is important to us.

## 1. Information We Collect
- Account information such as email and profile details.
- Uploaded assets used to generate outputs.
- Technical logs like browser, IP and usage events.

## 2. How We Use Information
- Provide and improve the service.
- Handle billing and account support.
- Prevent abuse and protect platform security.

## 3. Data Protection
- HTTPS encryption in transit.
- Access control and least-privilege operations.
- Data retention minimization.

## 4. Sharing
We do not sell personal data. We only share data with service providers required to operate the product, or when legally required.

## 5. Your Rights
You can request access, correction or deletion by contacting **support@${getDomain().replace(
  "https://",
  ""
)}**.

## 6. Retention
Uploaded media is processed for generation workflows. Retention duration depends on operational and legal requirements.

## 7. Third-Party Services
Billing and infrastructure services are provided by third parties (for example Stripe, cloud storage and model providers), each with their own policies.

## 8. Updates
We may update this policy periodically. Continued use means acceptance of the latest version.

## 9. Contact
**Email**: support@${getDomain().replace("https://", "")}
`;

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-14">
      <div className="rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-lg md:p-10">
        <h1 className="text-center text-4xl font-extrabold text-slate-900">Privacy Policy</h1>
        <p className="mb-10 mt-3 text-center text-sm text-slate-500">Last Updated: 2026-02-09</p>
        <ReactMarkdown className="markdown text-slate-700 leading-8">{text}</ReactMarkdown>
      </div>
    </main>
  );
}

export const metadata = {
  robots: {
    index: false,
    follow: true,
  },
};
