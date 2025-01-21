import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';

/**
 * <PaginatedResourceSection > is a component that encapsulate how the previous and next behaviors throughout your application.
 */
export function PaginatedResourceSection<NodesType>({
  connection,
  children,
  resourcesClassName,
}: {
  connection: React.ComponentProps<typeof Pagination<NodesType>>['connection'];
  children: React.FunctionComponent<{node: NodesType; index: number}>;
  resourcesClassName?: string;
}) {
  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => {
        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        return (
          <div>
            {resourcesClassName ? (
              <div className={resourcesClassName}>{resourcesMarkup}</div>
            ) : (
              resourcesMarkup
            )}
            <div className="mx-[100px] mt-[17px] mb-[40px]">
              <PreviousLink className="block h-[60px] w-fit rounded-[10px] bg-[#F9F1E7] m-auto py-[15px] px-[28px]">
                {isLoading ? 'Loading...' : <span>Prev</span>}
              </PreviousLink>
              <NextLink className="block h-[60px] w-fit rounded-[10px] bg-[#F9F1E7] m-auto py-[15px] px-[28px]">
                {isLoading ? 'Loading...' : <span>Next</span>}
              </NextLink>
            </div>
          </div>
        );
      }}
    </Pagination>
  );
}
