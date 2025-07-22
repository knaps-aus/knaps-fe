import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Product {
  id: number;
  brand_name?: string;
  product_name?: string;
  core_group?: string;
  rank?: number;
  net_after_sta?: string;
  go?: string;
  cat_sale_price?: string;
  gp_dollar?: string;
  gp_percent?: string;
  cat_sale?: string;
  cat_sale_end_date?: string;
  soh?: string;
  soo?: string;
}

const groupColors: Record<string, string> = {
  A: "bg-green-100 text-green-800",
  B: "bg-blue-100 text-blue-800",
  C: "bg-yellow-100 text-yellow-800",
  D: "bg-red-100 text-red-800",
  E: "bg-gray-100 text-gray-800",
};

interface ProductsTableProps {
  products: Product[];
  loading: boolean;
  error: boolean;
}

export default function ProductsTable({ products, loading, error }: ProductsTableProps) {
  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error loading products</div>;
  }

  if (products.length === 0) {
    return <div className="p-6 text-gray-500">No products found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product ID</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Core</TableHead>
            <TableHead>Rank</TableHead>
            <TableHead>Net (incl.) After STA</TableHead>
            <TableHead>Go</TableHead>
            <TableHead>Cat/Sale Price</TableHead>
            <TableHead>GP $</TableHead>
            <TableHead>GP %</TableHead>
            <TableHead>Cat/Sale</TableHead>
            <TableHead>Cat/Sale End Date</TableHead>
            <TableHead>SOH</TableHead>
            <TableHead>SOO</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.id}</TableCell>
              <TableCell>{p.brand_name || ""}</TableCell>
              <TableCell>{p.product_name || ""}</TableCell>
              <TableCell>
                {p.core_group ? (
                  <span
                    className={cn(
                      "px-2 py-1 rounded-md text-xs font-medium",
                      groupColors[p.core_group] || "bg-gray-100 text-gray-800",
                    )}
                  >
                    {p.core_group}
                  </span>
                ) : (
                  ""
                )}
              </TableCell>
              <TableCell>{p.rank ?? ""}</TableCell>
              <TableCell>{p.net_after_sta || ""}</TableCell>
              <TableCell>{p.go || ""}</TableCell>
              <TableCell>{p.cat_sale_price || ""}</TableCell>
              <TableCell>{p.gp_dollar || ""}</TableCell>
              <TableCell>{p.gp_percent || ""}</TableCell>
              <TableCell>{p.cat_sale || ""}</TableCell>
              <TableCell>{p.cat_sale_end_date || ""}</TableCell>
              <TableCell>{p.soh || ""}</TableCell>
              <TableCell>{p.soo || ""}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
