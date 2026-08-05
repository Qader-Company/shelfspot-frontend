import Image from "next/image";

export function AboutVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[576px] md:max-w-none">
      <Image
        src="/home/about-us.png"
        alt=""
        width={1228}
        height={718}
        className="h-auto w-full rounded-[18px] object-contain shadow-[0_20px_70px_-46px_rgba(4,2,2,0.18)]"
        sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1279px) 50vw, 576px"
      />
    </div>
  );
}
