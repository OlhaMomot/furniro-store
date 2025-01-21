export function HeroComponent({hero}) {
  if (!hero) return null;

  const {title, description, link, imageUrl} = hero;

  return (
    <div
      className="relative w-full h-[700px]"
      style={{backgroundImage: `url(${imageUrl})`}}
    >
      <div className="hero absolute top-[25%] right-0 mx-[50px] bg-[#FFF3E3] rounded-[20px] p-[40px] max-w-[50%]">
        <h1 className="text-[#B88E2F] text-[52px] leading-[62px] font-['Poppins] font-bold mb-[16px] text-balance capitalize">
          {title}
        </h1>
        <p className="mb-[46px] text-[#333333] text-[18px]">{description}</p>
        {link && <a href={link.url} className="bg-[#B88E2F] text-white py-[25px] px-[75px] text-[16px] font-bold uppercase">{link.text}</a>}
      </div>
    </div>
  );
}
