import { useTina } from "tinacms/dist/react";
import type { PageQuery } from "../../tina/__generated__/types";
import { PageBlocks } from "./blocks";

interface PageContentProps {
  query: string;
  variables: { relativePath: string };
  data: { page: PageQuery["page"] };
}

export default function PageContent(props: PageContentProps) {
  // useTina enables live editing: content updates in real-time in the Tina sidebar
  const { data } = useTina<{ page: PageQuery["page"] }>({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });

  const page = data.page;
  const hasHero = (page.blocks ?? []).some(
    (block) => block?.__typename === "PageBlocksHero",
  );

  return (
    <article>
      {!hasHero && <h1 className="sr-only">{page.title}</h1>}
      <PageBlocks blocks={page.blocks} />
    </article>
  );
}
