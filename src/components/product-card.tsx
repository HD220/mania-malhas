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
import { productImageTable } from "@/db/postgres/schema/productImage";
import { db } from "@/db/postgres";
import { productTable } from "@/db/postgres/schema/product";
import { eq } from "drizzle-orm";

export type ProductCardProps = {
  id: number;
};

export async function ProductCard({ id }: ProductCardProps) {
  const productQuery = db
    .select({
      id: productTable.id,
      name: productTable.name,
      description: productTable.description,
      price: productTable.price,
    })
    .from(productTable)
    .where(eq(productTable.id, id));

  const imagesQuery = db
    .select()
    .from(productImageTable)
    .where(eq(productImageTable.productId, id));

  const [[product], images] = await Promise.all([productQuery, imagesQuery]);
  console.log(images);

  return (
    <Card className="overflow-clip">
      <Carousel className="">
        <CarouselContent>
          {images.map(({ url, name, id }) => (
            <CarouselItem key={id}>
              <AspectRatio ratio={14 / 9}>
                <Image src={url} alt={name} fill className="object-contain" />
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
      <CardHeader className="p-3">
        <CardTitle className="text-base">{product.name}</CardTitle>
        <CardDescription className="text-xs line-clamp-2">
          {product.description}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-end p-3">
        <span>
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(parseFloat(product.price))}
        </span>
      </CardFooter>
    </Card>
  );
}
