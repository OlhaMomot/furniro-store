import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Link, useLoaderData, type MetaFunction} from '@remix-run/react';
import {Image, getPaginationVariables} from '@shopify/hydrogen';
import type {ArticleItemFragment} from 'storefrontapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: `Hydrogen | ${data?.blog.title ?? ''} blog`}];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return defer({...deferredData, ...criticalData});
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({
  context,
  request,
  params,
}: LoaderFunctionArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 4,
  });

  if (!params.blogHandle) {
    throw new Response(`blog not found`, {status: 404});
  }

  const [{blog}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {
        blogHandle: params.blogHandle,
        ...paginationVariables,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!blog?.articles) {
    throw new Response('Not found', {status: 404});
  }

  return {blog};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  return {};
}

export default function Blog() {
  const {blog} = useLoaderData<typeof loader>();
  const {articles} = blog;

  return (
    <div className="blog">
      {/* <h1 className="text-center">{blog.title}</h1> */}
      <div className="blog-grid max-w-[1140px] m-auto">
        <PaginatedResourceSection connection={articles}>
          {({node: article, index}) => (
            <ArticleItem
              article={article}
              key={article.id}
              loading={index < 2 ? 'eager' : 'lazy'}
            />
          )}
        </PaginatedResourceSection>
      </div>
    </div>
  );
}

function ArticleItem({
  article,
  loading,
}: {
  article: ArticleItemFragment;
  loading?: HTMLImageElement['loading'];
}) {
  const publishedAt = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.publishedAt!));
  return (
    <div className="blog-article mb-[24px] max-w-[820px]" key={article.id}>
      <Link to={`/blogs/${article.blog.handle}/${article.handle}`}>
        {article.image && (
          <div className="blog-article-image">
            <Image
              alt={article.image.altText || article.title}
              aspectRatio="3/2"
              data={article.image}
              loading={loading}
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
        )}
        <div className="flex gap-[35px] py-[16px]">
          <div className="flex items-center gap-[6px]">
            <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.99977 7.25C5.72977 7.25 5.26977 3.81 5.26977 3.81C4.99977 2.02 5.81977 0 7.96977 0C10.1298 0 10.9498 2.02 10.6798 3.81C10.6798 3.81 10.2698 7.25 7.99977 7.25ZM7.99977 9.82L10.7198 8C13.1098 8 15.2398 10.33 15.2398 12.53V15.02C15.2398 15.02 11.5898 16.15 7.99977 16.15C4.34977 16.15 0.759766 15.02 0.759766 15.02V12.53C0.759766 10.28 2.69977 8.05 5.22977 8.05L7.99977 9.82Z" fill="#9F9F9F"/>
            </svg>
            <small className="text-[16px] text-[#9F9F9F]">{article.author?.name}</small>
          </div>

          <div className="flex items-center gap-[6px]">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.66699 15.8334C1.66699 17.25 2.75033 18.3334 4.16699 18.3334H15.8337C17.2503 18.3334 18.3337 17.25 18.3337 15.8334V9.16669H1.66699V15.8334ZM15.8337 3.33335H14.167V2.50002C14.167 2.00002 13.8337 1.66669 13.3337 1.66669C12.8337 1.66669 12.5003 2.00002 12.5003 2.50002V3.33335H7.50033V2.50002C7.50033 2.00002 7.16699 1.66669 6.66699 1.66669C6.16699 1.66669 5.83366 2.00002 5.83366 2.50002V3.33335H4.16699C2.75033 3.33335 1.66699 4.41669 1.66699 5.83335V7.50002H18.3337V5.83335C18.3337 4.41669 17.2503 3.33335 15.8337 3.33335Z" fill="#9F9F9F"/>
            </svg>
            <small className="text-[16px] text-[#9F9F9F]">{publishedAt}</small>
          </div>

          <div className="flex items-center gap-[6px]">
            <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.89664 18.968C9.36664 18.97 8.85664 18.758 8.48264 18.382L0.645639 10.547C0.441312 10.3434 0.283632 10.0978 0.183493 9.82723C0.0833546 9.55668 0.0431437 9.26762 0.0656389 8.98001L0.565639 2.41401C0.600182 1.93599 0.806166 1.48652 1.1457 1.14827C1.48524 0.810017 1.93549 0.60574 2.41364 0.573012L8.97964 0.0730116C9.03164 0.0620116 9.08264 0.0620117 9.13464 0.0620117C9.66464 0.0620117 10.1716 0.272012 10.5446 0.648012L18.3826 8.48201C18.5684 8.66774 18.7158 8.88825 18.8164 9.13096C18.917 9.37366 18.9687 9.6338 18.9687 9.89651C18.9687 10.1592 18.917 10.4194 18.8164 10.6621C18.7158 10.9048 18.5684 11.1253 18.3826 11.311L11.3106 18.382C11.1254 18.5683 10.905 18.716 10.6623 18.8166C10.4196 18.9172 10.1594 18.9687 9.89664 18.968ZM5.65364 3.65401C5.32475 3.65411 5.00096 3.73531 4.71094 3.89042C4.42093 4.04554 4.17364 4.26978 3.99099 4.54329C3.80834 4.8168 3.69596 5.13113 3.6638 5.45845C3.63164 5.78576 3.68069 6.11595 3.80662 6.41978C3.93255 6.72361 4.13146 6.99169 4.38574 7.20029C4.64002 7.40888 4.94181 7.55155 5.26439 7.61565C5.58698 7.67976 5.92039 7.66332 6.2351 7.56779C6.54982 7.47227 6.83611 7.30061 7.06864 7.06801L7.07564 7.06201L7.08264 7.05501L7.07464 7.06201C7.35263 6.78158 7.54138 6.42513 7.61711 6.03759C7.69284 5.65006 7.65216 5.24877 7.5002 4.88432C7.34824 4.51986 7.09179 4.20855 6.76318 3.98961C6.43457 3.77066 6.04851 3.65389 5.65364 3.65401Z" fill="#9F9F9F"/>
            </svg>
            <small className="text-[16px] text-[#9F9F9F]">{article.tags}</small>
          </div>
        </div>
        <h3 className="text-[30px]">{article.title}</h3>
        <div>{article.content}</div>

        <span className="my-[30px]">Read more</span>
      </Link>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const BLOGS_QUERY = `#graphql
  query Blog(
    $language: LanguageCode
    $blogHandle: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(language: $language) {
    blog(handle: $blogHandle) {
      title
      seo {
        title
        description
      }
      articles(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ArticleItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          hasNextPage
          endCursor
          startCursor
        }

      }
    }
  }
  fragment ArticleItem on Article {
    author: authorV2 {
      name
    }
    content
    contentHtml
    handle
    id
    image {
      id
      altText
      url
      width
      height
    }
    publishedAt
    title
    tags
    blog {
      handle
    }
  }
` as const;
