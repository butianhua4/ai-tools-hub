import { templates } from "@/data/templates";

type Template = typeof templates[number];

export function TemplateCard({ template }: { template: Template }) {
  const tagText = template.tags.join(" / ");

  return (
    <article className="flex min-w-0 flex-col rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-brand">{template.category} / {template.format}</p>
          <h3 className="mt-2 break-words text-lg font-semibold leading-7 text-ink">{template.title}</h3>
        </div>
        {template.isPaid ? (
          <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">即将上线</span>
        ) : (
          <span className="shrink-0 rounded-full bg-green-50 px-3 py-1 text-xs text-green-700">免费</span>
        )}
      </div>

      <p className="mt-3 flex-1 text-sm leading-6 text-gray-600">{template.description}</p>
      <p className="mt-3 text-xs leading-5 text-gray-500">适用标签：{tagText}</p>

      {template.isPaid ? (
        <div className="mt-5 rounded-md border border-dashed border-gray-300 bg-gray-50 p-3">
          <p className="text-sm font-medium text-gray-700">付费模板暂不开放购买</p>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            预留平台：{template.paymentProvider || "Gumroad / Lemon Squeezy"}。等免费模板有真实反馈后再接支付。
          </p>
        </div>
      ) : (
        <a
          className="mt-5 inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          href={template.downloadUrl}
          download={template.fileName}
        >
          免费下载
        </a>
      )}
    </article>
  );
}
