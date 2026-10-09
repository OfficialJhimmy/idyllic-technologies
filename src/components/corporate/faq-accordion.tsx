"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { Minus, Plus } from "@phosphor-icons/react";

type Faq = { id: string; question: string; answer: string };

/**
 * Hairline accordion. Radix gives it keyboard control, the right roles and focus handling. The answers
 * are plain text and are shown exactly as approved.
 */
export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  return (
    <Accordion.Root type="single" collapsible className="border-t border-line">
      {faqs.map((f) => (
        <Accordion.Item key={f.id} value={f.id} className="border-b border-line">
          <Accordion.Header className="m-0">
            <Accordion.Trigger className="group flex min-h-20 w-full items-center justify-between gap-6 py-5 text-left font-heading text-xl font-medium sm:text-2xl">
              {f.question}
              <span aria-hidden className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line-strong transition-colors duration-150 group-hover:bg-sunken">
                <Plus size={18} className="transition-[opacity,transform] duration-200 group-data-[state=open]:rotate-90 group-data-[state=open]:opacity-0" />
                <Minus size={18} className="absolute opacity-0 transition-opacity duration-200 group-data-[state=open]:opacity-100" />
              </span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="faq-content overflow-hidden">
            <p className="max-w-[68ch] pb-8 text-lg leading-relaxed text-ink-muted">{f.answer}</p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
