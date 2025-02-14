import {Suspense} from 'react';
import {Await, NavLink} from '@remix-run/react';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import { PortableText } from '@portabletext/react';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
  sanityFooter: any;
}

export function Footer({
  footer: footerPromise,
  header,
  publicStoreDomain,
  sanityFooter,
}: FooterProps) {
  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {(footer) => (
          <footer className="flex gap-[136px] bg-white px-[100px] py-[48px]">
            <PortableText value={sanityFooter.data.footer.text} />

            {footer?.menu && header.shop.primaryDomain?.url && (
              <FooterMenu
                menu={footer.menu}
                primaryDomainUrl={header.shop.primaryDomain.url}
                publicStoreDomain={publicStoreDomain}
              />
            )}
          </footer>
        )}
      </Await>
    </Suspense>
  );
}

function FooterMenu({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  menu: FooterQuery['menu'];
  primaryDomainUrl: FooterProps['header']['shop']['primaryDomain']['url'];
  publicStoreDomain: string;
}) {
  return (
    <nav className="footer-menu !gap-[120px] !items-start" role="navigation">
      {(menu || FALLBACK_FOOTER_MENU).items.map((item) => {
        if (!item.url) return null;

        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;

        const isExternal = !url.startsWith('/');

        return (
          <div key={item.id} className="menu-item">
            {isExternal ? (
              <a href={url} rel="noopener noreferrer" target="_blank">
                {item.title}
              </a>
            ) : (
              <NavLink end prefetch="intent" className="text-red" style={activeLinkStyle} to={url}>
                {item.title}
              </NavLink>
            )}

            {item.items && item.items.length > 0 && (
              <ul className="submenu mt-[40px] text-[#9F9F9F] text-[16px]">
                {item.items.map((subItem) => {
                  if (!subItem.url) return null;
                  const subUrl =
                    subItem.url.includes('myshopify.com') ||
                    subItem.url.includes(publicStoreDomain) ||
                    subItem.url.includes(primaryDomainUrl)
                      ? new URL(subItem.url).pathname
                      : subItem.url;
                  const isSubExternal = !subUrl.startsWith('/');

                  return (
                    <li key={subItem.id}>
                      {isSubExternal ? (
                        <a href={subUrl} rel="noopener noreferrer" target="_blank">
                          {subItem.title}
                        </a>
                      ) : (
                        <NavLink end prefetch="intent" style={activeLinkStyle} to={subUrl}>
                          {subItem.title}
                        </NavLink>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}

const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: 'gid://shopify/ShopPolicy/23358046264',
      tags: [],
      title: 'Privacy Policy',
      type: 'SHOP_POLICY',
      url: '/policies/privacy-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633093688',
      resourceId: 'gid://shopify/ShopPolicy/23358013496',
      tags: [],
      title: 'Refund Policy',
      type: 'SHOP_POLICY',
      url: '/policies/refund-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633126456',
      resourceId: 'gid://shopify/ShopPolicy/23358111800',
      tags: [],
      title: 'Shipping Policy',
      type: 'SHOP_POLICY',
      url: '/policies/shipping-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633159224',
      resourceId: 'gid://shopify/ShopPolicy/23358079032',
      tags: [],
      title: 'Terms of Service',
      type: 'SHOP_POLICY',
      url: '/policies/terms-of-service',
      items: [],
    },
  ],
};

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}
