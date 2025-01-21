export function InfoBlocks({blocks}) {
  return (
    <div className="bg-accent flex justify-between py-[100px] px-[54px]">
      {blocks.map((block) => (
        <div key={block._key} className="flex items-center gap-[10px]">
          <img src={block.imageUrl} alt="icon" />
          <div>
            <h4 className="text-[#242424] text-[25px] leading-[150%] font-semibold">{block.title}</h4>
            <p className="text-[#898989] text-[20px] leading-[150%]">{block.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
