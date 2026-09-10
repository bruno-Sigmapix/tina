import { useTina, tinaField } from "tinacms/dist/react";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import type { PageQuery } from "../../tina/__generated__/types";

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

  return (
    <article>
      <h1 data-tina-field={tinaField(page, "title")}>{page.title}</h1>

      {page.image && (
        <img
          data-tina-field={tinaField(page, "image")}
          src={page.image}
          alt={page.title}
        />
      )}

      <div data-tina-field={tinaField(page, "body")}>
        <TinaMarkdown content={page.body} />
      </div>
    </article>
  );
}
