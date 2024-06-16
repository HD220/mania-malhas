import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import foto from "@/assets/foto.jpg";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export default function Page() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap gap-3 p-3">
      <ProductCard />
      <ProductCard />
      <ProductCard />
      <ProductCard />
      <ProductCard />
      <ProductCard />
    </div>
  );
}

//className="flex aspect-square items-center justify-center"

function ProductCard() {
  return (
    <Card className="overflow-clip">
      <Carousel className="">
        <CarouselContent>
          <CarouselItem>
            <AspectRatio ratio={14 / 9}>
              <Image src={foto} alt="foto" className="object-cover" />
            </AspectRatio>
          </CarouselItem>

          <CarouselItem>
            <AspectRatio ratio={14 / 9}>
              <Image src={foto} alt="foto" className="object-cover" />
            </AspectRatio>
          </CarouselItem>
          <CarouselItem>
            <AspectRatio ratio={14 / 9}>
              <Image src={foto} alt="foto" className="object-cover" />
            </AspectRatio>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious
          variant="link"
          size="icon"
          className="left-2 text-secondary"
        />
        <CarouselNext
          variant="link"
          size="icon"
          className="right-2 text-secondary"
        />
      </Carousel>
      <CardHeader className="p-3">
        <CardTitle className="text-base">Meu produto</CardTitle>
        <CardDescription className="text-xs line-clamp-2">
          O melhor O melhor O melhor O melhor O melhor O melhor
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-end">$ 60,00</CardFooter>
    </Card>
  );
}
