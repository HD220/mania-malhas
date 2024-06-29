import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Link from "next/link";
import { SelectProductWithImage } from "@/db/postgres/schema/productImage";

export async function ProductCard({
  id,
  name,
  description,
  price,
  images,
}: SelectProductWithImage) {
  return (
    <Card className="flex flex-col overflow-clip">
      <Carousel className="">
        <CarouselContent>
          {images?.map((image) => (
            <CarouselItem key={image.id}>
              <AspectRatio ratio={14 / 9}>
                <Image
                  src={image.url}
                  alt={name}
                  fill
                  sizes="100%"
                  priority
                  className="object-contain"
                />
              </AspectRatio>
            </CarouselItem>
          ))}
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
      <Link className="flex flex-1 flex-col" href={`/product/${id}/edit`}>
        <CardHeader className="flex-1 p-3">
          <CardTitle className="text-base">{name}</CardTitle>
          <CardDescription className="flex flex-1 text-xs line-clamp-2">
            {description}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-end items-end p-3">
          <span>
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(price)}
          </span>
        </CardFooter>
      </Link>
    </Card>
  );
}
