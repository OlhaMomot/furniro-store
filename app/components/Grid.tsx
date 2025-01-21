export function Grid({grid}) {
  return (
    <div className="mx-[130px] pt-[56px]">
      <h4 className="text-center text-[32px] color-[#333333] font-bold">{grid.title}</h4>
      <p className="text-center text-[20px] color-[#666666]">{grid.description}</p>

      <div className="pt-[60px] pb-[120px] grid grid-cols-3 gap-[20px]">
        {grid.content.map((item) => (
          <div key={item._key}>
            <img src={item.imageUrl} alt={item.link.text} className="w-full mb-[30px]" />
            <a
              href={item.link.url}
              className="block w-fit m-auto text-[24px] font-[500]"
            >
              {item.link.text}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
