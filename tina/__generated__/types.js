export function gql(strings, ...args) {
  let str = "";
  strings.forEach((string, i) => {
    str += string + (args[i] || "");
  });
  return str;
}
export const PagePartsFragmentDoc = gql`
    fragment PageParts on Page {
  __typename
  title
  metaDescription
  blocks {
    __typename
    ... on PageBlocksHero {
      heading
      subheading
      image
      ctaLabel
      ctaUrl
    }
    ... on PageBlocksContent {
      body
    }
    ... on PageBlocksImageText {
      image
      body
      imagePosition
    }
    ... on PageBlocksCta {
      heading
      text
      buttonLabel
      buttonUrl
    }
  }
}
    `;
export const NavPartsFragmentDoc = gql`
    fragment NavParts on Nav {
  __typename
  items {
    __typename
    page {
      ... on Page {
        __typename
        title
        metaDescription
        blocks {
          __typename
          ... on PageBlocksHero {
            heading
            subheading
            image
            ctaLabel
            ctaUrl
          }
          ... on PageBlocksContent {
            body
          }
          ... on PageBlocksImageText {
            image
            body
            imagePosition
          }
          ... on PageBlocksCta {
            heading
            text
            buttonLabel
            buttonUrl
          }
        }
      }
      ... on Document {
        _sys {
          filename
          basename
          hasReferences
          breadcrumbs
          path
          relativePath
          extension
        }
        id
      }
    }
    label
  }
}
    `;
export const PricingPartsFragmentDoc = gql`
    fragment PricingParts on Pricing {
  __typename
  tiers {
    __typename
    number
    title
    highlight
    details
  }
  footnote
}
    `;
export const PageDocument = gql`
    query page($relativePath: String!) {
  page(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...PageParts
  }
}
    ${PagePartsFragmentDoc}`;
export const PageConnectionDocument = gql`
    query pageConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: PageFilter) {
  pageConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...PageParts
      }
    }
  }
}
    ${PagePartsFragmentDoc}`;
export const NavDocument = gql`
    query nav($relativePath: String!) {
  nav(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...NavParts
  }
}
    ${NavPartsFragmentDoc}`;
export const NavConnectionDocument = gql`
    query navConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: NavFilter) {
  navConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...NavParts
      }
    }
  }
}
    ${NavPartsFragmentDoc}`;
export const PricingDocument = gql`
    query pricing($relativePath: String!) {
  pricing(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...PricingParts
  }
}
    ${PricingPartsFragmentDoc}`;
export const PricingConnectionDocument = gql`
    query pricingConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: PricingFilter) {
  pricingConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...PricingParts
      }
    }
  }
}
    ${PricingPartsFragmentDoc}`;
export function getSdk(requester) {
  return {
    page(variables, options) {
      return requester(PageDocument, variables, options);
    },
    pageConnection(variables, options) {
      return requester(PageConnectionDocument, variables, options);
    },
    nav(variables, options) {
      return requester(NavDocument, variables, options);
    },
    navConnection(variables, options) {
      return requester(NavConnectionDocument, variables, options);
    },
    pricing(variables, options) {
      return requester(PricingDocument, variables, options);
    },
    pricingConnection(variables, options) {
      return requester(PricingConnectionDocument, variables, options);
    }
  };
}
import { createClient } from "tinacms/dist/client";
const generateRequester = (client) => {
  const requester = async (doc, vars, options) => {
    let url = client.apiUrl;
    if (options?.branch) {
      const index = client.apiUrl.lastIndexOf("/");
      url = client.apiUrl.substring(0, index + 1) + options.branch;
    }
    const data = await client.request({
      query: doc,
      variables: vars,
      url
    }, options);
    return { data: data?.data, errors: data?.errors, query: doc, variables: vars || {} };
  };
  return requester;
};
export const ExperimentalGetTinaClient = () => getSdk(
  generateRequester(
    createClient({
      url: "http://localhost:4001/graphql",
      queries
    })
  )
);
export const queries = (client) => {
  const requester = generateRequester(client);
  return getSdk(requester);
};
