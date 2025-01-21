import {Link} from "@remix-run/react";

export function PageBanner({content, title}) {
  const bannerTitle = content.hero?.title?.trim() || title;

  return (
    <div
      className="banner h-[316px] flex flex-col items-center justify-center"
      style={{
        backgroundImage: content.hero?.imageUrl ? `url(${content.hero.imageUrl})` : undefined,
      }}
    >
      <h1 className="text-[48px] font-semibold mb-2">{bannerTitle}</h1>
      <nav aria-label="Breadcrumb" className="">
        <div className="breadcrumbs">
          <Link
            to="/"
            className="after:content-['>'] after:m-1 font-semibold text-[16px]"
          >
            Home
          </Link>
          <span aria-current="page">{bannerTitle}</span>
        </div>
      </nav>
    </div>
  );
}
