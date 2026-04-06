// pages/all-products.tsx
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useState, ChangeEvent } from "react";
import useTranslation from "next-translate/useTranslation";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";
import { Product, Category } from "@/types/product";
import { Search, X, ListFilter } from "lucide-react";

interface AllProductsProps {
  products: Product[];
  categories: Category[];
  selectedCategory: string | null;
  discount: boolean;
}

export default function AllProductsPage({
  products,
  categories,
  selectedCategory,
  discount,
}: AllProductsProps) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const cat = e.target.value;
    const params = new URLSearchParams();
    if (discount) params.set("discount", "1");
    if (cat) params.set("category", cat);
    router.push(`/all-products?${params.toString()}`);
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Layout title={discount ? t("onSale") : t("allProducts")}>
      <h1 className="mt-10 mb-4 text-2xl font-bold">
        {discount ? t("onSale") : t("allProducts")}
      </h1>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder={t("searchPlaceholder")}
              className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300
        focus:outline-none focus:ring-1 focus:ring-red-200 focus:border-red-500
        transition"
            />

            {searchTerm && (
              <button
                onClick={() => handleSearch({ target: { value: "" } } as any)}
                className="absolute right-2 top-1/2 -translate-y-1/2
          text-gray-400 hover:text-black transition"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="relative w-full md:w-56 ">
            <ListFilter
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />

            <select
              value={selectedCategory ?? ""}
              onChange={handleCategoryChange}
              className="w-full pl-12 pr-10 py-2 rounded-lg border border-gray-300
  bg-white appearance-none
  focus:outline-none focus:ring-1 focus:ring-red-200 focus:border-red-500
  transition cursor-pointer text-center md:text-left"
            >
              <option value="">{t("allCategories")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
        {filtered.length > 0 ? (
          filtered.map((p) => <ProductCard key={p.id} product={p} />)
        ) : (
          <p className="col-span-full text-center text-gray-500">
            {t("noProductsFound")}
          </p>
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<AllProductsProps> = async ({
  query,
  locale,
}) => {
  const selectedCategory =
    typeof query.category === "string" ? query.category : null;
  const discount = query.discount === "1";
  const lang = locale || "th";

  // 1) ดึงหมวดหมู่พร้อม translation ตามภาษาที่เลือก
  const rawCategories = await prisma.category.findMany({
    include: {
      translations: {
        where: { locale: lang },
        take: 1,
      },
    },
  });
  const categories: Category[] = rawCategories
    .map((c) => ({
      id: c.id,
      name: c.translations[0]?.name ?? "",
    }))
    .sort((a, b) => a.name.localeCompare(b.name, lang));

  // 2) สร้างเงื่อนไขการค้นหาสินค้า
  const whereClause: any = {};
  if (selectedCategory) whereClause.categoryId = selectedCategory;
  if (discount) whereClause.salePrice = { not: null };

  // 3) ดึงสินค้า พร้อม translation
  const rawProducts = await prisma.product.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      price: true,
      imageUrl: true,
      stock: true,
      salePrice: true,
      categoryId: true,
      isFeatured: true,
      translations: {
        where: { locale: lang },
        take: 1,
      },
    },
  });
  const products: Product[] = rawProducts.map((p) => ({
    id: p.id,
    name: p.translations[0]?.name ?? "",
    description: p.translations[0]?.description ?? "",
    price: p.price,
    imageUrl: p.imageUrl,
    stock: p.stock,
    salePrice: p.salePrice,
    categoryId: p.categoryId ?? "",
    isFeatured: p.isFeatured,
  }));

  return {
    props: {
      products,
      categories,
      selectedCategory,
      discount,
    },
  };
};
