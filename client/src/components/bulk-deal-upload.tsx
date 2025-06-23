import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CloudUpload, Download, CheckCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface UploadResult {
  success: number;
  errors: number;
  created: any[];
  failed: { row: number; error: string; details?: any }[];
}

export default function BulkDealUpload() {
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (data: any[]) => {
      const response = await apiRequest("POST", "/deals/bulk", data);
      return response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/deals"] });
      setUploadResult(result);
      toast({
        title: "Upload Complete",
        description: `${result.success} deals uploaded successfully, ${result.errors} failed`,
      });
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to process bulk upload",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n").filter((line) => line.trim());

        if (lines.length < 2) {
          toast({
            title: "Invalid File",
            description: "CSV file must contain at least a header and one data row",
            variant: "destructive",
          });
          return;
        }

        const headers = lines[0].split(",").map((h) => h.trim());
        const deals = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.trim());
          const deal: any = {};
          headers.forEach((header, index) => {
            const value = values[index] || "";
            deal[header] = value || null;
          });
          return deal;
        });

        uploadMutation.mutate(deals);
      } catch (error) {
        toast({
          title: "File Parse Error",
          description: "Failed to parse CSV file. Please check the format.",
          variant: "destructive",
        });
      }
    };

    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const headers = [
      "deal_type",
      "product_id",
      "amount_type",
      "amount",
      "start_date",
      "end_date",
      "yeamonth_partition",
      "provider",
      "store_amount",
      "head_office_amount",
      "trade_price",
    ];

    const csvContent = [headers.join(",")].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "deal_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Deal Upload</CardTitle>
          <p className="text-sm text-gray-600">Upload multiple deals at once using CSV files.</p>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer"
            onClick={handleFileSelect}
          >
            <CloudUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Drop your file here or click to browse</h3>
            <p className="text-sm text-gray-600 mb-4">Supports CSV files up to 10MB</p>
            <Button type="button" disabled={uploadMutation.isPending}>
              {uploadMutation.isPending ? "Processing..." : "Select File"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <Alert className="mt-6 bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">Need a template?</h4>
                <p className="text-sm text-blue-700 mb-2">Download our CSV template to ensure your data is formatted correctly.</p>
                <Button variant="link" className="p-0 h-auto text-blue-600" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-1" />
                  Download Template
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          {uploadResult && (
            <div className="mt-8">
              <Alert className="bg-green-50 border-green-200 mb-4">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <div>
                    <h4 className="text-sm font-medium text-green-900 mb-1">Upload Complete</h4>
                    <p className="text-sm text-green-700">
                      {uploadResult.success} deals have been successfully imported.
                      {uploadResult.errors > 0 && ` ${uploadResult.errors} deals failed to import.`}
                    </p>
                  </div>
                </AlertDescription>
              </Alert>

              {uploadResult.failed.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Failed Imports</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Row</TableHead>
                          <TableHead>Error</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {uploadResult.failed.map((failure, index) => (
                          <TableRow key={index}>
                            <TableCell>{failure.row}</TableCell>
                            <TableCell className="text-red-600">{failure.error}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
