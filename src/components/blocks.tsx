import { tinaField } from "tinacms/dist/react";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import type { PageQuery } from "../../tina/__generated__/types";

type Block = NonNullable<PageQuery["page"]["blocks"]>[number];
type Hero = Extract<Block, { __typename: "PageBlocksHero" }>;
type Content = Extract<Block, { __typename: "PageBlocksContent" }>;
type ImageText = Extract<Block, { __typename: "PageBlocksImageText" }>;
type Cta = Extract<Block, { __typename: "PageBlocksCta" }>;

function HeroBlock({ block }: { block: Hero }) {
  return (
    <section
      data-tina-field={tinaField(block)}
      className="flex flex-col items-center gap-6 py-12 text-center"
    >
      {block.image && (
        <img
          data-tina-field={tinaField(block, "image")}
          src={block.image}
          alt={block.heading}
          className="max-h-80 w-full rounded-2xl object-cover"
        />
      )}
      <h1
        data-tina-field={tinaField(block, "heading")}
        className="text-4xl font-bold tracking-tight text-slate-900"
      >
        {block.heading}
      </h1>
      {block.subheading && (
        <p
          data-tina-field={tinaField(block, "subheading")}
          className="max-w-2xl text-lg text-slate-600"
        >
          {block.subheading}
        </p>
      )}
      {block.ctaLabel && block.ctaUrl && (
        <a
          data-tina-field={tinaField(block, "ctaLabel")}
          href={block.ctaUrl}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          {block.ctaLabel}
        </a>
      )}
    </section>
  );
}

function ContentBlock({ block }: { block: Content }) {
  return (
    <section
      data-tina-field={tinaField(block, "body")}
      className="richtext py-8"
    >
      <TinaMarkdown content={block.body} />
    </section>
  );
}

function ImageTextBlock({ block }: { block: ImageText }) {
  const imageOnRight = block.imagePosition === "right";
  return (
    <section
      data-tina-field={tinaField(block)}
      className={`flex flex-col items-center gap-8 py-8 md:flex-row ${
        imageOnRight ? "md:flex-row-reverse" : ""
      }`}
    >
      {block.image && (
        <img
          data-tina-field={tinaField(block, "image")}
          src={block.image}
          alt=""
          className="w-full rounded-2xl object-cover md:w-1/2"
        />
      )}
      <div
        data-tina-field={tinaField(block, "body")}
        className="richtext md:w-1/2"
      >
        <TinaMarkdown content={block.body} />
      </div>
    </section>
  );
}

function CtaBlock({ block }: { block: Cta }) {
  return (
    <section
      data-tina-field={tinaField(block)}
      className="my-8 flex flex-col items-center gap-4 rounded-2xl bg-slate-900 px-8 py-12 text-center text-white"
    >
      <h2
        data-tina-field={tinaField(block, "heading")}
        className="text-2xl font-bold"
      >
        {block.heading}
      </h2>
      {block.text && (
        <p data-tina-field={tinaField(block, "text")} className="max-w-xl text-slate-300">
          {block.text}
        </p>
      )}
      {block.buttonLabel && block.buttonUrl && (
        <a
          data-tina-field={tinaField(block, "buttonLabel")}
          href={block.buttonUrl}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          {block.buttonLabel}
        </a>
      )}
    </section>
  );
}

interface PageBlocksProps {
  blocks: PageQuery["page"]["blocks"];
}

export function PageBlocks({ blocks }: PageBlocksProps) {
  return (
    <>
      {(blocks ?? []).map((block, i) => {
        if (!block) return null;
        switch (block.__typename) {
          case "PageBlocksHero":
            return <HeroBlock key={i} block={block} />;
          case "PageBlocksContent":
            return <ContentBlock key={i} block={block} />;
          case "PageBlocksImageText":
            return <ImageTextBlock key={i} block={block} />;
          case "PageBlocksCta":
            return <CtaBlock key={i} block={block} />;
          default:
            return null;
        }
      })}
    </>
  );
}
